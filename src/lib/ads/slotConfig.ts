import type { AdSlotKey } from '@/lib/ads.shared'
import type { AdPlacement } from './placements'

export type AdSlotConfig = {
  name: string
  defaultPlacement: AdPlacement
}

/** Maps SiteAds slot keys to trackable ad units and their default placement. */
export const AD_SLOT_CONFIG: Record<AdSlotKey, AdSlotConfig> = {
  homeLeaderboard: { name: 'Home — Top Leaderboard', defaultPlacement: 'homepage_top' },
  homeSidebarTop: { name: 'Home — Sidebar Top MPU', defaultPlacement: 'homepage_sidebar' },
  homeSidebarBottom: { name: 'Home — Sidebar Bottom MPU', defaultPlacement: 'homepage_sidebar' },
  categoryLeaderboard: { name: 'Category — Top Leaderboard', defaultPlacement: 'homepage_top' },
  categoryMidContent: { name: 'Category — Mid-content Leaderboard', defaultPlacement: 'homepage_inline' },
  categorySidebarTop: { name: 'Category — Sidebar Top MPU', defaultPlacement: 'homepage_sidebar' },
  categorySidebarBottom: { name: 'Category — Sidebar Bottom MPU', defaultPlacement: 'homepage_sidebar' },
  articleSidebarTop: { name: 'Article — Sidebar Top MPU', defaultPlacement: 'article_top' },
  articleSidebarBottom: { name: 'Article — Sidebar Bottom MPU', defaultPlacement: 'article_footer' },
}

export const AD_SLOT_KEYS = Object.keys(AD_SLOT_CONFIG) as AdSlotKey[]

export function getDefaultPlacement(slotKey: AdSlotKey): AdPlacement {
  return AD_SLOT_CONFIG[slotKey].defaultPlacement
}
