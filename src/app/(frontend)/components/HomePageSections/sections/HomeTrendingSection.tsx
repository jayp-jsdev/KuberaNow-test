import TrendingNews from '@/app/(frontend)/components/TrendingNews/TrendingNews'
import { fetchHomeTrending } from '@/lib/pageLayouts/homePageData'
import type { HomePage } from '@/payload-types'

type Section = Extract<NonNullable<HomePage['mainSections']>[number], { blockType: 'trendingNews' }>

type Props = {
  section: Section
}

export default async function HomeTrendingSection({ section }: Props) {
  const trending = await fetchHomeTrending(section.limit ?? 5)

  return <TrendingNews articles={trending} title={section.sectionTitle || 'Trending'} />
}
