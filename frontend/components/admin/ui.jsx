'use client';

import { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

export function PageTitle({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className = '', actions }) {
  return (
    <section className={`rounded-lg border border-line bg-white ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-sans text-sm font-semibold text-ink-900">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

const STATUS_STYLES = {
  published: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  scheduled: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  draft: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  archived: 'bg-stone-100 text-stone-600 ring-stone-500/20',
};
const STATUS_LABEL = { published: 'Published', scheduled: 'Scheduled', draft: 'Draft', archived: 'Archived' };

export function articleState(a) {
  if (a.status === 'published' && a.publishedAt && new Date(a.publishedAt) > new Date()) return 'scheduled';
  return a.status;
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-muted ${className}`} aria-label="Loading" />;
}

export function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-5xl' }[size];
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-ink-900/50" onClick={onClose} aria-label="Close dialog" />
      <div className={`relative flex max-h-[92vh] w-full ${width} flex-col rounded-t-xl bg-white shadow-2xl sm:rounded-xl`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-muted hover:bg-mist hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint, id }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-5 w-9 rounded-full bg-slate-300 transition-colors peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-post peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
      <span>
        <span className="block text-sm font-medium text-ink-900">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function formatBytes(n) {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
