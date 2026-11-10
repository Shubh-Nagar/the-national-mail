'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/adminApi';
import { useToast } from './Toast';
import { PageTitle, Modal, LoadingBlock } from './ui';

/**
 * Generic list + create/edit modal for simple resources (categories, tags, authors).
 * fields: [{ name, label, type: 'text'|'textarea'|'color'|'number'|'toggle', hint, placeholder, required }]
 * columns: [{ label, render(row), className }]
 */
export default function CrudPage({ resource, title, description, singular, fields, columns, defaults, deleteWarning }) {
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null); // row or {} for new
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api(`/admin/${resource}`).then((d) => setRows(d.data)).catch((e) => toast(e.message, 'error'));
  }, [resource, toast]);
  useEffect(load, [load]);

  const open = (row) => {
    setEditing(row || {});
    setError('');
    const init = { ...defaults };
    fields.forEach((f) => {
      if (row && row[f.name] !== undefined && row[f.name] !== null) init[f.name] = row[f.name];
    });
    setForm(init);
  };

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const d = editing.id
        ? await api(`/admin/${resource}/${editing.id}`, { method: 'PUT', body: form })
        : await api(`/admin/${resource}`, { method: 'POST', body: form });
      toast(d.message);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    const extra = deleteWarning ? ` ${deleteWarning(row)}` : '';
    if (!window.confirm(`Delete “${row.name}”?${extra}`)) return;
    try {
      const d = await api(`/admin/${resource}/${row.id}`, { method: 'DELETE' });
      toast(d.message);
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <PageTitle title={title} description={description} actions={<button className="btn-primary" onClick={() => open(null)}>New {singular}</button>} />
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        {!rows ? (
          <LoadingBlock />
        ) : rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-serif text-xl font-semibold">No {title.toLowerCase()} yet</p>
            <button className="btn-primary mt-4" onClick={() => open(null)}>Create the first {singular}</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-mist text-xs text-muted">
                <tr>
                  {columns.map((c) => <th key={c.label} className={`px-4 py-3 font-semibold ${c.className || ''}`}>{c.label}</th>)}
                  <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-mist/60">
                    {columns.map((c) => <td key={c.label} className={`px-4 py-3 ${c.className || ''}`}>{c.render(row)}</td>)}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => open(row)} className="rounded p-1.5 text-muted hover:bg-mist hover:text-ink" aria-label={`Edit ${row.name}`}><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(row)} className="rounded p-1.5 text-muted hover:bg-post-light hover:text-post" aria-label={`Delete ${row.name}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} size="sm" title={editing?.id ? `Edit ${singular}` : `New ${singular}`}>
        <form onSubmit={submit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              {f.type === 'toggle' ? (
                <label className="flex items-center gap-2 text-sm font-medium text-ink-900">
                  <input type="checkbox" className="h-4 w-4 accent-[#1B2A4A]" checked={!!form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })} />
                  {f.label}
                </label>
              ) : (
                <>
                  <label htmlFor={`f-${f.name}`} className="label">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea id={`f-${f.name}`} rows={4} className="field" value={form[f.name] ?? ''} placeholder={f.placeholder} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                  ) : f.type === 'color' ? (
                    <div className="flex gap-2">
                      <input type="color" className="h-10 w-12 cursor-pointer rounded border border-line" value={form[f.name] || '#1B2A4A'} onChange={(e) => setForm({ ...form, [f.name]: e.target.value.toUpperCase() })} aria-label={`${f.label} picker`} />
                      <input id={`f-${f.name}`} className="field font-mono text-sm" value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                    </div>
                  ) : (
                    <input id={`f-${f.name}`} type={f.type || 'text'} className="field" value={form[f.name] ?? ''} placeholder={f.placeholder} required={f.required} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                  )}
                </>
              )}
              {f.hint && <p className="hint">{f.hint}</p>}
            </div>
          ))}
          {error && <p className="rounded-md bg-post-light px-3 py-2 text-sm text-post-dark" role="alert">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" className="btn-ink" disabled={saving}>{saving ? 'Saving…' : editing?.id ? 'Save changes' : `Create ${singular}`}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
