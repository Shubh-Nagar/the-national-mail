import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { AppError } from '../utils/helpers.js';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

/** Requires a valid `Authorization: Bearer <token>` header. Sets req.user. */
export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError(401, 'Sign in to continue.'));

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return next(new AppError(401, 'Your session has expired. Sign in again.'));
  }

  const [user] = await query('SELECT id, name, email, role FROM users WHERE id = ?', [payload.sub]);
  if (!user) return next(new AppError(401, 'This account no longer exists.'));
  req.user = user;
  next();
}

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'Your account does not have permission to do this.'));
  }
  next();
};
