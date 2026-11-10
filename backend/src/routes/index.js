import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import * as pub from '../controllers/public.js';
import * as auth from '../controllers/auth.js';
import * as articles from '../controllers/adminArticles.js';
import * as tax from '../controllers/taxonomy.js';
import * as media from '../controllers/media.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Wait 15 minutes and try again.' },
});
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many submissions from this network. Try again in an hour.' },
});

/* ---------- public ---------- */
router.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
router.get('/home', pub.home);
router.get('/categories', pub.listCategories);
router.get('/categories/:slug', pub.getCategory);
router.get('/articles', pub.listArticles);
router.get('/search', pub.searchArticles);
router.get('/articles/:slug', pub.getArticle);
router.post('/articles/:slug/view', pub.recordView);
router.get('/tags/:slug', pub.getTag);
router.get('/authors/:slug', pub.getAuthor);
router.get('/sitemap', pub.sitemap);
router.post('/contact', formLimiter, pub.submitContact);
router.post('/newsletter', formLimiter, pub.subscribe);

/* ---------- auth ---------- */
router.post('/auth/login', loginLimiter, auth.login);
router.get('/auth/me', requireAuth, auth.me);
router.put('/auth/password', requireAuth, auth.changePassword);

/* ---------- admin (all routes below require a valid token) ---------- */
const admin = Router();
admin.use(requireAuth);

admin.get('/stats', articles.stats);

admin.get('/articles', articles.list);
admin.post('/articles', articles.create);
admin.get('/articles/:id', articles.getOne);
admin.put('/articles/:id', articles.update);
admin.patch('/articles/:id/status', articles.setStatus);
admin.delete('/articles/:id', articles.remove);

admin.get('/categories', tax.listCategories);
admin.post('/categories', tax.createCategory);
admin.put('/categories/:id', tax.updateCategory);
admin.delete('/categories/:id', tax.deleteCategory);

admin.get('/tags', tax.listTags);
admin.post('/tags', tax.createTag);
admin.put('/tags/:id', tax.updateTag);
admin.delete('/tags/:id', tax.deleteTag);

admin.get('/authors', tax.listAuthors);
admin.post('/authors', tax.createAuthor);
admin.put('/authors/:id', tax.updateAuthor);
admin.delete('/authors/:id', tax.deleteAuthor);

admin.get('/media', media.list);
admin.post('/media', upload.array('files', 20), media.uploadFiles);
admin.post('/media/external', media.addExternal);
admin.patch('/media/:id', media.update);
admin.delete('/media/:id', media.remove);

admin.get('/messages', tax.listMessages);
admin.patch('/messages/:id', tax.markMessage);
admin.delete('/messages/:id', tax.deleteMessage);
admin.get('/subscribers', tax.listSubscribers);

router.use('/admin', admin);

export default router;
