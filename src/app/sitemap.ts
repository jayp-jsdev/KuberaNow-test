import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getArticleUrl } from '@/lib/slug'
import { getSitemapBaseUrl } from '@/lib/seo'

export const revalidate = 3600

const PAGE_SIZE = 100

async function fetchAllPublishedArticles() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const articles: Array<{ slug: string; updatedAt: string; publishedAt?: string | null }> = []

  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const result = await payload.find({
      collection: 'articles',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: PAGE_SIZE,
      page,
      depth: 0,
      sort: '-publishedAt',
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
    })

    for (const doc of result.docs) {
      if (doc.slug) {
        articles.push({
          slug: doc.slug,
          updatedAt: doc.updatedAt,
          publishedAt: doc.publishedAt,
        })
      }
    }

    hasNextPage = result.hasNextPage
    page += 1
  }

  return articles
}

async function fetchAllCategories() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const categories: Array<{ slug: string; updatedAt: string }> = []

  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const result = await payload.find({
      collection: 'categories',
      limit: PAGE_SIZE,
      page,
      depth: 0,
      sort: 'title',
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    for (const doc of result.docs) {
      if (doc.slug) {
        categories.push({
          slug: doc.slug,
          updatedAt: doc.updatedAt,
        })
      }
    }

    hasNextPage = result.hasNextPage
    page += 1
  }

  return categories
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSitemapBaseUrl()
  const [articles, categories] = await Promise.all([
    fetchAllPublishedArticles(),
    fetchAllCategories(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${encodeURIComponent(category.slug)}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}${getArticleUrl(article.slug)}`,
    lastModified: new Date(article.publishedAt || article.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes]
}
