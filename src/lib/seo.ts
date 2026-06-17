import type { Metadata } from 'next'

export const SITE_NAME = 'KuberaNow'
export const SITE_DOMAIN = 'kuberanow.com'
export const SITE_URL = `https://${SITE_DOMAIN}`
export const SITE_TAGLINE = 'Business · Markets · Economy'
export const SITE_TITLE = `${SITE_NAME} – ${SITE_TAGLINE}`
export const SITE_DESCRIPTION =
  'Stay informed with the latest business news, market updates, and economy stories from KuberaNow.'
export const SITE_LOCALE = 'en_IN'
export const DEFAULT_OG_IMAGE = '/logo.png'

const MAX_DESCRIPTION_LENGTH = 160

/** When false, pages are noindex and robots.txt disallows all crawlers. */
export function isSeoCrawlingEnabled(): boolean {
  const value = process.env.SEO_CRAWLING_ENABLED
  if (value === undefined || value === '') return true
  return value === 'true' || value === '1'
}

const noIndexRobots: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
}

const indexRobots: NonNullable<Metadata['robots']> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
}

/** Canonical production URL for sitemap.xml and robots.txt. */
export function getSitemapBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SERVER_URL || SITE_URL).replace(/\/$/, '')
}

export function toAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = getSiteUrl()
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

export function truncateDescription(text: string, maxLength = MAX_DESCRIPTION_LENGTH): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

type BuildPageMetadataOptions = {
  title: string
  description?: string
  path?: string
  image?: string | null
  type?: 'website' | 'article'
  publishedTime?: string | null
  modifiedTime?: string | null
  authors?: string[]
  section?: string
  tags?: string[]
  noIndex?: boolean
}

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  section,
  tags,
  noIndex = false,
}: BuildPageMetadataOptions): Metadata {
  const summary = truncateDescription(description)
  const canonicalUrl = toAbsoluteUrl(path)
  const imageUrl = toAbsoluteUrl(image || DEFAULT_OG_IMAGE)

  const openGraph: NonNullable<Metadata['openGraph']> =
    type === 'article'
      ? {
        type: 'article',
        locale: SITE_LOCALE,
        url: canonicalUrl,
        siteName: SITE_NAME,
        title,
        description: summary,
        images: [
          {
            url: imageUrl,
            alt: title,
          },
        ],
        publishedTime: publishedTime || undefined,
        modifiedTime: modifiedTime || undefined,
        authors: authors?.length ? authors : undefined,
        section,
        tags: tags?.length ? tags : undefined,
      }
      : {
        type: 'website',
        locale: SITE_LOCALE,
        url: canonicalUrl,
        siteName: SITE_NAME,
        title,
        description: summary,
        images: [
          {
            url: imageUrl,
            alt: title,
          },
        ],
      }

  return {
    title,
    description: summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph,
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description: summary,
      images: [imageUrl],
    },
    robots: !isSeoCrawlingEnabled() || noIndex ? noIndexRobots : indexRobots,
    ...(tags?.length ? { keywords: tags } : {}),
  }
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: '/',
  },
  title: {
    default: SITE_TITLE,
    template: `%s – ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: '/brand-logo.svg', type: 'image/svg+xml' }],
    shortcut: '/brand-logo.svg',
    apple: '/brand-logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: getSiteUrl(),
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: isSeoCrawlingEnabled() ? indexRobots : noIndexRobots,
}
