'use client';

import { useState } from 'react';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const empty = { name: '', email: '', subject: '', message: '', website: '' };

export default function ContactForm() {
  const [form, setForm] = useState(empty);
  const [state, setState] = useState({ status: 'idle', message: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setState({ status: 'loading', message: '' });
    try {
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Message not sent. Try again.');
      setState({ status: 'done', message: data.message });
      setForm(empty);
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  if (state.status === 'done') {
    return (
      <div className="rounded-lg border border-line bg-letter/60 p-8" role="status">
        <h2 className="font-serif text-2xl font-semibold">Message sent</h2>
        <p className="mt-2 text-muted">{state.message}</p>
        <button className="btn-ghost mt-6" onClick={() => setState({ status: 'idle', message: '' })}>Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">Your name</label>
          <input id="c-name" className="field" value={form.name} onChange={set('name')} required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="c-email" className="label">Email</label>
          <input id="c-email" type="email" className="field" value={form.email} onChange={set('email')} required autoComplete="email" />
        </div>
      </div>
      <div>
        <label htmlFor="c-subject" className="label">Subject <span className="font-normal text-muted">(optional)</span></label>
        <input id="c-subject" className="field" value={form.subject} onChange={set('subject')} placeholder="A story tip, a correction, a partnership…" />
      </div>
      <div>
        <label htmlFor="c-message" className="label">Message</label>
        <textarea id="c-message" rows={7} className="field" value={form.message} onChange={set('message')} required minLength={10} />
        <p className="hint">If you are sharing a story, tell us who is involved, where it is happening and how we can reach them.</p>
      </div>
      {/* Honeypot: hidden from people, filled in by bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </div>
      {state.status === 'error' && <p className="text-sm text-post" role="alert">{state.message}</p>}
      <button type="submit" className="btn-primary px-6 py-2.5" disabled={state.status === 'loading'}>
        {state.status === 'loading' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
