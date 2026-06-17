import { unstable_cache } from 'next/cache'
import type { Payload } from 'payload'
import type { ArticlePageLayout } from '@/payload-types'
import {
  resolveArticleDisplayOrder,
  type ArticleDisplaySectionType,
} from '@/lib/articles/displaySections'
import { getPayloadCached } from '@/lib/safePayload'
import { safeDb } from '@/lib/safePayload.shared'
import {
  isSectionEnabled,
  resolveArticlePageSections,
  type ArticleSectionType,
} from './defaults'

export type ArticlePageLayoutData = {
  layout: ArticlePageLayout | null
  sections: NonNullable<ArticlePageLayout['sections']>
  displayOrder: Array<{ blockType: ArticleDisplaySectionType; enabled: boolean }>
  isSectionOn: (type: ArticleSectionType) => boolean
  getSectionTitle: (type: Extract<ArticleSectionType, 'alsoRead'>) => string
}

const getArticlePageLayoutGlobal = unstable_cache(
  async (): Promise<ArticlePageLayout | null> => {
    const payload = await getPayloadCached()
    if (!payload) return null

    return safeDb(
      () =>
        payload.findGlobal({
          slug: 'article-page-layout',
          depth: 0,
        }),
      null,
    )
  },
  ['article-page-layout-global'],
  { revalidate: 300, tags: ['global:article-page-layout'] },
)

function buildArticlePageLayoutData(layout: ArticlePageLayout | null): ArticlePageLayoutData {
  const sections = resolveArticlePageSections(layout?.sections)
  const displayOrder = resolveArticleDisplayOrder(layout?.displayOrder)

  const isSectionOn = (type: ArticleSectionType) =>
    sections.some((section) => section.blockType === type && isSectionEnabled(section))

  const getSectionTitle = (type: Extract<ArticleSectionType, 'alsoRead'>) => {
    const match = sections.find((section) => section.blockType === type)
    if (match?.blockType === 'alsoRead' && match.sectionTitle) {
      return match.sectionTitle
    }
    return 'Also Read'
  }

  return {
    layout,
    sections,
    displayOrder,
    isSectionOn,
    getSectionTitle,
  }
}

export async function fetchArticlePageLayout(_payload?: Payload): Promise<ArticlePageLayoutData> {
  const layout = await getArticlePageLayoutGlobal()
  return buildArticlePageLayoutData(layout)
}
