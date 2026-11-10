'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CategoryNav({ categories = [] }) {
  const pathname = usePathname();
  const items = [{ name: 'Home', slug: '', href: '/' }, ...categories.map((c) => ({ ...c, href: `/category/${c.slug}` }))];

  return (
    <nav aria-label="Sections" className="sticky top-0 z-30 border-y border-ink-900 bg-ink">
      <div className="container-site">
        <ul className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto">
          {items.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative block px-3 py-3 text-[0.95rem] font-medium transition-colors ${
                    active ? 'text-white' : 'text-white/75 hover:text-white'
                  }`}
                >
                  {item.name}
                  {active && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-post" aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
