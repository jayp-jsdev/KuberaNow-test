import type { AdSlotKey } from '@/lib/ads.shared'
import type { AdPlacement } from './placements'

export type AdTrackingInfo = {
  adId: string
  placement: AdPlacement
}

export type AdRegistry = Partial<Record<AdSlotKey, AdTrackingInfo>>

export function getAdTracking(
  registry: AdRegistry,
  slotKey: AdSlotKey,
): AdTrackingInfo | undefined {
  return registry?.[slotKey]
}
