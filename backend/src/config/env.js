import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '..', '..');

dotenv.config({ path: path.join(ROOT_DIR, '.env'), quiet: true });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const port = parseInt(process.env.PORT || '5000', 10);

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  if (isProd) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters in production.');
  }
  jwtSecret = jwtSecret || 'dev-only-insecure-secret-change-me-0123456789';
  console.warn('[env] JWT_SECRET is missing or short. Using a development fallback. Set it in backend/.env.');
}

export const env = {
  nodeEnv,
  isProd,
  port,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'national_mail',
  },
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  publicUrl: (process.env.PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, ''),
  uploadDir: path.resolve(ROOT_DIR, process.env.UPLOAD_DIR || 'uploads'),
  maxImageMb: parseInt(process.env.MAX_IMAGE_MB || '10', 10),
  maxVideoMb: parseInt(process.env.MAX_VIDEO_MB || '200', 10),
};
