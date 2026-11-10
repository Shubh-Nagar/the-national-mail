'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Copy, Trash2 } from 'lucide-react';
import { api } from '@/lib/adminApi';
import { useToast } from '@/components/admin/Toast';
import { PageTitle, Modal, LoadingBlock, Spinner, formatBytes } from '@/components/admin/ui';
import { ACCEPT, MediaThumb, uploadFiles } from '@/components/admin/MediaPicker';
import { formatDateTime } from '@/lib/format';

const FILTERS = [
  { value: '', label: 'All files' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
];

export default function MediaPage() {
  const toast = useToast();
  const fileRef = useRef(null);
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(null);
  const [alt, setAlt] = useState('');

  const load = useCallback(() => {
    const sp = new URLSearchParams({ page: String(page), limit: '48' });
    if (type) sp.set('type', type);
    if (q) sp.set('q', q);
    api(`/admin/media?${sp}`)
      .then((d) => {
        setItems(d.data);
        setPagination(d.pagination);
      })
      .catch((e) => toast(e.message, 'error'));
  }, [type, q, page, toast]);
  useEffect(load, [load]);

  async function handleFiles(files) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const d = await uploadFiles(files);
      toast(d.message);
      d.rejected?.forEach((r) => toast(r, 'error'));
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function saveAlt() {
    try {
      const d = await api(`/admin/media/${active.id}`, { method: 'PATCH', body: { alt_text: alt } });
      toast(d.message);
      setActive(null);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  async function remove(item) {
    const warn = item.usage ? ` It is used in ${item.usage} place${item.usage === 1 ? '' : 's'} and will be removed from those articles.` : '';
    if (!window.confirm(`Delete ${item.originalName || 'this file'}?${warn}`)) return;
    try {
      const d = await api(`/admin/media/${item.id}`, { method: 'DELETE' });
      toast(d.message);
      setActive(null);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      <PageTitle
        title="Media library"
        description="Images and videos used in articles. Drag files anywhere on this page to upload."
        actions={
          <>
            <input ref={fileRef} type="file" multiple accept={`${ACCEPT.image},${ACCEPT.video}`} className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
            <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Spinner className="h-4 w-4 text-white" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Uploading…' : 'Upload files'}
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg border border-line bg-white p-1">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => { setType(f.value); setPage(1); }} className={`rounded-md px-3 py-1.5 text-sm font-medium ${type === f.value ? 'bg-ink text-white' : 'text-ink-700 hover:bg-mist'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by file name or alt text" className="field py-1.5 text-sm sm:w-72" aria-label="Search media" />
      </div>

      <div className={`rounded-lg border-2 border-dashed p-4 transition-colors ${dragging ? 'border-post bg-post-light/40' : 'border-transparent'}`}>
        {!items ? (
          <LoadingBlock />
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-xl font-semibold">No files yet</p>
            <p className="mt-1 text-sm text-muted">Upload JPG, PNG, WebP, GIF or AVIF images up to 10 MB, and MP4, WebM or MOV videos up to 200 MB.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {items.map((item) => (
              <li key={item.id}>
                <button onClick={() => { setActive(item); setAlt(item.alt || ''); }} className="block w-full text-left">
                  <MediaThumb item={item} className="aspect-square w-full rounded-md ring-1 ring-line hover:ring-ink/40" />
                  <p className="mt-1.5 truncate text-xs font-medium text-ink-900">{item.originalName}</p>
                  <p className="text-xs text-muted">{item.width ? `${item.width}×${item.height}` : item.type}{item.sizeBytes ? `, ${formatBytes(item.sizeBytes)}` : ''}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <button className="btn-ghost" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title="File details"
        footer={
          active && (
            <>
              <button className="btn-danger mr-auto" onClick={() => remove(active)}><Trash2 className="h-4 w-4" /> Delete</button>
              <button className="btn-ghost" onClick={() => setActive(null)}>Close</button>
              {active.type === 'image' && <button className="btn-ink" onClick={saveAlt}>Save alt text</button>}
            </>
          )
        }
      >
        {active && (
          <div className="grid gap-5 md:grid-cols-2">
            {active.type === 'video' ? (
              <video src={active.url} controls className="w-full rounded bg-ink-900" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.url} alt={active.alt || ''} className="w-full rounded bg-mist object-contain" />
            )}
            <div className="space-y-3 text-sm">
              <p className="break-all font-medium text-ink-900">{active.originalName}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted">
                <dt>Type</dt><dd>{active.mimeType || active.type}</dd>
                {active.width && (<><dt>Size</dt><dd>{active.width}×{active.height}px</dd></>)}
                {active.sizeBytes && (<><dt>File size</dt><dd>{formatBytes(active.sizeBytes)}</dd></>)}
                <dt>Uploaded</dt><dd>{formatDateTime(active.createdAt)}</dd>
                <dt>Used in</dt><dd>{active.usage ? `${active.usage} place${active.usage === 1 ? '' : 's'}` : 'Not used yet'}</dd>
              </dl>
              <div>
                <label className="label" htmlFor="m-url">File URL</label>
                <div className="flex gap-2">
                  <input id="m-url" readOnly value={active.url} className="field py-1.5 font-mono text-xs" onFocus={(e) => e.target.select()} />
                  <button className="btn-ghost px-2" onClick={() => navigator.clipboard?.writeText(active.url).then(() => toast('URL copied.'))} aria-label="Copy URL"><Copy className="h-4 w-4" /></button>
                </div>
              </div>
              {active.type === 'image' && (
                <div>
                  <label className="label" htmlFor="m-alt">Alt text</label>
                  <textarea id="m-alt" rows={3} className="field text-sm" value={alt} onChange={(e) => setAlt(e.target.value)} />
                  <p className="hint">Describe the image for readers who use screen readers.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
