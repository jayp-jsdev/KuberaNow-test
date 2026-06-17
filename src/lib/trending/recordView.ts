import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import type { Payload } from 'payload'

import { isValidObjectId, toObjectId } from '@/lib/mongo/objectId'
import { requestTrendingRecalc } from '@/jobs/trendingScheduler'
import { logTrendingError, logTrendingWarn } from './logger'

type RecordViewInput = {
  articleId: string
  /** @deprecated No longer used — view count is incremented atomically in MongoDB. */
  currentViewCount?: number | null
}

function getMongoCollection(payload: Payload, slug: string) {
  const adapter = payload.db as unknown as MongooseAdapter
  const model = adapter.collections?.[slug]

  if (model?.collection) {
    return model.collection
  }

  if (!adapter?.connection) {
    throw new Error('MongoDB connection is not available')
  }

  return adapter.connection.collection(slug)
}

function isRetryableMongoError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return message.includes('write conflict') || message.includes('e11000')
}

async function withMongoRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isRetryableMongoError(error) || attempt === maxAttempts - 1) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)))
    }
  }

  throw lastError
}

function articleIdFilter(payload: Payload, articleId: string) {
  if (!isValidObjectId(payload, articleId)) {
    throw new Error(`Invalid article id: ${articleId}`)
  }
  return { _id: toObjectId(payload, articleId) }
}

async function incrementArticleViewCount(payload: Payload, articleId: string): Promise<void> {
  const collection = getMongoCollection(payload, 'articles')
  const result = await withMongoRetry(() =>
    collection.updateOne(articleIdFilter(payload, articleId), { $inc: { viewCount: 1 } }),
  )

  if (result.matchedCount === 0) {
    throw new Error(`Article not found: ${articleId}`)
  }
}

/**
 * Records a view event and atomically increments the article lifetime viewCount.
 * Uses a direct MongoDB $inc to avoid re-validating unrelated article fields.
 */
export async function recordArticleView(payload: Payload, input: RecordViewInput): Promise<void> {
  const { articleId } = input

  if (!articleId) {
    return
  }

  // Some pages can render with non-Mongo/mock IDs in dev.
  // Skip persistence instead of logging noisy errors every request.
  if (!isValidObjectId(payload, articleId)) {
    logTrendingWarn('Skipping view record for non-Mongo article id', { articleId })
    return
  }

  try {
    await withMongoRetry(() =>
      payload.create({
        collection: 'news-views',
        data: {
          newsId: articleId,
        },
        overrideAccess: true,
      }),
    )
  } catch (error) {
    logTrendingError('Failed to record news view event', error, { articleId })
  }

  try {
    await incrementArticleViewCount(payload, articleId)
    requestTrendingRecalc(payload)
  } catch (error) {
    logTrendingWarn('Failed to increment article view count', {
      articleId,
      error: error instanceof Error ? error.message : error,
    })
  }
}
