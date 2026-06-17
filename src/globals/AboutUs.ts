import type { GlobalConfig } from 'payload'

export const AboutUs: GlobalConfig = {
  slug: 'about-us',
  label: 'About Us',
  admin: {
    group: 'Site Pages',
    description: 'Manage the content of the About Us page.',
  },
  fields: [
    {
      name: 'whereBusinessSpeaksGujarati',
      type: 'richText',
      label: 'Where Business Speaks Gujarati',
      required: true,
    },
    {
      name: 'ourStory',
      type: 'richText',
      label: 'Our Story',
      required: true,
    },
    {
      name: 'whatWeCover',
      type: 'array',
      label: 'What We Cover',
      minRows: 1,
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          required: true,
        },
      ],
    },
    {
      name: 'ourValues',
      type: 'array',
      label: 'Our Values',
      minRows: 1,
      fields: [
        {
          name: 'value',
          type: 'text',
          label: 'Value Title (e.g. Integrity)',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          required: true,
        },
      ],
    },
    {
      name: 'ourVision',
      type: 'group',
      label: 'Our Vision',
      fields: [
        {
          name: 'descriptions',
          type: 'array',
          label: 'Descriptions',
          minRows: 1,
          fields: [
            {
              name: 'description',
              type: 'textarea',
              label: 'Description',
              required: true,
            },
          ],
        },
        {
          name: 'tagline',
          type: 'text',
          label: 'Tagline / Quote (Footer Text)',
        },
      ],
    },
  ],
}
