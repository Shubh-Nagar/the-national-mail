import { z } from 'zod';
import { query, withTransaction } from '../config/db.js';
import { LIST_SELECT, mapListRow, getFullArticle, toBooleanQuery } from '../services/articles.js';
import {
  AppError, notFound, slugify, sanitizeContent, readingTime, toEmbedUrl, parsePagination, paginationMeta,
} from '../utils/helpers.js';

const optionalId = z.preprocess(
  (v) => (v === '' || v === undefined ? null : v),
  z.coerce.number().int().positive().nullable()
);
const boolish = z.preprocess((v) => v === true || v === 1 || v === '1' || v === 'true', z.boolean());
const optionalText = (max) => z.preprocess((v) => (v === '' ? null : v), z.string().trim().max(max).nullable().optional());

const articleSchema = z
  .object({
    title: z.string().trim().min(3, 'Give the article a headline (at least 3 characters).').max(255),
    slug: optionalText(255),
    excerpt: optionalText(500),
    content: z.string().max(5_000_000).optional().default(''),
    category_id: optionalId,
    author_id: optionalId,
    featured_media_id: optionalId,
    featured_image_caption: optionalText(300),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    published_at: z.preprocess((v) => (v === '' ? null : v), z.coerce.date().nullable().optional()),
    is_featured: boolish.default(false),
    is_editors_pick: boolish.default(false),
    video_type: z.enum(['none', 'embed', 'upload']).default('none'),
    video_url: optionalText(500),
    video_media_id: optionalId,
    tags: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
    gallery: z
      .array(z.object({ media_id: z.coerce.number().int().positive(), caption: optionalText(300) }))
      .max(50)
      .default([]),
    meta_title: optionalText(255),
    meta_description: optionalText(320),
    meta_keywords: optionalText(255),
    canonical_url: z.preprocess((v) => (v === '' ? null : v), z.string().url('Canonical URL must be a full URL.').max(500).nullable().optional()),
  })
  .superRefine((d, ctx) => {
    if (d.video_type === 'embed') {
      if (!d.video_url) ctx.addIssue({ code: 'custom', path: ['video_url'], message: 'Paste a YouTube or Vimeo link for the video.' });
      else if (!toEmbedUrl(d.video_url)) ctx.addIssue({ code: 'custom', path: ['video_url'], message: 'Only YouTube and Vimeo links can be embedded.' });
    }
    if (d.video_type === 'upload' && !d.video_media_id) {
      ctx.addIssue({ code: 'custom', path: ['video_media_id'], message: 'Choose a video from the media library.' });
    }
  });

