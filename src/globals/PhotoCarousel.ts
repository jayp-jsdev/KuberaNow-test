import type { GlobalConfig } from 'payload'

export const PhotoCarousel: GlobalConfig = {
  slug: 'photo-carousel',
  label: 'Home Page Carousel',
  admin: {
    group: 'Page Layouts',
    description:
      'Legacy carousel settings. Prefer editing slides under Globals → Home Page → Photo Carousel.',
  },
  fields: [
    {
      name: 'isEnabled',
      type: 'checkbox',
      label: 'Show Carousel on Home Page',
      defaultValue: true,
      admin: {
        description:
          'Toggle ON to display the carousel. Toggle OFF to hide it without deleting your photos.',
      },
    },
    {
      name: 'photos',
      type: 'array',
      label: 'Carousel Photos',
      maxRows: 4,
      admin: {
        description: 'Add, remove, or reorder photos in the carousel. Maximum 4 photos allowed.',
        initCollapsed: false,
      },
      fields: [
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
          label: 'Redirect To Article',
          admin: {
            description:
              'When users click this slide they will be redirected to this article.',
          },
        },
      ],
    },
  ],
}
