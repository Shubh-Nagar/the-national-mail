import { z } from 'zod';
import { query } from '../config/db.js';
import { listPublished, mapListRow, LIST_SELECT, PUBLISHED, getFullArticle } from '../services/articles.js';
import { notFound, parsePagination, paginationMeta, absUrl, toBool } from '../utils/helpers.js';

/* ---------------- categories ---------------- */

export async function listCategories(_req, res) {
  const rows = await query(
    `SELECT c.id, c.name, c.slug, c.description, c.color, c.sort_order,
            (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id AND ${PUBLISHED}) AS article_count
     FROM categories c WHERE c.is_active = 1 ORDER BY c.sort_order, c.name`
  );
  res.json({ data: rows.map((r) => ({ ...r, article_count: Number(r.article_count) })) });
}

export async function getCategory(req, res) {
  const [cat] = await query(
    'SELECT id, name, slug, description, color FROM categories WHERE slug = ? AND is_active = 1',
    [req.params.slug]
  );
  if (!cat) throw notFound('Category');
  res.json({ data: cat });
}

/* ---------------- articles ---------------- */

export async function listArticles(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const exclude = String(req.query.exclude || '')
    .split(',')
    .map((n) => parseInt(n, 10))
    .filter(Boolean);
  const { items, total } = await listPublished(
    {
      category: req.query.category,
      tag: req.query.tag,
      author: req.query.author,
      featured: toBool(req.query.featured),
      editorsPick: toBool(req.query.editors_pick),
      video: toBool(req.query.video),
      exclude,
    },
    { limit, offset, orderBy: req.query.sort === 'popular' ? 'a.views DESC, a.published_at DESC' : 'a.published_at DESC' }
  );
  res.json({ data: items, pagination: paginationMeta(page, limit, total) });
}

export async function searchArticles(req, res) {
  const q = String(req.query.q || '').trim().slice(0, 100);
  const { page, limit, offset } = parsePagination(req.query);
  if (!q) return res.json({ data: [], pagination: paginationMeta(page, limit, 0), query: '' });
  const { items, total } = await listPublished({ q, category: req.query.category }, { limit, offset });
  res.json({ data: items, pagination: paginationMeta(page, limit, total), query: q });
}

export async function getArticle(req, res) {
  const article = await getFullArticle({ slug: req.params.slug }, { publicOnly: true });
  if (!article) throw notFound('Article');

  // Related: same category first, then most recent to fill the gap.
  const related = [];
  if (article.categoryId) {
    const { items } = await listPublished({ category: article.category.slug, exclude: [article.id] }, { limit: 4 });
    related.push(...items);
  }
  if (related.length < 4) {
    const { items } = await listPublished({ exclude: [article.id, ...related.map((r) => r.id)] }, { limit: 4 - related.length });
    related.push(...items);
  }

  // Drop admin-only fields from the public payload.
  const { status, createdAt, featuredMediaId, videoMediaId, videoUrl, videoType, categoryId, authorId, ...pub } = article;
  res.json({ data: { ...pub, related } });
}

export async function recordView(req, res) {
  await query(`UPDATE articles a SET a.views = a.views + 1 WHERE a.slug = ? AND ${PUBLISHED}`, [req.params.slug]);
  res.status(204).end();
}

/* ---------------- home ---------------- */

export async function home(_req, res) {
  // 1 lead + 4 secondary stories; top up with latest if fewer are featured.
  const featured = (await listPublished({ featured: true }, { limit: 5 })).items;
  if (featured.length < 5) {
    const extra = await listPublished({ exclude: featured.map((a) => a.id) }, { limit: 5 - featured.length });
    featured.push(...extra.items);
  }
  const used = featured.map((a) => a.id);

  const [latest, trending, editorsPicks, videos, sectionRows] = await Promise.all([
    listPublished({ exclude: used.length ? used : undefined }, { limit: 6 }),
    listPublished({}, { limit: 5, orderBy: 'a.views DESC, a.published_at DESC' }),
    listPublished({ editorsPick: true }, { limit: 4 }),
    listPublished({ video: true }, { limit: 6 }),
    query(
      `SELECT * FROM (
         SELECT x.*, ROW_NUMBER() OVER (PARTITION BY x.c_id ORDER BY x.published_at DESC) AS rn
         FROM (${LIST_SELECT} WHERE ${PUBLISHED} AND c.is_active = 1 AND c.show_on_home = 1) x
       ) ranked WHERE ranked.rn <= 4`
    ),
  ]);

  const cats = await query(
    'SELECT id, name, slug, description, color FROM categories WHERE is_active = 1 AND show_on_home = 1 ORDER BY sort_order, name'
  );
  const sections = cats
    .map((c) => ({
      category: c,
      articles: sectionRows
        .filter((r) => r.c_id === c.id)
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        .map(mapListRow),
    }))
    .filter((s) => s.articles.length > 0);

  res.json({
    data: {
      featured,
      latest: latest.items,
      trending: trending.items,
      editorsPicks: editorsPicks.items,
      videos: videos.items,
      sections,
    },
  });
}

/* ---------------- tags & authors ---------------- */

export async function getTag(req, res) {
  const [tag] = await query('SELECT id, name, slug FROM tags WHERE slug = ?', [req.params.slug]);
  if (!tag) throw notFound('Tag');
  res.json({ data: tag });
}

export async function getAuthor(req, res) {
  const [author] = await query(
    'SELECT id, name, slug, designation, bio, avatar_url FROM authors WHERE slug = ?',
    [req.params.slug]
  );
  if (!author) throw notFound('Author');
  res.json({ data: { ...author, avatar_url: absUrl(author.avatar_url) } });
}

/* ---------------- contact & newsletter ---------------- */

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(120),
  email: z.string().trim().email('Enter a valid email address.').max(190),
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(10, 'Your message needs at least 10 characters.').max(5000),
  website: z.string().optional(), // honeypot
});

export async function submitContact(req, res) {
  const body = contactSchema.parse(req.body);
  if (body.website) return res.status(201).json({ ok: true }); // bot filled the hidden field
  await query(
    'INSERT INTO contact_messages (name, email, subject, message, ip_address) VALUES (?, ?, ?, ?, ?)',
    [body.name, body.email.toLowerCase(), body.subject || null, body.message, req.ip]
  );
  res.status(201).json({ ok: true, message: 'Message sent. Our team replies within two working days.' });
}

const newsletterSchema = z.object({ email: z.string().trim().email('Enter a valid email address.').max(190) });

export async function subscribe(req, res) {
  const { email } = newsletterSchema.parse(req.body);
  await query(
    `INSERT INTO newsletter_subscribers (email) VALUES (?)
     ON DUPLICATE KEY UPDATE status = 'subscribed'`,
    [email.toLowerCase()]
  );
  res.status(201).json({ ok: true, message: 'Subscribed. The next edition will be in your inbox.' });
}

/* ---------------- sitemap ---------------- */

export async function sitemap(_req, res) {
  const [articles, categories, tags, authors] = await Promise.all([
    query(`SELECT a.slug, a.updated_at FROM articles a WHERE ${PUBLISHED} ORDER BY a.published_at DESC LIMIT 5000`),
    query('SELECT slug, updated_at FROM categories WHERE is_active = 1'),
    query('SELECT t.slug FROM tags t WHERE EXISTS (SELECT 1 FROM article_tags at WHERE at.tag_id = t.id)'),
    query('SELECT slug, updated_at FROM authors'),
  ]);
  res.json({ data: { articles, categories, tags, authors } });
}
