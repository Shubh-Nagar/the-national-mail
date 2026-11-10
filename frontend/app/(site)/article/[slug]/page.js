import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ArticleCard from '@/components/site/ArticleCard';
import ShareButtons from '@/components/site/ShareButtons';
import ReadingProgress from '@/components/site/ReadingProgress';
import ViewTracker from '@/components/site/ViewTracker';
import Gallery from '@/components/site/Gallery';
import { apiGetOrNull } from '@/lib/api';
import { formatDate, initials } from '@/lib/format';
import { site } from '@/lib/site';

export const revalidate = 60;

async function load(slug) {
  const res = await apiGetOrNull(`/articles/${encodeURIComponent(slug)}`);
  return res?.data || null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = await load(slug).catch(() => null);
  if (!a) return { title: 'Story not found' };
  const title = a.seo?.metaTitle || a.title;
  const description = a.seo?.metaDescription || a.excerpt || undefined;
  const url = `/article/${a.slug}`;
  return {
    title,
    description,
    keywords: a.seo?.metaKeywords || a.tags.map((t) => t.name).join(', ') || undefined,
    alternates: { canonical: a.seo?.canonicalUrl || url },
    authors: a.author ? [{ name: a.author.name, url: `/author/${a.author.slug}` }] : undefined,
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      publishedTime: a.publishedAt,
      modifiedTime: a.updatedAt,
      section: a.category?.name,
      tags: a.tags.map((t) => t.name),
      authors: a.author ? [a.author.name] : undefined,
      images: a.image ? [{ url: a.image.url, width: a.image.width, height: a.image.height, alt: a.image.alt }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: a.image ? [a.image.url] : undefined },
  };
}

function VideoBlock({ video, title }) {
  if (!video) return null;
  return (
    <section className="my-10" aria-label="Video">
      <h2 className="mb-4 font-serif text-xl font-semibold">Watch</h2>
      <div className="overflow-hidden rounded bg-ink-900">
        {video.type === 'embed' && video.embedUrl ? (
          <iframe
            src={video.embedUrl}
            title={`Video: ${title}`}
            className="aspect-video w-full"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video controls preload="metadata" playsInline className="aspect-video w-full">
            <source src={video.url} type={video.mimeType || 'video/mp4'} />
            Your browser cannot play this video. <a href={video.url}>Download it instead.</a>
          </video>
        )}
      </div>
    </section>
  );
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const a = await load(slug);
  if (!a) notFound();

  const url = `${site.url}/article/${a.slug}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: a.title,
      description: a.excerpt,
      image: a.image ? [a.image.url] : undefined,
      datePublished: a.publishedAt,
      dateModified: a.updatedAt,
      articleSection: a.category?.name,
      keywords: a.tags.map((t) => t.name).join(', '),
      author: a.author ? { '@type': 'Person', name: a.author.name, url: `${site.url}/author/${a.author.slug}` } : undefined,
      publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `${site.url}/icon.svg` } },
      mainEntityOfPage: url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
        ...(a.category ? [{ '@type': 'ListItem', position: 2, name: a.category.name, item: `${site.url}/category/${a.category.slug}` }] : []),
        { '@type': 'ListItem', position: a.category ? 3 : 2, name: a.title, item: url },
      ],
    },
  ];

  return (
    <>
      <ReadingProgress />
      <ViewTracker slug={a.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <article>
        <header className="container-site max-w-4xl pt-8 sm:pt-12">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-ink hover:underline">Home</Link></li>
              {a.category && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={`/category/${a.category.slug}`} className="font-semibold hover:underline" style={{ color: a.category.color }}>
                      {a.category.name}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>

          <h1 className="mt-4 font-serif text-[2.1rem] font-semibold leading-[1.1] tracking-[-0.015em] sm:text-5xl sm:leading-[1.06]">
            {a.title}
          </h1>
          {a.excerpt && <p className="mt-5 font-serif text-xl leading-relaxed text-ink-700 sm:text-[1.4rem]">{a.excerpt}</p>}

          <div className="mt-8 flex flex-col gap-5 border-y border-line py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {a.author && (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-base text-white" aria-hidden="true">
                  {initials(a.author.name)}
                </span>
              )}
              <div className="text-sm">
                {a.author && (
                  <p>
                    By{' '}
                    <Link href={`/author/${a.author.slug}`} className="font-semibold text-ink-900 hover:underline">{a.author.name}</Link>
                    {a.author.designation && <span className="text-muted">, {a.author.designation}</span>}
                  </p>
                )}
                <p className="text-muted">
                  <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
                  <span className="mx-2 inline-block h-3 w-px translate-y-0.5 bg-line" aria-hidden="true" />
                  {a.readingTime} min read
                </p>
              </div>
            </div>
            <ShareButtons url={url} title={a.title} />
          </div>
        </header>

        {a.image && (
          <figure className="container-site mt-8 max-w-5xl">
            <div className="relative aspect-[16/10] overflow-hidden rounded bg-letter">
              <Image src={a.image.url} alt={a.image.alt || a.title} fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
            </div>
            {a.image.caption && <figcaption className="mt-3 text-sm text-muted">{a.image.caption}</figcaption>}
          </figure>
        )}

        <div className="container-site mt-10 max-w-read">
          <div
            id="article-content"
            className="article-body prose prose-mail max-w-none prose-headings:font-serif prose-headings:font-semibold prose-h2:mt-12 prose-h2:text-[1.6rem] prose-blockquote:font-serif prose-figcaption:font-sans prose-a:font-medium"
            dangerouslySetInnerHTML={{ __html: a.content }}
          />

          <VideoBlock video={a.video} title={a.title} />
          <Gallery images={a.gallery} />

          {a.tags.length > 0 && (
            <div className="mt-10 border-t border-line pt-6">
              <h2 className="sr-only">Topics</h2>
              <ul className="flex flex-wrap gap-2">
                {a.tags.map((t) => (
                  <li key={t.id}>
                    <Link href={`/tag/${t.slug}`} className="inline-block rounded-full bg-mist px-3 py-1 text-sm text-ink-700 hover:bg-letter hover:text-ink-900">
                      #{t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <p className="text-sm font-semibold text-ink-900">Know someone who should read this?</p>
            <ShareButtons url={url} title={a.title} />
          </div>

          {a.author && (
            <aside className="mt-10 flex gap-4 rounded-lg bg-letter/70 p-6" aria-label="About the author">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-lg text-white" aria-hidden="true">
                {initials(a.author.name)}
              </span>
              <div>
                <p className="font-serif text-lg font-semibold">
                  <Link href={`/author/${a.author.slug}`} className="hover:underline">{a.author.name}</Link>
                </p>
                {a.author.bio && <p className="mt-1 text-sm leading-relaxed text-ink-700">{a.author.bio}</p>}
              </div>
            </aside>
          )}
        </div>
      </article>

      {a.related?.length > 0 && (
        <section className="container-site mt-20" aria-labelledby="related">
          <h2 id="related" className="mb-8 border-b border-line pb-3 font-serif text-2xl font-semibold">Keep reading</h2>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {a.related.map((r) => (
              <ArticleCard key={r.id} article={r} showExcerpt={false} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
