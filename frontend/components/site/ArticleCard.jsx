import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import { timeAgo } from '@/lib/format';

export function CategoryLabel({ category, className = '' }) {
  if (!category) return null;
  return (
    <Link
      href={`/category/${category.slug}`}
      className={`relative z-10 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline ${className}`}
      style={{ color: category.color || '#B4232A' }}
    >
      {category.name}
    </Link>
  );
}

export function ArticleMeta({ article, showAuthor = true, light = false, className = '' }) {
  const tone = light ? 'text-white/75' : 'text-muted';
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${tone} ${className}`}>
      {showAuthor && article.author && <span className={light ? 'text-white' : 'font-medium text-ink-700'}>{article.author.name}</span>}
      {article.publishedAt && <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>}
      {article.readingTime ? <span>{article.readingTime} min read</span> : null}
    </p>
  );
}

function Thumb({ article, sizes, className = '', priority = false }) {
  return (
    <div className={`relative overflow-hidden bg-letter ${className}`}>
      {article.image ? (
        <Image
          src={article.image.url}
          alt={article.image.alt || article.title}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl text-ink/30">TNM</div>
      )}
      {article.hasVideo && (
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded bg-ink-900/85 px-2 py-1 text-xs font-medium text-white">
          <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" /> Video
        </span>
      )}
    </div>
  );
}

/**
 * Article teaser.
 * variant: 'card' (image on top) | 'row' (image left) | 'compact' (small image right) | 'text' (no image)
 */
export default function ArticleCard({ article, variant = 'card', priority = false, showExcerpt = true, hideCategory = false, withExcerpt = false }) {
  const href = `/article/${article.slug}`;
  const category = hideCategory ? null : article.category;

  if (variant === 'row') {
    return (
      <article className="group relative grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 sm:gap-6">
        <Thumb article={article} sizes="(min-width: 1024px) 320px, 40vw" className="aspect-[4/3] rounded" />
        <div className="min-w-0">
          <CategoryLabel category={category} />
          <h3 className="mt-1 font-serif text-lg font-semibold leading-snug sm:text-xl">
            <Link href={href} className="headline-link after:absolute after:inset-0">{article.title}</Link>
          </h3>
          {showExcerpt && article.excerpt && <p className="mt-2 line-clamp-2 hidden text-sm text-muted sm:block">{article.excerpt}</p>}
          <ArticleMeta article={article} className="mt-3" />
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group relative flex gap-4">
        <div className="min-w-0 flex-1">
          <CategoryLabel category={category} className="text-xs" />
          <h3 className="mt-0.5 font-serif text-[1.05rem] font-semibold leading-snug">
            <Link href={href} className="headline-link after:absolute after:inset-0">{article.title}</Link>
          </h3>
          {withExcerpt && article.excerpt && (
            <p className="mt-1.5 line-clamp-2 hidden text-sm text-muted sm:block">{article.excerpt}</p>
          )}
          <ArticleMeta article={article} showAuthor={false} className="mt-1.5" />
        </div>
        <Thumb article={article} sizes="112px" className="aspect-square w-24 shrink-0 rounded sm:w-28" />
      </article>
    );
  }

  if (variant === 'text') {
    return (
      <article className="group relative">
        <CategoryLabel category={category} className="text-xs" />
        <h3 className="mt-0.5 font-serif text-lg font-semibold leading-snug">
          <Link href={href} className="headline-link after:absolute after:inset-0">{article.title}</Link>
        </h3>
        <ArticleMeta article={article} className="mt-1.5" />
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col">
      <Thumb article={article} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="aspect-[16/10] rounded" priority={priority} />
      <div className="mt-4 flex flex-1 flex-col">
        <CategoryLabel category={category} />
        <h3 className="mt-1 font-serif text-xl font-semibold leading-snug">
          <Link href={href} className="headline-link after:absolute after:inset-0">{article.title}</Link>
        </h3>
        {showExcerpt && article.excerpt && <p className="mt-2 line-clamp-3 text-[0.98rem] leading-relaxed text-muted">{article.excerpt}</p>}
        <ArticleMeta article={article} className="mt-auto pt-3" />
      </div>
    </article>
  );
}
