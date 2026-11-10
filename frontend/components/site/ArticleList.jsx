import Link from 'next/link';
import Image from 'next/image';
import ArticleCard, { ArticleMeta, CategoryLabel } from './ArticleCard';

function LeadRow({ article }) {
  return (
    <article className="group relative grid gap-6 lg:grid-cols-12 lg:items-center lg:gap-10">
      <div className="relative aspect-[16/10] overflow-hidden rounded bg-letter lg:col-span-7">
        {article.image && (
          <Image src={article.image.url} alt={article.image.alt || article.title} fill priority sizes="(min-width: 1024px) 720px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
      </div>
      <div className="lg:col-span-5">
        <CategoryLabel category={article.category} />
        <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-[2.25rem]">
          <Link href={`/article/${article.slug}`} className="headline-link after:absolute after:inset-0">{article.title}</Link>
        </h2>
        {article.excerpt && <p className="mt-4 text-lg leading-relaxed text-ink-700">{article.excerpt}</p>}
        <ArticleMeta article={article} className="mt-4 text-sm" />
      </div>
    </article>
  );
}

/** Listing used by category, tag and author pages. The first story gets a wide treatment on page 1. */
export default function ArticleList({ articles, highlightFirst = true }) {
  if (!articles.length) return null;
  const [first, ...rest] = highlightFirst ? articles : [null, ...articles];
  return (
    <div>
      {first && (
        <div className="mb-12 border-b border-line pb-12">
          <LeadRow article={first} />
        </div>
      )}
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
