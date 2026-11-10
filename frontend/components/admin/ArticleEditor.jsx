'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowDown, ArrowUp, ExternalLink, ImagePlus, Trash2, X, Film } from 'lucide-react';
import { api, publicSiteUrl } from '@/lib/adminApi';
import { useToast } from './Toast';
import { Card, StatusBadge, articleState, LoadingBlock, Toggle } from './ui';
import MediaPicker, { MediaThumb } from './MediaPicker';
import RichTextEditor from './RichTextEditor';

const EMPTY = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category_id: '',
  author_id: '',
  featured: null, // media object
  featured_image_caption: '',
  status: 'draft',
  published_at: '',
  is_featured: false,
  is_editors_pick: false,
  video_type: 'none',
  video_url: '',
  video: null, // media object
  tags: [],
  gallery: [], // [{ media, caption }]
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  canonical_url: '',
};

/** ISO string -> value for <input type="datetime-local"> in the browser's timezone */
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

function fromArticle(a) {
  return {
    title: a.title || '',
    slug: a.slug || '',
    excerpt: a.excerpt || '',
    content: a.content || '',
    category_id: a.categoryId || '',
    author_id: a.authorId || '',
    featured: a.featuredMediaId && a.image ? { id: a.featuredMediaId, url: a.image.url, alt: a.image.alt, type: 'image' } : null,
    featured_image_caption: a.featuredImageCaption || '',
    status: a.status,
    published_at: toLocalInput(a.publishedAt),
    is_featured: a.isFeatured,
    is_editors_pick: a.isEditorsPick,
    video_type: a.videoType || 'none',
    video_url: a.videoUrl || '',
    video: a.videoMediaId && a.video ? { id: a.videoMediaId, url: a.video.url, type: 'video', originalName: a.video.url.split('/').pop() } : null,
    tags: a.tags.map((t) => t.name),
    gallery: a.gallery.map((g) => ({ media: { id: g.id, url: g.url, alt: g.alt, type: 'image' }, caption: g.caption || '' })),
    meta_title: a.seo?.metaTitle || '',
    meta_description: a.seo?.metaDescription || '',
    meta_keywords: a.seo?.metaKeywords || '',
    canonical_url: a.seo?.canonicalUrl || '',
  };
}

function toPayload(f, statusOverride) {
  return {
    title: f.title,
    slug: f.slug,
    excerpt: f.excerpt,
    content: f.content,
    category_id: f.category_id || null,
    author_id: f.author_id || null,
    featured_media_id: f.featured?.id || null,
    featured_image_caption: f.featured_image_caption,
    status: statusOverride || f.status,
    published_at: f.published_at ? new Date(f.published_at).toISOString() : null,
    is_featured: f.is_featured,
    is_editors_pick: f.is_editors_pick,
    video_type: f.video_type,
    video_url: f.video_url,
    video_media_id: f.video?.id || null,
    tags: f.tags,
    gallery: f.gallery.map((g) => ({ media_id: g.media.id, caption: g.caption })),
    meta_title: f.meta_title,
    meta_description: f.meta_description,
    meta_keywords: f.meta_keywords,
    canonical_url: f.canonical_url,
  };
}

