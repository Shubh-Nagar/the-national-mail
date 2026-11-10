'use client';

import CrudPage from '@/components/admin/CrudPage';

export default function CategoriesPage() {
  return (
    <CrudPage
      resource="categories"
      title="Categories"
      singular="category"
      description="Sections shown in the site navigation. Lower sort numbers appear first."
      defaults={{ color: '#1B2A4A', sort_order: 0, show_on_home: true, is_active: true }}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'slug', label: 'URL slug', hint: 'Leave empty to create one from the name.' },
        { name: 'description', label: 'Description', type: 'textarea', hint: 'Shown under the section title.' },
        { name: 'color', label: 'Accent colour', type: 'color' },
        { name: 'sort_order', label: 'Sort order', type: 'number' },
        { name: 'show_on_home', label: 'Show a section for this category on the home page', type: 'toggle' },
        { name: 'is_active', label: 'Show in the navigation', type: 'toggle' },
      ]}
      deleteWarning={(r) => (r.article_count ? `Its ${r.article_count} articles will become uncategorised.` : '')}
      columns={[
        {
          label: 'Name',
          render: (r) => (
            <span className="flex items-center gap-2 font-medium text-ink-900">
              <span className="h-3 w-3 rounded-full" style={{ background: r.color }} aria-hidden="true" />
              {r.name}
            </span>
          ),
        },
        { label: 'Slug', className: 'hidden sm:table-cell text-muted', render: (r) => r.slug },
        { label: 'Articles', className: 'text-right tabular-nums', render: (r) => r.article_count },
        { label: 'Order', className: 'hidden md:table-cell text-right tabular-nums', render: (r) => r.sort_order },
        {
          label: 'Visibility',
          className: 'hidden md:table-cell',
          render: (r) => (r.is_active ? (r.show_on_home ? 'Nav and home page' : 'Nav only') : <span className="text-muted">Hidden</span>),
        },
      ]}
    />
  );
}
