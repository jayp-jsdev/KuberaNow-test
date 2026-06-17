import type { Payload } from 'payload'
import { isValidObjectId, toObjectId } from '@/lib/mongo/objectId'
import { calculateCtr } from './ctr'
import { getAdAnalyticsDailyCollection } from './db'
import { logAdAnalyticsError } from './logger'
import type { AdPlacement } from './placements'
import { isValidPlacement } from './placements'

export type AdEventType = 'impression' | 'click'

export type RecordAdEventInput = {
  adId: string
  placement: AdPlacement
  eventType: AdEventType
}

export type RecordAdEventResult = {
  success: true
  date: string
  placement: AdPlacement
  impressions: number
  clicks: number
  ctr: number
}

export class AdEventValidationError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AdEventValidationError'
    this.status = status
  }
}

function getUtcDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function parseAdObjectId(payload: Payload, adId: string) {
  if (!isValidObjectId(payload, adId)) {
    throw new AdEventValidationError('Invalid ad ID', 400)
  }

  return toObjectId(payload, adId)
}

async function assertAdExists(payload: Payload, adId: string): Promise<void> {
  const ad = await payload.findByID({
    collection: 'ads',
    id: adId,
    depth: 0,
    overrideAccess: true,
  })

  if (!ad || ad.isActive === false) {
    throw new AdEventValidationError('Ad not found', 404)
  }
}

export function validateAdEventInput(body: unknown): { placement: AdPlacement } {
  if (!body || typeof body !== 'object') {
    throw new AdEventValidationError('Request body is required', 400)
  }

  const { placement } = body as { placement?: unknown }

  if (!isValidPlacement(placement)) {
    throw new AdEventValidationError('Invalid placement', 400)
  }

  return { placement }
}

/**
 * Atomically increments daily impressions or clicks and recalculates CTR.
 */
export async function recordAdEvent(
  payload: Payload,
  input: RecordAdEventInput,
): Promise<RecordAdEventResult> {
  const { adId, placement, eventType } = input
  const date = getUtcDateString()
  const adObjectId = parseAdObjectId(payload, adId)
  const incrementField = eventType === 'impression' ? 'impressions' : 'clicks'

  await assertAdExists(payload, adId)

  const collection = getAdAnalyticsDailyCollection(payload)
  const now = new Date()

  const updated = await collection.findOneAndUpdate(
    {
      ad: adObjectId,
      date,
      placement,
    },
    {
      $inc: { [incrementField]: 1 },
      $setOnInsert: {
        ad: adObjectId,
        date,
        placement,
        ctr: 0,
        createdAt: now,
      },
      $set: { updatedAt: now },
    },
    {
      upsert: true,
      returnDocument: 'after',
    },
  )

  if (!updated) {
    throw new Error('Failed to update ad analytics')
  }

  const impressions = Number(updated.impressions ?? 0)
  const clicks = Number(updated.clicks ?? 0)
  const ctr = calculateCtr(impressions, clicks)

  if (updated.ctr !== ctr) {
    await collection.updateOne({ _id: updated._id }, { $set: { ctr, updatedAt: now } })
  }

  return {
    success: true,
    date,
    placement,
    impressions,
    clicks,
    ctr,
  }
}

export async function safeRecordAdEvent(
  payload: Payload,
  input: RecordAdEventInput,
): Promise<RecordAdEventResult> {
  try {
    return await recordAdEvent(payload, input)
  } catch (error) {
    if (error instanceof AdEventValidationError) {
      throw error
    }

    logAdAnalyticsError(`Failed to record ad ${input.eventType}`, error, input)
    throw error
  }
}
