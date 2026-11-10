'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function Gallery({ images = [] }) {
  const [index, setIndex] = useState(null);
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((d) => setIndex((i) => (i + d + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, close, step]);

  if (!images.length) return null;
  const current = index !== null ? images[index] : null;

  return (
    <section aria-label="Photo gallery" className="my-10">
      <h2 className="mb-4 font-serif text-xl font-semibold">Photos from this story</h2>
      <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {images.map((img, i) => (
          <figure key={img.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded bg-letter"
              aria-label={`Open photo ${i + 1} of ${images.length}`}
            >
              <Image src={img.url} alt={img.alt || img.caption || ''} fill sizes="(min-width: 768px) 340px, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            </button>
            {img.caption && <figcaption className="mt-2 text-sm text-muted">{img.caption}</figcaption>}
          </figure>
        ))}
      </div>

      {current && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ink-900/95" role="dialog" aria-modal="true" aria-label="Photo viewer">
          <div className="flex items-center justify-between p-4 text-sm text-white/80">
            <span>{index + 1} of {images.length}</span>
            <button onClick={close} className="rounded-md p-2 text-white hover:bg-white/10" aria-label="Close photo viewer">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={current.url} alt={current.alt || current.caption || ''} fill sizes="100vw" className="object-contain" />
            {images.length > 1 && (
              <>
                <button onClick={() => step(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Previous photo">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={() => step(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Next photo">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          {current.caption && <p className="mx-auto max-w-2xl p-4 text-center text-sm text-white/85">{current.caption}</p>}
        </div>
      )}
    </section>
  );
}
