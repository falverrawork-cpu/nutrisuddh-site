import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { getRazorpayClient, getRazorpayPublicKey, verifyRazorpaySignature } from "./lib/razorpay";
import { ensureAdminUser } from "./lib/bootstrap";
import { db } from "./lib/db";
import { AuthRequest, requireAdmin, requireAuth, signAuthToken } from "./lib/auth";
import { sendAdminTestEmail, sendOrderConfirmationEmails, sendOrderStatusUpdateEmail, type MailOrder } from "./lib/email";

type Role = "user" | "admin";

type OrderInputItem = {
  productId: string;
  productTitle: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: string;
};

type OrderInput = {
  id: string;
  createdAt: string;
  expectedDeliveryDate: string;
  status: string;
  paymentId: string;
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  shipping: number;
  total: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  pinCode?: string;
  items: OrderInputItem[];
};

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(cors());
app.use(express.json());

const mapUser = (user: { id: number; name: string; email: string; phone: string | null; role: Role; password_hash?: string | null }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone ?? "",
  role: user.role,
  hasPassword: Boolean(user.password_hash && user.password_hash.trim().length > 0)
});

const getUserByEmail = db.prepare(
  "SELECT id, name, email, phone, password_hash, role FROM users WHERE email = ?"
);
const getUserById = db.prepare(
  "SELECT id, name, email, phone, password_hash, role FROM users WHERE id = ?"
);
const getUserWithPasswordById = db.prepare(
  "SELECT id, name, email, phone, password_hash, role FROM users WHERE id = ?"
);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function serializeOrderRows(orderRows: any[], itemRows: any[]) {
  return orderRows.map((order) => ({
    id: order.id,
    userId: order.user_id,
    createdAt: order.created_at,
    expectedDeliveryDate: order.expected_delivery_date,
    status: order.status,
    paymentId: order.payment_id,
    paymentStatus: order.payment_id ? "Paid" : "Pending",
    subtotal: order.subtotal,
    discountCode: order.discount_code ?? undefined,
    discountAmount: order.discount_amount,
    shipping: order.shipping,
    total: order.total,
    customerName: order.customer_name ?? undefined,
    customerEmail: order.customer_email ?? undefined,
    customerPhone: order.customer_phone ?? undefined,
    addressLine1: order.address_line1 ?? undefined,
    addressLine2: order.address_line2 ?? undefined,
    pinCode: order.pin_code ?? undefined,
    items: itemRows
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        productId: item.product_id,
        productTitle: item.product_title,
        variantLabel: item.variant_label,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        lineTotal: item.line_total,
        image: item.image
      }))
  }));
}

function toMailOrder(order: any, items: OrderInputItem[] | any[]): MailOrder {
  return {
    id: order.id,
    createdAt: order.created_at ?? order.createdAt,
    expectedDeliveryDate: order.expected_delivery_date ?? order.expectedDeliveryDate,
    status: order.status,
    paymentId: order.payment_id ?? order.paymentId,
    subtotal: order.subtotal,
    discountCode: order.discount_code ?? order.discountCode ?? null,
    discountAmount: order.discount_amount ?? order.discountAmount,
    shipping: order.shipping,
    total: order.total,
    customerName: order.customer_name ?? order.customerName ?? null,
    customerEmail: order.customer_email ?? order.customerEmail ?? null,
    customerPhone: order.customer_phone ?? order.customerPhone ?? null,
    addressLine1: order.address_line1 ?? order.addressLine1 ?? null,
    addressLine2: order.address_line2 ?? order.addressLine2 ?? null,
    pinCode: order.pin_code ?? order.pinCode ?? null,
    items: items.map((item: any) => ({
      productTitle: item.product_title ?? item.productTitle,
      variantLabel: item.variant_label ?? item.variantLabel,
      quantity: item.quantity,
      lineTotal: item.line_total ?? item.lineTotal
    }))
  };
}

async function runDailyOrderStatusEmails() {
  const candidates = db
    .prepare(
      `SELECT *
       FROM orders
       WHERE COALESCE(customer_email, '') <> ''
         AND status NOT IN ('Delivered', 'Completed')
         AND (
           last_status_email_sent_at IS NULL
           OR date(last_status_email_sent_at) < date('now', 'localtime')
         )
       ORDER BY datetime(created_at) DESC
       LIMIT 300`
    )
    .all() as any[];

  if (candidates.length === 0) return;

  const orderIds = candidates.map((order) => order.id);
  const placeholders = orderIds.map(() => "?").join(",");
  const itemRows = db
    .prepare(`SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`)
    .all(...orderIds) as any[];

  for (const order of candidates) {
    try {
      const orderItems = itemRows.filter((item) => item.order_id === order.id);
      const sent = await sendOrderStatusUpdateEmail(toMailOrder(order, orderItems));
      if (sent) {
        db.prepare("UPDATE orders SET last_status_email_sent_at = ? WHERE id = ?")
          .run(new Date().toISOString(), order.id);
      }
    } catch (error) {
      console.error(`Daily status email failed for order ${order.id}`, error);
    }
  }
}

