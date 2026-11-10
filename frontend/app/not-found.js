import Link from 'next/link';
import Logo from '@/components/site/Logo';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-letter/60 px-6 text-center">
      <Logo />
      <p className="mt-12 font-serif text-7xl font-semibold text-post">404</p>
      <h1 className="mt-4 font-serif text-3xl font-semibold">Return to sender</h1>
      <p className="mt-3 max-w-md text-ink-700">
        We could not find that page. The story may have moved, or the link may have a typo.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">Go to the home page</Link>
        <Link href="/search" className="btn-ghost">Search stories</Link>
      </div>
    </div>
  );
}