function TagInput({ value, onChange, suggestions }) {
  const [draft, setDraft] = useState('');
  const add = (t) => {
    const name = t.trim().replace(/,$/, '');
    if (name && !value.some((v) => v.toLowerCase() === name.toLowerCase())) onChange([...value, name]);
    setDraft('');
  };
  const matches = draft
    ? suggestions.filter((s) => s.name.toLowerCase().includes(draft.toLowerCase()) && !value.includes(s.name)).slice(0, 6)
    : [];
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-line bg-white p-2 focus-within:border-ink">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-letter px-2.5 py-0.5 text-sm text-ink-900">
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove tag ${t}`} className="text-muted hover:text-post">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? '' : 'Type a tag and press Enter'}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
          aria-label="Add tag"
        />
      </div>
      {matches.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-1">
          {matches.map((s) => (
            <li key={s.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(s.name)} className="rounded-full border border-line px-2 py-0.5 text-xs hover:border-ink hover:bg-mist">
                + {s.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Counter({ value, max, ideal }) {
  const n = value.length;
  const tone = n > max ? 'text-post' : n >= ideal[0] && n <= ideal[1] ? 'text-emerald-700' : 'text-muted';
  return <span className={`text-xs tabular-nums ${tone}`}>{n}/{max}</span>;
}

export default function ArticleEditor({ id }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(id ? null : EMPTY);
  const [article, setArticle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [picker, setPicker] = useState(null); // 'featured' | 'gallery' | 'video'
  const [dirty, setDirty] = useState(false);
  const slugTouched = useRef(Boolean(id));

  useEffect(() => {
    Promise.all([api('/admin/categories'), api('/admin/authors'), api('/admin/tags')])
      .then(([c, a, t]) => {
        setCategories(c.data);
        setAuthors(a.data);
        setAllTags(t.data);
      })
      .catch((e) => toast(e.message, 'error'));
  }, [toast]);

  useEffect(() => {
    if (!id) return;
    api(`/admin/articles/${id}`)
      .then((d) => {
        setArticle(d.data);
        setForm(fromArticle(d.data));
      })
      .catch((e) => {
        toast(e.message, 'error');
        router.replace('/admin/articles');
      });
  }, [id, router, toast]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = useCallback((patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  }, []);

  const save = useCallback(
    async (statusOverride) => {
      setSaving(true);
      setErrors({});
      try {
        const body = toPayload(form, statusOverride);
        const d = id
          ? await api(`/admin/articles/${id}`, { method: 'PUT', body })
          : await api('/admin/articles', { method: 'POST', body });
        setDirty(false);
        const labels = { published: 'Article published.', draft: 'Draft saved.', archived: 'Article archived.' };
        toast(statusOverride ? labels[statusOverride] : d.message);
        setArticle(d.data);
        setForm(fromArticle(d.data));
        if (!id) router.replace(`/admin/articles/${d.data.id}`);
      } catch (e) {
        const fieldErrors = {};
        (e.details || []).forEach((x) => { fieldErrors[x.field] = x.message; });
        setErrors(fieldErrors);
        toast(e.message, 'error');
      } finally {
        setSaving(false);
      }
    },
    [form, id, router, toast]
  );

  // Ctrl/Cmd + S saves
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (form && !saving) save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [form, saving, save]);

  async function remove() {
    if (!window.confirm('Delete this article permanently? This cannot be undone.')) return;
    try {
      await api(`/admin/articles/${id}`, { method: 'DELETE' });
      setDirty(false);
      toast('Article deleted.');
      router.replace('/admin/articles');
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  const seoTitle = form?.meta_title || form?.title || 'Article headline';
  const seoDesc = form?.meta_description || form?.excerpt || 'A short summary of the story appears here in search results.';
  const state = article ? articleState(article) : 'draft';
  const isLive = state === 'published';
  const previewSlug = useMemo(
    () => (form?.slug || form?.title || 'article').toLowerCase().replace(/['’₹]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    [form?.slug, form?.title]
  );

  if (!form) return <LoadingBlock />;

  const publishLabel = form.status === 'published' ? 'Update' : form.published_at && new Date(form.published_at) > new Date() ? 'Schedule' : 'Publish';

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles" className="rounded p-1.5 text-muted hover:bg-white hover:text-ink" aria-label="Back to articles">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-2xl font-semibold">{id ? 'Edit article' : 'New article'}</h1>
          {article && <StatusBadge status={state} />}
          {dirty && <span className="text-xs text-muted">Unsaved changes</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {isLive && (
            <a href={`/article/${article.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <ExternalLink className="h-4 w-4" /> View
            </a>
          )}
          {form.status !== 'published' && (
            <button className="btn-ghost" disabled={saving} onClick={() => save('draft')}>Save draft</button>
          )}
          <button className="btn-primary" disabled={saving} onClick={() => save('published')}>
            {saving ? 'Saving…' : publishLabel}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main column */}
        <div className="min-w-0 space-y-5">
          <div className="rounded-lg border border-line bg-white p-5">
            <label htmlFor="title" className="sr-only">Headline</label>
            <textarea
              id="title"
              rows={2}
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                set(slugTouched.current ? { title } : { title, slug: '' });
              }}
              placeholder="Headline"
              className="w-full resize-none border-0 bg-transparent p-0 font-serif text-3xl font-semibold leading-tight text-ink-900 outline-none placeholder:text-muted/50 sm:text-4xl"
            />
            {errors.title && <p className="mt-1 text-sm text-post">{errors.title}</p>}
            <div className="mt-3 flex items-center gap-1 text-sm text-muted">
              <span className="shrink-0">{publicSiteUrl || ''}/article/</span>
              <input
                value={form.slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  set({ slug: e.target.value });
                }}
                placeholder={previewSlug}
                className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-ink-900 hover:border-line focus:border-ink focus:outline-none"
                aria-label="URL slug"
              />
            </div>
            <label htmlFor="excerpt" className="label mt-5">Standfirst</label>
            <textarea
              id="excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => set({ excerpt: e.target.value })}
              placeholder="One or two sentences under the headline that tell readers why this story matters."
              className="field font-serif text-lg"
              maxLength={500}
            />
          </div>

          <RichTextEditor value={form.content} onChange={(content) => set({ content })} />

          <Card title="Photo gallery" actions={<button className="btn-ghost py-1 text-xs" onClick={() => setPicker('gallery')}><ImagePlus className="h-3.5 w-3.5" /> Add photos</button>}>
            {form.gallery.length === 0 ? (
              <p className="text-sm text-muted">Add photos to show a gallery below the story. Readers can open them full screen.</p>
            ) : (
              <ul className="space-y-3">
                {form.gallery.map((g, i) => (
                  <li key={g.media.id} className="flex items-center gap-3">
                    <MediaThumb item={g.media} className="h-16 w-24 shrink-0 rounded" />
                    <input
                      value={g.caption}
                      onChange={(e) => set({ gallery: form.gallery.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)) })}
                      placeholder="Caption"
                      className="field py-1.5 text-sm"
                      aria-label={`Caption for photo ${i + 1}`}
                    />
                    <div className="flex shrink-0">
                      <button type="button" disabled={i === 0} onClick={() => { const g2 = [...form.gallery]; [g2[i - 1], g2[i]] = [g2[i], g2[i - 1]]; set({ gallery: g2 }); }} className="rounded p-1.5 text-muted hover:bg-mist disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" disabled={i === form.gallery.length - 1} onClick={() => { const g2 = [...form.gallery]; [g2[i + 1], g2[i]] = [g2[i], g2[i + 1]]; set({ gallery: g2 }); }} className="rounded p-1.5 text-muted hover:bg-mist disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                      <button type="button" onClick={() => set({ gallery: form.gallery.filter((_, j) => j !== i) })} className="rounded p-1.5 text-muted hover:bg-post-light hover:text-post" aria-label="Remove photo"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Search and social">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="meta_title" className="label">Search title</label>
                  <Counter value={form.meta_title} max={70} ideal={[40, 65]} />
                </div>
                <input id="meta_title" className="field" value={form.meta_title} onChange={(e) => set({ meta_title: e.target.value })} placeholder={form.title || 'Defaults to the headline'} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="meta_description" className="label">Search description</label>
                  <Counter value={form.meta_description} max={160} ideal={[120, 158]} />
                </div>
                <textarea id="meta_description" rows={2} className="field" value={form.meta_description} onChange={(e) => set({ meta_description: e.target.value })} placeholder={form.excerpt || 'Defaults to the standfirst'} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="meta_keywords" className="label">Keywords</label>
                  <input id="meta_keywords" className="field" value={form.meta_keywords} onChange={(e) => set({ meta_keywords: e.target.value })} placeholder="Defaults to the tags" />
                </div>
                <div>
                  <label htmlFor="canonical_url" className="label">Canonical URL</label>
                  <input id="canonical_url" type="url" className="field" value={form.canonical_url} onChange={(e) => set({ canonical_url: e.target.value })} placeholder="Only if first published elsewhere" />
                  {errors.canonical_url && <p className="mt-1 text-xs text-post">{errors.canonical_url}</p>}
                </div>
              </div>
              <div className="rounded-md border border-line bg-mist p-4">
                <p className="text-xs text-muted">Search result preview</p>
                <p className="mt-2 truncate text-xs text-emerald-800">{(publicSiteUrl || 'https://nationalmail.in').replace(/^https?:\/\//, '')} › article › {previewSlug}</p>
                <p className="truncate text-lg text-[#1a0dab]">{seoTitle}</p>
                <p className="line-clamp-2 text-sm text-ink-700">{seoDesc}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card title="Publishing">
            <div className="space-y-4">
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select id="status" className="field" value={form.status} onChange={(e) => set({ status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label htmlFor="published_at" className="label">Publish date</label>
                <input id="published_at" type="datetime-local" className="field" value={form.published_at} onChange={(e) => set({ published_at: e.target.value })} />
                <p className="hint">Leave empty to publish now. Pick a future time to schedule.</p>
              </div>
              <Toggle id="is_featured" checked={form.is_featured} onChange={(v) => set({ is_featured: v })} label="Feature on the home page" hint="Shown in the lead stories at the top." />
              <Toggle id="is_editors_pick" checked={form.is_editors_pick} onChange={(v) => set({ is_editors_pick: v })} label="Editor's pick" hint="Shown in the Editor's picks band." />
              <button className="btn-ghost w-full" disabled={saving} onClick={() => save()}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {id && (
                <button className="btn-danger w-full" onClick={remove}>
                  <Trash2 className="h-4 w-4" /> Delete article
                </button>
              )}
            </div>
          </Card>

          <Card title="Section and byline">
            <div className="space-y-4">
              <div>
                <label htmlFor="category_id" className="label">Category</label>
                <select id="category_id" className="field" value={form.category_id} onChange={(e) => set({ category_id: e.target.value ? Number(e.target.value) : '' })}>
                  <option value="">Uncategorised</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="author_id" className="label">Author</label>
                <select id="author_id" className="field" value={form.author_id} onChange={(e) => set({ author_id: e.target.value ? Number(e.target.value) : '' })}>
                  <option value="">No byline</option>
                  {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <span className="label">Tags</span>
                <TagInput value={form.tags} onChange={(tags) => set({ tags })} suggestions={allTags} />
              </div>
            </div>
          </Card>

          <Card title="Featured image">
            {form.featured ? (
              <div className="space-y-3">
                <div className="relative">
                  <MediaThumb item={form.featured} className="aspect-[16/10] w-full rounded" />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button className="rounded bg-white/95 px-2 py-1 text-xs font-semibold shadow hover:bg-white" onClick={() => setPicker('featured')}>Replace</button>
                    <button className="rounded bg-white/95 px-2 py-1 text-xs font-semibold text-post shadow hover:bg-white" onClick={() => set({ featured: null })}>Remove</button>
                  </div>
                </div>
                <input className="field text-sm" value={form.featured_image_caption} onChange={(e) => set({ featured_image_caption: e.target.value })} placeholder="Caption (optional)" aria-label="Featured image caption" />
              </div>
            ) : (
              <button onClick={() => setPicker('featured')} className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-line text-sm text-muted hover:border-ink/40 hover:text-ink">
                <ImagePlus className="h-6 w-6" />
                Choose or upload an image
              </button>
            )}
          </Card>

          <Card title="Video">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1 rounded-md bg-mist p-1 text-sm" role="radiogroup" aria-label="Video type">
                {[['none', 'None'], ['embed', 'YouTube'], ['upload', 'Upload']].map(([v, l]) => (
                  <button
                    key={v}
                    role="radio"
                    aria-checked={form.video_type === v}
                    onClick={() => set({ video_type: v })}
                    className={`rounded px-2 py-1.5 font-medium ${form.video_type === v ? 'bg-white text-ink-900 shadow-sm' : 'text-muted hover:text-ink'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {form.video_type === 'embed' && (
                <div>
                  <input className="field text-sm" type="url" value={form.video_url} onChange={(e) => set({ video_url: e.target.value })} placeholder="YouTube or Vimeo link" aria-label="Video link" />
                  {errors.video_url && <p className="mt-1 text-xs text-post">{errors.video_url}</p>}
                </div>
              )}
              {form.video_type === 'upload' && (
                form.video ? (
                  <div className="space-y-2">
                    <video src={form.video.url} controls className="aspect-video w-full rounded bg-ink-900" preload="metadata" />
                    <div className="flex gap-2">
                      <button className="btn-ghost flex-1 py-1 text-xs" onClick={() => setPicker('video')}>Replace</button>
                      <button className="btn-danger flex-1 py-1 text-xs" onClick={() => set({ video: null })}>Remove</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setPicker('video')} className="flex w-full items-center justify-center gap-2 rounded border-2 border-dashed border-line py-6 text-sm text-muted hover:border-ink/40 hover:text-ink">
                    <Film className="h-5 w-5" /> Choose or upload a video
                  </button>
                )
              )}
              {errors.video_media_id && <p className="text-xs text-post">{errors.video_media_id}</p>}
            </div>
          </Card>
        </div>
      </div>

      <MediaPicker
        open={picker === 'featured'}
        onClose={() => setPicker(null)}
        type="image"
        title="Choose the featured image"
        onSelect={(m) => set({ featured: m })}
      />
      <MediaPicker
        open={picker === 'gallery'}
        onClose={() => setPicker(null)}
        type="image"
        multiple
        title="Add photos to the gallery"
        onSelect={(ms) => set({ gallery: [...form.gallery, ...ms.filter((m) => !form.gallery.some((g) => g.media.id === m.id)).map((m) => ({ media: m, caption: m.alt || '' }))] })}
      />
      <MediaPicker
        open={picker === 'video'}
        onClose={() => setPicker(null)}
        type="video"
        title="Choose a video"
        onSelect={(m) => set({ video: m })}
      />
    </div>
  );
}
