import { cache } from 'react'
import type { Payload } from 'payload'
import type { AdSlotKey } from '@/lib/ads.shared'
import { emptyFindResult, safeDb } from '@/lib/safePayload.shared'
import type { AdPlacement } from './placements'
import { getDefaultPlacement } from './slotConfig'
import type { AdRegistry } from './fetchAdRegistry.shared'

export type { AdTrackingInfo, AdRegistry } from './fetchAdRegistry.shared'
export { getAdTracking } from './fetchAdRegistry.shared'

async function loadAdRegistry(payload: Payload, slots?: AdSlotKey[]): Promise<AdRegistry> {
  const result = await safeDb(
    () =>
      payload.find({
        collection: 'ads',
        where: {
          and: [
            { isActive: { equals: true } },
            ...(slots?.length ? [{ slotKey: { in: slots } }] : []),
          ],
        },
        limit: slots?.length ?? 50,
        depth: 0,
        select: {
          slotKey: true,
          defaultPlacement: true,
        },
        overrideAccess: true,
      }),
    emptyFindResult(),
  )

  const registry: AdRegistry = {}

  for (const doc of result.docs ?? []) {
    const slotKey = doc.slotKey as AdSlotKey | null | undefined
    if (!slotKey) continue

    registry[slotKey] = {
      adId: String(doc.id),
      placement: (doc.defaultPlacement as AdPlacement) || getDefaultPlacement(slotKey),
    }
  }

  return registry
}

export const fetchAdRegistry = cache(async (payload: Payload): Promise<AdRegistry> => {
  return loadAdRegistry(payload)
})

/** Load tracking metadata for specific ad slots only. */
export async function fetchAdRegistryForSlots(
  payload: Payload,
  slots: AdSlotKey[],
): Promise<AdRegistry> {
  const uniqueSlots = [...new Set(slots)]
  if (uniqueSlots.length === 0) return {}
  return loadAdRegistry(payload, uniqueSlots)
}