function startDailyOrderStatusEmailScheduler() {
  const run = () => {
    runDailyOrderStatusEmails().catch((error) => {
      console.error("Daily order status scheduler failed", error);
    });
  };

  run();
  setInterval(run, 60 * 60 * 1000);
}

app.post("/api/auth/signup", async (req, res) => {
  try {
    const body = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    const name = body.name?.trim();
    const email = body.email ? normalizeEmail(body.email) : "";
    const phone = body.phone?.trim() ?? "";
    const password = body.password ?? "";

    if (!name) return res.status(400).json({ error: "Name is required." });
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Valid email is required." });
    if (!phone) return res.status(400).json({ error: "Phone number is required." });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

    const existing = getUserByEmail.get(email) as
      | { id: number; name: string; email: string; phone: string | null; role: Role; password_hash: string }
      | undefined;

    const hash = await bcrypt.hash(password, 10);
    let userId: number;

    if (existing) {
      const hasPassword = Boolean(existing.password_hash && existing.password_hash.trim().length > 0);
      if (hasPassword) {
        return res.status(409).json({ error: "Email already registered." });
      }

      db.prepare(
        `UPDATE users
         SET name = ?, phone = ?, password_hash = ?
         WHERE id = ?`
      ).run(name, phone, hash, existing.id);
      userId = existing.id;
    } else {
      const result = db
        .prepare(
          `INSERT INTO users (name, email, phone, password_hash, role, created_at)
           VALUES (?, ?, ?, ?, 'user', ?)`
        )
        .run(name, email, phone, hash, new Date().toISOString());
      userId = Number(result.lastInsertRowid);
    }

    const user = getUserById.get(userId) as {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      role: Role;
      password_hash: string;
    };

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });
    return res.json({ token, user: mapUser(user) });
  } catch (error) {
    console.error("Signup failed", error);
    return res.status(500).json({ error: "Unable to sign up." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const body = req.body as { email?: string; password?: string };
    const email = body.email ? normalizeEmail(body.email) : "";
    const password = body.password ?? "";

    const user = getUserByEmail.get(email) as
      | { id: number; name: string; email: string; phone: string | null; role: Role; password_hash: string }
      | undefined;

    if (!user) return res.status(401).json({ error: "Invalid email or password." });
    if (!user.password_hash || user.password_hash.trim().length === 0) {
      return res.status(401).json({ error: "No password set for this account. Login from checkout session and set password in My Account." });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password." });

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });
    return res.json({ token, user: mapUser(user) });
  } catch (error) {
    console.error("Login failed", error);
    return res.status(500).json({ error: "Unable to login." });
  }
});

app.post("/api/auth/checkout-account", async (req, res) => {
  try {
    const body = req.body as { name?: string; email?: string; phone?: string };
    const name = body.name?.trim() ?? "";
    const email = body.email ? normalizeEmail(body.email) : "";
    const phone = body.phone?.trim() ?? "";

    if (!name) return res.status(400).json({ error: "Name is required." });
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Valid email is required." });

    let user = getUserByEmail.get(email) as
      | { id: number; name: string; email: string; phone: string | null; role: Role; password_hash: string }
      | undefined;

    if (!user) {
      const result = db
        .prepare(
          `INSERT INTO users (name, email, phone, password_hash, role, created_at)
           VALUES (?, ?, ?, ?, 'user', ?)`
        )
        .run(name, email, phone, "", new Date().toISOString());
      user = getUserById.get(result.lastInsertRowid) as
        | { id: number; name: string; email: string; phone: string | null; role: Role; password_hash: string }
        | undefined;
    } else {
      db.prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?").run(name, phone, user.id);
      user = getUserById.get(user.id) as
        | { id: number; name: string; email: string; phone: string | null; role: Role; password_hash: string }
        | undefined;
    }

    if (!user) return res.status(500).json({ error: "Unable to create checkout account." });

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });
    return res.json({ token, user: mapUser(user) });
  } catch (error) {
    console.error("Checkout account creation failed", error);
    return res.status(500).json({ error: "Unable to create account from checkout details." });
  }
});

