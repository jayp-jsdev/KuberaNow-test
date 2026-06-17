import type { Field } from 'payload'

/** Inline ad creative fields — use inside a group or block. */
export function adSlotFields(): Field[] {
  return [
      {
        name: 'isEnabled',
        type: 'checkbox',
        label: 'Enable Ad',
        defaultValue: false,
      },
      {
        name: 'showLabel',
        type: 'checkbox',
        label: 'Show Label',
        defaultValue: true,
        admin: {
          condition: (_, siblingData) => siblingData?.isEnabled === true,
        },
      },
      {
        name: 'labelText',
        type: 'text',
        label: 'Label Text',
        defaultValue: 'Advertisement',
        admin: {
          condition: (_, siblingData) =>
            siblingData?.isEnabled === true && siblingData?.showLabel !== false,
        },
      },
      {
        name: 'adType',
        type: 'select',
        label: 'Ad Type',
        defaultValue: 'image',
        options: [
          { label: 'Image Ad', value: 'image' },
          { label: 'Custom HTML / Ad Script', value: 'custom' },
        ],
        admin: {
          condition: (_, siblingData) => siblingData?.isEnabled === true,
        },
      },
      {
        name: 'sourceType',
        type: 'select',
        label: 'Image Source',
        defaultValue: 'upload',
        options: [
          { label: 'Upload Image', value: 'upload' },
          { label: 'External Image URL', value: 'url' },
        ],
        admin: {
          condition: (_, siblingData) =>
            siblingData?.isEnabled === true && siblingData?.adType === 'image',
        },
      },
      {
        name: 'imageUpload',
        type: 'upload',
        relationTo: 'media',
        label: 'Ad Image',
        admin: {
          condition: (_, siblingData) =>
            siblingData?.isEnabled === true &&
            siblingData?.adType === 'image' &&
            siblingData?.sourceType !== 'url',
        },
      },
      {
        name: 'imageUrl',
        type: 'text',
        label: 'External Image URL',
        admin: {
          description: 'Paste a direct image URL (used when Image Source is External).',
          condition: (_, siblingData) =>
            siblingData?.isEnabled === true &&
            siblingData?.adType === 'image' &&
            siblingData?.sourceType === 'url',
        },
      },
      {
        name: 'linkUrl',
        type: 'text',
        label: 'Click-through URL',
        admin: {
          description: 'Where users go when they click the ad image.',
          condition: (_, siblingData) =>
            siblingData?.isEnabled === true && siblingData?.adType === 'image',
        },
      },
      {
        name: 'openInNewTab',
        type: 'checkbox',
        label: 'Open Link in New Tab',
        defaultValue: true,
        admin: {
          condition: (_, siblingData) =>
            siblingData?.isEnabled === true && siblingData?.adType === 'image',
        },
      },
      {
        name: 'altText',
        type: 'text',
        label: 'Image Alt Text',
        admin: {
          condition: (_, siblingData) =>
            siblingData?.isEnabled === true && siblingData?.adType === 'image',
        },
      },
      {
        name: 'customHtml',
        type: 'textarea',
        label: 'Custom HTML / Ad Script',
        admin: {
          description: 'Paste ad network code (e.g. Google AdSense) or custom HTML.',
          condition: (_, siblingData) =>
            siblingData?.isEnabled === true && siblingData?.adType === 'custom',
        },
      },
  ]
}

/** Reusable Payload fields for a single ad placement slot. */
export function adSlotGroup(name: string, label: string): Field {
  return {
    name,
    type: 'group',
    label,
    fields: adSlotFields(),
  }
}
