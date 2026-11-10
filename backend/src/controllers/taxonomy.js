import { z } from 'zod';
import { query } from '../config/db.js';
import { notFound, slugify, absUrl } from '../utils/helpers.js';

const text = (max) => z.preprocess((v) => (v === '' ? null : v), z.string().trim().max(max).nullable().optional());
const boolish = z.preprocess((v) => v === true || v === 1 || v === '1' || v === 'true', z.boolean());

/* ---------------- categories ---------------- */

const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name needs at least 2 characters.').max(80),
  slug: text(100),
  description: text(300),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Colour must be a hex value like #1B2A4A.').default('#1B2A4A'),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  show_on_home: boolish.default(true),
  is_active: boolish.default(true),
});

export async function listCategories(_req, res) {
  const rows = await query(
    `SELECT c.*, (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id) AS article_count
     FROM categories c ORDER BY c.sort_order, c.name`
  );
  res.json({ data: rows.map((r) => ({ ...r, article_count: Number(r.article_count), show_on_home: !!r.show_on_home, is_active: !!r.is_active })) });
}

export async function createCategory(req, res) {
  const d = categorySchema.parse(req.body);
  const result = await query('INSERT INTO categories SET ?', [{ ...d, slug: slugify(d.slug || d.name) }]);
  res.status(201).json({ data: { id: result.insertId }, message: 'Category created.' });
}

export async function updateCategory(req, res) {
  const d = categorySchema.parse(req.body);
  const result = await query('UPDATE categories SET ? WHERE id = ?', [{ ...d, slug: slugify(d.slug || d.name) }, Number(req.params.id)]);
  if (!result.affectedRows) throw notFound('Category');
  res.json({ ok: true, message: 'Category saved.' });
}

export async function deleteCategory(req, res) {
  const result = await query('DELETE FROM categories WHERE id = ?', [Number(req.params.id)]);
  if (!result.affectedRows) throw notFound('Category');
  res.json({ ok: true, message: 'Category deleted. Its articles are now uncategorised.' });
}

/* ---------------- tags ---------------- */

const tagSchema = z.object({
  name: z.string().trim().min(1, 'Enter a tag name.').max(60),
  slug: text(80),
});

export async function listTags(req, res) {
  const q = String(req.query.q || '').trim();
  const rows = await query(
    `SELECT t.id, t.name, t.slug, COUNT(at.article_id) AS article_count
     FROM tags t LEFT JOIN article_tags at ON at.tag_id = t.id
     ${q ? 'WHERE t.name LIKE ?' : ''}
     GROUP BY t.id ORDER BY article_count DESC, t.name LIMIT 500`,
    q ? [`%${q}%`] : []
  );
  res.json({ data: rows.map((r) => ({ ...r, article_count: Number(r.article_count) })) });
}

export async function createTag(req, res) {
  const d = tagSchema.parse(req.body);
  const result = await query('INSERT INTO tags (name, slug) VALUES (?, ?)', [d.name, slugify(d.slug || d.name)]);
  res.status(201).json({ data: { id: result.insertId }, message: 'Tag created.' });
}

export async function updateTag(req, res) {
  const d = tagSchema.parse(req.body);
  const result = await query('UPDATE tags SET name = ?, slug = ? WHERE id = ?', [d.name, slugify(d.slug || d.name), Number(req.params.id)]);
  if (!result.affectedRows) throw notFound('Tag');
  res.json({ ok: true, message: 'Tag saved.' });
}

export async function deleteTag(req, res) {
  const result = await query('DELETE FROM tags WHERE id = ?', [Number(req.params.id)]);
  if (!result.affectedRows) throw notFound('Tag');
  res.json({ ok: true, message: 'Tag deleted.' });
}

/* ---------------- authors ---------------- */

const authorSchema = z.object({
  name: z.string().trim().min(2, 'Author name needs at least 2 characters.').max(120),
  slug: text(140),
  designation: text(120),
  bio: text(2000),
  avatar_url: text(500),
});

export async function listAuthors(_req, res) {
  const rows = await query(
    `SELECT au.*, (SELECT COUNT(*) FROM articles a WHERE a.author_id = au.id) AS article_count
     FROM authors au ORDER BY au.name`
  );
  res.json({ data: rows.map((r) => ({ ...r, avatar_url: r.avatar_url, avatar_abs: absUrl(r.avatar_url), article_count: Number(r.article_count) })) });
}

export async function createAuthor(req, res) {
  const d = authorSchema.parse(req.body);
  const result = await query('INSERT INTO authors SET ?', [{ ...d, slug: slugify(d.slug || d.name) }]);
  res.status(201).json({ data: { id: result.insertId }, message: 'Author created.' });
}

export async function updateAuthor(req, res) {
  const d = authorSchema.parse(req.body);
  const result = await query('UPDATE authors SET ? WHERE id = ?', [{ ...d, slug: slugify(d.slug || d.name) }, Number(req.params.id)]);
  if (!result.affectedRows) throw notFound('Author');
  res.json({ ok: true, message: 'Author saved.' });
}

export async function deleteAuthor(req, res) {
  const result = await query('DELETE FROM authors WHERE id = ?', [Number(req.params.id)]);
  if (!result.affectedRows) throw notFound('Author');
  res.json({ ok: true, message: 'Author deleted. Their articles no longer show a byline.' });
}

/* ---------------- contact messages ---------------- */

export async function listMessages(_req, res) {
  const rows = await query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 500');
  res.json({ data: rows.map((r) => ({ ...r, is_read: !!r.is_read })) });
}

export async function markMessage(req, res) {
  const isRead = req.body?.is_read === false ? 0 : 1;
  const result = await query('UPDATE contact_messages SET is_read = ? WHERE id = ?', [isRead, Number(req.params.id)]);
  if (!result.affectedRows) throw notFound('Message');
  res.json({ ok: true });
}

export async function deleteMessage(req, res) {
  const result = await query('DELETE FROM contact_messages WHERE id = ?', [Number(req.params.id)]);
  if (!result.affectedRows) throw notFound('Message');
  res.json({ ok: true, message: 'Message deleted.' });
}

export async function listSubscribers(_req, res) {
  const rows = await query('SELECT id, email, status, created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 5000');
  res.json({ data: rows });
}
