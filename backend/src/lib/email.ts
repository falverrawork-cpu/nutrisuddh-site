import nodemailer from "nodemailer";
import { buildInvoiceHtml as buildStyledInvoiceHtml } from "./invoices/template";

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
  shippingCity?: string | null;
  shippingState?: string | null;
  pinCode?: string | null;
  invoiceNumber?: string | null;
  invoicePath?: string | null;
  items: MailOrderItem[];
};

const SMTP_HOST = process.env.SMTP_HOST?.trim() ?? "";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE ?? "false").toLowerCase() === "true";
const SMTP_USER = process.env.SMTP_USER?.trim() ?? "";
const SMTP_PASS = process.env.SMTP_PASS?.trim() ?? "";
const SMTP_URL = process.env.SMTP_URL?.trim() ?? "";
const SMTP_FROM = process.env.SMTP_FROM?.trim() || SMTP_USER;
const REQUIRED_ORDER_NOTIFICATION_EMAIL = "nsagrooverseas25@gmail.com";
const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
  process.env.ADMIN_EMAIL?.trim() ||
  REQUIRED_ORDER_NOTIFICATION_EMAIL;

let transporter: nodemailer.Transporter | null = null;
let resolvedHostLabel = "";
let emailReadyLogged = false;
let emailNotConfiguredLogged = false;
let lastEmailError = "";

export function getLastEmailError() {
  return lastEmailError;
}

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
  push("smtp.titan.email", 465, true);
  push("smtp.titan.email", 587, false);
  push("smtp.zoho.in", 465, true);
  push("smtp.zoho.in", 587, false);
  push("smtp.zoho.com", 465, true);
  push("smtp.zoho.com", 587, false);
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
  if (!SMTP_FROM || ((!SMTP_URL || !SMTP_URL.includes("://")) && (!SMTP_USER || !SMTP_PASS))) {
    if (!emailNotConfiguredLogged) {
      console.warn("[email] SMTP not configured. Set SMTP_URL or SMTP_USER/SMTP_PASS/SMTP_FROM.");
      emailNotConfiguredLogged = true;
    }
    return null;
  }
  if (transporter) {
    return transporter;
  }

  if (SMTP_URL) {
    const urlTransport = nodemailer.createTransport(SMTP_URL);
    try {
      await urlTransport.verify();
      transporter = urlTransport;
      resolvedHostLabel = "SMTP_URL";
      if (!emailReadyLogged) {
        console.log("[email] SMTP enabled with SMTP_URL");
        emailReadyLogged = true;
      }
      return transporter;
    } catch (error) {
      const message = error instanceof Error ? `${(error as any).code ?? "ERR"} ${error.message}` : "ERR Unknown error";
      lastEmailError = `SMTP connection failed for SMTP_URL. ${message}`;
      console.error(`[email] ${lastEmailError}`);
      return null;
    }
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
  lastEmailError = `SMTP connection failed. Checked ${candidates.length} host(s). ${shortFailure}`;
  console.error(`[email] ${lastEmailError}`);
  return null;
}

export function isEmailDeliverable(email?: string | null) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return false;
  if (normalized.endsWith(".local")) return false;
  return true;
}

function getAdminNotificationRecipients() {
  return Array.from(
    new Set([ADMIN_NOTIFICATION_EMAIL, REQUIRED_ORDER_NOTIFICATION_EMAIL].map((value) => value.trim()).filter(isEmailDeliverable))
  );
}

