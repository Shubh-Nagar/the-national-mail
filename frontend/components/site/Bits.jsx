import Link from 'next/link';

export function SectionHeading({ title, href, linkLabel = 'See all', color = '#B4232A', as: Tag = 'h2', description }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-3">
      <div className="min-w-0">
        <Tag className="flex items-center gap-3 font-serif text-2xl font-semibold sm:text-[1.9rem]">
          <span className="h-6 w-1.5 rounded-full" style={{ background: color }} aria-hidden="true" />
          {href ? <Link href={href} className="hover:underline">{title}</Link> : title}
        </Tag>
        {description && <p className="mt-1 pl-[1.125rem] text-sm text-muted">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-post hover:text-post-dark hover:underline">
          <span className="sm:hidden">See all</span>
          <span className="hidden sm:inline">{linkLabel}</span>
        </Link>
      )}
    </div>
  );
}

export function Pagination({ page, totalPages, basePath, query = {} }) {
  if (totalPages <= 1) return null;
  const href = (p) => {
    const params = new URLSearchParams({ ...query, ...(p > 1 ? { page: String(p) } : {}) });
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const pages = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p += 1) pages.push(p);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1 text-sm" aria-label="Pagination">
      {page > 1 && <Link href={href(page - 1)} className="btn-ghost" rel="prev">Newer stories</Link>}
      <ul className="mx-2 flex items-center gap-1">
        {pages.map((p) => (
          <li key={p}>
            <Link
              href={href(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 ${
                p === page ? 'bg-ink font-semibold text-white' : 'text-ink hover:bg-mist'
              }`}
            >
              {p}
            </Link>
          </li>
        ))}
      </ul>
      {page < totalPages && <Link href={href(page + 1)} className="btn-ghost" rel="next">Older stories</Link>}
    </nav>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-mist px-6 py-14 text-center">
      <h2 className="font-serif text-2xl font-semibold">{title}</h2>
      {children && <div className="mx-auto mt-2 max-w-md text-muted">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, color, children }) {
  return (
    <div className="border-b border-line bg-letter/60">
      <div className="container-site py-10 sm:py-14">
        {color && <span className="mb-4 block h-1.5 w-12 rounded-full" style={{ background: color }} aria-hidden="true" />}
        <h1 className="font-serif text-4xl font-semibold tracking-[-0.01em] sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-lg text-muted">{description}</p>}
        {children}
      </div>
    </div>
  );
}
