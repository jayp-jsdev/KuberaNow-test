import type { CollectionConfig } from 'payload'
import { AD_PLACEMENT_OPTIONS } from '@/lib/ads/placements'
import { AD_SLOT_KEYS } from '@/lib/ads/slotConfig'

const slotKeyOptions = AD_SLOT_KEYS.map((key) => ({
  label: key,
  value: key,
}))

export const Ads: CollectionConfig = {
  slug: 'ads',
  labels: {
    singular: 'Ad',
    plural: 'Ads',
  },
  admin: {
    group: 'Ads',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slotKey', 'defaultPlacement', 'isActive', 'updatedAt'],
    description:
      'Trackable ad units linked to Site Ads slots. Creative content is managed in the Site Ads global.',
  },
  indexes: [
    {
      fields: ['isActive'],
    },
    {
      fields: ['defaultPlacement'],
    },
  ],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'slotKey',
      type: 'select',
      required: true,
      unique: true,
      options: slotKeyOptions,
      admin: {
        description: 'Links this ad unit to a Site Ads slot for tracking.',
      },
    },
    {
      name: 'defaultPlacement',
      type: 'select',
      required: true,
      options: AD_PLACEMENT_OPTIONS,
      label: 'Default Placement',
      admin: {
        description: 'Primary placement zone used when this slot is rendered.',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: {
        description: 'Inactive ads are not tracked on the frontend.',
      },
    },
  ],
}
