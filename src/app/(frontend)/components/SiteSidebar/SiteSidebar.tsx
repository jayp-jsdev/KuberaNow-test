'use client'

import './SiteSidebar.css'
import { usePathname } from 'next/navigation'
import AdSlot from '../AdSlot/AdSlot'
import MorningBrief from '../MorningBrief/MorningBrief'
import CategoryNewsSections from '../CategoryNewsSections/CategoryNewsSections'
import { getAdTracking } from '@/lib/ads/fetchAdRegistry.shared'
import {
  SIDEBAR_AD_SLOTS,
  isSidebarCategoryNewsHiddenForPath,
  type SidebarData,
  type SidebarPage,
} from '@/lib/sidebar.shared'

type Props = {
  page: SidebarPage
  data: SidebarData
}

export default function SiteSidebar({ page, data }: Props) {
  const pathname = usePathname()
  const {
    categoryNewsSections = [],
    adRegistry = {},
    sidebarConfig,
    sidebarAds,
  } = data ?? {}
  const slots = SIDEBAR_AD_SLOTS[page]
  const config = sidebarConfig ?? {
    showTopAd: true,
    showMorningBrief: true,
    showCategoryNews: true,
    showBottomAd: true,
  }
  const showCategoryNews =
    config.showCategoryNews && !isSidebarCategoryNewsHiddenForPath(pathname)
  const topAd = sidebarAds?.top ?? null
  const bottomAd = sidebarAds?.bottom ?? null

  return (
    <aside className="home-sidebar-v2">
      {config.showTopAd && topAd?.isEnabled ? (
        <AdSlot
          ad={topAd}
          variant="mpu"
          fallbackSize="300 × 250"
          fallbackDesc="MPU"
          priority
          tracking={getAdTracking(adRegistry, slots.top)}
        />
      ) : null}

      {config.showMorningBrief ? <MorningBrief /> : null}

      {showCategoryNews ? <CategoryNewsSections sections={categoryNewsSections} /> : null}

      {config.showBottomAd && bottomAd?.isEnabled ? (
        <AdSlot
          ad={bottomAd}
          variant="mpu"
          fallbackSize="300 × 250"
          fallbackDesc="MPU"
          tracking={getAdTracking(adRegistry, slots.bottom)}
        />
      ) : null}
    </aside>
  )
}
