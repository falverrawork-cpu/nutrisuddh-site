import nodemailer from "nodemailer";

type MailOrderItem = {
  productTitle: string;
  variantLabel: string;
  quantity: number;
  lineTotal: number;
};

export type MailOrder = {
  id: string;
  createdAt: string;
  expectedDeliveryDate: string;
  status: string;
  paymentId: string;
  subtotal: number;
  discountCode?: string | null;
  discountAmount: number;
  shipping: number;
  total: number;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  pinCode?: string | null;
  items: MailOrderItem[];
};

const SMTP_HOST = process.env.SMTP_HOST?.trim() ?? "";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE ?? "false").toLowerCase() === "true";
const SMTP_USER = process.env.SMTP_USER?.trim() ?? "";
const SMTP_PASS = process.env.SMTP_PASS?.trim() ?? "";
const SMTP_FROM = process.env.SMTP_FROM?.trim() || SMTP_USER;
const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
  process.env.ADMIN_EMAIL?.trim() ||
  "admin@gmail.com";

let transporter: nodemailer.Transporter | null = null;
let resolvedHostLabel = "";
let emailReadyLogged = false;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

type SmtpCandidate = {
  host: string;
  port: number;
  secure: boolean;
};

function getSmtpCandidates() {
  const result: SmtpCandidate[] = [];
  const seen = new Set<string>();

  const push = (host: string, port: number, secure: boolean) => {
    const normalizedHost = host.trim().toLowerCase();
    if (!normalizedHost) return;
    const key = `${normalizedHost}:${port}:${secure}`;
    if (seen.has(key)) return;
    seen.add(key);
    result.push({ host: normalizedHost, port, secure });
  };

  push(SMTP_HOST, SMTP_PORT, SMTP_SECURE);

  const userDomain = SMTP_USER.includes("@") ? SMTP_USER.split("@")[1]?.toLowerCase().trim() : "";
  if (userDomain) {
    push(`smtp.${userDomain}`, 465, true);
    push(`smtp.${userDomain}`, 587, false);
    push(`smtp.${userDomain}`, 2525, false);
    push(`mail.${userDomain}`, 465, true);
    push(`mail.${userDomain}`, 587, false);
    push(`mail.${userDomain}`, 2525, false);
  }

  push("smtp.gmail.com", 465, true);
  push("smtp.gmail.com", 587, false);
  push("smtp.zoho.in", 465, true);
  push("smtp.zoho.com", 465, true);
  push("smtp.office365.com", 587, false);
  push("smtpout.secureserver.net", 465, true);
  push("smtpout.secureserver.net", 587, false);
  push("mail.privateemail.com", 465, true);
  push("mail.privateemail.com", 587, false);
  push("smtp.hostinger.com", 465, true);
  push("smtp.hostinger.com", 587, false);
  push("smtp.hostinger.com", 2525, false);

  return result;
}

async function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return null;
  }
  if (transporter) {
    return transporter;
  }

  const candidates = getSmtpCandidates();
  const failures: string[] = [];

  for (const candidate of candidates) {
    const client = nodemailer.createTransport({
      host: candidate.host,
      port: candidate.port,
      secure: candidate.secure,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
      tls: {
        servername: candidate.host,
        rejectUnauthorized: false
      }
    });

    try {
      await client.verify();
      transporter = client;
      resolvedHostLabel = `${candidate.host}:${candidate.port} secure=${candidate.secure}`;
      if (!emailReadyLogged) {
        console.log(`[email] SMTP enabled with host ${resolvedHostLabel}`);
        emailReadyLogged = true;
      }
      return transporter;
    } catch (error) {
      const message = error instanceof Error ? `${(error as any).code ?? "ERR"} ${error.message}` : "ERR Unknown error";
      failures.push(`${candidate.host}:${candidate.port} -> ${message}`);
    }
  }

  const shortFailure = failures.slice(0, 4).join(" | ");
  throw new Error(`SMTP connection failed. Checked ${candidates.length} host(s). ${shortFailure}`);
}

export function isEmailDeliverable(email?: string | null) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return false;
  if (normalized.endsWith(".local")) return false;
  return true;
}

