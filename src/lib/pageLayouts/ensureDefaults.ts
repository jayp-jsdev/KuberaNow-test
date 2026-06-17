import type { Payload } from 'payload'
import {
  buildArticleDisplayOrder,
  needsDisplayOrderUpgrade,
} from '@/lib/articles/displaySections'
import {
  DEFAULT_ARTICLE_SECTIONS,
  DEFAULT_HOME_MAIN_SECTIONS,
  DEFAULT_SITE_SIDEBAR,
  resolveArticlePageSections,
} from '@/lib/pageLayouts/defaults'

type LegacySidebar = Record<string, unknown>

function hasSidebarContent(sidebar: LegacySidebar | null | undefined): boolean {
  if (!sidebar) return false
  const topAd = sidebar.topAd as { isEnabled?: boolean } | undefined
  const bottomAd = sidebar.bottomAd as { isEnabled?: boolean } | undefined
  const categorySections = sidebar.categorySections as unknown[] | undefined
  return Boolean(categorySections?.length || topAd?.isEnabled || bottomAd?.isEnabled)
}

function readLegacySidebar(globalDoc: unknown): LegacySidebar | undefined {
  if (!globalDoc || typeof globalDoc !== 'object') return undefined
  const sidebar = (globalDoc as { sidebar?: LegacySidebar }).sidebar
  return sidebar && typeof sidebar === 'object' ? sidebar : undefined
}

export async function ensureDefaultPageLayouts(payload: Payload): Promise<void> {
  const [homePage, articlePageLayout, siteSidebar] = await Promise.all([
    payload.findGlobal({ slug: 'home-page', depth: 0 }).catch(() => null),
    payload.findGlobal({ slug: 'article-page-layout', depth: 0 }).catch(() => null),
    payload.findGlobal({ slug: 'site-sidebar', depth: 0 }).catch(() => null),
  ])

  if (!homePage?.mainSections?.length) {
    await payload.updateGlobal({
      slug: 'home-page',
      data: {
        mainSections: DEFAULT_HOME_MAIN_SECTIONS,
      },
      depth: 0,
    })
  }

  const resolvedArticleSections = resolveArticlePageSections(articlePageLayout?.sections)
  const needsArticleLayoutUpgrade =
    !articlePageLayout?.sections?.length ||
    !articlePageLayout.sections.some((section) => section.blockType === 'articleContent') ||
    articlePageLayout.sections.length !== DEFAULT_ARTICLE_SECTIONS.length

  const resolvedDisplayOrder = buildArticleDisplayOrder(articlePageLayout?.displayOrder)
  const needsDisplayOrder = needsDisplayOrderUpgrade(articlePageLayout?.displayOrder)

  if (needsArticleLayoutUpgrade || needsDisplayOrder) {
    await payload.updateGlobal({
      slug: 'article-page-layout',
      data: {
        ...(needsArticleLayoutUpgrade ? { sections: resolvedArticleSections } : {}),
        ...(needsDisplayOrder ? { displayOrder: resolvedDisplayOrder } : {}),
      },
      depth: 0,
    })
  }

  const legacySidebar =
    readLegacySidebar(homePage) ?? readLegacySidebar(articlePageLayout)

  if (!hasSidebarContent(siteSidebar as LegacySidebar | null) && hasSidebarContent(legacySidebar)) {
    await payload.updateGlobal({
      slug: 'site-sidebar',
      data: legacySidebar as typeof DEFAULT_SITE_SIDEBAR,
      depth: 0,
    })
    return
  }

  if (!siteSidebar) {
    await payload.updateGlobal({
      slug: 'site-sidebar',
      data: DEFAULT_SITE_SIDEBAR,
      depth: 0,
    })
  }
}