app.post("/api/auth/admin/login", async (req, res) => {
  try {
    const body = req.body as { email?: string; password?: string };
    const email = body.email ? normalizeEmail(body.email) : "";
    const password = body.password ?? "";

    const user = getUserByEmail.get(email) as
      | { id: number; name: string; email: string; phone: string | null; role: Role; password_hash: string }
      | undefined;

    if (!user || user.role !== "admin") return res.status(401).json({ error: "Invalid admin credentials." });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid admin credentials." });

    const token = signAuthToken({ userId: user.id, email: user.email, role: user.role });
    return res.json({ token, user: mapUser(user) });
  } catch (error) {
    console.error("Admin login failed", error);
    return res.status(500).json({ error: "Unable to login as admin." });
  }
});

app.get("/api/auth/me", requireAuth, (req: AuthRequest, res) => {
  const auth = req.auth;
  if (!auth) return res.status(401).json({ error: "Unauthorized." });

  const user = getUserById.get(auth.userId) as
    | { id: number; name: string; email: string; phone: string | null; role: Role; password_hash: string }
    | undefined;

  if (!user) return res.status(404).json({ error: "User not found." });
  return res.json({ user: mapUser(user) });
});

app.patch("/api/auth/profile", requireAuth, (req: AuthRequest, res) => {
  try {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ error: "Unauthorized." });

    const body = req.body as { name?: string; phone?: string };
    const name = body.name?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";

    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }

    db.prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?").run(name, phone, auth.userId);

    const updatedUser = getUserById.get(auth.userId) as
      | { id: number; name: string; email: string; phone: string | null; role: Role; password_hash: string }
      | undefined;

    if (!updatedUser) return res.status(404).json({ error: "User not found." });
    return res.json({ user: mapUser(updatedUser) });
  } catch (error) {
    console.error("Profile update failed", error);
    return res.status(500).json({ error: "Unable to update profile." });
  }
});

app.post("/api/auth/reset-password", requireAuth, async (req: AuthRequest, res) => {
  try {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ error: "Unauthorized." });

    const body = req.body as { currentPassword?: string; newPassword?: string };
    const currentPassword = body.currentPassword ?? "";
    const newPassword = body.newPassword ?? "";

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters." });
    }

    const user = getUserWithPasswordById.get(auth.userId) as
      | { id: number; password_hash: string }
      | undefined;
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const hasPassword = Boolean(user.password_hash && user.password_hash.trim().length > 0);
    if (hasPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required." });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect." });
      }
    }

    const nextHash = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(nextHash, auth.userId);

    return res.json({ ok: true });
  } catch (error) {
    console.error("Password reset failed", error);
    return res.status(500).json({ error: "Unable to reset password." });
  }
});

app.post("/api/orders", requireAuth, async (req: AuthRequest, res) => {
  try {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ error: "Unauthorized." });

    const body = req.body as OrderInput;
    if (!body.id || !body.paymentId || !Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: "Invalid order payload." });
    }

    const insertOrder = db.prepare(
      `INSERT INTO orders (
        id, user_id, created_at, expected_delivery_date, status, payment_id,
        subtotal, discount_code, discount_amount, shipping, total,
        customer_name, customer_email, customer_phone, address_line1, address_line2, pin_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const insertItem = db.prepare(
      `INSERT INTO order_items (
        order_id, product_id, product_title, variant_label, quantity, unit_price, line_total, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const trx = db.transaction(() => {
      insertOrder.run(
        body.id,
        auth.userId,
        body.createdAt,
        body.expectedDeliveryDate,
        body.status || "Pending",
        body.paymentId,
        body.subtotal,
        body.discountCode ?? null,
        body.discountAmount,
        body.shipping,
        body.total,
        body.customerName ?? null,
        body.customerEmail ?? null,
        body.customerPhone ?? null,
        body.addressLine1 ?? null,
        body.addressLine2 ?? null,
        body.pinCode ?? null
      );

      for (const item of body.items) {
        insertItem.run(
          body.id,
          item.productId,
          item.productTitle,
          item.variantLabel,
          item.quantity,
          item.unitPrice,
          item.lineTotal,
          item.image
        );
      }
    });

    trx();

    const mailOrder = toMailOrder(
      {
        id: body.id,
        createdAt: body.createdAt,
        expectedDeliveryDate: body.expectedDeliveryDate,
        status: body.status || "Pending",
        paymentId: body.paymentId,
        subtotal: body.subtotal,
        discountCode: body.discountCode,
        discountAmount: body.discountAmount,
        shipping: body.shipping,
        total: body.total,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        pinCode: body.pinCode
      },
      body.items
    );

    sendOrderConfirmationEmails(mailOrder).catch((error) => {
      console.error(`Order confirmation email failed for order ${body.id}`, error);
    });

    return res.json({ ok: true, orderId: body.id });
  } catch (error) {
    console.error("Create order failed", error);
    return res.status(500).json({ error: "Unable to store order." });
  }
});

