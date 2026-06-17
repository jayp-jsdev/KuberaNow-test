import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Articles } from './collections/Articles'
import { PinnedSection } from './collections/PinnedSection'
import { NewsViews } from './collections/NewsViews'
import { NewsAnalytics } from './collections/NewsAnalytics'
import { Ads } from './collections/Ads'
import { AdAnalyticsDaily } from './collections/AdAnalyticsDaily'
import { PhotoCarousel } from './globals/PhotoCarousel'
import { AboutUs } from './globals/AboutUs'
import { TermsOfUse } from './globals/TermsOfUse'
import { Disclaimer } from './globals/Disclaimer'
import { PrivacyPolicy } from './globals/PrivacyPolicy'
import { ContactUs } from './globals/ContactUs'
import { SiteAds } from './globals/SiteAds'
import { HomePage } from './globals/HomePage'
import { ArticlePageLayout } from './globals/ArticlePageLayout'
import { SiteSidebar } from './globals/SiteSidebar'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Articles,
    PinnedSection,
    NewsViews,
    NewsAnalytics,
    Ads,
    AdAnalyticsDaily,
  ],
  globals: [
    HomePage,
    ArticlePageLayout,
    SiteSidebar,
    PhotoCarousel,
    AboutUs,
    TermsOfUse,
    Disclaimer,
    PrivacyPolicy,
    ContactUs,
    SiteAds,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
  onInit: async (payload) => {
    const { startTrendingScheduler } = await import('./jobs/trendingScheduler')
    const { ensureDefaultAds } = await import('./lib/ads/ensureAds')
    const { ensureDefaultPageLayouts } = await import('./lib/pageLayouts/ensureDefaults')
    startTrendingScheduler(payload)
    await ensureDefaultAds(payload)
    await ensureDefaultPageLayouts(payload)
  },
})
