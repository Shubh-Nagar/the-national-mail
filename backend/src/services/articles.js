import { query } from '../config/db.js';
import { absUrl, toEmbedUrl } from '../utils/helpers.js';

/** Condition that makes an article visible on the public site. */
export const PUBLISHED = "a.status = 'published' AND a.published_at IS NOT NULL AND a.published_at <= UTC_TIMESTAMP()";

export const LIST_SELECT = `
  SELECT a.id, a.title, a.slug, a.excerpt, a.status, a.is_featured, a.is_editors_pick,
         a.video_type, a.views, a.reading_time, a.published_at, a.created_at, a.updated_at,
         c.id AS c_id, c.name AS c_name, c.slug AS c_slug, c.color AS c_color,
         au.id AS au_id, au.name AS au_name, au.slug AS au_slug, au.avatar_url AS au_avatar,
         m.url AS m_url, m.alt_text AS m_alt, m.width AS m_w, m.height AS m_h
  FROM articles a
  LEFT JOIN categories c ON c.id = a.category_id
  LEFT JOIN authors au   ON au.id = a.author_id
  LEFT JOIN media m      ON m.id = a.featured_media_id`;

export function mapListRow(r) {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    status: r.status,
    isFeatured: !!r.is_featured,
    isEditorsPick: !!r.is_editors_pick,
    hasVideo: r.video_type && r.video_type !== 'none',
    views: r.views,
    readingTime: r.reading_time,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    category: r.c_id ? { id: r.c_id, name: r.c_name, slug: r.c_slug, color: r.c_color } : null,
    author: r.au_id ? { id: r.au_id, name: r.au_name, slug: r.au_slug, avatarUrl: absUrl(r.au_avatar) } : null,
    image: r.m_url ? { url: absUrl(r.m_url), alt: r.m_alt || r.title, width: r.m_w, height: r.m_h } : null,
  };
}

