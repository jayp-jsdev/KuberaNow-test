import type { GlobalConfig } from 'payload'

export const ContactUs: GlobalConfig = {
  slug: 'contact-us',
  label: 'Contact Us',
  admin: {
    group: 'Site Pages',
    description: 'Manage the Contact Us page content and contact details.',
  },
  fields: [
    {
      name: 'pageTitle',
      type: 'text',
      label: 'Page Title',
      defaultValue: 'Get in Touch with Us',
      required: true,
    },
    {
      name: 'responseCommitment',
      type: 'textarea',
      label: 'Response Commitment Banner',
      admin: {
        description:
          'Shown in the banner below the page title. Prefix with "Response Commitment:" if desired.',
      },
    },
    {
      name: 'contactCards',
      type: 'array',
      label: 'Contact Cards',
      minRows: 1,
      admin: {
        description: 'First 3 cards appear in a 3-column row; remaining cards use a 2-column row.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'iconImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Card Icon',
          admin: {
            description: 'Upload an icon image (SVG or PNG). Displayed in the maroon icon box on the card.',
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Card Title',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
        },
        {
          name: 'details',
          type: 'array',
          label: 'Contact Details',
          minRows: 1,
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Label',
              required: true,
              admin: {
                description: 'e.g. Email, Phone, WhatsApp, Ofc Hours',
              },
            },
            {
              name: 'value',
              type: 'text',
              label: 'Value',
              required: true,
            },
            {
              name: 'highlightValue',
              type: 'checkbox',
              label: 'Highlight Value',
              defaultValue: false,
              admin: {
                description: 'Show the value in brand red (recommended for email addresses).',
              },
            },
          ],
        },
        {
          name: 'footnote',
          type: 'textarea',
          label: 'Footnote',
          admin: {
            description: 'Optional small note shown at the bottom of the card.',
          },
        },
      ],
    },
    {
      name: 'grievanceSection',
      type: 'group',
      label: 'Grievance Officer Section',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Section Title',
          defaultValue: 'Grievance Officer',
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Description',
        },
        {
          name: 'slaBoxes',
          type: 'array',
          label: 'SLA Boxes',
          admin: {
            description:
              'Timeline cards in the grievance section. Add as many as needed (e.g. Acknowledgement, Resolution).',
            initCollapsed: false,
          },
          defaultValue: [
            {
              label: 'Acknowledgement',
              value: '24 Hrs',
              subtitle: 'from receipt',
            },
            {
              label: 'Resolution',
              value: '15 Days',
              subtitle: 'from receipt',
            },
          ],
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Label',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: 'Value',
              required: true,
              admin: {
                description: 'Large gold value (e.g. "24 Hrs", "15 Days").',
              },
            },
            {
              name: 'subtitle',
              type: 'text',
              label: 'Subtitle',
              admin: {
                description: 'Small line below the value (e.g. "from receipt").',
              },
            },
          ],
        },
        {
          name: 'officerDetails',
          type: 'array',
          label: 'Officer Details',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Label',
              required: true,
            },
            {
              name: 'value',
              type: 'text',
              label: 'Value',
              required: true,
            },
          ],
        },
        {
          name: 'submissionNote',
          type: 'textarea',
          label: 'Submission Instructions',
          admin: {
            description: 'Shown in the note box at the bottom right of the grievance section.',
          },
        },
      ],
    },
  ],
}