function buildInvoiceHtml(order: MailOrder) {
  const rows = order.items
    .map(
      (item) =>
        `<tr><td>${escapeHtml(item.productTitle)}</td><td>${escapeHtml(item.variantLabel)}</td><td>${item.quantity}</td><td>${formatCurrency(item.lineTotal)}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8" /><title>Invoice ${escapeHtml(order.id)}</title></head>
<body style="font-family: Arial, sans-serif; color:#1f2937;">
  <h2>Invoice</h2>
  <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
  <p><strong>Placed:</strong> ${escapeHtml(formatDateTime(order.createdAt))}</p>
  <p><strong>Payment ID:</strong> ${escapeHtml(order.paymentId)}</p>
  <p><strong>Status:</strong> ${escapeHtml(order.status)}</p>
  <p><strong>Delivery Address:</strong> ${escapeHtml(order.addressLine1 ?? "-")}, ${escapeHtml(order.addressLine2 ?? "-")} - ${escapeHtml(order.pinCode ?? "-")}</p>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">
    <thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th>Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p><strong>Subtotal:</strong> ${formatCurrency(order.subtotal)}</p>
  <p><strong>Discount:</strong> ${formatCurrency(order.discountAmount)}</p>
  <p><strong>Shipping:</strong> ${order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</p>
  <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
</body></html>`;
}

function buildItemsList(order: MailOrder) {
  if (!order.items.length) return "<li>No items</li>";
  return order.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.productTitle)} (${escapeHtml(item.variantLabel)}) x${item.quantity} - ${formatCurrency(item.lineTotal)}</li>`
    )
    .join("");
}

export async function sendOrderConfirmationEmails(order: MailOrder) {
  const mailer = await getTransporter();
  if (!mailer) return;

  const invoiceHtml = buildInvoiceHtml(order);
  const itemList = buildItemsList(order);
  const address = `${order.addressLine1 ?? "-"}, ${order.addressLine2 ?? "-"} - ${order.pinCode ?? "-"}`;

  const customerHtml = `
    <p>Hi ${escapeHtml(order.customerName ?? "Customer")},</p>
    <p>Your order <strong>${escapeHtml(order.id)}</strong> has been confirmed.</p>
    <p><strong>Status:</strong> ${escapeHtml(order.status)}<br/>
    <strong>Expected Delivery:</strong> ${escapeHtml(formatDateTime(order.expectedDeliveryDate))}<br/>
    <strong>Total:</strong> ${formatCurrency(order.total)}</p>
    <p><strong>Items:</strong></p>
    <ul>${itemList}</ul>
    <p><strong>Delivery Address:</strong> ${escapeHtml(address)}</p>
    <p>Thank you for ordering from Nutri Suddh.</p>
  `;

  const adminHtml = `
    <p>New order confirmed.</p>
    <p><strong>Order ID:</strong> ${escapeHtml(order.id)}<br/>
    <strong>Customer:</strong> ${escapeHtml(order.customerName ?? "-")}<br/>
    <strong>Email:</strong> ${escapeHtml(order.customerEmail ?? "-")}<br/>
    <strong>Phone:</strong> ${escapeHtml(order.customerPhone ?? "-")}<br/>
    <strong>Address:</strong> ${escapeHtml(address)}<br/>
    <strong>Total:</strong> ${formatCurrency(order.total)}</p>
    <p><strong>Items:</strong></p>
    <ul>${itemList}</ul>
  `;

  const tasks: Array<Promise<unknown>> = [];
  if (isEmailDeliverable(order.customerEmail)) {
    tasks.push(
      mailer.sendMail({
        from: SMTP_FROM,
        to: order.customerEmail as string,
        subject: `Order Confirmed: ${order.id}`,
        html: customerHtml,
        attachments: [
          {
            filename: `invoice-${order.id}.html`,
            content: invoiceHtml
          }
        ]
      })
    );
  }

  if (isEmailDeliverable(ADMIN_NOTIFICATION_EMAIL)) {
    tasks.push(
      mailer.sendMail({
        from: SMTP_FROM,
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: `New Order: ${order.id}`,
        html: adminHtml,
        attachments: [
          {
            filename: `invoice-${order.id}.html`,
            content: invoiceHtml
          }
        ]
      })
    );
  }

  await Promise.all(tasks);
}

export async function sendOrderStatusUpdateEmail(order: MailOrder) {
  const mailer = await getTransporter();
  if (!mailer) return false;
  if (!isEmailDeliverable(order.customerEmail)) return false;

  const address = `${order.addressLine1 ?? "-"}, ${order.addressLine2 ?? "-"} - ${order.pinCode ?? "-"}`;

  await mailer.sendMail({
    from: SMTP_FROM,
    to: order.customerEmail as string,
    subject: `Order Status Update: ${order.id} (${order.status})`,
    html: `
      <p>Hi ${escapeHtml(order.customerName ?? "Customer")},</p>
      <p>Your order <strong>${escapeHtml(order.id)}</strong> status is currently:</p>
      <p><strong>${escapeHtml(order.status)}</strong></p>
      <p><strong>Expected Delivery:</strong> ${escapeHtml(formatDateTime(order.expectedDeliveryDate))}</p>
      <p><strong>Delivery Address:</strong> ${escapeHtml(address)}</p>
      <p>We will continue sending daily status updates until your order is delivered.</p>
    `
  });

  return true;
}

export async function sendAdminTestEmail() {
  const mailer = await getTransporter();
  if (!mailer) {
    throw new Error("SMTP is not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM.");
  }
  if (!isEmailDeliverable(ADMIN_NOTIFICATION_EMAIL)) {
    throw new Error("ADMIN_NOTIFICATION_EMAIL is invalid.");
  }

  await mailer.sendMail({
    from: SMTP_FROM,
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: "Nutri Suddh SMTP Test Email",
    html: `
      <p>This is a test email from Nutri Suddh backend.</p>
      <p><strong>SMTP Route:</strong> ${escapeHtml(resolvedHostLabel || "auto-detected")}</p>
      <p><strong>Time:</strong> ${escapeHtml(new Date().toLocaleString("en-IN"))}</p>
      <p>If you received this, SMTP configuration is working.</p>
    `
  });
}