app.get("/api/orders/my", requireAuth, (req: AuthRequest, res) => {
  try {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ error: "Unauthorized." });

    const orderRows = db
      .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY datetime(created_at) DESC")
      .all(auth.userId) as any[];

    if (orderRows.length === 0) {
      return res.json({ orders: [] });
    }

    const orderIds = orderRows.map((order) => order.id);
    const placeholders = orderIds.map(() => "?").join(",");
    const itemRows = db
      .prepare(`SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`)
      .all(...orderIds) as any[];

    return res.json({ orders: serializeOrderRows(orderRows, itemRows) });
  } catch (error) {
    console.error("Fetch my orders failed", error);
    return res.status(500).json({ error: "Unable to fetch orders." });
  }
});

app.get("/api/admin/orders", requireAuth, requireAdmin, (_req, res) => {
  try {
    const orderRows = db
      .prepare("SELECT * FROM orders ORDER BY datetime(created_at) DESC")
      .all() as any[];

    if (orderRows.length === 0) {
      return res.json({ orders: [] });
    }

    const orderIds = orderRows.map((order) => order.id);
    const placeholders = orderIds.map(() => "?").join(",");
    const itemRows = db
      .prepare(`SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id ASC`)
      .all(...orderIds) as any[];

    return res.json({ orders: serializeOrderRows(orderRows, itemRows) });
  } catch (error) {
    console.error("Fetch admin orders failed", error);
    return res.status(500).json({ error: "Unable to fetch orders." });
  }
});

app.get("/api/admin/users", requireAuth, requireAdmin, (_req, res) => {
  try {
    const users = db
      .prepare(
        `SELECT id, name, email, phone, role, created_at
         FROM users
         ORDER BY datetime(created_at) DESC`
      )
      .all() as Array<{
      id: number;
      name: string;
      email: string;
      phone: string | null;
      role: Role;
      created_at: string;
    }>;

    return res.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
        createdAt: user.created_at
      }))
    });
  } catch (error) {
    console.error("Fetch admin users failed", error);
    return res.status(500).json({ error: "Unable to fetch users." });
  }
});

app.patch("/api/admin/users/:userId", requireAuth, requireAdmin, (req: AuthRequest, res) => {
  try {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ error: "Unauthorized." });

    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user id." });
    }

    const body = req.body as { name?: string; phone?: string; email?: string; role?: Role };
    const name = body.name?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const email = body.email ? normalizeEmail(body.email) : "";
    const role = body.role === "admin" ? "admin" : "user";

    if (!name) return res.status(400).json({ error: "Name is required." });
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Valid email is required." });

    const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(userId) as { id: number } | undefined;
    if (!existing) return res.status(404).json({ error: "User not found." });

    const duplicate = db
      .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
      .get(email, userId) as { id: number } | undefined;
    if (duplicate) return res.status(409).json({ error: "Email already in use by another user." });

    db.prepare("UPDATE users SET name = ?, phone = ?, email = ?, role = ? WHERE id = ?")
      .run(name, phone, email, role, userId);

    const updatedUser = getUserById.get(userId) as
      | { id: number; name: string; email: string; phone: string | null; role: Role; password_hash: string }
      | undefined;
    if (!updatedUser) return res.status(404).json({ error: "User not found." });

    return res.json({ user: mapUser(updatedUser) });
  } catch (error) {
    console.error("Admin update user failed", error);
    return res.status(500).json({ error: "Unable to update user." });
  }
});

app.delete("/api/admin/users/:userId", requireAuth, requireAdmin, (req: AuthRequest, res) => {
  try {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ error: "Unauthorized." });

    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user id." });
    }
    if (userId === auth.userId) {
      return res.status(400).json({ error: "You cannot delete your own admin account." });
    }

    const result = db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    if (result.changes === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({ ok: true, userId });
  } catch (error) {
    console.error("Admin delete user failed", error);
    return res.status(500).json({ error: "Unable to delete user." });
  }
});

