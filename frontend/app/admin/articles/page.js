'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/adminApi';
import { useToast } from '@/components/admin/Toast';
import { PageTitle, StatusBadge, articleState, LoadingBlock } from '@/components/admin/ui';
import { formatDateTime } from '@/lib/format';

const TABS = [
  { value: '', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Drafts' },
  { value: 'archived', label: 'Archived' },
];

function ArticlesTable() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const status = params.get('status') || '';
  const page = parseInt(params.get('page') || '1', 10);
  const q = params.get('q') || '';
  const categoryId = params.get('category_id') || '';

  const [rows, setRows] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(q);

  const setParam = useCallback(
    (next) => {
      const sp = new URLSearchParams(params.toString());
      Object.entries(next).forEach(([k, v]) => (v ? sp.set(k, v) : sp.delete(k)));
      if (!('page' in next)) sp.delete('page');
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router]
  );

  const load = useCallback(() => {
    setRows(null);
    const sp = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) sp.set('status', status);
    if (q) sp.set('q', q);
    if (categoryId) sp.set('category_id', categoryId);
    api(`/admin/articles?${sp}`)
      .then((d) => {
        setRows(d.data);
        setPagination(d.pagination);
      })
      .catch((e) => {
        toast(e.message, 'error');
        setRows([]);
      });
  }, [page, status, q, categoryId, toast]);

  useEffect(load, [load]);
  useEffect(() => {
    api('/admin/categories').then((d) => setCategories(d.data)).catch(() => {});
  }, []);

  async function changeStatus(a, next) {
    try {
      const d = await api(`/admin/articles/${a.id}/status`, { method: 'PATCH', body: { status: next } });
      toast(d.message);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  async function remove(a) {
    if (!window.confirm(`Delete “${a.title}”? This cannot be undone.`)) return;
    try {
      const d = await api(`/admin/articles/${a.id}`, { method: 'DELETE' });
      toast(d.message);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return (
    <>
      <PageTitle title="Articles" description="Write, schedule and manage every story on the site." actions={<Link href="/admin/articles/new" className="btn-primary">New article</Link>} />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg border border-line bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setParam({ status: t.value })}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${status === t.value ? 'bg-ink text-white' : 'text-ink-700 hover:bg-mist'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select className="field w-auto py-1.5 text-sm" value={categoryId} onChange={(e) => setParam({ category_id: e.target.value })} aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setParam({ q: search.trim() });
            }}
            className="flex items-center rounded-md border border-line bg-white focus-within:border-ink"
          >
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles" className="w-40 bg-transparent px-3 py-1.5 text-sm outline-none sm:w-56" aria-label="Search articles" />
            <button className="px-2 text-muted hover:text-ink" aria-label="Search"><Search className="h-4 w-4" /></button>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white">
        {!rows ? (
          <LoadingBlock />
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-xl font-semibold">No articles here</p>
            <p className="mt-1 text-sm text-muted">{q || status || categoryId ? 'Try a different filter or search.' : 'Write your first story to get started.'}</p>
            <Link href="/admin/articles/new" className="btn-primary mt-4">New article</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Category</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Date</th>
                  <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Reads</th>
                  <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((a) => {
                  const state = articleState(a);
                  return (
                    <tr key={a.id} className="hover:bg-mist/60">
                      <td className="max-w-md px-4 py-3">
                        <div className="flex items-center gap-3">
                          {a.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.image.url} alt="" className="hidden h-10 w-14 shrink-0 rounded object-cover sm:block" />
                          ) : (
                            <span className="hidden h-10 w-14 shrink-0 rounded bg-letter sm:block" />
                          )}
                          <div className="min-w-0">
                            <Link href={`/admin/articles/${a.id}`} className="line-clamp-2 font-medium text-ink-900 hover:underline">{a.title}</Link>
                            <p className="text-xs text-muted">
                              {a.author?.name || 'No byline'}
                              {a.isFeatured && <span className="ml-2 font-semibold text-post">Featured</span>}
                              {a.isEditorsPick && <span className="ml-2 font-semibold text-ink-700">Editor&apos;s pick</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">{a.category?.name || <span className="text-muted">None</span>}</td>
                      <td className="px-4 py-3"><StatusBadge status={state} /></td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-muted lg:table-cell">{formatDateTime(a.publishedAt || a.updatedAt)}</td>
                      <td className="hidden px-4 py-3 text-right tabular-nums sm:table-cell">{a.views.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {state === 'published' && (
                            <a href={`/article/${a.slug}`} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-muted hover:bg-mist hover:text-ink" title="View on site" aria-label="View on site">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <Link href={`/admin/articles/${a.id}`} className="rounded p-1.5 text-muted hover:bg-mist hover:text-ink" title="Edit" aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          {a.status !== 'published' ? (
                            <button onClick={() => changeStatus(a, 'published')} className="rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Publish</button>
                          ) : (
                            <button onClick={() => changeStatus(a, 'draft')} className="rounded px-2 py-1 text-xs font-semibold text-ink-700 hover:bg-mist">Unpublish</button>
                          )}
                          <button onClick={() => remove(a)} className="rounded p-1.5 text-muted hover:bg-post-light hover:text-post" title="Delete" aria-label="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted">Page {pagination.page} of {pagination.totalPages}, {pagination.total} articles</p>
          <div className="flex gap-2">
            <button className="btn-ghost" disabled={page <= 1} onClick={() => setParam({ page: String(page - 1) })}>Previous</button>
            <button className="btn-ghost" disabled={page >= pagination.totalPages} onClick={() => setParam({ page: String(page + 1) })}>Next</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ArticlesTable />
    </Suspense>
  );
}
