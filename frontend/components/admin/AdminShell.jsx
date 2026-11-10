'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, FolderTree, Tags, Users, Image as ImageIcon, Inbox, KeyRound, LogOut, Menu, X, ExternalLink, PenSquare,
} from 'lucide-react';
import { AuthProvider, useAuth } from './AuthProvider';
import { ToastProvider } from './Toast';
import { LoadingBlock } from './ui';
import { LogoMark } from '@/components/site/Logo';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/media', label: 'Media library', icon: ImageIcon },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/tags', label: 'Tags', icon: Tags },
  { href: '/admin/authors', label: 'Authors', icon: Users },
  { href: '/admin/messages', label: 'Messages', icon: Inbox },
];

function Sidebar({ onNavigate }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col bg-ink-900 text-white/80">
      <Link href="/admin" className="flex items-center gap-3 px-5 py-5" onClick={onNavigate}>
        <LogoMark className="h-8 w-8" />
        <span className="leading-tight">
          <span className="block font-serif text-lg font-semibold text-white">The National Mail</span>
          <span className="block text-xs text-white/55">Newsroom</span>
        </span>
      </Link>
      <div className="px-3">
        <Link href="/admin/articles/new" onClick={onNavigate} className="btn-primary w-full">
          <PenSquare className="h-4 w-4" /> New article
        </Link>
      </div>
      <nav className="mt-4 flex-1 space-y-0.5 px-3" aria-label="Admin">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href) && !(href === '/admin/articles' && pathname === '/admin/articles/new');
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-0.5 border-t border-white/10 p-3 text-sm">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" /> View website
        </a>
        <Link href="/admin/account" onClick={onNavigate} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/5 hover:text-white">
          <KeyRound className="h-4 w-4" /> Account
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        {user && <p className="truncate px-3 pt-2 text-xs text-white/45">Signed in as {user.email}</p>}
      </div>
    </div>
  );
}

function Guard({ children }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLogin = pathname.startsWith('/admin/login');

  useEffect(() => {
    if (status === 'anon' && !isLogin) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    if (status === 'authed' && isLogin) router.replace('/admin');
  }, [status, isLogin, pathname, router]);

  if (isLogin) return children;
  if (status !== 'authed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <LoadingBlock />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <Sidebar />
      </aside>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button className="absolute inset-0 bg-ink-900/50" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <div className="absolute inset-y-0 left-0 w-72">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMenuOpen(true)} className="rounded p-1 text-ink" aria-label="Open menu">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="font-serif text-lg font-semibold">Newsroom</span>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminShell({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <Guard>{children}</Guard>
      </ToastProvider>
    </AuthProvider>
  );
}
