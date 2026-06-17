import type { Field } from 'payload'

type LegalPageFieldsOptions = {
  defaultTitle: string
  sectionsDescription: string
}

export function legalPageFields({ defaultTitle, sectionsDescription }: LegalPageFieldsOptions): Field[] {
  return [
    {
      name: 'pageTitle',
      type: 'text',
      label: 'Page Title',
      defaultValue: defaultTitle,
      required: true,
    },
    {
      name: 'lastUpdated',
      type: 'date',
      label: 'Last Updated',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
        description: 'Displayed below the page title when enabled on the frontend.',
      },
    },
    {
      name: 'intro',
      type: 'richText',
      label: 'Introduction',
      admin: {
        description: 'Opening paragraph shown at the top of the page.',
      },
    },
    {
      name: 'importantNotice',
      type: 'richText',
      label: 'Important Notice',
      admin: {
        description: 'Optional highlighted callout box.',
      },
    },
    {
      name: 'sections',
      type: 'array',
      label: 'Sections',
      minRows: 1,
      admin: {
        description: sectionsDescription,
        initCollapsed: false,
      },
      fields: [
        {
          name: 'sectionNumber',
          type: 'text',
          label: 'Section Number',
          admin: {
            description: 'Optional. e.g. "2.1", "2.2". Shown before the title.',
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Section Title',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          label: 'Section Content',
          required: true,
        },
      ],
    },
  ]
}
