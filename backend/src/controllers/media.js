import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { imageSize } from 'image-size';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { IMAGE_TYPES } from '../middleware/upload.js';
import { AppError, notFound, absUrl, parsePagination, paginationMeta } from '../utils/helpers.js';

const toPublicPath = (absPath) => '/uploads/' + path.relative(env.uploadDir, absPath).split(path.sep).join('/');

function mapMedia(r) {
  return {
    id: r.id,
    type: r.type,
    storage: r.storage,
    url: absUrl(r.url),
    originalName: r.original_name,
    mimeType: r.mime_type,
    sizeBytes: r.size_bytes ? Number(r.size_bytes) : null,
    width: r.width,
    height: r.height,
    alt: r.alt_text,
    createdAt: r.created_at,
    usage: r.usage_count !== undefined ? Number(r.usage_count) : undefined,
  };
}

export async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 40, maxLimit: 100 });
  const where = ['1=1'];
  const params = [];
  if (['image', 'video'].includes(req.query.type)) { where.push('m.type = ?'); params.push(req.query.type); }
  if (req.query.q) { where.push('(m.original_name LIKE ? OR m.alt_text LIKE ?)'); params.push(`%${req.query.q}%`, `%${req.query.q}%`); }
  const w = where.join(' AND ');
  const [rows, [{ total }]] = await Promise.all([
    query(
      `SELECT m.*,
         (SELECT COUNT(*) FROM articles a WHERE a.featured_media_id = m.id OR a.video_media_id = m.id)
         + (SELECT COUNT(*) FROM article_media am WHERE am.media_id = m.id) AS usage_count
       FROM media m WHERE ${w} ORDER BY m.created_at DESC, m.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    ),
    query(`SELECT COUNT(*) AS total FROM media m WHERE ${w}`, params),
  ]);
  res.json({ data: rows.map(mapMedia), pagination: paginationMeta(page, limit, Number(total)) });
}

export async function uploadFiles(req, res) {
  const files = req.files || [];
  if (!files.length) throw new AppError(400, 'Choose at least one file to upload.');

  const created = [];
  const rejected = [];
  for (const f of files) {
    const isImage = Boolean(IMAGE_TYPES[f.mimetype]);
    if (isImage && f.size > env.maxImageMb * 1024 * 1024) {
      await fs.unlink(f.path).catch(() => {});
      rejected.push(`${f.originalname} is larger than ${env.maxImageMb} MB.`);
      continue;
    }
    let width = null;
    let height = null;
    if (isImage) {
      try {
        const dim = imageSize(await fs.readFile(f.path));
        width = dim.width || null;
        height = dim.height || null;
      } catch {
        await fs.unlink(f.path).catch(() => {});
        rejected.push(`${f.originalname} is not a readable image.`);
        continue;
      }
    }
    const alt = (req.body?.alt_text || path.parse(f.originalname).name.replace(/[-_]+/g, ' ')).slice(0, 300);
    const result = await query(
      `INSERT INTO media (type, storage, url, original_name, mime_type, size_bytes, width, height, alt_text, uploaded_by)
       VALUES (?, 'local', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [isImage ? 'image' : 'video', toPublicPath(f.path), f.originalname.slice(0, 255), f.mimetype, f.size, width, height, alt, req.user.id]
    );
    const [row] = await query('SELECT * FROM media WHERE id = ?', [result.insertId]);
    created.push(mapMedia(row));
  }

  if (!created.length) throw new AppError(400, rejected.join(' '));
  res.status(201).json({
    data: created,
    rejected,
    message: `${created.length} file${created.length === 1 ? '' : 's'} uploaded.`,
  });
}

const externalSchema = z.object({
  url: z.string().url('Enter a full https:// link.').max(500),
  type: z.enum(['image', 'video']),
  alt_text: z.string().max(300).optional(),
});

/** Register an image or video hosted elsewhere (e.g. a CDN) without uploading it. */
export async function addExternal(req, res) {
  const d = externalSchema.parse(req.body);
  const result = await query(
    "INSERT INTO media (type, storage, url, original_name, alt_text, uploaded_by) VALUES (?, 'external', ?, ?, ?, ?)",
    [d.type, d.url, path.basename(new URL(d.url).pathname).slice(0, 255) || d.url.slice(0, 255), d.alt_text || null, req.user.id]
  );
  const [row] = await query('SELECT * FROM media WHERE id = ?', [result.insertId]);
  res.status(201).json({ data: mapMedia(row), message: 'Link added to the media library.' });
}

export async function update(req, res) {
  const { alt_text } = z.object({ alt_text: z.string().trim().max(300) }).parse(req.body);
  const result = await query('UPDATE media SET alt_text = ? WHERE id = ?', [alt_text, Number(req.params.id)]);
  if (!result.affectedRows) throw notFound('File');
  res.json({ ok: true, message: 'Alt text saved.' });
}

export async function remove(req, res) {
  const [row] = await query('SELECT * FROM media WHERE id = ?', [Number(req.params.id)]);
  if (!row) throw notFound('File');
  await query('DELETE FROM media WHERE id = ?', [row.id]);
  if (row.storage === 'local' && row.url.startsWith('/uploads/') && !row.url.startsWith('/uploads/seed/')) {
    const filePath = path.join(env.uploadDir, row.url.replace(/^\/uploads\//, ''));
    if (filePath.startsWith(env.uploadDir)) await fs.unlink(filePath).catch(() => {});
  }
  res.json({ ok: true, message: 'File deleted.' });
}
