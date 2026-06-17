import type { Payload } from 'payload'
import type { Article } from '../payload-types'
import { findArticleCards } from './articleCards'
import { safeDb } from './safePayload.shared'

type ArticleLike = { id: string }

function toId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string }).id)
  }
  return null
}

/** Collect ordered pinned article IDs for the home page (PinnedSection + article-level pins). */
export async function fetchHomePinnedArticleIds(payload: Payload): Promise<string[]> {
  return safeDb(async () => {
    const [pinnedSectionResult, pinnedArticlesResult] = await Promise.all([
      payload.find({
        collection: 'pinned-sections',
        where: {
          section: { equals: 'home' },
        },
        depth: 1,
        limit: 1,
      }),
      payload.find({
        collection: 'articles',
        where: {
          isPinned: { equals: true },
          pinnedPage: { equals: 'home' },
          _status: { equals: 'published' },
        },
        depth: 0,
        limit: 20,
        sort: '-updatedAt',
      }),
    ])

    const ordered: string[] = []
    const seen = new Set<string>()

    const add = (id: string | null) => {
      if (!id || seen.has(id)) return
      seen.add(id)
      ordered.push(id)
    }

    const sectionArticles = pinnedSectionResult.docs[0]?.articles
    if (Array.isArray(sectionArticles)) {
      for (const article of sectionArticles) {
        add(toId(article))
      }
    }

    for (const article of pinnedArticlesResult.docs) {
      add(toId(article))
    }

    return ordered.slice(0, 4)
  }, [])
}

/** Fetch up to 4 published home-pinned articles in display order. */
export async function fetchHomePinnedArticles(payload: Payload): Promise<Article[]> {
  return safeDb(async () => {
    const pinnedIds = await fetchHomePinnedArticleIds(payload)
    if (pinnedIds.length === 0) return []

    const pinnedResult = await findArticleCards(payload, {
      where: {
        id: { in: pinnedIds },
        _status: { equals: 'published' },
      },
      limit: pinnedIds.length,
    })

    const pinnedDocs = pinnedResult.docs as Article[]
    return pinnedIds
      .map((id) => pinnedDocs.find((doc) => doc.id === id))
      .filter((doc): doc is Article => doc != null)
      .slice(0, 4)
  }, [])
}

/** Collect ordered pinned article IDs for a category (PinnedSection + article-level pins). */
export async function fetchCategoryPinnedArticleIds(
  payload: Payload,
  categoryId: string,
): Promise<string[]> {
  return safeDb(async () => {
    const [pinnedSectionResult, pinnedArticlesResult] = await Promise.all([
      payload.find({
        collection: 'pinned-sections',
        where: {
          section: { equals: 'category_top' },
          category: { equals: categoryId },
        },
        depth: 0,
        limit: 1,
      }),
      payload.find({
        collection: 'articles',
        where: {
          categories: { in: [categoryId] },
          isPinned: { equals: true },
          _status: { equals: 'published' },
        },
        depth: 0,
        limit: 20,
        sort: '-publishedAt',
      }),
    ])

    const ordered: string[] = []
    const seen = new Set<string>()

    const add = (id: string | null) => {
      if (!id || seen.has(id)) return
      seen.add(id)
      ordered.push(id)
    }

    const sectionArticles = pinnedSectionResult.docs[0]?.articles
    if (Array.isArray(sectionArticles)) {
      for (const article of sectionArticles) {
        add(toId(article))
      }
    }

    for (const article of pinnedArticlesResult.docs) {
      add(toId(article))
    }

    return ordered
  }, [])
}

/** Move pinned articles to the front, preserving pinned order then original order. */
export function orderArticlesWithPinned<T extends ArticleLike>(
  articles: T[],
  pinnedIds: string[],
): T[] {
  if (!pinnedIds.length) return articles

  const rank = new Map(pinnedIds.map((id, index) => [id, index]))

  return [...articles].sort((a, b) => {
    const aRank = rank.get(a.id)
    const bRank = rank.get(b.id)
    if (aRank !== undefined && bRank !== undefined) return aRank - bRank
    if (aRank !== undefined) return -1
    if (bRank !== undefined) return 1
    return 0
  })
}

type FetchCategoryArticlesOptions = {
  categoryId: string
  limit?: number
}

export type CategoryArticlesResult = {
  pinnedArticles: Article[]
  regularArticles: Article[]
  totalDocs: number
}

/** Fetch category articles — pinned block + latest regular articles, card fields only. */
export async function fetchCategoryArticlesOrdered(
  payload: Payload,
  { categoryId, limit = 20 }: FetchCategoryArticlesOptions,
): Promise<CategoryArticlesResult> {
  return safeDb(async () => {
    const pinnedIds = await fetchCategoryPinnedArticleIds(payload, categoryId)
    const restLimit = Math.max(0, limit - pinnedIds.length)

    const [pinnedResult, restResult, totalDocs] = await Promise.all([
      pinnedIds.length > 0
        ? findArticleCards(payload, {
            where: {
              id: { in: pinnedIds },
              _status: { equals: 'published' },
            },
            limit: pinnedIds.length,
          })
        : Promise.resolve({ docs: [] }),
      findArticleCards(payload, {
        where: {
          categories: { in: [categoryId] },
          _status: { equals: 'published' },
          ...(pinnedIds.length > 0 ? { id: { not_in: pinnedIds } } : {}),
        },
        limit: restLimit,
        sort: '-publishedAt',
      }),
      payload.count({
        collection: 'articles',
        where: {
          categories: { in: [categoryId] },
          _status: { equals: 'published' },
        },
      }),
    ])

    const pinnedArticles =
      pinnedIds.length > 0
        ? pinnedIds
            .map((id) => (pinnedResult.docs as Article[]).find((doc) => doc.id === id))
            .filter((doc): doc is Article => doc != null)
        : []

    return {
      pinnedArticles,
      regularArticles: restResult.docs as Article[],
      totalDocs: totalDocs.totalDocs,
    }
  }, { pinnedArticles: [], regularArticles: [], totalDocs: 0 })
}
