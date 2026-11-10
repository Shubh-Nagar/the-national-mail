'use client';

import { useState } from 'react';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export default function NewsletterForm({ compact = false }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function onSubmit(e) {
    e.preventDefault();
    setState({ status: 'loading', message: '' });
    try {
      const res = await fetch(`${API}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed. Try again.');
      setState({ status: 'done', message: data.message });
      setEmail('');
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      <div className={`flex w-full gap-2 ${compact ? 'flex-col' : 'flex-col sm:flex-row'}`}>
        <label htmlFor={compact ? 'nl-email-c' : 'nl-email'} className="sr-only">Email address</label>
        <input
          id={compact ? 'nl-email-c' : 'nl-email'}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="field flex-1 py-2.5"
          autoComplete="email"
        />
        <button type="submit" className="btn-primary py-2.5" disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-[1.25rem] text-sm ${state.status === 'error' ? 'text-post' : 'text-ink-700'}`}
      >
        {state.message}
      </p>
    </form>
  );
}