app.patch("/api/admin/orders/:orderId/status", requireAuth, requireAdmin, (req, res) => {
  try {
    const orderId = req.params.orderId;
    const body = req.body as { status?: string };
    const nextStatus = body.status?.trim();
    const allowedStatuses = new Set(["Order Confirmed", "Dispatched", "Delivered"]);

    if (!nextStatus) {
      return res.status(400).json({ error: "Status is required." });
    }
    if (!allowedStatuses.has(nextStatus)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const result = db
      .prepare("UPDATE orders SET status = ? WHERE id = ?")
      .run(nextStatus, orderId);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    return res.json({ ok: true, orderId, status: nextStatus });
  } catch (error) {
    console.error("Update order status failed", error);
    return res.status(500).json({ error: "Unable to update order status." });
  }
});

app.delete("/api/admin/orders/:orderId", requireAuth, requireAdmin, (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = db
      .prepare("SELECT id, status FROM orders WHERE id = ?")
      .get(orderId) as { id: string; status: string } | undefined;

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const deletableStatuses = new Set(["Delivered", "Completed"]);
    if (!deletableStatuses.has(order.status)) {
      return res.status(400).json({ error: "Only completed/delivered orders can be deleted." });
    }

    const result = db.prepare("DELETE FROM orders WHERE id = ?").run(orderId);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    return res.json({ ok: true, orderId });
  } catch (error) {
    console.error("Delete order failed", error);
    return res.status(500).json({ error: "Unable to delete order." });
  }
});

app.post("/api/admin/test-email", requireAuth, requireAdmin, async (_req, res) => {
  try {
    await sendAdminTestEmail();
    return res.json({ ok: true });
  } catch (error) {
    console.error("Admin test email failed", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : "Unable to send test email." });
  }
});

app.get("/api/admin/summary", requireAuth, requireAdmin, (_req, res) => {
  try {
    const totals = db
      .prepare(
        `SELECT
          COUNT(*) AS totalOrders,
          COALESCE(SUM(total), 0) AS totalRevenue,
          COALESCE(SUM(CASE WHEN status IN ('Order Confirmed', 'Confirmed', 'Pending') THEN 1 ELSE 0 END), 0) AS confirmedOrders,
          COALESCE(SUM(CASE WHEN status = 'Dispatched' THEN 1 ELSE 0 END), 0) AS dispatchedOrders,
          COALESCE(SUM(CASE WHEN status IN ('Delivered', 'Completed') THEN 1 ELSE 0 END), 0) AS deliveredOrders
         FROM orders`
      )
      .get() as {
      totalOrders: number;
      totalRevenue: number;
      confirmedOrders: number;
      dispatchedOrders: number;
      deliveredOrders: number;
    };

    return res.json({ summary: totals });
  } catch (error) {
    console.error("Fetch admin summary failed", error);
    return res.status(500).json({ error: "Unable to fetch summary." });
  }
});

app.post("/api/razorpay/order", async (req, res) => {
  try {
    const body = req.body as { amount?: number; currency?: string; receipt?: string };

    if (typeof body.amount !== "number" || !Number.isInteger(body.amount) || body.amount <= 0) {
      return res.status(400).json({ error: "Invalid amount." });
    }

    const amount = body.amount;
    const currency = body.currency ?? "INR";
    const receipt = body.receipt ?? `rcpt_${Date.now()}`;

    const razorpay = getRazorpayClient();
    const order = await (razorpay.orders.create({
      amount,
      currency,
      receipt
    }) as Promise<{ id: string; amount: number; currency: string }>);

    return res.json({
      keyId: getRazorpayPublicKey(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error("Razorpay create order failed", error);
    return res.status(500).json({ error: "Unable to create payment order." });
  }
});

app.post("/api/razorpay/verify", async (req, res) => {
  try {
    const body = req.body as {
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    };

    if (!body.razorpay_payment_id || !body.razorpay_order_id || !body.razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields." });
    }

    const signatureOk = verifyRazorpaySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature
    );

    if (!signatureOk) {
      return res.status(400).json({ error: "Signature mismatch. Payment could not be verified." });
    }

    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.fetch(body.razorpay_payment_id);

    if (payment.status !== "captured" && payment.status !== "authorized") {
      return res.status(400).json({ error: "Payment not captured." });
    }

    return res.json({ verified: true, paymentId: payment.id });
  } catch (error) {
    console.error("Razorpay verify payment failed", error);
    return res.status(500).json({ error: "Unable to verify payment." });
  }
});

ensureAdminUser()
  .then(() => {
    startDailyOrderStatusEmailScheduler();
    app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to bootstrap backend", error);
    process.exit(1);
  });
