import { richTextToPlainText } from './richtext'
import { getYoutubeId } from './youtube'
import {
  isVideoMedia,
  isVideoMimeType,
  resolveMediaDoc,
  resolveMediaMimeType,
  resolveMediaUrl,
  type MediaDoc,
} from './media'

type MediaLike = MediaDoc | string | null | undefined

type ImageGroup = {
  mediaType?: string | null
  imageAsset?: MediaLike
  videoFile?: MediaLike
  videoPoster?: MediaLike
}

type CategoryLike = { title?: string | null; slug?: string | null } | string | null | undefined

export type ArticleVideoKind = 'none' | 'youtube' | 'upload'

export type ArticleDisplay = {
  image?: ImageGroup | MediaLike
  categories?: CategoryLike[] | null
  summary?: unknown
  youtubeLink?: string | null
  carouselImages?: Array<{ image?: MediaLike } | null> | null
  youtubeThumbnailUrl?: string | null
  thumbnail?: MediaLike
  category?: CategoryLike
  aiSummary?: string | null
  youtubeVideoUrl?: string | null
  videoUrl?: string | null
  hasArticleAudio?: boolean | null
}

function getImageGroup(article: ArticleDisplay): ImageGroup | null {
  const image = article.image
  if (!image || typeof image !== 'object') return null
  if ('imageAsset' in image || 'videoFile' in image || 'videoPoster' in image) {
    return image as ImageGroup
  }
  return null
}

/** Hero image URL — always from imageAsset when set. */
export function getArticleHeroImageUrl(article: ArticleDisplay): string | null {
  const group = getImageGroup(article)
  if (group?.imageAsset) {
    const url = resolveMediaUrl(group.imageAsset)
    if (url && !isVideoMedia(group.imageAsset)) return url
  }

  if (article.image && typeof article.image === 'object' && 'url' in article.image) {
    const url = resolveMediaUrl(article.image as MediaLike)
    if (url && !isVideoMedia(article.image as MediaLike)) return url
  }

  return null
}

/** Uploaded title video URL. */
export function getArticleLocalVideoUrl(article: ArticleDisplay): string | null {
  const group = getImageGroup(article)
  if (group?.videoFile) return resolveMediaUrl(group.videoFile)
  return null
}

export function getArticleLocalVideoMimeType(article: ArticleDisplay): string {
  const group = getImageGroup(article)
  return resolveMediaMimeType(group?.videoFile) || 'video/mp4'
}

export function hasUploadedTitleVideo(article: ArticleDisplay): boolean {
  return Boolean(getArticleLocalVideoUrl(article))
}

/** Poster for uploaded title video — videoPoster, then hero image, then YouTube thumb. */
export function getArticleVideoPosterUrl(article: ArticleDisplay): string | null {
  const group = getImageGroup(article)
  const fromPoster = resolveMediaUrl(group?.videoPoster)
  if (fromPoster) return fromPoster

  const fromHero = getArticleHeroImageUrl(article)
  if (fromHero) return fromHero

  return getArticleYoutubeThumbnail(article)
}

export function getArticleYoutubeUrl(article: ArticleDisplay): string | null {
  const url = article.youtubeLink || article.youtubeVideoUrl || article.videoUrl || ''
  return url.trim() || null
}

export function getArticleYoutubeId(article: ArticleDisplay): string | null {
  const url = getArticleYoutubeUrl(article)
  return url ? getYoutubeId(url) : null
}

export function getArticleYoutubeThumbnail(article: ArticleDisplay): string | null {
  if (article.youtubeThumbnailUrl) return article.youtubeThumbnailUrl
  const id = getArticleYoutubeId(article)
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null
}

export function getArticleVideoKind(article: ArticleDisplay): ArticleVideoKind {
  if (hasUploadedTitleVideo(article)) return 'upload'
  if (getArticleYoutubeId(article)) return 'youtube'
  return 'none'
}

/** Card/list thumbnail — image first, then video poster, then YouTube thumb, then carousel. */
export function getArticleThumbUrl(article: ArticleDisplay): string | null {
  const heroImage = getArticleHeroImageUrl(article)
  if (heroImage) return heroImage

  const group = getImageGroup(article)
  const poster = resolveMediaUrl(group?.videoPoster)
  if (poster) return poster

  const youtubeThumb = getArticleYoutubeThumbnail(article)
  if (youtubeThumb) return youtubeThumb

  const carousel = article.carouselImages
  if (Array.isArray(carousel) && carousel.length > 0) {
    const first = carousel[0]?.image
    const fromCarousel = resolveMediaUrl(typeof first === 'object' ? first : null)
    if (fromCarousel) return fromCarousel
  }

  return resolveMediaUrl(article.thumbnail)
}

export function getPrimaryCategory(article: ArticleDisplay): { title: string; slug: string } {
  const fromArray =
    Array.isArray(article.categories) && article.categories.length > 0
      ? article.categories[0]
      : null
  const cat = fromArray ?? article.category

  if (cat && typeof cat === 'object') {
    return { title: cat.title || 'General', slug: cat.slug || '' }
  }
  return { title: 'General', slug: '' }
}

export function getCategoryTitle(article: ArticleDisplay): string {
  return getPrimaryCategory(article).title
}

export function getCategorySlug(article: ArticleDisplay): string {
  return getPrimaryCategory(article).slug
}

export function getSummaryText(article: ArticleDisplay): string {
  return richTextToPlainText(article.summary) || article.aiSummary || ''
}

/** @deprecated Use getArticleYoutubeUrl */
export function getArticleVideoUrl(article: ArticleDisplay): string {
  return getArticleYoutubeUrl(article) || ''
}

/** Resolve media from Lexical upload node value. */
export function mediaFromUploadValue(value: unknown): MediaDoc | null {
  if (!value) return null
  if (typeof value === 'object') return resolveMediaDoc(value as MediaDoc)
  return null
}

export function isUploadValueVideo(value: unknown): boolean {
  const doc = mediaFromUploadValue(value)
  return isVideoMedia(doc)
}

export function getUploadMediaUrl(value: unknown): string | null {
  return resolveMediaUrl(mediaFromUploadValue(value))
}

export function getUploadMediaMimeType(value: unknown): string {
  return resolveMediaMimeType(mediaFromUploadValue(value)) || 'video/mp4'
}

export { isVideoMimeType, resolveMediaUrl, type MediaDoc }
