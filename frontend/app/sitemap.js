import { apiGetSafe } from '@/lib/api';
import { site } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap() {
  const { data } = await apiGetSafe('/sitemap', { data: { articles: [], categories: [], tags: [], authors: [] } }, { revalidate: 3600 });
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${site.url}/about`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${site.url}/contact`, changeFrequency: 'yearly', priority: 0.3 },
    ...data.categories.map((c) => ({ url: `${site.url}/category/${c.slug}`, lastModified: c.updated_at, changeFrequency: 'daily', priority: 0.7 })),
    ...data.articles.map((a) => ({ url: `${site.url}/article/${a.slug}`, lastModified: a.updated_at, changeFrequency: 'weekly', priority: 0.8 })),
    ...data.tags.map((t) => ({ url: `${site.url}/tag/${t.slug}`, changeFrequency: 'weekly', priority: 0.4 })),
    ...data.authors.map((a) => ({ url: `${site.url}/author/${a.slug}`, lastModified: a.updated_at, changeFrequency: 'weekly', priority: 0.4 })),
  ];
}
