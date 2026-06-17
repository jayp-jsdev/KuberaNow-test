import type { Payload } from 'payload'
import { getMediaUrl } from './carousel'
import { batchMediaUrlsByIds } from './mediaFile'
import { safeDb } from './safePayload.shared'
import type { AdSlotData, SiteAdsGlobal } from './ads.shared'
import { resolveAdSlotData } from './ads.shared'

export type {
  AdSlotKey,
  AdSlotData,
  SiteAdsGlobal,
  ResolvedAdSlot,
} from './ads.shared'
export { getAdSlot, resolveAdSlotData, resolveAdSlotDataWithInline } from './ads.shared'

function toMediaId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string }).id)
  }
  return null
}

/** Resolve inline ad slot media IDs to fast /api/media/file URLs. */
export async function resolveAdSlotDataWithMedia(
  payload: Payload,
  slot: AdSlotData | null | undefined,
) {
  const resolved = resolveAdSlotData(slot)
  if (!resolved?.isEnabled || resolved.imageSrc) {
    return resolved
  }

  const mediaId = toMediaId(slot?.imageUpload)
  if (!mediaId) return resolved

  const mediaById = await batchMediaUrlsByIds(payload, [mediaId])
  const media = mediaById.get(mediaId)
  if (!media) return resolved

  return {
    ...resolved,
    imageUpload: media,
    imageSrc: getMediaUrl(media) || resolved.imageSrc,
  }
}

export async function fetchSiteAds(payload: Payload): Promise<SiteAdsGlobal> {
  return safeDb(
    () =>
      payload.findGlobal({
        slug: 'site-ads',
        depth: 1,
      }) as Promise<SiteAdsGlobal>,
    {},
  )
}

export type CategoryPageAds = {
  categoryLeaderboard: Awaited<ReturnType<typeof resolveAdSlotDataWithMedia>>
  categoryMidContent: Awaited<ReturnType<typeof resolveAdSlotDataWithMedia>>
}

/** Category page ad slots only — depth 0 config + lightweight media URLs. */
export async function fetchCategoryPageAds(payload: Payload): Promise<CategoryPageAds> {
  const global = await safeDb(
    () =>
      payload.findGlobal({
        slug: 'site-ads',
        depth: 0,
        select: {
          categoryLeaderboard: true,
          categoryMidContent: true,
        },
      }) as Promise<Pick<SiteAdsGlobal, 'categoryLeaderboard' | 'categoryMidContent'>>,
    {},
  )

  const [categoryLeaderboard, categoryMidContent] = await Promise.all([
    resolveAdSlotDataWithMedia(payload, global.categoryLeaderboard),
    resolveAdSlotDataWithMedia(payload, global.categoryMidContent),
  ])

  return { categoryLeaderboard, categoryMidContent }
}
