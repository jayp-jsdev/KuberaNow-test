import type { Payload } from 'payload'
import { AD_SLOT_CONFIG, AD_SLOT_KEYS } from './slotConfig'
import { logAdAnalyticsError, logAdAnalyticsInfo } from './logger'

/**
 * Ensures one trackable ad document exists per Site Ads slot key.
 */
export async function ensureDefaultAds(payload: Payload): Promise<void> {
  try {
    let created = 0

    for (const slotKey of AD_SLOT_KEYS) {
      const existing = await payload.find({
        collection: 'ads',
        where: { slotKey: { equals: slotKey } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      if (existing.docs.length > 0) {
        continue
      }

      const config = AD_SLOT_CONFIG[slotKey]

      await payload.create({
        collection: 'ads',
        data: {
          name: config.name,
          slotKey,
          defaultPlacement: config.defaultPlacement,
          isActive: true,
        },
        overrideAccess: true,
      })

      created += 1
    }

    if (created > 0) {
      logAdAnalyticsInfo(`Seeded ${created} default ad unit(s)`)
    }
  } catch (error) {
    logAdAnalyticsError('Failed to seed default ads', error)
  }
}