async function uniqueSlug(conn, desired, excludeId = null) {
  const base = slugify(desired);
  let slug = base;
  for (let i = 2; i < 500; i += 1) {
    const [rows] = await conn.query('SELECT id FROM articles WHERE slug = ? AND (? IS NULL OR id <> ?)', [slug, excludeId, excludeId]);
    if (!rows.length) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

async function syncTags(conn, articleId, names) {
  await conn.query('DELETE FROM article_tags WHERE article_id = ?', [articleId]);
  const unique = [...new Map(names.map((n) => [slugify(n), n])).entries()];
  for (const [slug, name] of unique) {
    await conn.query('INSERT INTO tags (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)', [name, slug]);
    const [[{ id }]] = await conn.query('SELECT LAST_INSERT_ID() AS id');
    await conn.query('INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)', [articleId, id]);
  }
}

async function syncGallery(conn, articleId, gallery) {
  await conn.query('DELETE FROM article_media WHERE article_id = ?', [articleId]);
  const seen = new Set();
  let order = 0;
  for (const g of gallery) {
    if (seen.has(g.media_id)) continue;
    seen.add(g.media_id);
    await conn.query(
      'INSERT INTO article_media (article_id, media_id, sort_order, caption) VALUES (?, ?, ?, ?)',
      [articleId, g.media_id, order++, g.caption || null]
    );
  }
}

function toRow(d) {
  const content = sanitizeContent(d.content || '');
  let publishedAt = d.published_at || null;
  if (d.status === 'published' && !publishedAt) publishedAt = new Date();
  return {
    title: d.title,
    excerpt: d.excerpt || null,
    content,
    category_id: d.category_id,
    author_id: d.author_id,
    featured_media_id: d.featured_media_id,
    featured_image_caption: d.featured_image_caption || null,
    status: d.status,
    published_at: publishedAt,
    is_featured: d.is_featured ? 1 : 0,
    is_editors_pick: d.is_editors_pick ? 1 : 0,
    video_type: d.video_type,
    video_url: d.video_type === 'embed' ? d.video_url : null,
    video_media_id: d.video_type === 'upload' ? d.video_media_id : null,
    reading_time: readingTime(content),
    meta_title: d.meta_title || null,
    meta_description: d.meta_description || null,
    meta_keywords: d.meta_keywords || null,
    canonical_url: d.canonical_url || null,
  };
}

/* ---------------- handlers ---------------- */

export async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
  const where = ['1=1'];
  const params = [];
  const status = req.query.status;
  if (status === 'scheduled') {
    where.push("a.status = 'published' AND a.published_at > UTC_TIMESTAMP()");
  } else if (['draft', 'published', 'archived'].includes(status)) {
    where.push('a.status = ?');
    params.push(status);
  }
  if (req.query.category_id) { where.push('a.category_id = ?'); params.push(req.query.category_id); }
  if (req.query.q) {
    const boolQ = toBooleanQuery(req.query.q);
    if (boolQ) { where.push('MATCH(a.title, a.excerpt, a.content) AGAINST (? IN BOOLEAN MODE)'); params.push(boolQ); }
    else { where.push('a.title LIKE ?'); params.push(`%${req.query.q}%`); }
  }
  const whereSql = where.join(' AND ');
  const [rows, [{ total }]] = await Promise.all([
    query(`${LIST_SELECT} WHERE ${whereSql} ORDER BY COALESCE(a.published_at, a.updated_at) DESC, a.id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
    query(`SELECT COUNT(*) AS total FROM articles a WHERE ${whereSql}`, params),
  ]);
  res.json({ data: rows.map(mapListRow), pagination: paginationMeta(page, limit, Number(total)) });
}

export async function getOne(req, res) {
  const article = await getFullArticle({ id: Number(req.params.id) }, { publicOnly: false });
  if (!article) throw notFound('Article');
  res.json({ data: article });
}

export async function create(req, res) {
  const d = articleSchema.parse(req.body);
  const id = await withTransaction(async (conn) => {
    const row = toRow(d);
    row.slug = await uniqueSlug(conn, d.slug || d.title);
    row.created_by = req.user.id;
    row.updated_by = req.user.id;
    const [result] = await conn.query('INSERT INTO articles SET ?', [row]);
    await syncTags(conn, result.insertId, d.tags);
    await syncGallery(conn, result.insertId, d.gallery);
    return result.insertId;
  });
  res.status(201).json({ data: await getFullArticle({ id }, { publicOnly: false }), message: 'Article created.' });
}

export async function update(req, res) {
  const id = Number(req.params.id);
  const [existing] = await query('SELECT id, slug FROM articles WHERE id = ?', [id]);
  if (!existing) throw notFound('Article');
  const d = articleSchema.parse(req.body);
  await withTransaction(async (conn) => {
    const row = toRow(d);
    row.slug = d.slug && slugify(d.slug) !== existing.slug ? await uniqueSlug(conn, d.slug, id) : existing.slug;
    row.updated_by = req.user.id;
    await conn.query('UPDATE articles SET ? WHERE id = ?', [row, id]);
    await syncTags(conn, id, d.tags);
    await syncGallery(conn, id, d.gallery);
  });
  res.json({ data: await getFullArticle({ id }, { publicOnly: false }), message: 'Article saved.' });
}

const statusSchema = z.object({ status: z.enum(['draft', 'published', 'archived']) });

export async function setStatus(req, res) {
  const id = Number(req.params.id);
  const { status } = statusSchema.parse(req.body);
  const result = await query(
    `UPDATE articles SET status = ?, updated_by = ?,
       published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN UTC_TIMESTAMP() ELSE published_at END
     WHERE id = ?`,
    [status, req.user.id, status, id]
  );
  if (!result.affectedRows) throw notFound('Article');
  const labels = { published: 'Article published.', draft: 'Article moved to drafts.', archived: 'Article archived.' };
  res.json({ ok: true, message: labels[status] });
}

export async function remove(req, res) {
  const result = await query('DELETE FROM articles WHERE id = ?', [Number(req.params.id)]);
  if (!result.affectedRows) throw notFound('Article');
  res.json({ ok: true, message: 'Article deleted.' });
}

export async function stats(_req, res) {
  const [[counts], [media], [msgs], [subs], recent, top] = await Promise.all([
    query(`SELECT
        SUM(status = 'published' AND published_at <= UTC_TIMESTAMP()) AS published,
        SUM(status = 'published' AND published_at > UTC_TIMESTAMP())  AS scheduled,
        SUM(status = 'draft') AS drafts,
        SUM(status = 'archived') AS archived,
        COALESCE(SUM(views), 0) AS views
      FROM articles`),
    query("SELECT SUM(type = 'image') AS images, SUM(type = 'video') AS videos FROM media"),
    query('SELECT COUNT(*) AS unread FROM contact_messages WHERE is_read = 0'),
    query("SELECT COUNT(*) AS total FROM newsletter_subscribers WHERE status = 'subscribed'"),
    query(`${LIST_SELECT} ORDER BY a.updated_at DESC LIMIT 6`),
    query(`${LIST_SELECT} WHERE a.status = 'published' ORDER BY a.views DESC LIMIT 5`),
  ]);
  const n = (v) => Number(v || 0);
  if (!counts) throw new AppError(500, 'Could not load stats');
  res.json({
    data: {
      articles: { published: n(counts.published), scheduled: n(counts.scheduled), drafts: n(counts.drafts), archived: n(counts.archived) },
      views: n(counts.views),
      media: { images: n(media.images), videos: n(media.videos) },
      unreadMessages: n(msgs.unread),
      subscribers: n(subs.total),
      recent: recent.map(mapListRow),
      top: top.map(mapListRow),
    },
  });
}
