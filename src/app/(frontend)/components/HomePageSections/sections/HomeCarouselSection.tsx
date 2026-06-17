import HomePhotoCarousel from '@/app/(frontend)/components/HomePhotoCarousel/HomePhotoCarousel'
import { fetchHomeCarouselSlides } from '@/lib/pageLayouts/homePageData'
import type { HomePage } from '@/payload-types'

type Section = Extract<NonNullable<HomePage['mainSections']>[number], { blockType: 'photoCarousel' }>

type Props = {
  section: Section
}

export default async function HomeCarouselSection({ section }: Props) {
  const slides = await fetchHomeCarouselSlides(section)
  if (slides.length === 0) return null

  return (
    <div className="home-carousel-wrap">
      <HomePhotoCarousel slides={slides} />
    </div>
  )
}
