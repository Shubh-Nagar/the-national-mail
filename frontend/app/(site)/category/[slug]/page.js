import { notFound } from 'next/navigation';
import Link from 'next/link';
import ArticleList from '@/components/site/ArticleList';
import { PageHeader, Pagination, EmptyState } from '@/components/site/Bits';
import { apiGet, apiGetOrNull } from '@/lib/api';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const res = await apiGetOrNull(`/categories/${slug}`).catch(() => null);
  if (!res) return { title: 'Section not found' };
  return {
    title: res.data.name,
    description: res.data.description || `Latest ${res.data.name} stories from The National Mail.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);

  const cat = await apiGetOrNull(`/categories/${slug}`);
  if (!cat) notFound();
  const { data: articles, pagination } = await apiGet(`/articles?category=${encodeURIComponent(slug)}&page=${page}&limit=13`);

  return (
    <>
      <PageHeader title={cat.data.name} description={cat.data.description} color={cat.data.color} />
      <div className="container-site py-12">
        {articles.length ? (
          <ArticleList articles={articles} highlightFirst={page === 1} />
        ) : (
          <EmptyState title={`No ${cat.data.name.toLowerCase()} stories yet`} action={<Link href="/" className="btn-ghost">Back to the home page</Link>}>
            Stories published in this section will appear here.
          </EmptyState>
        )}
        <Pagination page={pagination.page} totalPages={pagination.totalPages} basePath={`/category/${slug}`} />
      </div>
    </>
  );
}
