'use client';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'tnm_admin_token';

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (t) => {
    try { localStorage.setItem(TOKEN_KEY, t); } catch {}
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  },
};

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * Authenticated request to the API.
 * `body` is sent as JSON unless it is a FormData instance.
 */
export async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Cannot reach the API. Check that the backend is running.');
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (res.status === 401 && path !== '/auth/login') {
    tokenStore.clear();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
  }
  if (!res.ok) throw new ApiError(res.status, data?.error || `Request failed (${res.status})`, data?.details);
  return data;
}

export const publicSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
