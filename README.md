# The National Mail

A complete news website: a public site for readers and a protected newsroom where editors write, schedule and publish stories.

| Layer | Stack |
| --- | --- |
| Frontend | Next.js 15 (App Router, React 19), Tailwind CSS 3, Tiptap 3 rich text editor |
| Backend | Node.js 18.18+ with Express 5, REST API, JWT auth, Multer uploads, Zod validation |
| Database | MySQL 8.0+ (MariaDB 10.6+ also works), normalised schema with a full-text search index |

```
the-national-mail/
├── backend/                 Express API
│   ├── src/
│   │   ├── app.js           Express app (security headers, CORS, static uploads)
│   │   ├── server.js        Entry point
│   │   ├── config/          env + MySQL pool
│   │   ├── middleware/      JWT auth, uploads, error handling
│   │   ├── controllers/     public, auth, adminArticles, taxonomy, media
│   │   ├── services/        shared article queries
│   │   ├── routes/          all routes in one file
│   │   └── utils/           slugs, HTML sanitising, video embeds, pagination
│   ├── scripts/             db-setup, create-admin, seed data + SQL generator
│   ├── uploads/seed/        illustrated images used by the sample articles
│   └── .env.example
├── frontend/                Next.js site + admin panel
│   ├── app/(site)/          public pages: home, category, article, tag, author, search, about, contact
│   ├── app/admin/           newsroom: dashboard, articles, editor, media, categories, tags, authors, messages, account
│   ├── components/site/     public UI
│   ├── components/admin/    admin UI (editor, media picker, CRUD tables)
│   ├── lib/                 API clients, formatting, site config
│   └── .env.example
├── database/
│   ├── schema.sql           tables, keys, indexes
│   └── seed.sql             sample categories, authors, tags and 16 articles
├── tools/generate-seed-images.py
├── docker-compose.yml       optional MySQL container
└── package.json             convenience scripts for both apps
```

---

## Quick start (about 5 minutes)

**You need:** Node.js 18.18 or newer (20 or 22 recommended) and a MySQL 8 server. If you don't have MySQL installed, Docker works: `docker compose up -d db`.

```bash
# 1. Install dependencies for the root, backend and frontend
npm run install:all

# 2. Create backend/.env and frontend/.env.local from the examples
npm run setup:env

# 3. Edit backend/.env: set DB_USER / DB_PASSWORD for your MySQL server,
#    and set JWT_SECRET to a long random string:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 4. Create the database, tables and sample content
npm run db:setup          # asks before it drops existing tables

# 5. Run the API (port 5000) and the website (port 3000) together
npm run dev
```

Open:

- Website: http://localhost:3000
- Newsroom: http://localhost:3000/admin
- API health check: http://localhost:5000/api/health

**Default admin login:** `admin@nationalmail.in` / `Admin@12345`. Change it straight away under **Account** in the newsroom, or set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before running `npm run db:setup`.

> Using the Docker MySQL? Set `DB_USER=national_mail` and `DB_PASSWORD=national_mail` in `backend/.env`.

### Running the apps separately

```bash
# Terminal 1
cd backend
npm install
cp .env.example .env      # then edit it
npm run db:setup
npm run dev               # http://localhost:5000

# Terminal 2
cd frontend
npm install
cp .env.example .env.local
npm run dev               # http://localhost:3000
```

### Loading the SQL files by hand

If you prefer the MySQL CLI or a GUI (phpMyAdmin, TablePlus, Workbench), you don't need `npm run db:setup`:

```bash
mysql -u root -p -e "CREATE DATABASE national_mail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u root -p national_mail < database/schema.sql
mysql -u root -p national_mail < database/seed.sql
```

---

## Environment variables

### `backend/.env`

| Variable | Default | What it does |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `PUBLIC_URL` | `http://localhost:5000` | Public address of the API. Used to build image and video links, so set it to your real API domain in production |
| `CLIENT_URL` | `http://localhost:3000` | Website origin(s) allowed by CORS, comma separated |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | `127.0.0.1` `3306` `root` (empty) `national_mail` | MySQL connection |
| `JWT_SECRET` | none | Secret used to sign admin sessions. Required in production, at least 32 characters |
| `JWT_EXPIRES_IN` | `7d` | How long an admin stays signed in |
| `ADMIN_NAME` `ADMIN_EMAIL` `ADMIN_PASSWORD` | empty | Optional. `npm run db:setup` creates or updates this admin |
| `UPLOAD_DIR` | `uploads` | Where uploaded files are stored, relative to `backend/` |
| `MAX_IMAGE_MB` / `MAX_VIDEO_MB` | `10` / `200` | Upload size limits |

