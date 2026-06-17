import type { Payload } from 'payload'
import type { Article } from '@/payload-types'
import { findArticleCards } from '@/lib/articleCards'
import { getArticleThumbUrl } from '@/lib/display'
import { safeDb } from '@/lib/safePayload.shared'
import { parseTrendingLimit } from './config'

export type TrendingArticleItem = {
  id: string
  title: string
  slug: string
  image: string | null
  trendingScore: number
}

export type TrendingArticlesResponse = {
  trending: TrendingArticleItem[]
}

function toArticleId(newsId: unknown): string | null {
  if (!newsId) return null
  if (typeof newsId === 'string') return newsId
  if (typeof newsId === 'object' && 'id' in newsId) {
    return String((newsId as { id: unknown }).id)
  }
  return null
}

function isPublishedArticle(article: Article): boolean {
  return !article._status || article._status === 'published'
}

async function resolvePublishedArticles(
  payload: Payload,
  newsIds: unknown[],
): Promise<Map<string, Article>> {
  const orderedIds: string[] = []
  const prefetched = new Map<string, Article>()

  for (const newsId of newsIds) {
    if (newsId && typeof newsId === 'object' && 'title' in newsId) {
      const article = newsId as Article
      if (isPublishedArticle(article)) {
        prefetched.set(article.id, article)
        continue
      }
    }

    const articleId = toArticleId(newsId)
    if (articleId && !orderedIds.includes(articleId)) {
      orderedIds.push(articleId)
    }
  }

  const missingIds = orderedIds.filter((id) => !prefetched.has(id))
  if (missingIds.length > 0) {
    const result = await findArticleCards(payload, {
      where: {
        and: [
          { id: { in: missingIds } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: missingIds.length,
      overrideAccess: true,
    })

    for (const article of result.docs as Article[]) {
      prefetched.set(article.id, article)
    }
  }

  const resolved = new Map<string, Article>()
  for (const newsId of newsIds) {
    const articleId = toArticleId(newsId)
    if (!articleId) continue
    const article = prefetched.get(articleId)
    if (article) resolved.set(articleId, article)
  }

  return resolved
}

function toTrendingItems(articles: Article[], scoreFor: (article: Article) => number): TrendingArticleItem[] {
  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    image: getArticleThumbUrl(article),
    trendingScore: scoreFor(article),
  }))
}

async function fetchTrendingFallback(payload: Payload, limit: number): Promise<TrendingArticlesResponse> {
  const viewedResult = await findArticleCards(payload, {
    where: {
      and: [
        { _status: { equals: 'published' } },
        { viewCount: { greater_than: 0 } },
      ],
    },
    sort: '-viewCount',
    limit,
    overrideAccess: true,
  })

  if (viewedResult.docs.length > 0) {
    return {
      trending: toTrendingItems(viewedResult.docs as Article[], (article) => article.viewCount || 0),
    }
  }

  const latestResult = await findArticleCards(payload, {
    where: {
      _status: { equals: 'published' },
    },
    sort: '-publishedAt',
    limit,
    overrideAccess: true,
  })

  return {
    trending: toTrendingItems(latestResult.docs as Article[], (article) => article.viewCount || 0),
  }
}

/**
 * Reads precomputed trending analytics and returns published articles only.
 */
export async function fetchTrendingArticles(
  payload: Payload,
  limitInput?: number | string | null,
): Promise<TrendingArticlesResponse> {
  return safeDb(async () => {
    const limit = typeof limitInput === 'number' ? limitInput : parseTrendingLimit(String(limitInput ?? ''))

    const analyticsResult = await payload.find({
      collection: 'news-analytics',
      sort: '-trendingScore',
      limit: Math.max(limit * 3, limit),
      depth: 0,
      select: {
        newsId: true,
        trendingScore: true,
      },
      overrideAccess: true,
    })

    if (analyticsResult.docs.length === 0) {
      return fetchTrendingFallback(payload, limit)
    }

    const analyticsDocs = analyticsResult.docs.slice(0, Math.max(limit * 3, limit))
    const articleMap = await resolvePublishedArticles(
      payload,
      analyticsDocs.map((doc) => doc.newsId),
    )

    const trending: TrendingArticleItem[] = []

    for (const doc of analyticsDocs) {
      const articleId = toArticleId(doc.newsId)
      if (!articleId) continue

      const article = articleMap.get(articleId)
      if (!article) continue

      trending.push({
        id: article.id,
        title: article.title,
        slug: article.slug,
        image: getArticleThumbUrl(article),
        trendingScore: typeof doc.trendingScore === 'number' ? doc.trendingScore : 0,
      })

      if (trending.length >= limit) {
        break
      }
    }

    if (trending.length === 0) {
      return fetchTrendingFallback(payload, limit)
    }

    return { trending }
  }, { trending: [] })
}
