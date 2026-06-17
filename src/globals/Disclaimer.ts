import type { GlobalConfig } from 'payload'
import { legalPageFields } from '../lib/legalPageFields'

export const Disclaimer: GlobalConfig = {
  slug: 'disclaimer',
  label: 'Disclaimer',
  admin: {
    group: 'Site Pages',
    description: 'Manage the content of the Disclaimer page.',
  },
  fields: legalPageFields({
    defaultTitle: 'Disclaimer',
    sectionsDescription: 'Add, remove, or reorder disclaimer sections.',
  }),
}
