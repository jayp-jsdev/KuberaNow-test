import type { CollectionConfig } from 'payload'

const adminOnly = {
  create: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
  read: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
  update: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
  delete: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
}

export const NewsAnalytics: CollectionConfig = {
  slug: 'news-analytics',
  labels: {
    singular: 'News Analytics',
    plural: 'News Analytics',
  },
  admin: {
    group: 'Analytics',
    hidden: true,
    useAsTitle: 'newsId',
    defaultColumns: ['newsId', 'trendingScore', 'shares', 'comments', 'lastCalculatedAt'],
    description: 'Precomputed trending analytics per article.',
  },
  access: adminOnly,
  indexes: [
    {
      fields: ['trendingScore'],
    },
  ],
  fields: [
    {
      name: 'newsId',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
      unique: true,
      label: 'Article',
    },
    {
      name: 'shares',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
        description: 'Total share count for this article.',
      },
    },
    {
      name: 'comments',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
        description: 'Total comment count for this article.',
      },
    },
    {
      name: 'trendingScore',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Precomputed trending score. Updated by the background job.',
      },
    },
    {
      name: 'lastCalculatedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
