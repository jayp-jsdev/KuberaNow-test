export type HomeMainSectionType =
  | 'leaderboardAd'
  | 'photoCarousel'
  | 'pinnedNews'
  | 'trendingNews'
  | 'latestNews'

export type ArticleSectionType =
  | 'breadcrumbs'
  | 'metaHeader'
  | 'articleContent'
  | 'alsoRead'
  | 'reactions'
  | 'tags'
  | 'shareBar'

export const DEFAULT_HOME_MAIN_SECTIONS = [
  {
    blockType: 'leaderboardAd' as const,
    blockName: 'Top Leaderboard Ad',
    enabled: true,
    ad: { isEnabled: false },
  },
  {
    blockType: 'photoCarousel' as const,
    blockName: 'Photo Carousel',
    enabled: true,
    photos: [],
  },
  {
    blockType: 'pinnedNews' as const,
    blockName: 'Pinned News',
    enabled: true,
    sectionTitle: 'Pinned News',
    showCount: true,
    pinnedItems: [],
  },
  {
    blockType: 'trendingNews' as const,
    blockName: 'Trending News',
    enabled: true,
    sectionTitle: 'Trending',
    limit: 5,
  },
  {
    blockType: 'latestNews' as const,
    blockName: 'Latest News',
    enabled: true,
    sectionTitle: 'Latest news',
    perPage: 10,
  },
]

export const DEFAULT_SITE_SIDEBAR = {
  showTopAd: true,
  showMorningBrief: true,
  showCategoryNews: true,
  categorySections: [],
  showBottomAd: true,
}

export const DEFAULT_ARTICLE_SECTIONS = [
  { blockType: 'breadcrumbs' as const, blockName: 'Breadcrumbs', enabled: true },
  { blockType: 'metaHeader' as const, blockName: 'Meta Header', enabled: true },
  { blockType: 'articleContent' as const, blockName: 'Article Content', enabled: true },
  { blockType: 'tags' as const, blockName: 'Tags', enabled: true },
  { blockType: 'reactions' as const, blockName: 'Reactions Bar', enabled: true },
  { blockType: 'shareBar' as const, blockName: 'Share Bar', enabled: true },
  { blockType: 'alsoRead' as const, blockName: 'Also Read', enabled: true, sectionTitle: 'Also Read' },
]

type StoredPageSection = {
  blockType: string
  enabled?: boolean | null
  [key: string]: unknown
}

/** Use stored layout order when valid; fall back to defaults when core sections are missing. */
export function resolveArticlePageSections(
  stored: StoredPageSection[] | null | undefined,
): typeof DEFAULT_ARTICLE_SECTIONS {
  if (!stored?.length) return DEFAULT_ARTICLE_SECTIONS

  const hasContentSection = stored.some((section) => section.blockType === 'articleContent')
  if (!hasContentSection) return DEFAULT_ARTICLE_SECTIONS

  const storedTypes = new Set(stored.map((section) => section.blockType))
  const missing = DEFAULT_ARTICLE_SECTIONS.filter(
    (section) => !storedTypes.has(section.blockType),
  )
  if (!missing.length) {
    return stored as typeof DEFAULT_ARTICLE_SECTIONS
  }

  const merged = [...stored]
  for (const defaultSection of DEFAULT_ARTICLE_SECTIONS) {
    if (!storedTypes.has(defaultSection.blockType)) {
      const insertAt = DEFAULT_ARTICLE_SECTIONS.findIndex(
        (section) => section.blockType === defaultSection.blockType,
      )
      merged.splice(Math.min(insertAt, merged.length), 0, defaultSection)
      storedTypes.add(defaultSection.blockType)
    }
  }

  return merged as typeof DEFAULT_ARTICLE_SECTIONS
}

export function isSectionEnabled(section: { enabled?: boolean | null } | null | undefined): boolean {
  return section?.enabled !== false
}
