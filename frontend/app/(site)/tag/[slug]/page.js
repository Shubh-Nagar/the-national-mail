import { notFound } from 'next/navigation';
import ArticleList from '@/components/site/ArticleList';
import { PageHeader, Pagination } from '@/components/site/Bits';
import { apiGet, apiGetOrNull } from '@/lib/api';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await apiGetOrNull(`/tags/${slug}`).catch(() => null);
  if (!res) return { title: 'Topic not found' };
  return { title: `Stories about ${res.data.name}`, alternates: { canonical: `/tag/${slug}` } };
}

export default async function TagPage({ params, searchParams }) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const tag = await apiGetOrNull(`/tags/${slug}`);
  if (!tag) notFound();
  const { data: articles, pagination } = await apiGet(`/articles?tag=${encodeURIComponent(slug)}&page=${page}&limit=12`);

  return (
    <>
      <PageHeader
        title={`#${tag.data.name}`}
        description={`${pagination.total} ${pagination.total === 1 ? 'story' : 'stories'} tagged ${tag.data.name}.`}
      />
      <div className="container-site py-12">
        <ArticleList articles={articles} highlightFirst={false} />
        <Pagination page={pagination.page} totalPages={pagination.totalPages} basePath={`/tag/${slug}`} />
      </div>
    </>
  );
}
