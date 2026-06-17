'use client'

import { useRowLabel } from '@payloadcms/ui'

type RowData = {
  article?: { title?: string | null } | string | null
}

export function PinnedArticleRowLabel() {
  const { data, rowNumber } = useRowLabel<RowData>()
  const articleTitle =
    data?.article && typeof data.article === 'object' ? data.article.title : null
  const label = articleTitle || `Pinned article ${(rowNumber ?? 0) + 1}`

  return <span>{label}</span>
}
