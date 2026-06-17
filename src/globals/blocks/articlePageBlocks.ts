import type { Block } from 'payload'
import { sectionEnabledField, sectionTitleField } from './sharedSectionFields'

const pageBlock = (slug: string, singular: string, description: string): Block => ({
  slug,
  labels: { singular, plural: singular },
  admin: {
    disableBlockName: true,
  },
  fields: [
    sectionEnabledField,
    {
      name: 'info',
      type: 'text',
      label: 'Section',
      defaultValue: description,
      admin: { readOnly: true },
    },
  ],
})

export const articleBreadcrumbsBlock = pageBlock(
  'breadcrumbs',
  'Breadcrumbs',
  'Home › Category › Article trail',
)

export const articleMetaHeaderBlock = pageBlock(
  'metaHeader',
  'Meta Header',
  'Category badge and reading time',
)

export const articleContentBlock: Block = {
  slug: 'articleContent',
  labels: {
    singular: 'Article Content',
    plural: 'Article Content',
  },
  admin: {
    disableBlockName: true,
  },
  fields: [
    sectionEnabledField,
    {
      name: 'info',
      type: 'text',
      label: 'Content',
      defaultValue: 'Title, media, quotes, and body — order managed under Article Page → Content Display Order',
      admin: { readOnly: true },
    },
  ],
}

export const articleAlsoReadBlock: Block = {
  slug: 'alsoRead',
  labels: {
    singular: 'Also Read',
    plural: 'Also Read',
  },
  admin: {
    disableBlockName: true,
  },
  fields: [
    sectionEnabledField,
    sectionTitleField('Also Read'),
    {
      name: 'contentInfo',
      type: 'text',
      label: 'Content Source',
      defaultValue: 'Linked articles on each article',
      admin: {
        readOnly: true,
        description:
          'Articles come from each article\'s "Also Read" / hyperlink fields in the Articles collection.',
      },
    },
  ],
}

export const articleReactionsBlock: Block = {
  slug: 'reactions',
  labels: { singular: 'Reactions Bar', plural: 'Reactions Bars' },
  admin: { disableBlockName: true },
  fields: [sectionEnabledField],
}

export const articleTagsBlock: Block = {
  slug: 'tags',
  labels: { singular: 'Tags', plural: 'Tags' },
  admin: { disableBlockName: true },
  fields: [sectionEnabledField],
}

export const articleShareBlock: Block = {
  slug: 'shareBar',
  labels: { singular: 'Share Bar (Bottom)', plural: 'Share Bars' },
  admin: { disableBlockName: true },
  fields: [sectionEnabledField],
}

export const articlePageBlocks = [
  articleBreadcrumbsBlock,
  articleMetaHeaderBlock,
  articleContentBlock,
  articleTagsBlock,
  articleReactionsBlock,
  articleShareBlock,
  articleAlsoReadBlock,
]
