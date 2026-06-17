import type { Block } from 'payload'

export const privacyContentSectionBlock: Block = {
  slug: 'contentSection',
  labels: {
    singular: 'Content Section',
    plural: 'Content Sections',
  },
  fields: [
    {
      name: 'sectionNumber',
      type: 'text',
      label: 'Section Number',
      admin: {
        description: 'e.g. "1.1", "1.2", or "1.2.1"',
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
}

export const privacyCookiesPolicyBlock: Block = {
  slug: 'cookiesPolicy',
  labels: {
    singular: 'Cookies Policy',
    plural: 'Cookies Policies',
  },
  fields: [
    {
      name: 'sectionNumber',
      type: 'text',
      label: 'Section Number',
      defaultValue: '1.4',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Cookies Policy',
      required: true,
    },
    {
      name: 'intro',
      type: 'richText',
      label: 'Introduction',
    },
    {
      name: 'cookieTypes',
      type: 'array',
      label: 'Cookie Types',
      minRows: 1,
      admin: {
        description: 'Displayed in a 2-column grid (e.g. Essential, Analytics, Preference, Marketing).',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Cookie Type',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          required: true,
        },
        {
          name: 'managedBy',
          type: 'text',
          label: 'Managed By',
          admin: {
            description:
              'Small tag shown below the description, e.g. "KuberaNow" or "Google Analytics / third-party".',
          },
        },
      ],
    },
    {
      name: 'footer',
      type: 'richText',
      label: 'Closing Text',
      admin: {
        description: 'Text shown below the cookie type grid.',
      },
    },
  ],
}

export const privacyGrievanceOfficerBlock: Block = {
  slug: 'grievanceOfficer',
  labels: {
    singular: 'Grievance Officer',
    plural: 'Grievance Officers',
  },
  fields: [
    {
      name: 'sectionNumber',
      type: 'text',
      label: 'Section Number',
      defaultValue: '1.8',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Grievance Officer',
      required: true,
    },
    {
      name: 'intro',
      type: 'richText',
      label: 'Introduction',
    },
    {
      name: 'officerName',
      type: 'text',
      label: 'Name',
    },
    {
      name: 'designation',
      type: 'text',
      label: 'Designation',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Address',
    },
    {
      name: 'responseTime',
      type: 'text',
      label: 'Response Time',
    },
    {
      name: 'closing',
      type: 'richText',
      label: 'Closing Text',
    },
  ],
}

export const privacyPolicyBlocks = [
  privacyContentSectionBlock,
  privacyCookiesPolicyBlock,
  privacyGrievanceOfficerBlock,
]
