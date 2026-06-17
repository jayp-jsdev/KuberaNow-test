import type { GlobalConfig } from 'payload'
import { adSlotGroup } from '@/lib/adSlotFields'

export const SiteAds: GlobalConfig = {
  slug: 'site-ads',
  label: 'Site Ads',
  admin: {
    group: 'Ads',
    description:
      'Manage advertisement slots across home, category, and article pages. Each slot supports image ads or custom HTML/scripts.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Home Page',
          fields: [
            adSlotGroup('homeLeaderboard', 'Top Leaderboard (728 × 90)'),
            adSlotGroup('homeSidebarTop', 'Sidebar Top MPU (300 × 250)'),
            adSlotGroup('homeSidebarBottom', 'Sidebar Bottom MPU (300 × 250)'),
          ],
        },
        {
          label: 'Category Page',
          fields: [
            adSlotGroup('categoryLeaderboard', 'Top Leaderboard (728 × 90)'),
            adSlotGroup('categoryMidContent', 'Mid-content Leaderboard (728 × 90)'),
            adSlotGroup('categorySidebarTop', 'Sidebar Top MPU (300 × 250)'),
            adSlotGroup('categorySidebarBottom', 'Sidebar Bottom MPU (300 × 250)'),
          ],
        },
        {
          label: 'Article Page',
          fields: [
            adSlotGroup('articleSidebarTop', 'Sidebar Top MPU (300 × 250)'),
            adSlotGroup('articleSidebarBottom', 'Sidebar Bottom MPU (300 × 250)'),
          ],
        },
      ],
    },
  ],
}
