'use client'

import { useRowLabel } from '@payloadcms/ui'

type RowData = {
  enabled?: boolean | null
  category?: { title?: string | null } | string | null
}

export function CategorySectionRowLabel() {
  const { data, rowNumber } = useRowLabel<RowData>()
  const categoryTitle =
    data?.category && typeof data.category === 'object' ? data.category.title : null
  const status = data?.enabled === false ? ' (hidden)' : ''
  const label = categoryTitle
    ? `${categoryTitle}${status}`
    : `Category block ${(rowNumber ?? 0) + 1}${status}`

  return <span>{label}</span>
}
