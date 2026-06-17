import type { Field } from 'payload'

export const sectionEnabledField: Field = {
  name: 'enabled',
  type: 'checkbox',
  label: 'Show Section',
  defaultValue: true,
}

export function sectionTitleField(defaultValue: string, label = 'Section Title'): Field {
  return {
    name: 'sectionTitle',
    type: 'text',
    label,
    defaultValue,
    required: true,
  }
}

export const carouselPhotoFields: Field[] = [
  {
    name: 'caption',
    type: 'text',
    label: 'Slide Label',
    admin: {
      description: 'Optional label shown in admin only (e.g. "Budget 2026").',
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
  },
  {
    name: 'imageUpload',
    type: 'upload',
    relationTo: 'media',
    label: 'Upload Image',
    admin: {
      condition: (_, siblingData) => siblingData?.sourceType !== 'url',
    },
  },
  {
    name: 'imageUrl',
    type: 'text',
    label: 'External Image URL',
    admin: {
      description: 'Paste a direct image URL.',
      condition: (_, siblingData) => siblingData?.sourceType === 'url',
    },
  },
  {
    name: 'altText',
    type: 'text',
    label: 'Alt Text',
  },
  {
    name: 'article',
    type: 'relationship',
    relationTo: 'articles',
    label: 'Link To Article',
    admin: {
      description: 'When users click this slide they go to this article.',
    },
  },
]
