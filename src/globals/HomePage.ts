import type { GlobalConfig } from 'payload'
import { homePageBlocks } from './blocks/homePageBlocks'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  admin: {
    group: 'Page Layouts',
    description:
      'Control which sections appear on the home page, their order, titles, and content. Drag sections to reorder.',
  },
  fields: [
    {
      name: 'mainSections',
      type: 'blocks',
      label: 'Home Page Sections',
      minRows: 1,
      admin: {
        description:
          'Each block is a section on the home page. Toggle "Show Section" off to hide without deleting content.',
        initCollapsed: false,
      },
      blocks: homePageBlocks,
    },
  ],
}
