import { getArticleThumbUrl, getCategoryTitle, getSummaryText } from '@/lib/display'
import type { Article } from '@/payload-types'

export type NormalizedArticle = {
  id: string
  title: string
  slug: string
  category: string
  publishedAt: string
  excerpt: string
  imageUrl: string | null
}

export function normalizeArticle(article: Article): NormalizedArticle {
  const title = article.title || ''
  const slug = article.slug || ''
  const publishedAt = article.publishedAt || article.createdAt
  const dateStr = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : ''

  const excerpt = article.summary ? getSummaryText(article) : (article.subtitle || '')
  const category = getCategoryTitle(article) || 'General'
  const imageUrl = getArticleThumbUrl(article) || null

  return {
    id: article.id,
    title,
    slug,
    category,
    publishedAt: dateStr,
    excerpt,
    imageUrl,
  }
}
