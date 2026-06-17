import { getMediaUrl } from './carousel'

type MediaLike = { url?: string | null } | string | null | undefined

export type AdSlotKey =
  | 'homeLeaderboard'
  | 'homeSidebarTop'
  | 'homeSidebarBottom'
  | 'categoryLeaderboard'
  | 'categoryMidContent'
  | 'categorySidebarTop'
  | 'categorySidebarBottom'
  | 'articleSidebarTop'
  | 'articleSidebarBottom'

export type AdSlotData = {
  isEnabled?: boolean | null
  showLabel?: boolean | null
  labelText?: string | null
  adType?: 'image' | 'custom' | null
  sourceType?: 'upload' | 'url' | null
  imageUpload?: MediaLike
  imageUrl?: string | null
  linkUrl?: string | null
  openInNewTab?: boolean | null
  altText?: string | null
  customHtml?: string | null
}

export type SiteAdsGlobal = {
  homeLeaderboard?: AdSlotData | null
  homeSidebarTop?: AdSlotData | null
  homeSidebarBottom?: AdSlotData | null
  categoryLeaderboard?: AdSlotData | null
  categoryMidContent?: AdSlotData | null
  categorySidebarTop?: AdSlotData | null
  categorySidebarBottom?: AdSlotData | null
  articleSidebarTop?: AdSlotData | null
  articleSidebarBottom?: AdSlotData | null
}

export type ResolvedAdSlot = AdSlotData & {
  imageSrc?: string | null
}

function resolveAdImageSrc(slot: AdSlotData): string | null {
  if (slot.adType !== 'image') return null
  return (
    (slot.sourceType === 'url' ? slot.imageUrl : null) ||
    getMediaUrl(slot.imageUpload) ||
    slot.imageUrl ||
    null
  )
}

export function getAdImageFilename(slot: AdSlotData | null | undefined): string | null {
  if (!slot || slot.adType !== 'image' || slot.sourceType === 'url') return null
  const media = slot.imageUpload
  if (!media || typeof media !== 'object') return null
  return (media as { filename?: string | null }).filename || null
}

export function collectAdImageFilenames(
  slots: Array<AdSlotData | null | undefined>,
): string[] {
  return slots.flatMap((slot) => {
    const filename = getAdImageFilename(slot)
    return filename ? [filename] : []
  })
}

function resolveAdSlot(slot: AdSlotData | null | undefined): ResolvedAdSlot | null {
  if (!slot) return null
  return {
    ...slot,
    imageSrc: resolveAdImageSrc(slot),
  }
}

/** Resolve ad slot data from inline home-page fields or any AdSlotData object. */
export function resolveAdSlotData(
  slot: AdSlotData | null | undefined,
): ResolvedAdSlot | null {
  return resolveAdSlot(slot)
}

/** Prefer inlined CMS upload bytes over /api/media/file URLs when available. */
export function resolveAdSlotDataWithInline(
  slot: AdSlotData | null | undefined,
  inlineImages: Record<string, string>,
): ResolvedAdSlot | null {
  const resolved = resolveAdSlot(slot)
  if (!resolved) return null

  const filename = getAdImageFilename(slot)
  if (filename && inlineImages[filename]) {
    return { ...resolved, imageSrc: inlineImages[filename] }
  }

  return resolved
}

export function getAdSlot(
  siteAds: SiteAdsGlobal | null | undefined,
  key: AdSlotKey,
): ResolvedAdSlot | null {
  if (!siteAds) return null
  return resolveAdSlot(siteAds[key])
}
