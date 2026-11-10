import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';
import { AppError, slugify } from '../utils/helpers.js';

export const IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};
export const VIDEO_TYPES = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
};

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    const now = new Date();
    const sub = path.join(String(now.getUTCFullYear()), String(now.getUTCMonth() + 1).padStart(2, '0'));
    const dir = path.join(env.uploadDir, sub);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = IMAGE_TYPES[file.mimetype] || VIDEO_TYPES[file.mimetype];
    const base = slugify(path.parse(file.originalname).name).slice(0, 60);
    cb(null, `${base}-${crypto.randomBytes(4).toString('hex')}.${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.maxVideoMb * 1024 * 1024, files: 20 },
  fileFilter(_req, file, cb) {
    if (IMAGE_TYPES[file.mimetype] || VIDEO_TYPES[file.mimetype]) return cb(null, true);
    cb(new AppError(400, `${file.originalname}: unsupported file type. Use JPG, PNG, WebP, GIF, AVIF, MP4, WebM, OGG or MOV.`));
  },
});
