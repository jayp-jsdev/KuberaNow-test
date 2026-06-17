/** Supported ad placement zones — extend this list to add new placements. */
export const AD_PLACEMENTS = [
  'homepage_top',
  'homepage_sidebar',
  'homepage_inline',
  'article_top',
  'article_inline',
  'article_footer',
] as const

export type AdPlacement = (typeof AD_PLACEMENTS)[number]

export function isValidPlacement(value: unknown): value is AdPlacement {
  return typeof value === 'string' && (AD_PLACEMENTS as readonly string[]).includes(value)
}

export const AD_PLACEMENT_OPTIONS = AD_PLACEMENTS.map((value) => ({
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  value,
}))
