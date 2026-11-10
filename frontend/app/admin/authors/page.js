'use client';

import CrudPage from '@/components/admin/CrudPage';

export default function AuthorsPage() {
  return (
    <CrudPage
      resource="authors"
      title="Authors"
      singular="author"
      description="Bylines shown on articles and author pages. Authors do not need an admin account."
      defaults={{}}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'slug', label: 'URL slug', hint: 'Leave empty to create one from the name.' },
        { name: 'designation', label: 'Role', placeholder: 'Senior Correspondent' },
        { name: 'bio', label: 'Short bio', type: 'textarea' },
        { name: 'avatar_url', label: 'Photo URL', type: 'url', hint: 'Optional. Paste an image link from the media library.' },
      ]}
      deleteWarning={(r) => (r.article_count ? `Their ${r.article_count} articles will no longer show a byline.` : '')}
      columns={[
        {
          label: 'Name',
          render: (r) => (
            <div>
              <p className="font-medium text-ink-900">{r.name}</p>
              <p className="text-xs text-muted">{r.designation}</p>
            </div>
          ),
        },
        { label: 'Slug', className: 'hidden sm:table-cell text-muted', render: (r) => r.slug },
        { label: 'Articles', className: 'text-right tabular-nums', render: (r) => r.article_count },
      ]}
    />
  );
}
