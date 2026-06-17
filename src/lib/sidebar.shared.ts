import type { AdSlotKey, ResolvedAdSlot, SiteAdsGlobal } from './ads.shared'
import type { AdRegistry } from './ads/fetchAdRegistry.shared'
import type { CategoryNewsSection } from './categoryNews'

export type SidebarPage = 'home' | 'category' | 'article'

export const SIDEBAR_AD_SLOTS: Record<SidebarPage, { top: AdSlotKey; bottom: AdSlotKey }> = {
  home: { top: 'homeSidebarTop', bottom: 'homeSidebarBottom' },
  category: { top: 'categorySidebarTop', bottom: 'categorySidebarBottom' },
  article: { top: 'articleSidebarTop', bottom: 'articleSidebarBottom' },
}

export type SidebarConfig = {
  showTopAd: boolean
  showMorningBrief: boolean
  showCategoryNews: boolean
  showBottomAd: boolean
}

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  showTopAd: true,
  showMorningBrief: true,
  showCategoryNews: true,
  showBottomAd: true,
}

export type SidebarData = {
  adRegistry: AdRegistry
  categoryNewsSections: CategoryNewsSection[]
  sidebarConfig: SidebarConfig
  sidebarAds: {
    top?: ResolvedAdSlot | null
    bottom?: ResolvedAdSlot | null
  }
}

/** Routes that use full-width main content without the right sidebar. */
export const SIDEBAR_HIDDEN_ROUTES = ['/contact-us'] as const

/** Routes where the sidebar stays visible but category news blocks are hidden. */
export const SIDEBAR_CATEGORY_NEWS_HIDDEN_ROUTES = [
  '/disclaimer',
  '/privacy-policy',
  '/terms-of-use',
] as const

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

export function isSidebarHiddenForPath(pathname: string): boolean {
  return SIDEBAR_HIDDEN_ROUTES.some((route) => matchesRoute(pathname, route))
}

export function isSidebarCategoryNewsHiddenForPath(pathname: string): boolean {
  return SIDEBAR_CATEGORY_NEWS_HIDDEN_ROUTES.some((route) => matchesRoute(pathname, route))
}

export function resolveSidebarPageFromPath(pathname: string): SidebarPage {
  if (pathname.startsWith('/category/')) return 'category'
  if (pathname.startsWith('/articles/')) return 'article'
  return 'home'
}
