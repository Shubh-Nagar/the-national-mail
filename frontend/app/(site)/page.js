import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import ArticleCard, { ArticleMeta, CategoryLabel } from '@/components/site/ArticleCard';
import { SectionHeading, EmptyState } from '@/components/site/Bits';
import NewsletterForm from '@/components/site/NewsletterForm';
import Postmark from '@/components/site/Postmark';
import { apiGetSafe } from '@/lib/api';
import { compactNumber } from '@/lib/format';

export const revalidate = 60;

function LeadStory({ article }) {
  return (
    <article className="group relative">
      <div className="relative">
        <div className="stamp">
          <div className="relative aspect-[3/2] overflow-hidden bg-letter">
            {article.image && (
              <Image
                src={article.image.url}
                alt={article.image.alt || article.title}
                fill
                priority
                sizes="(min-width: 1024px) 720px, 100vw"
                className="object-cover"
              />
            )}
          </div>
        </div>
        <Postmark className="pointer-events-none absolute -right-3 -top-8 hidden w-[210px] -rotate-6 mix-blend-multiply sm:block lg:-right-10" />
      </div>
      <div className="mt-6 max-w-[44rem]">
        <CategoryLabel category={article.category} className="text-base" />
        <h1 className="mt-2 font-serif text-[2rem] font-semibold leading-[1.08] tracking-[-0.015em] sm:text-4xl lg:text-[3.1rem] lg:leading-[1.05]">
          <Link href={`/article/${article.slug}`} className="headline-link after:absolute after:inset-0">
            {article.title}
          </Link>
        </h1>
        {article.excerpt && <p className="mt-4 text-lg leading-relaxed text-ink-700">{article.excerpt}</p>}
        <ArticleMeta article={article} className="mt-4 text-sm" />
      </div>
    </article>
  );
}

