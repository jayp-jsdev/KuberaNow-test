import './components/NewsCardGrid/NewsCardGrid.css'
import './page.css'
import HomePageSections from './components/HomePageSections/HomePageSections'
import { fetchHomePageSections } from '@/lib/pageLayouts/homePageData'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10) || 1)
  const mainSections = await fetchHomePageSections()
  return <HomePageSections sections={mainSections} currentPage={currentPage} />
}
