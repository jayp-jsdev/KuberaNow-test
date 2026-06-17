import type { CollectionConfig } from 'payload'
import { AD_PLACEMENT_OPTIONS } from '@/lib/ads/placements'

const adminReadOnly = {
  create: () => false,
  update: () => false,
  delete: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
  read: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
}

export const AdAnalyticsDaily: CollectionConfig = {
  slug: 'ad-analytics-daily',
  labels: {
    singular: 'Ad Analytics (Daily)',
    plural: 'Ad Analytics (Daily)',
  },
  admin: {
    group: 'Analytics',
    useAsTitle: 'id',
    defaultColumns: ['ad', 'date', 'placement', 'impressions', 'clicks', 'ctr', 'updatedAt'],
    description: 'Aggregated daily ad performance per placement. Updated automatically by tracking endpoints.',
    listSearchableFields: ['date', 'placement'],
  },
  access: adminReadOnly,
  indexes: [
    {
      fields: ['ad', 'date', 'placement'],
      unique: true,
    },
    {
      fields: ['ad', 'date'],
    },
    {
      fields: ['date'],
    },
    {
      fields: ['placement'],
    },
    {
      fields: ['impressions'],
    },
    {
      fields: ['clicks'],
    },
    {
      fields: ['ctr'],
    },
  ],
  fields: [
    {
      name: 'ad',
      type: 'relationship',
      relationTo: 'ads',
      required: true,
      label: 'Ad',
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      label: 'Date (UTC)',
      admin: {
        readOnly: true,
        description: 'UTC calendar date in YYYY-MM-DD format.',
      },
      validate: (value: unknown) => {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return 'Date must be in YYYY-MM-DD format'
        }
        return true
      },
    },
    {
      name: 'placement',
      type: 'select',
      required: true,
      options: AD_PLACEMENT_OPTIONS,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'impressions',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'clicks',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'ctr',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
        description: 'Click-through rate (%) = (clicks / impressions) × 100',
      },
    },
  ],
  timestamps: true,
}
