'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

export default function MobileMenu({ categories = [] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="-ml-2 rounded-md p-2 text-ink lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-ink-900/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line p-4">
              <Logo />
              <button onClick={() => setOpen(false)} className="rounded-md p-2 text-ink" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form action="/search" role="search" className="border-b border-line p-4">
              <input name="q" type="search" placeholder="Search stories" className="field" aria-label="Search stories" />
            </form>
            <nav className="flex-1 p-2" aria-label="Sections">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="flex items-center gap-3 rounded-md px-3 py-3 font-serif text-lg text-ink-900 hover:bg-mist"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} aria-hidden="true" />
                  {c.name}
                </Link>
              ))}
            </nav>
            <div className="space-y-1 border-t border-line p-4 text-sm">
              <Link href="/about" className="block py-1.5 text-muted hover:text-ink">About us</Link>
              <Link href="/contact" className="block py-1.5 text-muted hover:text-ink">Share a story</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
