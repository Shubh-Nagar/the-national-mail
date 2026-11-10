'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trash2, Mail } from 'lucide-react';
import { api } from '@/lib/adminApi';
import { useToast } from '@/components/admin/Toast';
import { PageTitle, LoadingBlock } from '@/components/admin/ui';
import { formatDateTime } from '@/lib/format';

export default function MessagesPage() {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => {
    api('/admin/messages').then((d) => setRows(d.data)).catch((e) => toast(e.message, 'error'));
  }, [toast]);
  useEffect(load, [load]);

  async function openMessage(m) {
    setOpenId(openId === m.id ? null : m.id);
    if (!m.is_read) {
      await api(`/admin/messages/${m.id}`, { method: 'PATCH', body: { is_read: true } }).catch(() => {});
      setRows((rs) => rs.map((r) => (r.id === m.id ? { ...r, is_read: true } : r)));
    }
  }

  async function remove(m) {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    try {
      const d = await api(`/admin/messages/${m.id}`, { method: 'DELETE' });
      toast(d.message);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  const unread = rows?.filter((r) => !r.is_read).length || 0;

  return (
    <>
      <PageTitle title="Messages" description={rows ? `${unread} unread. Messages sent through the Contact page arrive here.` : 'Messages sent through the Contact page arrive here.'} />
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        {!rows ? (
          <LoadingBlock />
        ) : rows.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted">No messages yet. They will appear here when readers use the Contact page.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((m) => (
              <li key={m.id}>
                <button onClick={() => openMessage(m)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-mist/60" aria-expanded={openId === m.id}>
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${m.is_read ? 'bg-transparent' : 'bg-post'}`} aria-label={m.is_read ? undefined : 'Unread'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className={`truncate ${m.is_read ? 'text-ink-700' : 'font-semibold text-ink-900'}`}>{m.name}</p>
                      <time className="shrink-0 text-xs text-muted">{formatDateTime(m.created_at)}</time>
                    </div>
                    <p className="truncate text-sm text-ink-700">{m.subject || 'No subject'}</p>
                    {openId !== m.id && <p className="truncate text-sm text-muted">{m.message}</p>}
                  </div>
                </button>
                {openId === m.id && (
                  <div className="border-t border-line bg-mist/50 px-9 py-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-body">{m.message}</p>
                    <div className="mt-4 flex gap-2">
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your message to The National Mail'}`)}`} className="btn-ink py-1.5"><Mail className="h-4 w-4" /> Reply to {m.email}</a>
                      <button onClick={() => remove(m)} className="btn-danger py-1.5"><Trash2 className="h-4 w-4" /> Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
