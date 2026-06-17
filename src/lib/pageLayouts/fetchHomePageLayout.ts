import type { Payload } from 'payload'
import type { HomePage } from '@/payload-types'
import { buildCarouselSlides } from '@/lib/carousel'
import {
  extractPinnedIds,
  fetchHomeCarouselSlides,
  fetchHomeLatestNews,
  fetchHomePageSections,
  fetchHomePinnedArticles,
  fetchHomeTrending,
} from './homePageData'
import { fetchTrendingArticles } from '@/lib/trending/fetchTrending'
import { isSectionEnabled } from './defaults'

type HomeMainSections = NonNullable<HomePage['mainSections']>
type PinnedSection = Extract<HomeMainSections[number], { blockType: 'pinnedNews' }>
type CarouselSection = Extract<HomeMainSections[number], { blockType: 'photoCarousel' }>

export type HomePageLayoutData = {
  layout: HomePage | null
  mainSections: HomeMainSections
  pinnedIds: string[]
  pinnedArticles: Awaited<ReturnType<typeof fetchHomePinnedArticles>>
  carouselSlides: ReturnType<typeof buildCarouselSlides>
  trending: Awaited<ReturnType<typeof fetchHomeTrending>>
  latestNewsPerPage: number
}

/** @deprecated Prefer section-specific fetchers from homePageData.ts */
export async function fetchHomePageLayout(
  payload: Payload,
  currentPage: number,
): Promise<HomePageLayoutData> {
  const mainSections = await fetchHomePageSections()
  const pinnedSection = mainSections.find(
    (section): section is PinnedSection =>
      section.blockType === 'pinnedNews' && isSectionEnabled(section),
  )
  const pinnedArticles = pinnedSection ? await fetchHomePinnedArticles(pinnedSection) : []
  const pinnedIds = extractPinnedIds(pinnedSection)

  const carouselSection = mainSections.find(
    (section): section is CarouselSection =>
      section.blockType === 'photoCarousel' && isSectionEnabled(section),
  )
  const trendingSection = mainSections.find(
    (section) => section.blockType === 'trendingNews' && isSectionEnabled(section),
  )
  const latestSection = mainSections.find(
    (section) => section.blockType === 'latestNews' && isSectionEnabled(section),
  )

  const [carouselSlides, trendingResult] = await Promise.all([
    carouselSection ? fetchHomeCarouselSlides(carouselSection) : Promise.resolve([]),
    trendingSection?.blockType === 'trendingNews'
      ? fetchTrendingArticles(payload, trendingSection.limit ?? 5)
      : Promise.resolve({ trending: [] }),
  ])

  const latestNewsPerPage =
    latestSection?.blockType === 'latestNews' ? (latestSection.perPage ?? 10) : 10

  if (latestSection?.blockType === 'latestNews' && isSectionEnabled(latestSection)) {
    await fetchHomeLatestNews(currentPage, latestNewsPerPage, pinnedIds)
  }

  return {
    layout: null,
    mainSections,
    pinnedIds,
    pinnedArticles,
    carouselSlides,
    trending: trendingResult.trending,
    latestNewsPerPage,
  }
}
