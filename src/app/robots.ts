import type { MetadataRoute } from 'next'
import { getSitemapBaseUrl, isSeoCrawlingEnabled } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  if (!isSeoCrawlingEnabled()) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
    }
  }

  const baseUrl = getSitemapBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: new URL(baseUrl).host,
  }
}
