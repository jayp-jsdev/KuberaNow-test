import type { Payload } from 'payload'
import { logTrendingError } from './logger'

function toArticleId(newsId: string | { id: string }): string {
  return typeof newsId === 'string' ? newsId : newsId.id
}

async function getOrCreateAnalyticsRecord(payload: Payload, articleId: string) {
  const existing = await payload.find({
    collection: 'news-analytics',
    where: {
      newsId: {
        equals: articleId,
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    return existing.docs[0]
  }

  return payload.create({
    collection: 'news-analytics',
    data: {
      newsId: articleId,
      shares: 0,
      comments: 0,
      trendingScore: 0,
    },
    overrideAccess: true,
  })
}

async function incrementCounter(
  payload: Payload,
  articleId: string,
  field: 'shares' | 'comments',
  delta: number,
): Promise<void> {
  if (!articleId || delta === 0) return

  try {
    const record = await getOrCreateAnalyticsRecord(payload, articleId)
    const current = typeof record[field] === 'number' ? record[field] : 0
    const next = Math.max(0, current + delta)

    await payload.update({
      collection: 'news-analytics',
      id: record.id,
      data: {
        [field]: next,
      },
      overrideAccess: true,
    })
  } catch (error) {
    logTrendingError(`Failed to update analytics ${field} counter`, error, { articleId, delta })
  }
}

/**
 * Increment the share counter for an article.
 *
 * TODO: Wire this into the share tracking flow once a shares collection or
 * share event API is implemented. Call from ShareBar/ShareRow or a dedicated
 * POST /api/articles/[id]/share endpoint.
 */
export async function incrementShareCount(payload: Payload, articleId: string, delta = 1): Promise<void> {
  await incrementCounter(payload, articleId, 'shares', delta)
}

/**
 * Increment the comment counter for an article.
 *
 * TODO: Wire this into the comments collection afterChange hook once comments
 * are implemented. Example:
 *   afterChange: async ({ doc, operation }) => {
 *     if (operation === 'create') {
 *       await incrementCommentCount(req.payload, toArticleId(doc.article))
 *     }
 *   }
 */
export async function incrementCommentCount(payload: Payload, articleId: string, delta = 1): Promise<void> {
  await incrementCounter(payload, articleId, 'comments', delta)
}

export async function getAnalyticsCounters(
  payload: Payload,
  articleIds: string[],
): Promise<Map<string, { shares: number; comments: number }>> {
  const counters = new Map<string, { shares: number; comments: number }>()

  if (articleIds.length === 0) {
    return counters
  }

  const result = await payload.find({
    collection: 'news-analytics',
    where: {
      newsId: {
        in: articleIds,
      },
    },
    limit: articleIds.length,
    depth: 0,
    overrideAccess: true,
  })

  for (const doc of result.docs) {
    const articleId = toArticleId(doc.newsId as string | { id: string })
    counters.set(articleId, {
      shares: typeof doc.shares === 'number' ? doc.shares : 0,
      comments: typeof doc.comments === 'number' ? doc.comments : 0,
    })
  }

  return counters
}
