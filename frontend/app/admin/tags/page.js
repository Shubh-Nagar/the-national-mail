'use client';

import CrudPage from '@/components/admin/CrudPage';

export default function TagsPage() {
  return (
    <CrudPage
      resource="tags"
      title="Tags"
      singular="tag"
      description="Topics that connect stories across sections. Tags are also created automatically when you add them to an article."
      defaults={{}}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'slug', label: 'URL slug', hint: 'Leave empty to create one from the name.' },
      ]}
      columns={[
        { label: 'Name', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
        { label: 'Slug', className: 'hidden sm:table-cell text-muted', render: (r) => r.slug },
        { label: 'Articles', className: 'text-right tabular-nums', render: (r) => r.article_count },
      ]}
    />
  );
}