/** Builds a MySQL boolean-mode full-text expression from free text. */
export function toBooleanQuery(q) {
  const words = String(q)
    .replace(/[+\-<>()~*"@]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 8);
  return words.length ? words.map((w) => `${w}*`).join(' ') : null;
}

/**
 * Public, paginated article list with optional filters.
 * filters: { category, tag, author, featured, editorsPick, video, q, exclude[] }
 */
export async function listPublished(filters = {}, { limit = 12, offset = 0, orderBy = 'a.published_at DESC' } = {}) {
  const where = [PUBLISHED];
  const params = [];
  const joins = [];
  let relevance = null;

  if (filters.category) { where.push('c.slug = ?'); params.push(filters.category); }
  if (filters.author) { where.push('au.slug = ?'); params.push(filters.author); }
  if (filters.featured) where.push('a.is_featured = 1');
  if (filters.editorsPick) where.push('a.is_editors_pick = 1');
  if (filters.video) where.push("a.video_type <> 'none'");
  if (filters.exclude?.length) { where.push('a.id NOT IN (?)'); params.push(filters.exclude); }
  if (filters.tag) {
    joins.push('JOIN article_tags atg ON atg.article_id = a.id JOIN tags tg ON tg.id = atg.tag_id');
    where.push('tg.slug = ?');
    params.push(filters.tag);
  }
  if (filters.q) {
    const boolQ = toBooleanQuery(filters.q);
    if (boolQ) {
      where.push('MATCH(a.title, a.excerpt, a.content) AGAINST (? IN BOOLEAN MODE)');
      params.push(boolQ);
      relevance = boolQ;
    } else {
      where.push('(a.title LIKE ? OR a.excerpt LIKE ?)');
      params.push(`%${filters.q}%`, `%${filters.q}%`);
    }
  }

  const base = `${LIST_SELECT} ${joins.join(' ')} WHERE ${where.join(' AND ')}`;
  const countSql = `SELECT COUNT(DISTINCT a.id) AS total FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id
    LEFT JOIN authors au ON au.id = a.author_id
    ${joins.join(' ')} WHERE ${where.join(' AND ')}`;

  let sql = base;
  let sqlParams = [...params];
  if (relevance) {
    sql = base.replace('SELECT a.id,', 'SELECT MATCH(a.title, a.excerpt, a.content) AGAINST (? IN BOOLEAN MODE) AS score, a.id,');
    sqlParams = [relevance, ...params];
    orderBy = 'score DESC, a.published_at DESC';
  }
  sql += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;

  const [rows, [{ total }]] = await Promise.all([
    query(sql, [...sqlParams, limit, offset]),
    query(countSql, params),
  ]);
  return { items: rows.map(mapListRow), total: Number(total) };
}

export async function getTags(articleId) {
  return query(
    `SELECT t.id, t.name, t.slug FROM tags t JOIN article_tags at ON at.tag_id = t.id
     WHERE at.article_id = ? ORDER BY t.name`,
    [articleId]
  );
}

export async function getGallery(articleId) {
  const rows = await query(
    `SELECT m.id, m.url, m.alt_text, m.width, m.height, am.caption, am.sort_order
     FROM article_media am JOIN media m ON m.id = am.media_id
     WHERE am.article_id = ? ORDER BY am.sort_order, m.id`,
    [articleId]
  );
  return rows.map((r) => ({
    id: r.id, url: absUrl(r.url), alt: r.alt_text || r.caption || '', width: r.width, height: r.height, caption: r.caption,
  }));
}

/** Full article (all columns + relations). `publicOnly` hides drafts and scheduled posts. */
export async function getFullArticle({ id, slug }, { publicOnly = true } = {}) {
  const where = [];
  const params = [];
  if (id) { where.push('a.id = ?'); params.push(id); }
  if (slug) { where.push('a.slug = ?'); params.push(slug); }
  if (publicOnly) where.push(PUBLISHED);

  const [row] = await query(
    `SELECT a.*, c.name AS c_name, c.slug AS c_slug, c.color AS c_color,
            au.name AS au_name, au.slug AS au_slug, au.avatar_url AS au_avatar, au.designation AS au_designation, au.bio AS au_bio,
            m.url AS m_url, m.alt_text AS m_alt, m.width AS m_w, m.height AS m_h,
            vm.url AS vm_url, vm.mime_type AS vm_mime
     FROM articles a
     LEFT JOIN categories c ON c.id = a.category_id
     LEFT JOIN authors au ON au.id = a.author_id
     LEFT JOIN media m ON m.id = a.featured_media_id
     LEFT JOIN media vm ON vm.id = a.video_media_id
     WHERE ${where.join(' AND ')} LIMIT 1`,
    params
  );
  if (!row) return null;

  const [tags, gallery] = await Promise.all([getTags(row.id), getGallery(row.id)]);

  let video = null;
  if (row.video_type === 'embed' && row.video_url) {
    video = { type: 'embed', url: row.video_url, embedUrl: toEmbedUrl(row.video_url) };
  } else if (row.video_type === 'upload' && row.vm_url) {
    video = { type: 'upload', url: absUrl(row.vm_url), mimeType: row.vm_mime, mediaId: row.video_media_id };
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content || '',
    status: row.status,
    isFeatured: !!row.is_featured,
    isEditorsPick: !!row.is_editors_pick,
    readingTime: row.reading_time,
    views: row.views,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    categoryId: row.category_id,
    authorId: row.author_id,
    category: row.category_id ? { id: row.category_id, name: row.c_name, slug: row.c_slug, color: row.c_color } : null,
    author: row.author_id
      ? { id: row.author_id, name: row.au_name, slug: row.au_slug, avatarUrl: absUrl(row.au_avatar), designation: row.au_designation, bio: row.au_bio }
      : null,
    featuredMediaId: row.featured_media_id,
    image: row.m_url ? { url: absUrl(row.m_url), alt: row.m_alt || row.title, width: row.m_w, height: row.m_h, caption: row.featured_image_caption } : null,
    featuredImageCaption: row.featured_image_caption,
    videoType: row.video_type,
    videoUrl: row.video_url,
    videoMediaId: row.video_media_id,
    video,
    gallery,
    tags,
    seo: {
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      metaKeywords: row.meta_keywords,
      canonicalUrl: row.canonical_url,
    },
  };
}
