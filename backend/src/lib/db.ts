import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "..", "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "app.db");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  expected_delivery_date TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  discount_code TEXT,
  discount_amount INTEGER NOT NULL,
  shipping INTEGER NOT NULL,
  total INTEGER NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  pin_code TEXT,
  invoice_number TEXT UNIQUE,
  invoice_path TEXT,
  invoice_generated_at TEXT,
  last_status_email_sent_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  line_total INTEGER NOT NULL,
  image TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
 );

CREATE TABLE IF NOT EXISTS email_login_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  company TEXT,
  country TEXT,
  quantity TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  reply_subject TEXT,
  reply_message TEXT,
  replied_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_sequences (
  year INTEGER PRIMARY KEY,
  current_value INTEGER NOT NULL
);
`);

const orderColumns = db.prepare("PRAGMA table_info(orders)").all() as Array<{ name: string }>;
const hasLastStatusEmailColumn = orderColumns.some((column) => column.name === "last_status_email_sent_at");
if (!hasLastStatusEmailColumn) {
  db.exec("ALTER TABLE orders ADD COLUMN last_status_email_sent_at TEXT");
}
const hasShippingCityColumn = orderColumns.some((column) => column.name === "shipping_city");
if (!hasShippingCityColumn) {
  db.exec("ALTER TABLE orders ADD COLUMN shipping_city TEXT");
}
const hasShippingStateColumn = orderColumns.some((column) => column.name === "shipping_state");
if (!hasShippingStateColumn) {
  db.exec("ALTER TABLE orders ADD COLUMN shipping_state TEXT");
}
const hasInvoiceNumberColumn = orderColumns.some((column) => column.name === "invoice_number");
if (!hasInvoiceNumberColumn) {
  db.exec("ALTER TABLE orders ADD COLUMN invoice_number TEXT");
}
const hasInvoicePathColumn = orderColumns.some((column) => column.name === "invoice_path");
if (!hasInvoicePathColumn) {
  db.exec("ALTER TABLE orders ADD COLUMN invoice_path TEXT");
}
const hasInvoiceGeneratedAtColumn = orderColumns.some((column) => column.name === "invoice_generated_at");
if (!hasInvoiceGeneratedAtColumn) {
  db.exec("ALTER TABLE orders ADD COLUMN invoice_generated_at TEXT");
}