function buildConfirmationInvoiceHtml(order: MailOrder) {
  return buildStyledInvoiceHtml({
    invoiceNumber: order.invoiceNumber ?? order.id,
    orderId: order.id,
    orderDate: order.createdAt,
    customerName: order.customerName ?? "Customer",
    customerPhone: order.customerPhone ?? "-",
    customerEmail: order.customerEmail ?? "-",
    addressLine1: order.addressLine1 ?? "-",
    addressLine2: order.addressLine2 ?? "",
    city: order.shippingCity ?? "",
    state: order.shippingState ?? "",
    pincode: order.pinCode ?? "",
    subtotal: order.subtotal,
    discountCode: order.discountCode ?? null,
    discountAmount: order.discountAmount,
    shipping: order.shipping,
    total: order.total,
    items: order.items.map((item) => ({
      productName: item.variantLabel ? `${item.productTitle} (${item.variantLabel})` : item.productTitle,
      quantity: item.quantity,
      productPrice: item.quantity > 0 ? item.lineTotal / item.quantity : item.lineTotal,
      totalPrice: item.lineTotal
    }))
  });
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

function buildItemsRows(order: MailOrder, includePrice: boolean) {
  if (!order.items.length) return "<p>No items</p>";
  return order.items
    .map((item) =>
      includePrice
        ? `<p>${escapeHtml(item.productTitle)} × ${item.quantity} - ${formatCurrency(item.lineTotal)}</p>`
        : `<p>${escapeHtml(item.productTitle)} × ${item.quantity}</p>`
    )
    .join("");
}

function buildAddressBlock(order: MailOrder) {
  return [
    order.customerName ?? "-",
    order.addressLine1 ?? "-",
    order.addressLine2 ?? null,
    [order.shippingCity, order.shippingState].filter(Boolean).join(", ") || null,
    order.pinCode ? `PIN: ${escapeHtml(order.pinCode)}` : null,
    order.customerPhone ? `Phone: ${escapeHtml(order.customerPhone)}` : null
  ]
    .filter(Boolean)
    .map((line) => `<p>${line}</p>`)
    .join("");
}

export async function sendOrderConfirmationEmails(order: MailOrder) {
  const mailer = await getTransporter();
  if (!mailer) return false;

  const invoiceHtml = buildConfirmationInvoiceHtml(order);
  const itemList = buildItemsList(order);
  const address = [
    order.addressLine1 ?? "-",
    order.addressLine2 ?? null,
    [order.shippingCity, order.shippingState].filter(Boolean).join(", ") || null,
    order.pinCode ? `PIN ${order.pinCode}` : null
  ]
    .filter(Boolean)
    .join(", ");
  const addressBlock = buildAddressBlock(order);
  const orderItemsWithPrice = buildItemsRows(order, true);
  const attachments = order.invoicePath
    ? [
        {
          filename: `${order.invoiceNumber || order.id}.pdf`,
          path: order.invoicePath
        }
      ]
    : [
        {
          filename: `invoice-${order.id}.html`,
          content: invoiceHtml
        }
      ];

  const customerHtml = `
    <p>Dear Customer,</p>
    <p>Thank you for shopping with <strong>Nutrisuddh</strong>. Your order has been <strong>successfully confirmed</strong> and is now being prepared by our team.</p>
    <p>Please find your <strong>invoice attached</strong> with this email for your records.</p>
    <p><strong>Order Details</strong></p>
    <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
    <p><strong>Order Date:</strong> ${escapeHtml(formatDateTime(order.createdAt))}</p>
    <p><strong>Items Ordered:</strong></p>
    ${orderItemsWithPrice}
    <p><strong>Subtotal:</strong> ${formatCurrency(order.subtotal)}</p>
    <p><strong>Shipping:</strong> ${order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</p>
    <p><strong>Total Amount Paid:</strong> ${formatCurrency(order.total)}</p>
    <p><strong>Shipping Address:</strong></p>
    ${addressBlock}
    <p>We will notify you once your order has been <strong>dispatched</strong>.</p>
    <p>Thank you for choosing <strong>Nutrisuddh - Pure. Nutritious. Honest.</strong></p>
    <p>Warm regards,<br/>Team Nutrisuddh<br/><a href="https://www.nutrisuddh.com">www.nutrisuddh.com</a></p>
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
        attachments
      })
    );
  }

  const adminRecipients = getAdminNotificationRecipients();
  if (adminRecipients.length > 0) {
    tasks.push(
      mailer.sendMail({
        from: SMTP_FROM,
        to: adminRecipients.join(", "),
        subject: `New Order: ${order.id}`,
        html: adminHtml,
        attachments
      })
    );
  }

  try {
    await Promise.all(tasks);
    return tasks.length > 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    lastEmailError = message;
    console.error("[email] Order confirmation send failed", error);
    return false;
  }
}

export async function sendOrderStatusUpdateEmail(order: MailOrder) {
  const mailer = await getTransporter();
  if (!mailer) return false;
  if (!isEmailDeliverable(order.customerEmail)) return false;

  const addressBlock = buildAddressBlock(order);
  const orderItemsWithoutPrice = buildItemsRows(order, false);
  const deliveredOn = formatDateTime(new Date().toISOString());

  const html =
    order.status === "Dispatched"
      ? `
        <p>Dear Customer,</p>
        <p>Great news! Your <strong>Nutrisuddh order has been dispatched</strong> and is now on its way to you.</p>
        <p><strong>Order Details</strong></p>
        <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
        <p><strong>Items:</strong></p>
        ${orderItemsWithoutPrice}
        <p><strong>Shipping Address:</strong></p>
        ${addressBlock}
        <p>Your package should reach you within the estimated delivery timeframe.</p>
        <p>Thank you for choosing <strong>Nutrisuddh for healthy snacking.</strong></p>
        <p>Warm regards,<br/>Team Nutrisuddh<br/><a href="https://www.nutrisuddh.com">www.nutrisuddh.com</a></p>
      `
      : order.status === "Delivered" || order.status === "Completed"
        ? `
          <p>Dear Customer,</p>
          <p>Your <strong>Nutrisuddh order has been successfully delivered.</strong> We hope you enjoy the goodness and taste of our products.</p>
          <p><strong>Order Details</strong></p>
          <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
          <p><strong>Items Delivered:</strong></p>
          ${orderItemsWithoutPrice}
          <p><strong>Delivered On:</strong> ${escapeHtml(deliveredOn)}</p>
          <p>If everything arrived safely, we would love to hear your feedback. Your review helps us continue delivering the best quality snacks.</p>
          <p>If you need any assistance, feel free to reply to this email.</p>
          <p>Thank you for being a part of the <strong>Nutrisuddh family.</strong></p>
          <p>Warm regards,<br/>Team Nutrisuddh<br/><a href="https://www.nutrisuddh.com">www.nutrisuddh.com</a></p>
        `
        : `
          <p>Dear Customer,</p>
          <p>Your <strong>Nutrisuddh order has been successfully confirmed.</strong></p>
          <p><strong>Order Details</strong></p>
          <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
          <p><strong>Items Ordered:</strong></p>
          ${orderItemsWithoutPrice}
          <p>We will notify you once your order has been <strong>dispatched</strong>.</p>
          <p>Warm regards,<br/>Team Nutrisuddh<br/><a href="https://www.nutrisuddh.com">www.nutrisuddh.com</a></p>
        `;

  try {
    await mailer.sendMail({
      from: SMTP_FROM,
      to: order.customerEmail as string,
      subject: `Order Status Update: ${order.id} (${order.status})`,
      html
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    lastEmailError = message;
    console.error("[email] Order status update send failed", error);
    return false;
  }

  return true;
}

export async function sendPasswordResetCodeEmail(recipientEmail: string, code: string) {
  const mailer = await getTransporter();
  if (!mailer) return false;
  if (!isEmailDeliverable(recipientEmail)) return false;

  try {
    await mailer.sendMail({
      from: SMTP_FROM,
      to: recipientEmail,
      subject: "Nutri Suddh Password Reset Code",
      html: `
        <p>Your password reset code is:</p>
        <p style="font-size:20px;font-weight:700;letter-spacing:1px;">${escapeHtml(code)}</p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    lastEmailError = message;
    console.error("[email] Password reset email failed", error);
    return false;
  }

  return true;
}

