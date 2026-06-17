import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { headers } from 'next/headers'
import type { Category } from '@/payload-types'
import { collectAdImageFilenames, resolveAdSlotDataWithInline } from './ads.shared'
import { fetchAdRegistry } from './ads/fetchAdRegistry'
import { batchMediaDataUrls } from './mediaFile'
import { fetchConfiguredCategoryNewsSections } from './categoryNews'
import { DEFAULT_SITE_SIDEBAR } from './pageLayouts/defaults'
import { getAdminUrl, getPayloadCached } from './safePayload'
import { emptyFindResult, safeDb } from './safePayload.shared'
import {
  DEFAULT_SIDEBAR_CONFIG,
  resolveSidebarPageFromPath,
  type SidebarData,
  type SidebarPage,
} from './sidebar.shared'

export type { SidebarData, SidebarPage } from './sidebar.shared'
export {
  SIDEBAR_AD_SLOTS,
  SIDEBAR_CATEGORY_NEWS_HIDDEN_ROUTES,
  SIDEBAR_HIDDEN_ROUTES,
  isSidebarCategoryNewsHiddenForPath,
  isSidebarHiddenForPath,
  resolveSidebarPageFromPath,
} from './sidebar.shared'

export type LayoutShellData = {
  sidebarData: SidebarData
  categories: Category[]
  adminUrl: string
}

const EMPTY_SIDEBAR_DATA: SidebarData = {
  categoryNewsSections: [],
  adRegistry: {},
  sidebarConfig: DEFAULT_SIDEBAR_CONFIG,
  sidebarAds: {},
}

const loadLayoutShellData = unstable_cache(
  async (): Promise<Omit<LayoutShellData, 'adminUrl'>> => {
    const payload = await getPayloadCached()

    if (!payload) {
      return {
        sidebarData: EMPTY_SIDEBAR_DATA,
        categories: [],
      }
    }

    const [adRegistry, siteSidebar, categoriesResult] = await Promise.all([
      fetchAdRegistry(payload),
      safeDb(
        () =>
          payload.findGlobal({
            slug: 'site-sidebar',
            depth: 1,
          }),
        null,
      ),
      safeDb(
        () =>
          payload.find({
            collection: 'categories',
            depth: 0,
            limit: 20,
          }),
        emptyFindResult<Category>(),
      ),
    ])

    const config = {
      ...DEFAULT_SITE_SIDEBAR,
      ...(siteSidebar ?? {}),
    }

    const categoryNewsSections = await fetchConfiguredCategoryNewsSections(
      payload,
      config.categorySections,
    )

    const topAdRaw = config.topAd ?? null
    const bottomAdRaw = config.bottomAd ?? null
    let inlineAdImages: Record<string, string> = {}

    try {
      inlineAdImages = await batchMediaDataUrls(
        payload,
        collectAdImageFilenames([topAdRaw, bottomAdRaw]),
      )
    } catch {
      inlineAdImages = {}
    }

    return {
      sidebarData: {
        categoryNewsSections,
        adRegistry,
        sidebarConfig: {
          showTopAd: config.showTopAd !== false,
          showMorningBrief: config.showMorningBrief !== false,
          showCategoryNews: config.showCategoryNews !== false,
          showBottomAd: config.showBottomAd !== false,
        },
        sidebarAds: {
          top: resolveAdSlotDataWithInline(topAdRaw, inlineAdImages),
          bottom: resolveAdSlotDataWithInline(bottomAdRaw, inlineAdImages),
        },
      },
      categories: categoriesResult.docs ?? [],
    }
  },
  ['layout-shell-data-v1'],
  { revalidate: 120, tags: ['global:site-sidebar', 'layout-shell'] },
)

export const getLayoutShellData = cache(async (): Promise<LayoutShellData> => {
  const [adminUrl, shellData] = await Promise.all([getAdminUrl(), loadLayoutShellData()])

  return {
    ...shellData,
    adminUrl,
  }
})

const loadCategoriesForNav = unstable_cache(
  async (): Promise<Pick<Category, 'id' | 'title' | 'slug'>[]> => {
    const payload = await getPayloadCached()
    if (!payload) return []

    const result = await safeDb(
      () =>
        payload.find({
          collection: 'categories',
          depth: 0,
          select: {
            title: true,
            slug: true,
          },
          limit: 20,
        }),
      emptyFindResult<Category>(),
    )

    return result.docs ?? []
  },
  ['categories-nav-v1'],
  { revalidate: 120, tags: ['categories'] },
)

/** Lightweight category list for nav tabs — no sidebar or ad payload. */
export async function getCategoriesForNav(): Promise<
  Pick<Category, 'id' | 'title' | 'slug'>[]
> {
  return loadCategoriesForNav()
}

/** Cached sidebar data — shared with layout and pages that need ad registry. */
export async function getSidebarData(): Promise<SidebarData> {
  const { sidebarData } = await getLayoutShellData()
  return sidebarData
}

export async function resolveSidebarPage(): Promise<SidebarPage> {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || '/'
  return resolveSidebarPageFromPath(pathname)
}
