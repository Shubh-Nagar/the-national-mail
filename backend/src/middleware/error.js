import { ZodError } from 'zod';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError } from '../utils/helpers.js';

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, `No API route for ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return res.status(400).json({ error: details[0]?.message || 'Invalid input', details });
  }
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? `File is too large. Images can be up to ${env.maxImageMb} MB and videos up to ${env.maxVideoMb} MB.`
      : err.message;
    return res.status(400).json({ error: msg });
  }
  if (err?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'An item with this name or slug already exists. Choose a different one.' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  console.error(err);
  res.status(500).json({ error: env.isProd ? 'Something went wrong on the server.' : err.message });
}
