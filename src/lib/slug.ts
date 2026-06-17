/** Convert a title or raw string into a URL-safe slug. */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[,._!?'"]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function decodeSlugParam(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

/** Build a frontend article path; encodes slugs that still contain special characters. */
export function getArticleUrl(slug: string): string {
  return `/articles/${encodeURIComponent(slug)}`
}

export function getSlugLookupVariants(slug: string): string[] {
  const decoded = decodeSlugParam(slug)
  const normalized = titleToSlug(decoded)
  return [...new Set([slug, decoded, normalized].filter((value) => value.length > 0))]
}
