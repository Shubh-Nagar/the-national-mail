import Link from 'next/link';
import Logo from './Logo';
import { site } from '@/lib/site';

export default function Footer({ categories = [] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 bg-ink-900 text-white/80">
      <div className="container-site grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{site.description}</p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {site.social.map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="md:col-span-4" aria-label="Sections">
          <h2 className="mb-4 font-sans text-sm font-semibold text-white">Sections</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-white">{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="md:col-span-3" aria-label="Company">
          <h2 className="mb-4 font-sans text-sm font-semibold text-white">The National Mail</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/contact" className="hover:text-white">Share a story</Link></li>
            <li><Link href="/search" className="hover:text-white">Search</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} The National Mail. All rights reserved.</p>
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
