import { cache } from 'react'
import type { Payload, Where } from 'payload'
import { decodeSlugParam, getSlugLookupVariants, titleToSlug } from './slug'
import { articleDetailFindOptions } from './articleQuery'
import { getPayloadCached } from './safePayload'
import { safeDb } from './safePayload.shared'

type ArticleLookup = {
  slug: string
  previewId?: string
}

type FindOptions = {
  draft?: boolean
  publishedOnly?: boolean
}

async function findArticleBySlugVariants(
  payload: Payload,
  slug: string,
  { draft, publishedOnly }: FindOptions,
) {
  const variants = getSlugLookupVariants(slug)
  const slugWhere: Where = {
    or: variants.map((variant) => ({ slug: { equals: variant } })),
  }
  const where: Where = publishedOnly
    ? { and: [slugWhere, { _status: { equals: 'published' } }] }
    : slugWhere

  const result = await payload.find({
    collection: 'articles',
    where,
    draft,
    ...articleDetailFindOptions,
    limit: 1,
  })

  if (result.docs[0]) return result.docs[0]

  // Fallback: URL may contain the raw article title instead of a slug
  const titleGuess = decodeSlugParam(slug)
  if (titleGuess.includes(' ') || titleGuess.includes(',')) {
    const byTitle = await payload.find({
      collection: 'articles',
      where: {
        title: { equals: titleGuess },
        ...(publishedOnly ? { _status: { equals: 'published' } } : {}),
      },
      draft,
      ...articleDetailFindOptions,
      limit: 1,
    })
    if (byTitle.docs[0]) return byTitle.docs[0]

    const normalizedGuess = titleToSlug(titleGuess)
    const byNormalizedSlug = await payload.find({
      collection: 'articles',
      where: {
        slug: { equals: normalizedGuess },
        ...(publishedOnly ? { _status: { equals: 'published' } } : {}),
      },
      draft,
      ...articleDetailFindOptions,
      limit: 1,
    })
    if (byNormalizedSlug.docs[0]) return byNormalizedSlug.docs[0]
  }

  return null
}

export async function fetchArticleForDisplay(
  payload: Payload | null,
  { slug, previewId }: ArticleLookup,
  isPreview: boolean,
) {
  if (!payload) return null

  return safeDb(async () => {
    if (isPreview) {
      if (previewId) {
        try {
          const byIdDraft = await payload.findByID({
            collection: 'articles',
            id: previewId,
            draft: true,
            ...articleDetailFindOptions,
          })
          if (byIdDraft) return byIdDraft
        } catch {
          // fall through
        }
      }

      const draftMatch = await findArticleBySlugVariants(payload, slug, { draft: true })
      if (draftMatch) return draftMatch

      const publishedMatch = await findArticleBySlugVariants(payload, slug, {
        publishedOnly: true,
      })
      if (publishedMatch) return publishedMatch

      if (previewId) {
        try {
          return await payload.findByID({
            collection: 'articles',
            id: previewId,
            ...articleDetailFindOptions,
          })
        } catch {
          return null
        }
      }

      return null
    }

    return findArticleBySlugVariants(payload, slug, { publishedOnly: true })
  }, null)
}

/** Dedupes article fetches between generateMetadata and the page component. */
export const fetchArticleForDisplayCached = cache(
  async (slug: string, previewId: string | undefined, isPreview: boolean) => {
    const payload = await getPayloadCached()
    return fetchArticleForDisplay(payload, { slug, previewId }, isPreview)
  },
)
