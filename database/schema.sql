-- =====================================================================
--  The National Mail — MySQL schema
--  Compatible with MySQL 8.0+ and MariaDB 10.6+
--
--  WARNING: this file DROPS and recreates every table. Running it on an
--  existing database wipes its content. Use it for first-time setup or
--  for resetting a development database.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS article_media;
DROP TABLE IF EXISTS article_tags;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS newsletter_subscribers;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- users: people who can sign in to the admin panel
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(190) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  last_login_at  DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- authors: public bylines (kept separate from login accounts)
-- ---------------------------------------------------------------------
CREATE TABLE authors (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name         VARCHAR(120) NOT NULL,
  slug         VARCHAR(140) NOT NULL,
  designation  VARCHAR(120) NULL,
  bio          TEXT NULL,
  avatar_url   VARCHAR(500) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_authors_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
CREATE TABLE categories (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(80)  NOT NULL,
  slug          VARCHAR(100) NOT NULL,
  description   VARCHAR(300) NULL,
  color         CHAR(7)      NOT NULL DEFAULT '#1B2A4A',
  sort_order    INT          NOT NULL DEFAULT 0,
  show_on_home  TINYINT(1)   NOT NULL DEFAULT 1,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------
CREATE TABLE tags (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(60) NOT NULL,
  slug        VARCHAR(80) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tags_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- media: uploaded files (storage = local) or linked files (external)
-- ---------------------------------------------------------------------
CREATE TABLE media (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type           ENUM('image','video') NOT NULL,
  storage        ENUM('local','external') NOT NULL DEFAULT 'local',
  url            VARCHAR(500) NOT NULL,           -- '/uploads/2026/11/x.jpg' or 'https://…'
  original_name  VARCHAR(255) NULL,
  mime_type      VARCHAR(100) NULL,
  size_bytes     BIGINT UNSIGNED NULL,
  width          INT UNSIGNED NULL,
  height         INT UNSIGNED NULL,
  alt_text       VARCHAR(300) NULL,
  uploaded_by    INT UNSIGNED NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_media_type_created (type, created_at),
  CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- articles
--   A published article whose published_at is in the future is treated
--   as scheduled: it stays hidden from the public site until that time.
-- ---------------------------------------------------------------------
CREATE TABLE articles (
  id                      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title                   VARCHAR(255) NOT NULL,
  slug                    VARCHAR(255) NOT NULL,
  excerpt                 VARCHAR(500) NULL,
  content                 LONGTEXT NULL,
  featured_media_id       INT UNSIGNED NULL,
  featured_image_caption  VARCHAR(300) NULL,
  category_id             INT UNSIGNED NULL,
  author_id               INT UNSIGNED NULL,
  status                  ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  is_featured             TINYINT(1) NOT NULL DEFAULT 0,
  is_editors_pick         TINYINT(1) NOT NULL DEFAULT 0,
  video_type              ENUM('none','embed','upload') NOT NULL DEFAULT 'none',
  video_url               VARCHAR(500) NULL,      -- YouTube / Vimeo link when video_type = 'embed'
  video_media_id          INT UNSIGNED NULL,      -- media row when video_type = 'upload'
  reading_time            SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  views                   INT UNSIGNED NOT NULL DEFAULT 0,
  meta_title              VARCHAR(255) NULL,
  meta_description        VARCHAR(320) NULL,
  meta_keywords           VARCHAR(255) NULL,
  canonical_url           VARCHAR(500) NULL,
  published_at            DATETIME NULL,
  created_by              INT UNSIGNED NULL,
  updated_by              INT UNSIGNED NULL,
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_articles_slug (slug),
  KEY idx_articles_status_published (status, published_at),
  KEY idx_articles_category (category_id, status, published_at),
  KEY idx_articles_author (author_id, status, published_at),
  KEY idx_articles_featured (is_featured, status, published_at),
  KEY idx_articles_views (views),
  FULLTEXT KEY ft_articles_search (title, excerpt, content),
  CONSTRAINT fk_articles_featured_media FOREIGN KEY (featured_media_id) REFERENCES media (id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_video_media    FOREIGN KEY (video_media_id)    REFERENCES media (id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_category       FOREIGN KEY (category_id)       REFERENCES categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_author         FOREIGN KEY (author_id)         REFERENCES authors (id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_created_by     FOREIGN KEY (created_by)        REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_articles_updated_by     FOREIGN KEY (updated_by)        REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- article_tags: many-to-many between articles and tags
-- ---------------------------------------------------------------------
CREATE TABLE article_tags (
  article_id  INT UNSIGNED NOT NULL,
  tag_id      INT UNSIGNED NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  KEY idx_article_tags_tag (tag_id),
  CONSTRAINT fk_article_tags_article FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
  CONSTRAINT fk_article_tags_tag     FOREIGN KEY (tag_id)     REFERENCES tags (id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- article_media: ordered image gallery for an article
-- ---------------------------------------------------------------------
CREATE TABLE article_media (
  article_id  INT UNSIGNED NOT NULL,
  media_id    INT UNSIGNED NOT NULL,
  sort_order  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  caption     VARCHAR(300) NULL,
  PRIMARY KEY (article_id, media_id),
  KEY idx_article_media_media (media_id),
  CONSTRAINT fk_article_media_article FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
  CONSTRAINT fk_article_media_media   FOREIGN KEY (media_id)   REFERENCES media (id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- contact_messages: submissions from the public Contact page
-- ---------------------------------------------------------------------
CREATE TABLE contact_messages (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(190) NOT NULL,
  subject     VARCHAR(200) NULL,
  message     TEXT NOT NULL,
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contact_read_created (is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- newsletter_subscribers
-- ---------------------------------------------------------------------
CREATE TABLE newsletter_subscribers (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email       VARCHAR(190) NOT NULL,
  status      ENUM('subscribed','unsubscribed') NOT NULL DEFAULT 'subscribed',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_newsletter_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
