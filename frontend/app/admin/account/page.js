'use client';

import { useState } from 'react';
import { api } from '@/lib/adminApi';
import { useAuth } from '@/components/admin/AuthProvider';
import { useToast } from '@/components/admin/Toast';
import { PageTitle, Card } from '@/components/admin/ui';

export default function AccountPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirm) {
      setError('The new passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const d = await api('/auth/password', { method: 'PUT', body: { currentPassword: form.currentPassword, newPassword: form.newPassword } });
      toast(d.message);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="Account" description={`Signed in as ${user?.email} (${user?.role}).`} />
      <Card title="Change password" className="max-w-lg">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="cur" className="label">Current password</label>
            <input id="cur" type="password" className="field" autoComplete="current-password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          </div>
          <div>
            <label htmlFor="new" className="label">New password</label>
            <input id="new" type="password" className="field" autoComplete="new-password" minLength={8} required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
            <p className="hint">At least 8 characters.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="label">Confirm new password</label>
            <input id="confirm" type="password" className="field" autoComplete="new-password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
          {error && <p className="rounded-md bg-post-light px-3 py-2 text-sm text-post-dark" role="alert">{error}</p>}
          <button className="btn-ink" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
        </form>
      </Card>
    </>
  );
}
