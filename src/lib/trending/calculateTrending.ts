import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import type { Payload } from 'payload'
import { getAnalyticsCounters } from './analyticsCounters'
import { TRENDING_WEIGHTS } from './config'
import { logTrendingError, logTrendingInfo } from './logger'

type ViewCountMap = Map<string, number>

type ViewWindowCounts = {
  views1h: ViewCountMap
  views6h: ViewCountMap
  views24h: ViewCountMap
}

type TrendingRecalcResult = {
  updated: number
  zeroed: number
}

function getNewsViewsCollection(payload: Payload) {
  const adapter = payload.db as unknown as MongooseAdapter
  const model = adapter.collections?.['news-views']
  if (model?.collection) {
    return model.collection
  }
  if (!adapter?.connection) {
    throw new Error('MongoDB connection is not available')
  }
  return adapter.connection.collection('news-views')
}

function toCountMap(rows: Array<{ _id: unknown; count: number }>): ViewCountMap {
  const map = new Map<string, number>()
  for (const row of rows) {
    if (row._id == null) continue
    map.set(String(row._id), row.count)
  }
  return map
}

async function aggregateViewWindows(payload: Payload): Promise<ViewWindowCounts> {
  const collection = getNewsViewsCollection(payload)
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const [result] = await collection
    .aggregate<{
      views1h: Array<{ _id: unknown; count: number }>
      views6h: Array<{ _id: unknown; count: number }>
      views24h: Array<{ _id: unknown; count: number }>
    }>([
      {
        $facet: {
          views1h: [
            { $match: { createdAt: { $gte: oneHourAgo } } },
            { $group: { _id: { $toString: '$newsId' }, count: { $sum: 1 } } },
          ],
          views6h: [
            { $match: { createdAt: { $gte: sixHoursAgo } } },
            { $group: { _id: { $toString: '$newsId' }, count: { $sum: 1 } } },
          ],
          views24h: [
            { $match: { createdAt: { $gte: twentyFourHoursAgo } } },
            { $group: { _id: { $toString: '$newsId' }, count: { $sum: 1 } } },
          ],
        },
      },
    ])
    .toArray()

  return {
    views1h: toCountMap(result?.views1h || []),
    views6h: toCountMap(result?.views6h || []),
    views24h: toCountMap(result?.views24h || []),
  }
}

export function calculateTrendingScore(input: {
  views1h: number
  views6h: number
  views24h: number
  shares: number
  comments: number
}): number {
  return (
    input.views1h * TRENDING_WEIGHTS.views1h +
    input.views6h * TRENDING_WEIGHTS.views6h +
    input.views24h * TRENDING_WEIGHTS.views24h +
    input.shares * TRENDING_WEIGHTS.shares +
    input.comments * TRENDING_WEIGHTS.comments
  )
}

function collectRelevantArticleIds(viewWindows: ViewWindowCounts, analyticsArticleIds: string[]): string[] {
  const ids = new Set<string>(analyticsArticleIds)

  for (const map of [viewWindows.views1h, viewWindows.views6h, viewWindows.views24h]) {
    for (const articleId of map.keys()) {
      ids.add(articleId)
    }
  }

  return [...ids]
}

async function upsertAnalyticsRecord(
  payload: Payload,
  articleId: string,
  data: {
    shares: number
    comments: number
    trendingScore: number
    lastCalculatedAt: string
  },
): Promise<void> {
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
    await payload.update({
      collection: 'news-analytics',
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    })
    return
  }

  await payload.create({
    collection: 'news-analytics',
    data: {
      newsId: articleId,
      ...data,
    },
    overrideAccess: true,
  })
}

/**
 * Recalculates and stores trending scores for articles with recent activity.
 */
export async function recalculateTrendingScores(payload: Payload): Promise<TrendingRecalcResult> {
  const startedAt = Date.now()
  let updated = 0
  let zeroed = 0

  try {
    const [viewWindows, analyticsResult] = await Promise.all([
      aggregateViewWindows(payload),
      payload.find({
        collection: 'news-analytics',
        limit: 1000,
        depth: 0,
        overrideAccess: true,
      }),
    ])

    const analyticsArticleIds = analyticsResult.docs.map((doc) =>
      String(typeof doc.newsId === 'string' ? doc.newsId : doc.newsId?.id),
    )
    const articleIds = collectRelevantArticleIds(viewWindows, analyticsArticleIds)
    const counters = await getAnalyticsCounters(payload, articleIds)
    const calculatedAt = new Date().toISOString()

    await Promise.all(
      articleIds.map(async (articleId) => {
        const views1h = viewWindows.views1h.get(articleId) || 0
        const views6h = viewWindows.views6h.get(articleId) || 0
        const views24h = viewWindows.views24h.get(articleId) || 0
        const { shares = 0, comments = 0 } = counters.get(articleId) || {}
        const trendingScore = calculateTrendingScore({ views1h, views6h, views24h, shares, comments })

        await upsertAnalyticsRecord(payload, articleId, {
          shares,
          comments,
          trendingScore,
          lastCalculatedAt: calculatedAt,
        })

        if (trendingScore > 0) {
          updated += 1
        } else {
          zeroed += 1
        }
      }),
    )

    logTrendingInfo('Trending scores recalculated', {
      articleCount: articleIds.length,
      updated,
      zeroed,
      durationMs: Date.now() - startedAt,
    })

    return { updated, zeroed }
  } catch (error) {
    logTrendingError('Trending recalculation failed', error)
    throw error
  }
}
