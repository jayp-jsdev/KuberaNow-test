import type { GlobalConfig } from 'payload'
import { pageSidebarWidgetFields } from './blocks/sidebarFields'

export const SiteSidebar: GlobalConfig = {
  slug: 'site-sidebar',
  label: 'Site Sidebar',
  admin: {
    group: 'Page Layouts',
    description:
      'Shared sidebar shown on home, article, and category pages. Configure ads, Morning Brief, and category news blocks once.',
  },
  fields: pageSidebarWidgetFields,
}
