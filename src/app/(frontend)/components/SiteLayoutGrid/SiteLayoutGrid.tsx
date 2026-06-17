'use client'

import './SiteLayoutGrid.css'
import { usePathname } from 'next/navigation'
import SiteSidebar from '../SiteSidebar/SiteSidebar'
import {
  isSidebarHiddenForPath,
  resolveSidebarPageFromPath,
  type SidebarData,
} from '@/lib/sidebar.shared'

type Props = {
  children: React.ReactNode
  sidebarData: SidebarData
}

export default function SiteLayoutGrid({ children, sidebarData }: Props) {
  const pathname = usePathname()
  const showSidebar = !isSidebarHiddenForPath(pathname)
  const sidebarPage = resolveSidebarPageFromPath(pathname)

  return (
    <div className={`home-layout-v2${showSidebar ? '' : ' home-layout-v2--no-sidebar'}`}>
      <div className="home-main-v2">{children}</div>
      {showSidebar ? <SiteSidebar page={sidebarPage} data={sidebarData} /> : null}
    </div>
  )
}
