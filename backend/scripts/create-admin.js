/**
 * Create or reset an admin account without touching any other data.
 * Usage: npm run create-admin -- you@example.com "StrongPassword" "Your Name"
 */
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';

const [email, password, name = 'Admin'] = process.argv.slice(2);

if (!email || !password) {
  console.error('Usage: npm run create-admin -- <email> <password> [name]');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
await pool.query(
  `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')
   ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin'`,
  [name, email.toLowerCase(), hash]
);
console.log(`Admin account ready: ${email}`);
await pool.end();
