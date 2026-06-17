import type { CollectionConfig } from 'payload'

const adminOnly = {
  create: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
  read: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
  update: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
  delete: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
}

export const NewsViews: CollectionConfig = {
  slug: 'news-views',
  labels: {
    singular: 'News View',
    plural: 'News Views',
  },
  admin: {
    group: 'Analytics',
    hidden: true,
    useAsTitle: 'id',
    defaultColumns: ['newsId', 'createdAt'],
    description: 'Individual article view events used for trending score calculation.',
  },
  access: adminOnly,
  indexes: [
    {
      fields: ['newsId', 'createdAt'],
    },
  ],
  fields: [
    {
      name: 'newsId',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
      label: 'Article',
    },
  ],
  timestamps: true,
}
