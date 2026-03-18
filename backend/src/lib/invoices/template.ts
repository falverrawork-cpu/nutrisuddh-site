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
  customerGstn?: string;
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
const SELLER_NAME = "NS AGRO OVERSEAS";
const SELLER_ADDRESS = "Pranami mandir road, Siliguri, Dist Darjeeling WB 734001";
const SELLER_CONTACT = "+91 7001988499";
const SELLER_EMAIL = "contact@nutrisuddh.com";
const SELLER_WEBSITE = "www.nutrisuddh.com";
const SELLER_GSTIN = "19AKHPJ3048G1Z5";
const SELLER_FSSAI = "12825999000593";
const HSN_CODE = "20081930";
const GST_RATE_PERCENT = 5;
const CGST_RATE_PERCENT = GST_RATE_PERCENT / 2;
const SGST_RATE_PERCENT = GST_RATE_PERCENT / 2;
const PAYMENT_MODE = "Online";
const ORDER_SOURCE = "Website";

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
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const formatCustomerPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "-";
  const local = digits.slice(-10);
  if (local.length !== 10) return value;
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
};

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

function getInclusiveTaxBreakup(amount: number) {
  if (amount <= 0) {
    return {
      grossAmount: 0,
      taxableValue: 0,
      totalGst: 0,
      cgst: 0,
      sgst: 0
    };
  }

  const taxableValue = roundCurrency((amount * 100) / (100 + GST_RATE_PERCENT));
  const totalGst = roundCurrency(amount - taxableValue);
  const cgst = roundCurrency(totalGst / 2);
  const sgst = roundCurrency(totalGst - cgst);

  return {
    grossAmount: roundCurrency(amount),
    taxableValue,
    totalGst,
    cgst,
    sgst
  };
}

function getInvoiceTaxSummary(items: InvoiceItem[], fallbackSubtotal: number) {
  if (items.length === 0) {
    return getInclusiveTaxBreakup(fallbackSubtotal);
  }

  return items.reduce(
    (acc, item) => {
      const lineTax = getInclusiveTaxBreakup(item.totalPrice);
      acc.grossAmount = roundCurrency(acc.grossAmount + lineTax.grossAmount);
      acc.taxableValue = roundCurrency(acc.taxableValue + lineTax.taxableValue);
      acc.totalGst = roundCurrency(acc.totalGst + lineTax.totalGst);
      acc.cgst = roundCurrency(acc.cgst + lineTax.cgst);
      acc.sgst = roundCurrency(acc.sgst + lineTax.sgst);
      return acc;
    },
    {
      grossAmount: 0,
      taxableValue: 0,
      totalGst: 0,
      cgst: 0,
      sgst: 0
    }
  );
}

