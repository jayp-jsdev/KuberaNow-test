import type { GlobalConfig } from 'payload'
import { privacyPolicyBlocks } from './blocks/privacyPolicyBlocks'

export const PrivacyPolicy: GlobalConfig = {
  slug: 'privacy-policy',
  label: 'Privacy Policy',
  admin: {
    group: 'Site Pages',
    description: 'Manage the content of the Privacy Policy page.',
  },
  fields: [
    {
      name: 'pageTitle',
      type: 'text',
      label: 'Page Title',
      defaultValue: 'Privacy Policy',
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
      },
    },
    {
      name: 'sections',
      type: 'blocks',
      label: 'Sections',
      minRows: 1,
      admin: {
        description:
          'Add privacy policy sections. Use Content Section for text/lists, Cookies Policy for the cookie grid, and Grievance Officer for contact details.',
        initCollapsed: false,
      },
      blocks: privacyPolicyBlocks,
    },
  ],
}
