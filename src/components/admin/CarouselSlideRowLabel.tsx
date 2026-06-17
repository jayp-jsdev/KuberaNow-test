'use client'

import { useRowLabel } from '@payloadcms/ui'

type RowData = {
  caption?: string | null
  altText?: string | null
  article?: { title?: string | null } | string | null
}

export function CarouselSlideRowLabel() {
  const { data, rowNumber } = useRowLabel<RowData>()
  const articleTitle =
    data?.article && typeof data.article === 'object' ? data.article.title : null
  const label = articleTitle || data?.caption || data?.altText || `Slide ${(rowNumber ?? 0) + 1}`

  return <span>{label}</span>
}
