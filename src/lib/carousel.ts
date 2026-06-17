import type { CarouselSlide } from '@/app/(frontend)/components/HomePhotoCarousel/HomePhotoCarousel'
import { getCategoryTitle, type ArticleDisplay } from './display'
import { getArticleUrl } from './slug'

type MediaLike = { url?: string | null } | string | null | undefined
type ArticleLike =
  | (ArticleDisplay & {
    slug?: string | null
    title?: string | null
  })
  | string
  | null
  | undefined

type CarouselPhotoDoc = {
  id?: string | null
  caption?: string | null
  sourceType?: 'upload' | 'url' | null
  imageUpload?: MediaLike
  imageUrl?: string | null
  altText?: string | null
  article?: ArticleLike
  // legacy fields (previous schema)
  image?: MediaLike
  linkUrl?: string | null
  linkedArticle?: ArticleLike
}

export function getMediaUrl(media: MediaLike): string | null {
  if (!media || typeof media !== 'object') return null
  return media.url || null
}

export function getArticleImageUrl(article: ArticleLike): string | null {
  if (!article || typeof article !== 'object') return null
  // New schema: article.image is a group { imageAsset, ... }
  const image = article.image
  if (image && typeof image === 'object') {
    if ('imageAsset' in image) {
      return getMediaUrl((image as { imageAsset?: MediaLike }).imageAsset)
    }
    if ('url' in image) {
      return getMediaUrl(image as MediaLike)
    }
  }
  return getMediaUrl(article.thumbnail)
}

export function buildCarouselSlides(
  photos: CarouselPhotoDoc[] | null | undefined,
): CarouselSlide[] {
  if (!photos?.length) return []

  return photos
    .map((photo, index): CarouselSlide | null => {
      const linked =
        photo.article && typeof photo.article === 'object'
          ? photo.article
          : photo.linkedArticle && typeof photo.linkedArticle === 'object'
            ? photo.linkedArticle
            : null

      const imageUrl =
        (photo.sourceType === 'url' ? photo.imageUrl : null) ||
        getMediaUrl(photo.imageUpload) ||
        photo.imageUrl ||
        getMediaUrl(photo.image) ||
        (linked ? getArticleImageUrl(linked) : null)

      if (!imageUrl) return null

      const href = linked?.slug
        ? getArticleUrl(linked.slug)
        : photo.linkUrl || '#'

      return {
        id: photo.id || `slide-${index}`,
        imageUrl,
        href,
        title: photo.caption || linked?.title || undefined,
        category: linked ? getCategoryTitle(linked) : undefined,
        altText: photo.altText || undefined,
      }
    })
    .filter((slide): slide is CarouselSlide => slide !== null)
}
