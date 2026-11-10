'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Check, Film, Link2 } from 'lucide-react';
import { api } from '@/lib/adminApi';
import { useToast } from './Toast';
import { Modal, Spinner } from './ui';

export const ACCEPT = {
  image: 'image/jpeg,image/png,image/webp,image/gif,image/avif',
  video: 'video/mp4,video/webm,video/ogg,video/quicktime',
};

/** Uploads FileList to the media library. Returns created media items. */
export async function uploadFiles(files) {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('files', f));
  return api('/admin/media', { method: 'POST', body: form });
}

export function MediaThumb({ item, className = '' }) {
  if (item.type === 'video') {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 bg-ink-900 p-2 text-white/80 ${className}`}>
        <Film className="h-6 w-6" />
        <span className="line-clamp-1 max-w-full break-all text-[11px]">{item.originalName}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.url} alt={item.alt || ''} className={`object-cover ${className}`} loading="lazy" />;
}

export default function MediaPicker({ open, onClose, onSelect, type = 'image', multiple = false, title }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [link, setLink] = useState('');

  const load = useCallback(() => {
    const sp = new URLSearchParams({ limit: '60' });
    if (type !== 'all') sp.set('type', type);
    if (q) sp.set('q', q);
    api(`/admin/media?${sp}`).then((d) => setItems(d.data)).catch((e) => toast(e.message, 'error'));
  }, [type, q, toast]);

  useEffect(() => {
    if (open) {
      setSelected([]);
      load();
    }
  }, [open, load]);

  async function onFiles(e) {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const d = await uploadFiles(e.target.files);
      toast(d.message);
      d.rejected?.forEach((r) => toast(r, 'error'));
      setItems((xs) => [...d.data, ...(xs || [])]);
      setSelected((s) => (multiple ? [...d.data, ...s] : [d.data[0]]));
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function addLink(e) {
    e.preventDefault();
    try {
      const d = await api('/admin/media/external', { method: 'POST', body: { url: link, type: type === 'all' ? 'image' : type } });
      setItems((xs) => [d.data, ...(xs || [])]);
      setSelected((s) => (multiple ? [d.data, ...s] : [d.data]));
      setLink('');
      setShowLink(false);
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const toggle = (item) => {
    setSelected((s) => {
      const has = s.some((x) => x.id === item.id);
      if (!multiple) return has ? [] : [item];
      return has ? s.filter((x) => x.id !== item.id) : [...s, item];
    });
  };

  const label = type === 'video' ? 'video' : 'image';

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={title || (multiple ? `Choose ${label}s` : `Choose an ${label}`)}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-ink"
            disabled={!selected.length}
            onClick={() => {
              onSelect(multiple ? selected : selected[0]);
              onClose();
            }}
          >
            {multiple ? `Add ${selected.length || ''} ${label}${selected.length === 1 ? '' : 's'}` : `Use this ${label}`}
          </button>
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input ref={fileRef} type="file" accept={type === 'all' ? `${ACCEPT.image},${ACCEPT.video}` : ACCEPT[type]} multiple={multiple} className="hidden" onChange={onFiles} />
        <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Spinner className="h-4 w-4 text-white" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading…' : `Upload ${label}${multiple ? 's' : ''}`}
        </button>
        <button className="btn-ghost" onClick={() => setShowLink((v) => !v)}>
          <Link2 className="h-4 w-4" /> Add from a link
        </button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by file name or alt text"
          className="field ml-auto w-full py-1.5 text-sm sm:w-64"
          aria-label="Search media"
        />
      </div>
      {showLink && (
        <form onSubmit={addLink} className="mb-4 flex gap-2 rounded-md bg-mist p-3">
          <input type="url" required value={link} onChange={(e) => setLink(e.target.value)} placeholder={`https://… (${label} URL)`} className="field py-1.5 text-sm" aria-label={`${label} URL`} />
          <button className="btn-ink">Add</button>
        </form>
      )}

      {!items ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No {label}s yet. Upload one to get started.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => {
            const idx = selected.findIndex((x) => x.id === item.id);
            const isSel = idx >= 0;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  className={`relative block aspect-square w-full overflow-hidden rounded-md ring-offset-2 ${isSel ? 'ring-2 ring-post' : 'ring-1 ring-line hover:ring-ink/40'}`}
                  aria-pressed={isSel}
                  aria-label={item.alt || item.originalName}
                >
                  <MediaThumb item={item} className="h-full w-full" />
                  {isSel && (
                    <span className="absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-post px-1 text-xs font-bold text-white">
                      {multiple ? idx + 1 : <Check className="h-4 w-4" />}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
