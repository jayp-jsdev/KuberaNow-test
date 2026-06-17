import type { GlobalConfig } from 'payload'
import {
  ARTICLE_DISPLAY_ORDER_BLOCK_COUNT,
  DEFAULT_ARTICLE_DISPLAY_ORDER,
} from '@/lib/articles/displaySections'
import { DEFAULT_ARTICLE_SECTIONS } from '@/lib/pageLayouts/defaults'
import { articleDisplayBlocks } from './blocks/articleDisplayBlocks'
import { articlePageBlocks } from './blocks/articlePageBlocks'

const PAGE_SECTION_COUNT = DEFAULT_ARTICLE_SECTIONS.length

export const ArticlePageLayout: GlobalConfig = {
  slug: 'article-page-layout',
  label: 'Article Page',
  admin: {
    group: 'Page Layouts',
    description:
      'Manage article detail page layout: page sections and the shared content display order for all articles.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Page Sections',
          description: 'Outer page blocks: breadcrumbs, tags, reactions, also read, etc.',
          fields: [
            {
              name: 'sections',
              type: 'blocks',
              label: 'Article Page Sections',
              defaultValue: DEFAULT_ARTICLE_SECTIONS,
              minRows: PAGE_SECTION_COUNT,
              maxRows: PAGE_SECTION_COUNT,
              admin: {
                description:
                  'Drag to reorder page-level sections. Toggle "Show Section" to hide without removing.',
                initCollapsed: false,
              },
              blocks: articlePageBlocks,
            },
          ],
        },
        {
          label: 'Content Display Order',
          description:
            'How title, media, quotes, and body appear inside the Article Content section.',
          fields: [
            {
              name: 'displayOrder',
              type: 'blocks',
              label: 'Content Display Order',
              defaultValue: DEFAULT_ARTICLE_DISPLAY_ORDER,
              minRows: ARTICLE_DISPLAY_ORDER_BLOCK_COUNT,
              maxRows: ARTICLE_DISPLAY_ORDER_BLOCK_COUNT,
              admin: {
                description:
                  'All content blocks are listed below. Drag to reorder, or toggle "Show Section" to hide a block.',
                initCollapsed: false,
              },
              blocks: articleDisplayBlocks,
            },
          ],
        },
      ],
    },
  ],
}
