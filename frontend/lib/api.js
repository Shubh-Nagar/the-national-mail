/**
 * Server-side data fetching for public pages.
 * Responses are cached by Next.js and refreshed every `revalidate` seconds.
 */
const PUBLIC_API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const API = (process.env.INTERNAL_API_URL || PUBLIC_API).replace(/\/$/, '');

export const publicApiUrl = PUBLIC_API;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function apiGet(path, { revalidate = 60, tags } = {}) {
  let res;
  try {
    res = await fetch(`${API}${path}`, { next: { revalidate, tags } });
  } catch (err) {
    throw new ApiError(503, `The news service is unreachable (${err.message}).`);
  }
  if (!res.ok) {
    let message = res.statusText;
    try {
      message = (await res.json()).error || message;
    } catch {}
    throw new ApiError(res.status, message);
  }
  return res.json();
}

/** Like apiGet, but returns `fallback` instead of throwing (for optional page sections). */
export async function apiGetSafe(path, fallback, opts) {
  try {
    return await apiGet(path, opts);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.warn(`[api] ${path}: ${err.message}`);
    return fallback;
  }
}

/** Returns null on 404 so pages can call notFound(). */
export async function apiGetOrNull(path, opts) {
  try {
    return await apiGet(path, opts);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}