### `frontend/.env.local`

| Variable | Default | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | API base URL used by the browser and the server |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Website address, used for canonical links, Open Graph tags and the sitemap |
| `INTERNAL_API_URL` | empty | Optional. A private API address for server-side rendering (for example `http://backend:5000/api` in Docker) |

---

## What's included

### Public website

- **Home:** lead story in a postage-stamp frame with a dated postmark, four supporting top stories, latest stories, most read, editor's picks, a section for every category, a video row and a newsletter sign-up
- **Category, tag and author pages** with pagination
- **Article page:** headline, standfirst, byline, featured image with caption, rich text body with drop cap and pull quotes, embedded YouTube/Vimeo or uploaded video, photo gallery with a full-screen viewer, tags, share buttons, author box, related stories, reading progress bar
- **Search** across headlines, standfirsts and body text using MySQL full-text search
- **About** and **Contact** (messages land in the newsroom; includes a spam honeypot and rate limiting)
- **SEO:** per-article title, description, keywords and canonical URL, Open Graph and Twitter cards, `NewsArticle` and `BreadcrumbList` structured data, `sitemap.xml` and `robots.txt`
- **Responsive and accessible:** mobile-first layouts, slide-out mobile menu, skip link, visible focus states, reduced-motion support

### Newsroom (`/admin`)

- Email and password sign-in with JWT, rate-limited
- **Dashboard:** published, draft and scheduled counts, total reads, unread messages, subscribers, recent edits, most read
- **Articles:** filter by status or category, search, publish or unpublish in one click, delete
- **Editor:** headline, URL slug, standfirst, rich text (headings, lists, quotes, links, alignment, inline images, YouTube embeds), category, author, tags with suggestions, featured image and caption, gallery with captions and ordering, embedded or uploaded video, featured and editor's pick switches, scheduling, SEO fields with a search-result preview, unsaved-changes warning, Ctrl/Cmd+S to save
- **Media library:** drag-and-drop upload of images and videos, alt text, usage count, copy URL, delete. Images and videos hosted elsewhere can be added by link
- **Categories, tags and authors:** create, edit, delete. Categories have a colour, sort order and home page visibility
- **Messages:** read contact submissions and reply by email
- **Account:** change password

### Scheduling

Set **Status** to Published and pick a future **Publish date**. The story stays hidden from the website until that time, then appears automatically without any background job.

---

## API reference

All responses are JSON. Admin routes need `Authorization: Bearer <token>` from `/api/auth/login`.