function MostRead({ articles }) {
  if (!articles.length) return null;
  return (
    <section aria-labelledby="most-read">
      <h2 id="most-read" className="mb-4 border-b border-line pb-3 font-serif text-2xl font-semibold">Most read</h2>
      <ol className="divide-y divide-line">
        {articles.map((a, i) => (
          <li key={a.id} className="group relative flex gap-4 py-4">
            <span className="w-7 shrink-0 font-serif text-3xl font-semibold leading-none text-post/80" aria-hidden="true">{i + 1}</span>
            <div className="min-w-0">
              <h3 className="font-serif text-[1.05rem] font-semibold leading-snug">
                <Link href={`/article/${a.slug}`} className="headline-link after:absolute after:inset-0">{a.title}</Link>
              </h3>
              <p className="mt-1 text-xs text-muted">{compactNumber(a.views)} reads</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CategorySection({ section, flip }) {
  const [first, ...rest] = section.articles;
  const heading = (
    <SectionHeading
      title={<span id={`sec-${section.category.slug}`}>{section.category.name}</span>}
      href={`/category/${section.category.slug}`}
      linkLabel={`More ${section.category.name.toLowerCase()} stories`}
      color={section.category.color}
      description={section.category.description}
    />
  );

  // Sparse sections read better as a simple row of cards.
  if (section.articles.length < 3) {
    return (
      <section className="container-site mt-16" aria-labelledby={`sec-${section.category.slug}`}>
        {heading}
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {section.articles.map((a) => <ArticleCard key={a.id} article={a} hideCategory />)}
        </div>
      </section>
    );
  }

  return (
    <section className="container-site mt-16" aria-labelledby={`sec-${section.category.slug}`}>
      {heading}
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className={`lg:col-span-6 ${flip ? 'lg:order-2' : ''}`}>
          <ArticleCard article={first} hideCategory />
        </div>
        <div className="divide-y divide-line lg:col-span-6">
          {rest.map((a) => (
            <div key={a.id} className="py-5 first:pt-0">
              <ArticleCard article={a} variant="compact" hideCategory withExcerpt />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoBand({ videos }) {
  if (!videos.length) return null;
  return (
    <section className="mt-16 bg-letter py-12" aria-labelledby="videos">
      <div className="container-site">
        <SectionHeading title={<span id="videos">Watch</span>} description="Stories with video from the field." color="#1B2A4A" />
        <ul className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {videos.map((a) => (
            <li key={a.id} className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[31%]">
              <article className="group relative">
                <div className="relative aspect-video overflow-hidden rounded bg-ink">
                  {a.image && <Image src={a.image.url} alt={a.image.alt || a.title} fill sizes="(min-width: 1024px) 400px, 80vw" className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]" />}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="h-14 w-14 text-white drop-shadow" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-lg font-semibold leading-snug">
                  <Link href={`/article/${a.slug}`} className="headline-link after:absolute after:inset-0">{a.title}</Link>
                </h3>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const { data } = await apiGetSafe('/home', { data: null });

  if (!data || !data.featured?.length) {
    return (
      <div className="container-site py-16">
        <EmptyState
          title="No stories yet"
          action={<Link href="/admin" className="btn-primary">Open the admin panel</Link>}
        >
          {data
            ? 'Publish your first article from the admin panel and it will appear here.'
            : 'The news service is not responding. Check that the backend is running on the URL set in NEXT_PUBLIC_API_URL.'}
        </EmptyState>
      </div>
    );
  }

  const [lead, ...secondary] = data.featured;
  const sections = data.sections || [];

  return (
    <>
      {/* Today's lead stories */}
      <section className="border-b border-line bg-gradient-to-b from-letter/70 to-white pb-12 pt-10 sm:pt-14">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <LeadStory article={lead} />
          </div>
          <aside className="lg:col-span-5" aria-label="More top stories">
            <h2 className="mb-2 font-serif text-xl font-semibold text-ink-700">Also in today&apos;s mail</h2>
            <div className="divide-y divide-line">
              {secondary.map((a) => (
                <div key={a.id} className="py-5 first:pt-3">
                  <ArticleCard article={a} variant="compact" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* Latest + most read */}
      <div className="container-site mt-14 grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-8" aria-labelledby="latest">
          <SectionHeading title={<span id="latest">Latest stories</span>} />
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {data.latest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
        <aside className="space-y-10 lg:col-span-4">
          <MostRead articles={data.trending} />
          <div className="rounded-lg border border-letter-300 bg-letter p-6">
            <h2 className="font-serif text-xl font-semibold">Good news, every morning</h2>
            <p className="mb-4 mt-1 text-sm text-ink-700">Five stories worth your time, delivered at 7 am.</p>
            <NewsletterForm compact />
          </div>
        </aside>
      </div>

      {/* Editor's picks */}
      {data.editorsPicks.length > 0 && (
        <section className="mt-16 bg-ink-900 py-14 text-white" aria-labelledby="picks">
          <div className="container-site">
            <div className="mb-8 flex items-end justify-between border-b border-white/15 pb-3">
              <h2 id="picks" className="flex items-center gap-3 font-serif text-2xl font-semibold text-white sm:text-[1.9rem]">
                <span className="h-6 w-1.5 rounded-full bg-post" aria-hidden="true" />
                Editor&apos;s picks
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {data.editorsPicks.map((a) => (
                <article key={a.id} className="group relative">
                  <div className="relative aspect-[4/3] overflow-hidden rounded bg-ink-700">
                    {a.image && <Image src={a.image.url} alt={a.image.alt || a.title} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#F2B8B5]">{a.category?.name}</p>
                  <h3 className="mt-1 font-serif text-lg font-semibold leading-snug text-white">
                    <Link href={`/article/${a.slug}`} className="headline-link after:absolute after:inset-0">{a.title}</Link>
                  </h3>
                  <ArticleMeta article={a} light className="mt-2" />
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {sections.slice(0, 2).map((s, i) => <CategorySection key={s.category.id} section={s} flip={i % 2 === 1} />)}
      <VideoBand videos={data.videos} />
      {sections.slice(2).map((s, i) => <CategorySection key={s.category.id} section={s} flip={i % 2 === 1} />)}

      {/* Newsletter */}
      <section id="newsletter" className="container-site mt-20 scroll-mt-20">
        <div className="grid items-center gap-8 rounded-xl border border-letter-300 bg-letter px-6 py-10 sm:px-10 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Get the morning mail</h2>
            <p className="mt-3 max-w-md text-ink-700">
              One email a day with the stories our editors could not stop talking about. No spam, and you can unsubscribe in one click.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