export function buildInvoiceHtml(data: InvoiceTemplateData) {
  const invoiceTax = getInvoiceTaxSummary(data.items, data.subtotal);
  const itemRows = data.items
    .map((item, index) => {
      const lineTax = getInclusiveTaxBreakup(item.totalPrice);
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.productName)}</td>
          <td>${HSN_CODE}</td>
          <td>${item.quantity}</td>
          <td>${GST_RATE_PERCENT}%</td>
          <td>${formatCurrency(lineTax.taxableValue)}</td>
          <td>${formatCurrency(item.totalPrice)}</td>
        </tr>
      `;
    })
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
        font-size: 11px;
        line-height: 1.4;
      }
      .page {
        padding: 18px 20px 14px;
        position: relative;
      }
      .watermark {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 280px;
        transform: translate(-50%, -50%);
        opacity: 0.06;
        z-index: 0;
      }
      .content {
        position: relative;
        z-index: 1;
      }
      .header {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 18px;
        border-bottom: 2px solid #fcb03d;
        padding-bottom: 14px;
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
      .header p,
      .section p,
      .meta-card p,
      .note-box p {
        margin: 2px 0;
      }
      .meta-card {
        border: 1px solid #d9dfd8;
        border-radius: 14px;
        background: #fffdfa;
        padding: 12px 14px;
      }
      .summary-grid,
      .footer {
        display: grid;
        gap: 14px;
      }
      .summary-grid {
        grid-template-columns: minmax(0, 1fr) 290px;
        margin-top: 14px;
        align-items: start;
      }
      .section {
        margin-top: 14px;
      }
      .section-card {
        border: 1px solid #d9dfd8;
        border-radius: 14px;
        background: #ffffff;
        padding: 12px 14px;
      }
      .section-title {
        font-size: 13px;
        font-weight: 700;
        margin: 0 0 6px;
        color: #184b39;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
        table-layout: fixed;
      }
      th, td {
        border: 1px solid #d1d5db;
        padding: 7px 6px;
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
        border: 1px solid #d9dfd8;
        border-radius: 14px;
        background: #fffdfa;
        padding: 12px 14px;
      }
      .totals-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 5px 0;
        border-bottom: 1px solid #e5e7eb;
      }
      .totals-row.total {
        font-weight: 700;
        font-size: 14px;
        border-bottom: 0;
        padding-top: 10px;
        color: #184b39;
      }
      .note-box {
        border: 1px dashed #cdd6cc;
        border-radius: 14px;
        background: #fbfcf7;
        padding: 14px 16px;
      }
      .footer {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 2px solid #fcb03d;
        grid-template-columns: 1fr;
      }
      .signature-box {
        min-height: 94px;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }
      .signature-line {
        border-top: 1px solid #9ca3af;
        margin-top: 24px;
        padding-top: 6px;
        text-align: right;
      }
      .muted {
        color: #4b5563;
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
          <div>
            ${logoSrc ? `<img src="${logoSrc}" alt="Nutrisuddh" class="logo" />` : ""}
            <h1 class="invoice-title">TAX INVOICE</h1>
            <p class="company-name">${SELLER_NAME}</p>
            <p><strong>Address:</strong> ${SELLER_ADDRESS}</p>
            <p><strong>Contact:</strong> ${SELLER_CONTACT}</p>
            <p><strong>Email:</strong> ${SELLER_EMAIL}</p>
            <p><strong>Website:</strong> ${SELLER_WEBSITE}</p>
            <p><strong>GSTIN:</strong> ${SELLER_GSTIN}</p>
            <p><strong>FSSAI License No.:</strong> ${SELLER_FSSAI}</p>
          </div>

          <div class="meta-card">
            <p><strong>Invoice No.:</strong> ${escapeHtml(data.invoiceNumber)}</p>
            <p><strong>Invoice Date:</strong> ${escapeHtml(formatDate(data.orderDate))}</p>
            <p><strong>Order ID:</strong> ${escapeHtml(data.orderId)}</p>
            <p><strong>Payment Mode:</strong> ${PAYMENT_MODE}</p>
            <p><strong>Order Source:</strong> ${ORDER_SOURCE}</p>
          </div>
        </div>

        <div class="section section-card">
            <h2 class="section-title">Bill To</h2>
            <p><strong>Name:</strong> ${escapeHtml(data.customerName)}</p>
            <p><strong>Address:</strong> ${escapeHtml(
              [data.addressLine1, data.addressLine2].filter(Boolean).join(", ") || "-"
            )}, ${escapeHtml([data.city, data.state].filter(Boolean).join(", ") || "-")}${data.pincode ? ` - ${escapeHtml(data.pincode)}` : ""}</p>
            <p><strong>GST:</strong> ${escapeHtml(data.customerGstn?.trim() || "Nil")}</p>
            <p><strong>Phone:</strong> ${escapeHtml(formatCustomerPhone(data.customerPhone))}</p>
            <p><strong>Email:</strong> ${escapeHtml(data.customerEmail)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 8%;">S No.</th>
              <th style="width: 30%;">Product Name</th>
              <th style="width: 14%;">HSN Code</th>
              <th style="width: 10%;">Qty</th>
              <th style="width: 12%;">GST Rate</th>
              <th style="width: 13%;">Taxable Value</th>
              <th style="width: 13%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="summary-grid">
          <div class="section-card">
            <p class="section-title">Terms & Conditions</p>
            <p>Goods once sold will not be taken back.</p>
            <p>Subject to Siliguri Jurisdiction.</p>
          </div>
          <div class="totals">
            <div class="totals-row">
              <span>Taxable Value</span>
              <span>${formatCurrency(invoiceTax.taxableValue)}</span>
            </div>
            <div class="totals-row">
              <span>CGST @ ${CGST_RATE_PERCENT}%</span>
              <span>${formatCurrency(invoiceTax.cgst)}</span>
            </div>
            <div class="totals-row">
              <span>SGST @ ${SGST_RATE_PERCENT}%</span>
              <span>${formatCurrency(invoiceTax.sgst)}</span>
            </div>
            <div class="totals-row">
              <span>Subtotal</span>
              <span>${formatCurrency(data.subtotal)}</span>
            </div>
            <div class="totals-row">
              <span>Shipping</span>
              <span>${data.shipping === 0 ? "Free" : formatCurrency(data.shipping)}</span>
            </div>
            ${data.discountCode && data.discountAmount > 0
              ? `
                <div class="totals-row">
                  <span>Coupon (${escapeHtml(data.discountCode)})</span>
                  <span>- ${formatCurrency(data.discountAmount)}</span>
                </div>
              `
              : ""}
            <div class="totals-row total">
              <span>Total Amount</span>
              <span>${formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="section-card signature-box">
            <p class="section-title">Authorized Signature</p>
            <p>For ${SELLER_NAME}</p>
            <p class="muted">(Computer Generated Invoice)</p>
            <div class="signature-line">Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