export async function sendEmailLoginCodeEmail(recipientEmail: string, code: string) {
  const mailer = await getTransporter();
  if (!mailer) return false;
  if (!isEmailDeliverable(recipientEmail)) return false;

  try {
    await mailer.sendMail({
      from: SMTP_FROM,
      to: recipientEmail,
      subject: "Nutri Suddh Login Code",
      html: `
        <p>Your one-time login code is:</p>
        <p style="font-size:20px;font-weight:700;letter-spacing:1px;">${escapeHtml(code)}</p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    lastEmailError = message;
    console.error("[email] One-time login email failed", error);
    return false;
  }

  return true;
}

export async function sendAdminTestEmail() {
  const mailer = await getTransporter();
  if (!mailer) {
    const details = lastEmailError ? ` Last error: ${lastEmailError}` : "";
    throw new Error(`SMTP is not configured or reachable. Please check SMTP settings.${details}`);
  }
  if (!isEmailDeliverable(ADMIN_NOTIFICATION_EMAIL)) {
    throw new Error("ADMIN_NOTIFICATION_EMAIL is invalid.");
  }

  try {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    lastEmailError = message;
    throw new Error(`Unable to send test email. ${message}`);
  }
}

export async function sendFormReplyEmail(params: {
  toEmail: string;
  toName?: string | null;
  subject: string;
  message: string;
}) {
  const mailer = await getTransporter();
  if (!mailer) return false;
  if (!isEmailDeliverable(params.toEmail)) return false;

  try {
    await mailer.sendMail({
      from: SMTP_FROM,
      to: params.toEmail,
      subject: params.subject,
      html: `
        <p>Hi ${escapeHtml(params.toName?.trim() || "Customer")},</p>
        <p>${escapeHtml(params.message).replaceAll("\n", "<br/>")}</p>
        <p>Regards,<br/>Nutri Suddh Team</p>
      `
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    lastEmailError = message;
    console.error("[email] Form reply send failed", error);
    return false;
  }

  return true;
}

export async function sendFormSubmissionNotificationEmail(params: {
  formType: "contact" | "bulk";
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  company?: string | null;
  country?: string | null;
  quantity?: string | null;
  message: string;
  createdAt: string;
}) {
  const mailer = await getTransporter();
  if (!mailer) return false;
  if (!isEmailDeliverable(ADMIN_NOTIFICATION_EMAIL)) return false;

  const formLabel = params.formType === "bulk" ? "Bulk Query" : "Contact Enquiry";
  const details = [
    `<strong>Name:</strong> ${escapeHtml(params.name)}`,
    `<strong>Email:</strong> ${escapeHtml(params.email)}`,
    `<strong>Phone:</strong> ${escapeHtml(params.phone?.trim() || "-")}`,
    `<strong>Company:</strong> ${escapeHtml(params.company?.trim() || "-")}`,
    `<strong>Country:</strong> ${escapeHtml(params.country?.trim() || "-")}`,
    `<strong>Quantity:</strong> ${escapeHtml(params.quantity?.trim() || "-")}`,
    `<strong>Subject:</strong> ${escapeHtml(params.subject?.trim() || "-")}`,
    `<strong>Submitted At:</strong> ${escapeHtml(formatDateTime(params.createdAt))}`
  ];

  try {
    await mailer.sendMail({
      from: SMTP_FROM,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: `${formLabel}: ${params.name}`,
      html: `
        <p>A new <strong>${escapeHtml(formLabel)}</strong> was submitted on the website.</p>
        <p>${details.join("<br/>")}</p>
        <p><strong>Message:</strong><br/>${escapeHtml(params.message).replaceAll("\n", "<br/>")}</p>
      `
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    lastEmailError = message;
    console.error("[email] Form notification send failed", error);
    return false;
  }

  return true;
}
