'use client';

import { useEffect } from 'react';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

/** Counts one view per article per browser session. */
export default function ViewTracker({ slug }) {
  useEffect(() => {
    const key = `tnm-viewed-${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {}
    fetch(`${API}/articles/${encodeURIComponent(slug)}/view`, { method: 'POST', keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}
