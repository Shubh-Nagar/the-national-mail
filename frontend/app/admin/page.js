'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/adminApi';
import { useAuth } from '@/components/admin/AuthProvider';
import { PageTitle, Card, StatusBadge, articleState, LoadingBlock } from '@/components/admin/ui';
import { compactNumber, timeAgo } from '@/lib/format';

function Stat({ label, value, href }) {
  const body = (
    <div className="rounded-lg border border-line bg-white p-4 transition-colors hover:border-ink/30">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-ink-900">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats').then((d) => setStats(d.data)).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageTitle
        title={`Hello, ${user?.name?.split(' ')[0] || 'editor'}`}
        description="Here is what is happening across the site."
        actions={<Link href="/admin/articles/new" className="btn-primary">Write an article</Link>}
      />
      {error && <p className="mb-4 rounded-md bg-post-light p-3 text-sm text-post-dark">{error}</p>}
      {!stats ? (
        !error && <LoadingBlock />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Published" value={stats.articles.published} href="/admin/articles?status=published" />
            <Stat label="Drafts" value={stats.articles.drafts} href="/admin/articles?status=draft" />
            <Stat label="Scheduled" value={stats.articles.scheduled} href="/admin/articles?status=scheduled" />
            <Stat label="Total reads" value={compactNumber(stats.views)} />
            <Stat label="Images and videos" value={stats.media.images + stats.media.videos} href="/admin/media" />
            <Stat label="Unread messages" value={stats.unreadMessages} href="/admin/messages" />
            <Stat label="Newsletter subscribers" value={stats.subscribers} />
            <Stat label="Archived" value={stats.articles.archived} href="/admin/articles?status=archived" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <Card title="Recently edited" className="lg:col-span-3" actions={<Link href="/admin/articles" className="text-sm font-semibold text-post hover:underline">All articles</Link>}>
              <ul className="-my-2 divide-y divide-line">
                {stats.recent.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Link href={`/admin/articles/${a.id}`} className="block truncate font-medium text-ink-900 hover:underline">{a.title}</Link>
                      <p className="text-xs text-muted">{a.category?.name || 'Uncategorised'}, edited {timeAgo(a.updatedAt)}</p>
                    </div>
                    <StatusBadge status={articleState(a)} />
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Most read" className="lg:col-span-2">
              <ol className="-my-2 divide-y divide-line">
                {stats.top.map((a, i) => (
                  <li key={a.id} className="flex gap-3 py-3">
                    <span className="w-5 font-serif text-lg font-semibold text-post">{i + 1}</span>
                    <div className="min-w-0">
                      <Link href={`/admin/articles/${a.id}`} className="line-clamp-2 text-sm font-medium text-ink-900 hover:underline">{a.title}</Link>
                      <p className="text-xs text-muted">{compactNumber(a.views)} reads</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
