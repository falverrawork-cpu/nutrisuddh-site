import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../db";
import { allocateInvoiceNumber } from "./number";
import { renderInvoicePdf } from "./pdf";
import { buildInvoiceHtml } from "./template";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoicesDir = path.resolve(__dirname, "..", "..", "..", "data", "invoices");

export const INVOICE_ELIGIBLE_STATUSES = new Set([
  "Order Confirmed",
  "Confirmed",
  "Dispatched",
  "Delivered",
  "Completed"
]);

type OrderRow = {
  id: string;
  user_id: number;
  created_at: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_gstn: string | null;
  address_line1: string | null;
  address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  pin_code: string | null;
  invoice_number: string | null;
  invoice_path: string | null;
  invoice_generated_at: string | null;
};

type OrderItemRow = {
  product_title: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

const getOrderById = db.prepare("SELECT * FROM orders WHERE id = ?");
const getOrderItemsByOrderId = db.prepare(
  "SELECT product_title, quantity, unit_price, line_total FROM order_items WHERE order_id = ? ORDER BY id ASC"
);
const setOrderInvoiceMetadata = db.prepare(
  `UPDATE orders
   SET invoice_number = ?, invoice_path = ?, invoice_generated_at = ?
   WHERE id = ?`
);
const setOrderInvoiceNumberOnly = db.prepare(
  "UPDATE orders SET invoice_number = ? WHERE id = ?"
);

export type InvoiceRecord = {
  orderId: string;
  invoiceNumber: string;
  invoicePath: string;
  invoiceGeneratedAt: string;
};

export function getInvoiceDownloadFilename(invoiceNumber: string) {
  return `${invoiceNumber}.pdf`;
}

export function getOrderInvoiceRecord(orderId: string) {
  const row = getOrderById.get(orderId) as OrderRow | undefined;
  if (!row || !row.invoice_number || !row.invoice_path || !row.invoice_generated_at) {
    return null;
  }

  return {
    orderId: row.id,
    invoiceNumber: row.invoice_number,
    invoicePath: row.invoice_path,
    invoiceGeneratedAt: row.invoice_generated_at,
    status: row.status,
    userId: row.user_id
  };
}

export async function ensureOrderInvoice(orderId: string): Promise<InvoiceRecord> {
  const order = getOrderById.get(orderId) as OrderRow | undefined;

  if (!order) {
    throw new Error("Order not found.");
  }

  if (!INVOICE_ELIGIBLE_STATUSES.has(order.status)) {
    throw new Error("Invoice is only available for confirmed orders.");
  }

  const items = getOrderItemsByOrderId.all(orderId) as OrderItemRow[];
  const invoiceNumber = order.invoice_number ?? allocateInvoiceNumber(order.created_at);

  if (!order.invoice_number) {
    setOrderInvoiceNumberOnly.run(invoiceNumber, orderId);
  }

  const outputPath = path.join(invoicesDir, `${invoiceNumber}.pdf`);
  const html = buildInvoiceHtml({
    invoiceNumber,
    orderId: order.id,
    orderDate: order.created_at,
    customerName: order.customer_name ?? "Customer",
    customerPhone: order.customer_phone ?? "-",
    customerEmail: order.customer_email ?? "-",
    customerGstn: order.customer_gstn ?? "",
    addressLine1: order.address_line1 ?? "-",
    addressLine2: order.address_line2 ?? "",
    city: order.shipping_city ?? "",
    state: order.shipping_state ?? "",
    pincode: order.pin_code ?? "",
    subtotal: order.subtotal,
    discountCode: (order as { discount_code?: string | null }).discount_code ?? null,
    discountAmount: (order as { discount_amount?: number }).discount_amount ?? 0,
    shipping: order.shipping,
    total: order.total,
    items: items.map((item) => ({
      productName: `${item.product_title} (70 gms)`,
      quantity: item.quantity,
      productPrice: item.unit_price,
      totalPrice: item.line_total
    }))
  });

  await renderInvoicePdf(html, outputPath);

  const generatedAt = new Date().toISOString();
  setOrderInvoiceMetadata.run(invoiceNumber, outputPath, generatedAt, orderId);

  return {
    orderId,
    invoiceNumber,
    invoicePath: outputPath,
    invoiceGeneratedAt: generatedAt
  };
}
