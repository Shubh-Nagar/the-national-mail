import slugifyLib from 'slugify';
import sanitizeHtmlLib from 'sanitize-html';
import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (what = 'Resource') => new AppError(404, `${what} not found`);

export function slugify(text) {
  return slugifyLib(String(text || '').replace(/[₹$€£]/g, ''), { lower: true, strict: true, trim: true }).slice(0, 200) || 'item';
}

/** Turn '/uploads/x.jpg' into an absolute URL; leave absolute URLs untouched. */
export function absUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${env.publicUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function stripHtml(html = '') {
  return String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export function readingTime(html = '') {
  const words = stripHtml(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const EMBED_HOSTS = ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'];

/** Rich-text HTML allow-list. Matches what the admin editor can produce. */
export function sanitizeContent(html = '') {
  return sanitizeHtmlLib(html, {
    allowedTags: [
      'p', 'br', 'hr', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'sub', 'sup',
      'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'figure', 'figcaption', 'img', 'iframe', 'video', 'source', 'div', 'span',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder', 'loading'],
      video: ['src', 'controls', 'poster', 'width', 'height', 'preload', 'playsinline'],
      source: ['src', 'type'],
      div: ['data-youtube-video', 'class'],
      span: ['class'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
      '*': ['style'],
    },
    allowedStyles: {
      '*': { 'text-align': [/^(left|right|center|justify)$/] },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    allowedIframeHostnames: EMBED_HOSTS,
    allowProtocolRelative: false,
    exclusiveFilter: (frame) => (frame.tag === 'iframe' || frame.tag === 'img') && !frame.attribs.src,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href || '');
        return {
          tagName,
          attribs: external ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' } : attribs,
        };
      },
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
    },
  });
}

/** Convert a YouTube / Vimeo page URL into an embeddable player URL. */
export function toEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^m\./, '');
    if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (u.pathname.startsWith('/embed/')) return `https://www.youtube-nocookie.com${u.pathname}`;
      if (u.pathname.startsWith('/shorts/')) return `https://www.youtube-nocookie.com/embed/${u.pathname.split('/')[2]}`;
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host === 'vimeo.com') return `https://player.vimeo.com/video/${u.pathname.split('/').filter(Boolean)[0]}`;
    if (host === 'player.vimeo.com') return url;
  } catch {
    return null;
  }
  return null;
}

export function parsePagination(q, { defaultLimit = 12, maxLimit = 50 } = {}) {
  const page = Math.max(1, parseInt(q.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(q.limit, 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

export function paginationMeta(page, limit, total) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export const toBool = (v) => v === true || v === 1 || v === '1' || v === 'true';