**Public**

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/home` | Everything the home page needs in one request |
| GET | `/api/categories` | Active categories with article counts |
| GET | `/api/categories/:slug` | One category |
| GET | `/api/articles` | `?page&limit&category&tag&author&featured=1&editors_pick=1&video=1&sort=popular&exclude=1,2` |
| GET | `/api/articles/:slug` | Full article with tags, gallery, video and related stories |
| POST | `/api/articles/:slug/view` | Counts a read |
| GET | `/api/search?q=` | Full-text search, paginated |
| GET | `/api/tags/:slug`, `/api/authors/:slug` | Tag and author details |
| GET | `/api/sitemap` | Slugs for the sitemap |
| POST | `/api/contact` | `{ name, email, subject?, message }` |
| POST | `/api/newsletter` | `{ email }` |

**Auth**

| Method | Path |
| --- | --- |
| POST | `/api/auth/login` `{ email, password }` returns `{ token, user }` |
| GET | `/api/auth/me` |
| PUT | `/api/auth/password` `{ currentPassword, newPassword }` |

**Admin**

| Resource | Routes |
| --- | --- |
| Stats | `GET /api/admin/stats` |
| Articles | `GET /api/admin/articles?status=draft\|published\|scheduled\|archived&q&category_id&page`, `POST`, `GET/PUT/DELETE /:id`, `PATCH /:id/status` |
| Categories, tags, authors | `GET`, `POST`, `PUT /:id`, `DELETE /:id` under `/api/admin/categories`, `/tags`, `/authors` |
| Media | `GET /api/admin/media?type&q&page`, `POST` (multipart, field `files`, up to 20 files), `POST /external` `{ url, type }`, `PATCH /:id` `{ alt_text }`, `DELETE /:id` |
| Messages | `GET /api/admin/messages`, `PATCH /:id` `{ is_read }`, `DELETE /:id` |
| Subscribers | `GET /api/admin/subscribers` |

Example article payload:

```json
{
  "title": "Headline",
  "excerpt": "Standfirst",
  "content": "<p>Rich text HTML</p>",
  "category_id": 2,
  "author_id": 1,
  "featured_media_id": 12,
  "featured_image_caption": "Caption",
  "status": "published",
  "published_at": "2026-11-12T03:30:00.000Z",
  "is_featured": true,
  "is_editors_pick": false,
  "video_type": "embed",
  "video_url": "https://www.youtube.com/watch?v=…",
  "tags": ["water conservation", "gujarat"],
  "gallery": [{ "media_id": 14, "caption": "Caption" }],
  "meta_title": "", "meta_description": "", "meta_keywords": "", "canonical_url": ""
}
```

---

## Database

`database/schema.sql` creates ten tables:

| Table | Purpose |
| --- | --- |
| `users` | Newsroom logins (bcrypt password hashes, role `admin` or `editor`) |
| `authors` | Public bylines, kept separate from logins so contributors don't need accounts |
| `categories` | Sections with colour, order and visibility |
| `tags` + `article_tags` | Many-to-many topics |
| `media` | Every image and video, uploaded (`local`) or linked (`external`) |
| `articles` | Stories, with foreign keys to category, author, featured image, uploaded video and the users who created and last edited them |
| `article_media` | Ordered photo gallery per article |
| `contact_messages` | Contact form submissions |
| `newsletter_subscribers` | Newsletter sign-ups |

Deleting a category or author keeps its articles (the link is set to `NULL`). Deleting an article removes its tag and gallery links. A `FULLTEXT` index on title, standfirst and body powers search.

To change the sample content, edit `backend/scripts/seed-data.js`, run `npm --prefix backend run db:build-seed` to regenerate `database/seed.sql`, then `npm run db:setup`.

The people, villages and organisations in the sample stories are fictional. Replace them before launch.

---

## Security notes

- Passwords are hashed with bcrypt. Sessions are signed JWTs; the API refuses to start in production without a strong `JWT_SECRET`
- Article HTML is sanitised on the server with an allow-list. Only YouTube and Vimeo iframes are allowed
- Uploads are checked by MIME type and size, images are verified by reading their dimensions, and SVG uploads are not accepted
- Sign-in and public forms are rate-limited. Helmet sets security headers
- The admin token lives in `localStorage`. For higher-risk deployments, serve the API and site from the same domain and move to an httpOnly cookie

## Deploying

1. **Database:** create a MySQL 8 database and load `schema.sql`. Load `seed.sql` only if you want the sample content
2. **API:** set `NODE_ENV=production`, `PUBLIC_URL`, `CLIENT_URL`, the `DB_*` values and `JWT_SECRET`, then run `npm ci && npm start` behind Nginx or a process manager such as PM2. Keep `backend/uploads` on persistent storage
3. **Website:** set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` before building, then `npm ci && npm run build && npm start`, or deploy the `frontend` folder to Vercel
4. **HTTPS:** serve both over HTTPS. If the API uses a different domain from the uploads, check `next.config.mjs` → `images.remotePatterns`

## Customising

- **Name, tagline, social links, contact email:** `frontend/lib/site.js`
- **Colours, type scale, fonts:** `frontend/tailwind.config.js` and `frontend/app/globals.css`
- **Design language:** ink-blue (`#1B2A4A`) and post-box red (`#B4232A`) on white, with pale inland-letter blue panels. Headlines and article text use Newsreader; interface text uses Mukta, which also covers Devanagari and the ₹ sign. Both fonts are bundled through Fontsource, so nothing loads from Google at runtime. The postage-stamp frame and postmark on the lead story are the one decorative flourish; everything else stays quiet
- **Sample images:** regenerate with `python3 tools/generate-seed-images.py` (needs Pillow), or replace them from the Media library

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `ECONNREFUSED` on `npm run db:setup` | MySQL isn't running, or `DB_HOST`/`DB_PORT` are wrong |
| `ER_ACCESS_DENIED_ERROR` | Check `DB_USER` and `DB_PASSWORD` in `backend/.env` |
| Home page says the news service is not responding | Start the API, and check `NEXT_PUBLIC_API_URL` in `frontend/.env.local` |
| Images don't show | `PUBLIC_URL` in `backend/.env` must match the address the browser can reach |
| CORS error in the newsroom | Add the website's exact origin to `CLIENT_URL` |
| Changed `NEXT_PUBLIC_*` values have no effect | Restart `npm run dev`, or rebuild for production |
| Need to reset a password | `npm --prefix backend run create-admin -- you@example.com "NewPassword123" "Your Name"` |
