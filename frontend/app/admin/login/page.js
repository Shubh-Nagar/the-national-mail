'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/admin/AuthProvider';
import Logo from '@/components/site/Logo';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      const next = params.get('next');
      router.replace(next && next.startsWith('/admin') && !next.startsWith('/admin/login') ? next : '/admin');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" autoFocus />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      {error && <p className="rounded-md bg-post-light px-3 py-2 text-sm text-post-dark" role="alert">{error}</p>}
      <button type="submit" className="btn-ink w-full py-2.5" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-letter/60 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-xl border border-line bg-white p-7 shadow-sm">
          <h1 className="font-serif text-2xl font-semibold">Sign in to the newsroom</h1>
          <p className="mb-6 mt-1 text-sm text-muted">Use the account your administrator created for you.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
