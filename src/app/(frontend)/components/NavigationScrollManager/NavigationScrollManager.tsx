'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect, useRef } from 'react'

/**
 * Resets window scroll when the route path changes.
 *
 * Next.js App Router keeps the layout mounted during client navigations, so the
 * browser scroll position from the previous page is often preserved. Built-in
 * Link scrolling can also race ahead of the new page paint when `scroll-behavior:
 * smooth` is set on <html>, leaving the viewport stuck partway down.
 */
export default function NavigationScrollManager() {
  const pathname = usePathname()
  const isInitialRender = useRef(true)

  useLayoutEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    // Run after layout so the incoming page has committed to the DOM.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  }, [pathname])

  return null
}
