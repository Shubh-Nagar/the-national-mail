import Link from 'next/link';
import ArticleCard from '@/components/site/ArticleCard';
import { Pagination, EmptyState } from '@/components/site/Bits';
import { apiGetSafe } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q}` : 'Search', robots: { index: false } };
}

const SUGGESTIONS = ['water conservation', 'women', 'solar', 'heritage', 'agriculture'];

export default async function SearchPage({ searchParams }) {
  const { q = '', page: pageParam } = await searchParams;
  const query = String(q).trim();
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const result = query
    ? await apiGetSafe(`/search?q=${encodeURIComponent(query)}&page=${page}&limit=10`, null, { revalidate: 0 })
    : null;

  return (
    <div className="container-site max-w-4xl py-12">
      <h1 className="font-serif text-4xl font-semibold">Search</h1>
      <form action="/search" role="search" className="mt-6 flex gap-2">
        <label htmlFor="search-q" className="sr-only">Search stories</label>
        <input id="search-q" name="q" type="search" defaultValue={query} placeholder="Try “stepwell” or “solar”" className="field py-3 text-lg" autoFocus={!query} />
        <button type="submit" className="btn-ink px-6">Search</button>
      </form>

      {!query && (
        <div className="mt-8">
          <p className="text-sm text-muted">Popular topics</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s}>
                <Link href={`/search?q=${encodeURIComponent(s)}`} className="inline-block rounded-full border border-line px-4 py-1.5 text-sm hover:border-ink hover:bg-mist">{s}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {query && !result && (
        <p className="mt-8 rounded-md bg-post-light p-4 text-post-dark" role="alert">Search is unavailable right now. Try again in a minute.</p>
      )}

      {result && (
        <div className="mt-10">
          <p className="mb-6 text-sm text-muted" aria-live="polite">
            {result.pagination.total} {result.pagination.total === 1 ? 'result' : 'results'} for “{query}”
          </p>
          {result.data.length ? (
            <div className="divide-y divide-line">
              {result.data.map((a) => (
                <div key={a.id} className="py-6 first:pt-0">
                  <ArticleCard article={a} variant="row" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No stories match that search">
              Check the spelling, or try a broader word like a state, a crop or a cause.
            </EmptyState>
          )}
          <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} basePath="/search" query={{ q: query }} />
        </div>
      )}
    </div>
  );
}
