import Link from 'next/link';
import { Search } from 'lucide-react';
import Logo from './Logo';
import CategoryNav from './CategoryNav';
import MobileMenu from './MobileMenu';
import { site } from '@/lib/site';
import { formatDate } from '@/lib/format';

export default function Header({ categories = [] }) {
  const today = formatDate(new Date(), { weekday: 'long' });
  return (
    <header className="relative z-30 bg-white">
      <div className="border-b border-line bg-mist">
        <div className="container-site flex h-9 items-center justify-between text-xs text-muted">
          <time dateTime={new Date().toISOString().slice(0, 10)}>{today}</time>
          <nav aria-label="Secondary" className="hidden items-center gap-5 sm:flex">
            <Link href="/about" className="hover:text-ink">About us</Link>
            <Link href="/contact" className="hover:text-ink">Share a story</Link>
            <Link href="/#newsletter" className="font-semibold text-post hover:text-post-dark">Get the newsletter</Link>
          </nav>
        </div>
      </div>

      <div className="container-site flex items-center justify-between gap-4 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <MobileMenu categories={categories} />
          <div className="flex flex-col gap-1">
            <Logo size="lg" />
            <p className="hidden pl-[3.75rem] text-sm text-muted md:block">{site.tagline}</p>
          </div>
        </div>
        <form action="/search" role="search" className="hidden w-full max-w-xs items-center rounded-md border border-line bg-white focus-within:border-ink md:flex">
          <label htmlFor="header-search" className="sr-only">Search stories</label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Search stories"
            className="w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted"
          />
          <button type="submit" className="px-3 text-muted hover:text-ink" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </form>
        <Link href="/search" className="rounded-md p-2 text-ink md:hidden" aria-label="Search">
          <Search className="h-5 w-5" />
        </Link>
      </div>

      <CategoryNav categories={categories} />
    </header>
  );
}
