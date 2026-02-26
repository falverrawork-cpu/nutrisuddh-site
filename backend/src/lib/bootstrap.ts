import bcrypt from "bcryptjs";
import { db } from "./db";

export async function ensureAdminUser() {
  const adminName = (process.env.ADMIN_NAME ?? "NS AgroOverseas").trim();
  const adminPhone = (process.env.ADMIN_PHONE ?? "8918926359").trim();
  const adminEmail = (process.env.ADMIN_EMAIL ?? "nsagrooverseas25@gmail.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin";

  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(adminEmail) as { id: number } | undefined;

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  if (existing) {
    db.prepare(
      `UPDATE users
       SET name = ?, phone = ?, password_hash = ?, role = 'admin'
       WHERE id = ?`
    ).run(adminName, adminPhone, passwordHash, existing.id);
    console.log(`Updated admin user: ${adminEmail}`);
    return;
  }

  db.prepare(
    `INSERT INTO users (name, email, phone, password_hash, role, created_at)
     VALUES (?, ?, ?, ?, 'admin', ?)`
  ).run(adminName, adminEmail, adminPhone, passwordHash, new Date().toISOString());

  console.log(`Seeded admin user: ${adminEmail}`);
}
