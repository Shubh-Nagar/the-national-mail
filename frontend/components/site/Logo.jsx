import Link from 'next/link';

/** Envelope mark: a red post-box square with a folded flap. */
export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="6" fill="#B4232A" />
      <path d="M8 13.5h24v15a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 8 28.5z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M8.6 14.2 20 23l11.4-8.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ size = 'md', inverted = false }) {
  const text = size === 'lg' ? 'text-[1.45rem] sm:text-[2.35rem]' : 'text-[1.35rem] sm:text-[1.75rem]';
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="The National Mail, home">
      <LogoMark className={size === 'lg' ? 'h-8 w-8 sm:h-12 sm:w-12' : 'h-8 w-8 sm:h-9 sm:w-9'} />
      <span className={`whitespace-nowrap font-serif font-semibold leading-none tracking-[-0.015em] ${text} ${inverted ? 'text-white' : 'text-ink-900'}`}>
        The National Mail
      </span>
    </Link>
  );
}
