import type { Payload } from 'payload'
import type { Article, Category } from '@/payload-types'
import { findArticleCards } from './articleCards'
import { safeDb } from './safePayload.shared'

export const HOME_CATEGORY_SECTION_COUNT = 3
export const HOME_CATEGORY_ARTICLE_COUNT = 3

export type CategoryNewsSection = {
  category: Category
  articles: Article[]
}

export type SidebarCategorySection = {
  enabled?: boolean | null
  category?: Category | string | null
  articles?: (Article | string)[] | null
  id?: string | null
}

type SidebarCategorySectionInput = SidebarCategorySection | null | undefined

function toId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string }).id)
  }
  return null
}

function resolveCategory(section: SidebarCategorySection): Category | null {
  const category = section.category
  if (!category || typeof category !== 'object') return null
  return category as Category
}

async function resolveSectionArticles(
  section: SidebarCategorySection,
  docsById: Map<string, Article>,
): Promise<CategoryNewsSection | null> {
  if (section.enabled === false) return null

  const category = resolveCategory(section)
  if (!category) return null

  const articleIds = (section.articles ?? [])
    .map(toId)
    .filter((id): id is string => Boolean(id))
    .slice(0, HOME_CATEGORY_ARTICLE_COUNT)

  if (articleIds.length === 0) return null

  const articles = articleIds
    .map((id) => docsById.get(id))
    .filter((doc): doc is Article => {
      if (!doc) return false
      const categoryIds = (doc.categories ?? [])
        .map((item) => (typeof item === 'object' && item !== null ? item.id : item))
        .filter(Boolean)
      return categoryIds.includes(category.id)
    })

  if (articles.length === 0) return null

  return { category, articles }
}

/** Sidebar category blocks configured in a page layout global. */
export async function fetchConfiguredCategoryNewsSections(
  payload: Payload,
  categorySections: SidebarCategorySectionInput[] | null | undefined,
): Promise<CategoryNewsSection[]> {
  const sections = categorySections?.slice(0, HOME_CATEGORY_SECTION_COUNT) ?? []
  if (sections.length === 0) return []

  return safeDb(async () => {
    const enabledSections = sections.filter(
      (section): section is SidebarCategorySection => section != null && section.enabled !== false,
    )

    const articleIds = [
      ...new Set(
        enabledSections
          .flatMap((section) => section.articles ?? [])
          .map(toId)
          .filter((id): id is string => Boolean(id)),
      ),
    ]

    const docsById = new Map<string, Article>()
    if (articleIds.length > 0) {
      const result = await findArticleCards(payload, {
        where: {
          id: { in: articleIds },
          _status: { equals: 'published' },
        },
        limit: articleIds.length,
      })

      for (const doc of (result.docs ?? []) as Article[]) {
        docsById.set(doc.id, doc)
      }
    }

    const resolved = await Promise.all(
      enabledSections.map((section) => resolveSectionArticles(section, docsById)),
    )
    return resolved.filter((section): section is CategoryNewsSection => section != null)
  }, [])
}

export async function fetchHomeCategoryNewsSections(
  payload: Payload,
  categories: Category[],
): Promise<CategoryNewsSection[]> {
  const featuredCategories = categories?.slice(0, HOME_CATEGORY_SECTION_COUNT) ?? []

  return safeDb(
    () =>
      Promise.all(
        featuredCategories.map(async (category) => {
          const result = await findArticleCards(payload, {
            where: {
              categories: { in: [category.id] },
              _status: { equals: 'published' },
            },
            limit: HOME_CATEGORY_ARTICLE_COUNT,
            sort: '-publishedAt',
          })

          return {
            category,
            articles: (result.docs ?? []) as Article[],
          }
        }),
      ),
    [],
  )
}
