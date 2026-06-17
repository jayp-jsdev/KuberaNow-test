import type { Payload } from 'payload'
import type { Article, HomePage } from '@/payload-types'
import { findArticleCards } from '@/lib/articleCards'
import { buildCarouselSlides } from '@/lib/carousel'
import { batchMediaUrlsByIds } from '@/lib/mediaFile'
import { getPayloadCached } from '@/lib/safePayload'
import { emptyFindResult, safeDb } from '@/lib/safePayload.shared'
import { fetchTrendingArticles } from '@/lib/trending/fetchTrending'
import { DEFAULT_HOME_MAIN_SECTIONS } from './defaults'

type HomeMainSections = NonNullable<HomePage['mainSections']>
type PinnedSection = Extract<HomeMainSections[number], { blockType: 'pinnedNews' }>
type CarouselSection = Extract<HomeMainSections[number], { blockType: 'photoCarousel' }>

function toId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string }).id)
  }
  return null
}

export async function fetchHomePageSections(): Promise<HomeMainSections> {
  const payload = await getPayloadCached()
  if (!payload) return DEFAULT_HOME_MAIN_SECTIONS

  const layout = await safeDb(
    () =>
      payload.findGlobal({
        slug: 'home-page',
        depth: 0,
      }),
    null,
  )

  return layout?.mainSections?.length ? layout.mainSections : DEFAULT_HOME_MAIN_SECTIONS
}

export function extractPinnedIds(pinnedSection: PinnedSection | null | undefined): string[] {
  const blockArticles =
    pinnedSection?.pinnedItems?.map((item) => item.article) ??
    (pinnedSection as { articles?: unknown[] } | null | undefined)?.articles ??
    []

  return blockArticles
    .map(toId)
    .filter((id): id is string => Boolean(id))
    .slice(0, 4)
}

export async function fetchHomePinnedArticles(section: PinnedSection): Promise<Article[]> {
  const blockIds = extractPinnedIds(section)
  if (blockIds.length === 0) return []

  const payload = await getPayloadCached()
  if (!payload) return []

  const result = await safeDb(
    () =>
      findArticleCards(payload, {
        where: {
          id: { in: blockIds },
          _status: { equals: 'published' },
        },
        limit: blockIds.length,
      }),
    emptyFindResult<Article>(),
  )

  const docs = (result.docs ?? []) as Article[]
  return blockIds
    .map((id) => docs.find((doc) => doc.id === id))
    .filter((doc): doc is Article => doc != null)
}

export async function fetchHomeCarouselSlides(section: CarouselSection) {
  const photos = section.photos
  if (!photos?.length) return []

  const articleIds: string[] = []
  const mediaIds: string[] = []

  for (const photo of photos) {
    const articleId = toId(photo.article)
    if (articleId) articleIds.push(articleId)

    if (photo.sourceType !== 'url') {
      const mediaId = toId(photo.imageUpload)
      if (mediaId) mediaIds.push(mediaId)
    }
  }

  const uniqueArticleIds = [...new Set(articleIds)]
  const uniqueMediaIds = [...new Set(mediaIds)]

  if (uniqueArticleIds.length === 0 && uniqueMediaIds.length === 0) {
    return buildCarouselSlides(photos)
  }

  const payload = await getPayloadCached()
  if (!payload) return buildCarouselSlides(photos)

  const [articlesResult, mediaById] = await Promise.all([
    uniqueArticleIds.length > 0
      ? safeDb(
          () =>
            findArticleCards(payload, {
              where: {
                and: [
                  { id: { in: uniqueArticleIds } },
                  { _status: { equals: 'published' } },
                ],
              },
              limit: uniqueArticleIds.length,
            }),
          emptyFindResult<Article>(),
        )
      : Promise.resolve(emptyFindResult<Article>()),
    uniqueMediaIds.length > 0
      ? batchMediaUrlsByIds(payload, uniqueMediaIds)
      : Promise.resolve(new Map()),
  ])

  const articlesById = new Map(
    ((articlesResult.docs ?? []) as Article[]).map((article) => [article.id, article]),
  )

  const enrichedPhotos = photos.map((photo) => {
    const articleId = toId(photo.article)
    const mediaId = toId(photo.imageUpload)

    return {
      ...photo,
      ...(mediaId && mediaById.has(mediaId) ? { imageUpload: mediaById.get(mediaId) } : {}),
      ...(articleId && articlesById.has(articleId)
        ? { article: articlesById.get(articleId) }
        : {}),
    }
  })

  return buildCarouselSlides(enrichedPhotos)
}

export async function fetchHomeTrending(limit: number) {
  const payload = await getPayloadCached()
  if (!payload) return []

  const { trending } = await fetchTrendingArticles(payload, limit)
  return trending
}

export type LatestNewsResult = {
  articles: Article[]
  totalPages: number
}

export async function fetchHomeLatestNews(
  page: number,
  perPage: number,
  pinnedIds: string[],
): Promise<LatestNewsResult> {
  const payload = await getPayloadCached()
  if (!payload) {
    return { articles: [], totalPages: 0 }
  }

  const result = await safeDb(
    () =>
      findArticleCards(payload, {
        limit: perPage,
        page,
        sort: '-publishedAt',
        where: {
          _status: { equals: 'published' },
          ...(pinnedIds.length > 0 ? { id: { not_in: pinnedIds } } : {}),
        },
      }),
    emptyFindResult<Article>(),
  )

  return {
    articles: (result.docs ?? []) as Article[],
    totalPages: result.totalPages ?? 0,
  }
}
