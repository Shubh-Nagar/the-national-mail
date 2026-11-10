# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

The National Mail is a news website made of two separate npm packages plus SQL files:

- `backend/`: Express 5 REST API (ES modules, Node ≥18.18), MySQL via `mysql2`, JWT auth, Multer uploads, Zod validation.
- `frontend/`: Next.js 15 App Router (React 19, plain JS, no TypeScript), Tailwind 3, Tiptap 3 editor. Contains both the public site and the `/admin` newsroom.
- `database/`: `schema.sql` (drops and recreates all tables) and `seed.sql` (generated, see below).

`README.md` has the full API reference, env-var tables, and troubleshooting.

## Commands

Run these from the repo root unless noted. There is no test suite, linter, or formatter configured.

```bash
npm run install:all        # install root, backend and frontend deps
npm run setup:env          # copy .env.example -> backend/.env and frontend/.env.local (won't overwrite)
npm run db:setup           # DROP + recreate tables, load seed (prompts; add `-- --yes` or `-- --no-seed`)
npm run dev                # API on :5000 (node --watch) + Next on :3000, via concurrently
npm run build              # next build (frontend only; backend has no build)
docker compose up -d db    # optional MySQL 8 (user/pass national_mail)

npm --prefix backend run db:build-seed     # regenerate database/seed.sql from backend/scripts/seed-data.js
npm --prefix backend run create-admin -- you@example.com "Password123" "Name"   # create/reset an admin
```

Health check: `GET http://localhost:5000/api/health`. Default seeded login: `admin@nationalmail.in` / `Admin@12345`.

## Architecture

### Backend (`backend/src`)

- `server.js` starts `app.js` (helmet, CORS from `CLIENT_URL`, compression, static `/uploads`). `config/env.js` loads `backend/.env` and is the single source of config; it refuses to start in production without a ≥32-char `JWT_SECRET`.
- **All routes live in `routes/index.js`**, mounted under `/api`. Public, `/auth`, and an `admin` sub-router that applies `requireAuth` to everything under `/api/admin`. Add new endpoints there and point them at a controller.
- `services/articles.js` holds the shared article SQL (`LIST_SELECT`, `mapListRow`, `listPublished`) used by both public and admin controllers. The `PUBLISHED` constant defines public visibility.
- **Scheduling has no job runner.** The `articles.status` enum is only `draft|published|archived`. "Scheduled" means `status='published'` with a future `published_at`; the `PUBLISHED` condition (`published_at <= UTC_TIMESTAMP()`) hides it until then. The admin `?status=scheduled` filter and dashboard counts derive it the same way.
- Media URLs are stored relative (`/uploads/...`) and made absolute with `absUrl()` in `utils/helpers.js` using `PUBLIC_URL`. External media keep their full URL.
- Article HTML is sanitised server-side (`sanitizeContent` in `utils/helpers.js`, allow-list, only YouTube/Vimeo iframes). If you add Tiptap extensions that emit new tags or attributes, update that allow-list or they'll be stripped on save.
- Search uses the `FULLTEXT` index on `(title, excerpt, content)` in boolean mode via `toBooleanQuery`, falling back to `LIKE` for words shorter than 3 characters.
- `users` (logins, role `admin`/`editor`) are separate from `authors` (public bylines).

### Frontend (`frontend/`)

- `app/(site)/` is the public site, rendered on the server. It fetches through `lib/api.js` (`apiGet` / `apiGetSafe` / `apiGetOrNull`), which uses Next fetch caching. Pages set `export const revalidate = 60`, so content changes appear on the public site after up to about a minute. Server fetches use `INTERNAL_API_URL` when set, otherwise `NEXT_PUBLIC_API_URL`.
- `app/admin/` is the newsroom and is entirely client-side. `lib/adminApi.js` sends `Authorization: Bearer` with the token from `localStorage` (`tnm_admin_token`), and `components/admin/AuthProvider.jsx` gates the UI via `/auth/me`. `CrudPage.jsx` is the generic table/form used by the categories, tags and authors pages. `ArticleEditor.jsx` + `RichTextEditor.jsx` (Tiptap) make up the story editor.
- `next.config.mjs` derives the allowed `next/image` host from `NEXT_PUBLIC_API_URL`. `NEXT_PUBLIC_*` values are baked in at build/dev start, so restart after changing them.
- Site name, links and contact details are in `lib/site.js`. Colours and fonts are in `tailwind.config.js` and `app/globals.css`. Fonts are bundled via Fontsource; nothing loads from Google.

### Seed data

`database/seed.sql` is generated. Edit `backend/scripts/seed-data.js`, run `db:build-seed`, then `db:setup`. Seed images in `backend/uploads/seed/` come from `tools/generate-seed-images.py` (needs Pillow).
