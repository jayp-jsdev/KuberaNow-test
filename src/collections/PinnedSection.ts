import type { CollectionConfig } from 'payload'

export const PinnedSection: CollectionConfig = {
  slug: 'pinned-sections',
  labels: {
    singular: 'Pinned Section',
    plural: 'Pinned Section',
  },
  admin: {
    group: 'Articles',
    useAsTitle: 'section',
    defaultColumns: ['section', 'category', 'updatedAt'],
    description:
      'Legacy pinned section assignments. Prefer editing pinned articles under Globals → Home Page → Pinned News.',
  },
  fields: [
    {
      name: 'section',
      type: 'select',
      label: 'Section Assignment',
      defaultValue: 'home',
      options: [
        { label: 'Home Page', value: 'home' },
        { label: 'Latest News', value: 'trending' },
        { label: 'Category Top', value: 'category_top' },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Category Reference (Only for Category Top)',
      admin: {
        description: 'Required when the section is "Category Top".',
        condition: (data) => data?.section === 'category_top',
      },
    },
    {
      name: 'articles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      maxRows: 4,
      label: 'Pinned Articles Inventory',
      admin: {
        description:
          'Drag items up or down to re-order. Maximum 4 pinned articles allowed here.',
      },
      filterOptions: {
        _status: {
          equals: 'published',
        },
      },
    },
  ],
}
