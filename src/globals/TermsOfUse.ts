import type { GlobalConfig } from 'payload'
import { legalPageFields } from '../lib/legalPageFields'

export const TermsOfUse: GlobalConfig = {
  slug: 'terms-of-use',
  label: 'Terms of Use',
  admin: {
    group: 'Site Pages',
    description: 'Manage the content of the Terms of Use page.',
  },
  fields: legalPageFields({
    defaultTitle: 'Terms of Use',
    sectionsDescription: 'Add, remove, or reorder terms of use sections.',
  }),
}
