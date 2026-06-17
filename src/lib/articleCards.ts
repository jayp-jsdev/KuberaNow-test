import type { Payload } from 'payload'
import type { Article } from '@/payload-types'
import { articleCardFindOptions } from './articleQuery'
import { batchCategoryLabels, batchMediaUrlsByIds, type MediaUrlDoc } from './mediaFile'

function toId(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: string }).id)
  }
  return null
}

function collectRelationIds(articles: Article[]) {
  const mediaIds = new Set<string>()
  const categoryIds = new Set<string>()

  for (const article of articles) {
    for (const category of article.categories ?? []) {
      const id = toId(category)
      if (id) categoryIds.add(id)
    }

    const image = article.image
    if (image && typeof image === 'object') {
      const assetId = toId(image.imageAsset)
      const posterId = toId(image.videoPoster)
      if (assetId) mediaIds.add(assetId)
      if (posterId) mediaIds.add(posterId)
    }
  }

  return {
    mediaIds: [...mediaIds],
    categoryIds: [...categoryIds],
  }
}

function attachRelations(
  articles: Article[],
  mediaById: Map<string, MediaUrlDoc>,
  categoriesById: Map<string, { id: string; title?: string | null; slug?: string | null }>,
): Article[] {
  return articles.map((article) => {
    const image = article.image
    let nextImage = image

    if (image && typeof image === 'object') {
      const assetId = toId(image.imageAsset)
      const posterId = toId(image.videoPoster)

      nextImage = {
        ...image,
        ...(assetId && mediaById.has(assetId) ? { imageAsset: mediaById.get(assetId) } : {}),
        ...(posterId && mediaById.has(posterId) ? { videoPoster: mediaById.get(posterId) } : {}),
      } as typeof image
    }

    return {
      ...article,
      image: nextImage,
      categories: (article.categories ?? []).map((category) => {
        const id = toId(category)
        if (id && categoriesById.has(id)) {
          return categoriesById.get(id)!
        }
        return category
      }),
    } as Article
  })
}

/** Attach lightweight media URLs and category labels without loading image buffers. */
export async function hydrateArticleCards(
  payload: Payload,
  articles: Article[],
): Promise<Article[]> {
  if (articles.length === 0) return articles

  const { mediaIds, categoryIds } = collectRelationIds(articles)
  const [mediaById, categoriesById] = await Promise.all([
    batchMediaUrlsByIds(payload, mediaIds),
    batchCategoryLabels(payload, categoryIds),
  ])

  return attachRelations(articles, mediaById, categoriesById)
}

type ArticleFindOptions = Omit<Parameters<Payload['find']>[0], 'collection' | 'depth' | 'select'>

/** Card/list article query — never loads base64 image buffers from Mongo. */
export async function findArticleCards(payload: Payload, options: ArticleFindOptions) {
  const result = await payload.find({
    collection: 'articles',
    ...options,
    depth: articleCardFindOptions.depth,
    select: articleCardFindOptions.select,
  })

  const docs = await hydrateArticleCards(payload, (result.docs ?? []) as Article[])
  return { ...result, docs }
}
