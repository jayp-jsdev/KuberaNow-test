import { isSectionEnabled } from '@/lib/pageLayouts/defaults'

export type ArticleDisplaySectionType =
  | 'title'
  | 'subtitle'
  | 'summary'
  | 'byline'
  | 'shareActions'
  | 'articleAudio'
  | 'heroImage'
  | 'heroVideo'
  | 'youtubeVideo'
  | 'photoCarousel'
  | 'quotes'
  | 'body'

type StoredDisplayBlock = {
  blockType: string
  blockName?: string | null
  enabled?: boolean | null
  info?: string | null
}

export const DEFAULT_ARTICLE_DISPLAY_ORDER: Array<{
  blockType: ArticleDisplaySectionType
  blockName: string
  enabled: boolean
  info: string
}> = [
  { blockType: 'title', blockName: 'Title', enabled: true, info: 'Article headline' },
  { blockType: 'subtitle', blockName: 'Subtitle', enabled: true, info: 'Secondary headline below the title' },
  { blockType: 'summary', blockName: 'Summary', enabled: true, info: 'Rich-text summary / description' },
  { blockType: 'byline', blockName: 'Byline', enabled: true, info: 'Author and publish date' },
  { blockType: 'shareActions', blockName: 'Share & Save', enabled: true, info: 'Top share row and save button' },
  { blockType: 'articleAudio', blockName: 'Article Audio', enabled: true, info: 'Listen to article audio player' },
  { blockType: 'heroImage', blockName: 'Hero Image', enabled: true, info: 'Main title image with credits' },
  { blockType: 'heroVideo', blockName: 'Uploaded Video', enabled: true, info: 'MP4/WebM video from Title Media' },
  { blockType: 'youtubeVideo', blockName: 'YouTube Video', enabled: true, info: 'Embedded YouTube player' },
  { blockType: 'photoCarousel', blockName: 'Photo Carousel', enabled: true, info: 'In-article image gallery' },
  { blockType: 'quotes', blockName: 'Quotes', enabled: true, info: 'Pull quote and attribution' },
  { blockType: 'body', blockName: 'Article Body', enabled: true, info: 'Main rich-text content' },
]

export const ARTICLE_DISPLAY_ORDER_BLOCK_COUNT = DEFAULT_ARTICLE_DISPLAY_ORDER.length

/** @deprecated use DEFAULT_ARTICLE_DISPLAY_ORDER */
export const DEFAULT_ARTICLE_DISPLAY_SECTIONS = DEFAULT_ARTICLE_DISPLAY_ORDER

export function resolveArticleDisplayOrder(
  stored: StoredDisplayBlock[] | null | undefined,
): Array<{ blockType: ArticleDisplaySectionType; enabled: boolean }> {
  if (!stored?.length) {
    return DEFAULT_ARTICLE_DISPLAY_ORDER.map(({ blockType, enabled }) => ({ blockType, enabled }))
  }

  const resolved = stored
    .filter(
      (section): section is StoredDisplayBlock & { blockType: ArticleDisplaySectionType } =>
        Boolean(section.blockType),
    )
    .map((section) => ({
      blockType: section.blockType,
      enabled: isSectionEnabled(section),
    }))

  if (!resolved.length) {
    return DEFAULT_ARTICLE_DISPLAY_ORDER.map(({ blockType, enabled }) => ({ blockType, enabled }))
  }

  const types = new Set(resolved.map((section) => section.blockType))
  if (!types.has('title') && !types.has('body')) {
    return DEFAULT_ARTICLE_DISPLAY_ORDER.map(({ blockType, enabled }) => ({ blockType, enabled }))
  }

  const storedTypes = new Set(resolved.map((section) => section.blockType))
  const missing = DEFAULT_ARTICLE_DISPLAY_ORDER.filter(
    (section) => !storedTypes.has(section.blockType),
  )
  if (!missing.length) return resolved

  const merged = [...resolved]
  for (const defaultSection of DEFAULT_ARTICLE_DISPLAY_ORDER) {
    if (!storedTypes.has(defaultSection.blockType)) {
      const insertAt = DEFAULT_ARTICLE_DISPLAY_ORDER.findIndex(
        (section) => section.blockType === defaultSection.blockType,
      )
      merged.splice(Math.min(insertAt, merged.length), 0, {
        blockType: defaultSection.blockType,
        enabled: defaultSection.enabled,
      })
      storedTypes.add(defaultSection.blockType)
    }
  }

  return merged
}

/** Build the full display order for admin/DB, merging any missing blocks into default positions. */
export function buildArticleDisplayOrder(
  stored: StoredDisplayBlock[] | null | undefined,
): typeof DEFAULT_ARTICLE_DISPLAY_ORDER {
  const resolved = resolveArticleDisplayOrder(stored)

  return resolved.map(({ blockType, enabled }) => {
    const defaults = DEFAULT_ARTICLE_DISPLAY_ORDER.find((block) => block.blockType === blockType)
    const storedBlock = stored?.find((block) => block.blockType === blockType)
    return {
      blockType,
      blockName: storedBlock?.blockName || defaults?.blockName || blockType,
      enabled,
      info: storedBlock?.info || defaults?.info || '',
    }
  })
}

function isDisplayOrderComplete(stored: StoredDisplayBlock[] | null | undefined): boolean {
  if (!stored?.length) return false
  const defaultTypes = new Set(DEFAULT_ARTICLE_DISPLAY_ORDER.map((block) => block.blockType))
  const storedTypes = new Set(stored.map((block) => block.blockType))
  return (
    stored.length === DEFAULT_ARTICLE_DISPLAY_ORDER.length &&
    [...defaultTypes].every((type) => storedTypes.has(type))
  )
}

export function needsDisplayOrderUpgrade(
  stored: StoredDisplayBlock[] | null | undefined,
): boolean {
  return !isDisplayOrderComplete(stored)
}

export function isDisplaySectionOn(
  sections: Array<{ blockType: ArticleDisplaySectionType; enabled: boolean }>,
  type: ArticleDisplaySectionType,
): boolean {
  return sections.some((section) => section.blockType === type && section.enabled)
}
