import type { HomePage } from '@/payload-types'
import { isSectionEnabled } from '@/lib/pageLayouts/defaults'
import { extractPinnedIds } from '@/lib/pageLayouts/homePageData'
import HomeLeaderboardSection from './sections/HomeLeaderboardSection'
import HomeCarouselSection from './sections/HomeCarouselSection'
import HomePinnedSection from './sections/HomePinnedSection'
import HomeTrendingSection from './sections/HomeTrendingSection'
import HomeLatestNewsSection from './sections/HomeLatestNewsSection'

type HomeMainSections = NonNullable<HomePage['mainSections']>
type PinnedSection = Extract<HomeMainSections[number], { blockType: 'pinnedNews' }>

type Props = {
  sections: HomeMainSections
  currentPage: number
}

export default function HomePageSections({ sections, currentPage }: Props) {
  const pinnedSection = sections.find(
    (section): section is PinnedSection =>
      section.blockType === 'pinnedNews' && isSectionEnabled(section),
  )
  const pinnedIds = extractPinnedIds(pinnedSection)

  return (
    <>
      {sections.map((section, index) => {
        if (!isSectionEnabled(section)) return null

        const key = `${section.blockType}-${index}`

        switch (section.blockType) {
          case 'leaderboardAd':
            return <HomeLeaderboardSection key={key} section={section} />
          case 'photoCarousel':
            return <HomeCarouselSection key={key} section={section} />
          case 'pinnedNews':
            return <HomePinnedSection key={key} section={section} />
          case 'trendingNews':
            return <HomeTrendingSection key={key} section={section} />
          case 'latestNews':
            return (
              <HomeLatestNewsSection
                key={key}
                section={section}
                currentPage={currentPage}
                pinnedIds={pinnedIds}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}
