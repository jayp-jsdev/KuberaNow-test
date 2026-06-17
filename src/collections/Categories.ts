import type { CollectionConfig } from 'payload'
import { titleToSlug } from '../lib/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Category',
    plural: 'Category',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from title (mirrors Sanity slug { source: 'title' })
        if (data.title && (!data.slug || String(data.slug).trim() === '')) {
          data.slug = titleToSlug(String(data.title))
        } else if (data.slug) {
          const normalized = titleToSlug(String(data.slug))
          if (normalized) data.slug = normalized
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        position: 'sidebar',
        description: 'Auto-generated from the title. Used in category URLs.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
  ],
}
