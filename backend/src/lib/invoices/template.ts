import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type InvoiceItem = {
  productName: string;
  quantity: number;
  productPrice: number;
  totalPrice: number;
};

export type InvoiceTemplateData = {
  invoiceNumber: string;
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  discountCode?: string | null;
  discountAmount: number;
  shipping: number;
  total: number;
  items: InvoiceItem[];
};
const IMAGEKIT_LOGO_URL = "https://ik.imagekit.io/Falverra/brand-logo.png?updatedAt=1772868770392";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackLogoPath = path.resolve(__dirname, "..", "..", "..", "..", "frontend", "public", "logo", "brand-logo.png");
const fallbackLogoDataUri = fs.existsSync(fallbackLogoPath)
  ? `data:image/png;base64,${fs.readFileSync(fallbackLogoPath).toString("base64")}`
  : "";
const logoSrc = IMAGEKIT_LOGO_URL || fallbackLogoDataUri;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

export function buildInvoiceHtml(data: InvoiceTemplateData) {
  const itemRows = data.items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.productName)}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.productPrice)}</td>
          <td>${formatCurrency(item.totalPrice)}</td>
        </tr>
      `
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(data.invoiceNumber)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        color: #1f2937;
        background: #fffdf8;
        font-size: 12px;
        line-height: 1.5;
      }
      .page {
        padding: 30px 34px 28px;
        position: relative;
      }
      .watermark {
        position: absolute;
        left: 50%;
        top: 52%;
        width: 280px;
        transform: translate(-50%, -50%);
        opacity: 0.08;
        z-index: 0;
      }
      .content {
        position: relative;
        z-index: 1;
      }
      .header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        border-bottom: 2px solid #fcb03d;
        padding-bottom: 18px;
      }
      .header-left, .header-right, .section {
        width: 100%;
      }
      .logo {
        max-width: 130px;
        max-height: 52px;
        object-fit: contain;
        display: block;
        margin-bottom: 10px;
      }
      .invoice-title {
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0.04em;
        margin: 0 0 10px;
        color: #184b39;
      }
      .company-name {
        font-size: 15px;
        font-weight: 700;
        margin: 0 0 4px;
        color: #184b39;
      }
      .muted {
        color: #4b5563;
      }
      .header-right {
        max-width: 250px;
      }
      .header-right p,
      .header-left p,
      .section p {
        margin: 2px 0;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-top: 18px;
      }
      .section-title {
        font-size: 13px;
        font-weight: 700;
        margin: 0 0 8px;
        color: #184b39;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 22px;
        table-layout: fixed;
      }
      th, td {
        border: 1px solid #d1d5db;
        padding: 10px 8px;
        vertical-align: top;
        word-break: break-word;
      }
      th {
        background: #184b39;
        color: #ffffff;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        text-align: left;
      }
      tbody tr:nth-child(even) td {
        background: #fff8eb;
      }
      .totals {
        margin-top: 14px;
        margin-left: auto;
        width: 280px;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #e5e7eb;
      }
      .totals-row.total {
        font-weight: 700;
        font-size: 14px;
        border-bottom: 0;
        padding-top: 10px;
        color: #184b39;
      }
      .footer {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        margin-top: 34px;
        padding-top: 18px;
        border-top: 2px solid #fcb03d;
      }
      .footer-box {
        width: 100%;
      }
      .signature {
        text-align: right;
      }
      @page {
        margin: 18mm;
      }
    </style>
  </head>
  <body>
    <div class="page">
      ${logoSrc ? `<img src="${logoSrc}" alt="Nutrisuddh watermark" class="watermark" />` : ""}
      <div class="content">
        <div class="header">
          <div class="header-left">
            ${logoSrc ? `<img src="${logoSrc}" alt="Nutrisuddh" class="logo" />` : ""}
            <h1 class="invoice-title">TAX INVOICE</h1>
            <p class="company-name">NS AGRO OVERSEAS</p>
            <p>Registered Official Address: 123, Agro Lane, Siliguri, West Bengal, India - 734001</p>
            <p>Contact: +91 9876543210</p>
            <p>Email: contact@nutrisuddh.com</p>
            <p>Website: www.nutrisuddh.com</p>
            <p>GSTIN: 19AABCD1234E120</p>
            <p>FSSAI License No.: 12821004000321</p>
          </div>
          <div class="header-right">
            <p><strong>Invoice No.:</strong> ${escapeHtml(data.invoiceNumber)}</p>
            <p><strong>Date:</strong> ${escapeHtml(formatDate(data.orderDate))}</p>
            <p><strong>Order ID:</strong> ${escapeHtml(data.orderId)}</p>
          </div>
        </div>

        <div class="grid">
          <div class="section">
            <h2 class="section-title">Bill To</h2>
            <p><strong>Customer Name:</strong> ${escapeHtml(data.customerName)}</p>
            <p><strong>Contact:</strong> ${escapeHtml(data.customerPhone)}</p>
            <p><strong>Email:</strong> ${escapeHtml(data.customerEmail)}</p>
          </div>
          <div class="section">
            <h2 class="section-title">Ship To</h2>
            <p><strong>Address:</strong> ${escapeHtml(
              [data.addressLine1, data.addressLine2].filter(Boolean).join(", ") || "-"
            )}</p>
            <p>${escapeHtml([data.city, data.state].filter(Boolean).join(", ") || "-")}${data.pincode ? ` - ${escapeHtml(data.pincode)}` : ""}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 8%;">S No.</th>
              <th style="width: 42%;">Product Name</th>
              <th style="width: 12%;">Quantity</th>
              <th style="width: 18%;">Product Price</th>
              <th style="width: 20%;">Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal</span>
            <span>${formatCurrency(data.subtotal)}</span>
          </div>
          ${data.discountCode && data.discountAmount > 0
            ? `
              <div class="totals-row">
                <span>Coupon (${escapeHtml(data.discountCode)})</span>
                <span>- ${formatCurrency(data.discountAmount)}</span>
              </div>
            `
            : ""}
          <div class="totals-row">
            <span>Shipping</span>
            <span>${data.shipping === 0 ? "Free" : formatCurrency(data.shipping)}</span>
          </div>
          <div class="totals-row total">
            <span>Total Amount</span>
            <span>${formatCurrency(data.total)}</span>
          </div>
        </div>

        <div class="footer">
          <div class="footer-box">
            <p class="section-title">Terms & Conditions</p>
            <p>Goods once sold will not be taken back.</p>
            <p>Subject to Siliguri Jurisdiction.</p>
          </div>
          <div class="footer-box signature">
            <p class="section-title">Authorized Signatory</p>
            <p>For NS AGRO OVERSEAS</p>
            <p>(Computer Generated)</p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
