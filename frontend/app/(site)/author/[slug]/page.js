import { notFound } from 'next/navigation';
import ArticleList from '@/components/site/ArticleList';
import { Pagination, EmptyState } from '@/components/site/Bits';
import { apiGet, apiGetOrNull } from '@/lib/api';
import { initials } from '@/lib/format';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await apiGetOrNull(`/authors/${slug}`).catch(() => null);
  if (!res) return { title: 'Author not found' };
  return { title: res.data.name, description: res.data.bio, alternates: { canonical: `/author/${slug}` } };
}

export default async function AuthorPage({ params, searchParams }) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const author = await apiGetOrNull(`/authors/${slug}`);
  if (!author) notFound();
  const a = author.data;
  const { data: articles, pagination } = await apiGet(`/articles?author=${encodeURIComponent(slug)}&page=${page}&limit=12`);

  return (
    <>
      <div className="border-b border-line bg-letter/60">
        <div className="container-site flex flex-col gap-6 py-12 sm:flex-row sm:items-center">
          {a.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.avatar_url} alt="" className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-ink font-serif text-3xl text-white" aria-hidden="true">
              {initials(a.name)}
            </span>
          )}
          <div>
            <h1 className="font-serif text-4xl font-semibold">{a.name}</h1>
            {a.designation && <p className="mt-1 font-semibold text-post">{a.designation}</p>}
            {a.bio && <p className="mt-3 max-w-2xl text-ink-700">{a.bio}</p>}
          </div>
        </div>
      </div>
      <div className="container-site py-12">
        <h2 className="mb-8 font-serif text-2xl font-semibold">Stories by {a.name.split(' ')[0]}</h2>
        {articles.length ? (
          <ArticleList articles={articles} highlightFirst={false} />
        ) : (
          <EmptyState title="No published stories yet" />
        )}
        <Pagination page={pagination.page} totalPages={pagination.totalPages} basePath={`/author/${slug}`} />
      </div>
    </>
  );
}
