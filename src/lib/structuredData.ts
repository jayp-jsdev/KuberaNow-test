import { getArticleUrl } from './slug'
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  toAbsoluteUrl,
  truncateDescription,
} from './seo'

type JsonLdObject = Record<string, unknown>

export type BreadcrumbItem = {
  name: string
  path: string
}

export function buildJsonLdGraph(...nodes: JsonLdObject[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  }
}

export function buildOrganizationSchema(): JsonLdObject {
  const siteUrl = toAbsoluteUrl('/')

  return {
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: SITE_NAME,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: toAbsoluteUrl(DEFAULT_OG_IMAGE),
    },
  }
}

export function buildWebSiteSchema(): JsonLdObject {
  const siteUrl = toAbsoluteUrl('/')

  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}#website`,
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    publisher: {
      '@id': `${siteUrl}#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildSiteJsonLd(): JsonLdObject {
  return buildJsonLdGraph(buildOrganizationSchema(), buildWebSiteSchema())
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  }
}

type NewsArticleSchemaInput = {
  title: string
  description: string
  slug: string
  imageUrl?: string | null
  publishedAt: string
  updatedAt: string
  authorName?: string | null
  publisherName?: string | null
  categoryTitle?: string
  tags?: string[]
}

export function buildNewsArticleSchema({
  title,
  description,
  slug,
  imageUrl,
  publishedAt,
  updatedAt,
  authorName,
  publisherName,
  categoryTitle,
  tags,
}: NewsArticleSchemaInput): JsonLdObject {
  const pageUrl = toAbsoluteUrl(getArticleUrl(slug))
  const author = authorName || publisherName || SITE_NAME

  return {
    '@type': 'NewsArticle',
    '@id': `${pageUrl}#article`,
    headline: title,
    description: truncateDescription(description, 200),
    url: pageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    image: [toAbsoluteUrl(imageUrl || DEFAULT_OG_IMAGE)],
    datePublished: publishedAt,
    dateModified: updatedAt,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@id': `${toAbsoluteUrl('/')}#organization`,
    },
    isAccessibleForFree: true,
    inLanguage: 'en-IN',
    ...(categoryTitle ? { articleSection: categoryTitle } : {}),
    ...(tags?.length ? { keywords: tags.join(', ') } : {}),
  }
}

export function buildArticlePageJsonLd(input: NewsArticleSchemaInput & { breadcrumbs: BreadcrumbItem[] }) {
  return buildJsonLdGraph(
    buildNewsArticleSchema(input),
    buildBreadcrumbSchema(input.breadcrumbs),
  )
}

type CollectionPageSchemaInput = {
  title: string
  description: string
  slug: string
}

export function buildCollectionPageSchema({
  title,
  description,
  slug,
}: CollectionPageSchemaInput): JsonLdObject {
  const pageUrl = toAbsoluteUrl(`/category/${slug}`)

  return {
    '@type': 'CollectionPage',
    '@id': pageUrl,
    name: title,
    description: truncateDescription(description),
    url: pageUrl,
    isPartOf: {
      '@id': `${toAbsoluteUrl('/')}#website`,
    },
    inLanguage: 'en-IN',
  }
}

export function buildCategoryPageJsonLd(
  input: CollectionPageSchemaInput & { breadcrumbs: BreadcrumbItem[] },
) {
  return buildJsonLdGraph(
    buildCollectionPageSchema(input),
    buildBreadcrumbSchema(input.breadcrumbs),
  )
}
