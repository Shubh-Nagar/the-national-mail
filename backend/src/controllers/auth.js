import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../config/db.js';
import { signToken } from '../middleware/auth.js';
import { AppError } from '../utils/helpers.js';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);
  const [user] = await query('SELECT id, name, email, role, password_hash FROM users WHERE email = ?', [email.toLowerCase()]);
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) throw new AppError(401, 'That email and password do not match an account.');

  await query('UPDATE users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?', [user.id]);
  const { password_hash, ...safe } = user;
  res.json({ token: signToken(user), user: safe });
}

export async function me(req, res) {
  res.json({ user: req.user });
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.').max(128),
});

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = passwordSchema.parse(req.body);
  const [user] = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
  if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
    throw new AppError(400, 'Current password is incorrect.');
  }
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(newPassword, 10), req.user.id]);
  res.json({ ok: true, message: 'Password updated.' });
}
