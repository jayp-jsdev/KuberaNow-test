'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

function getFieldValue(fields: Record<string, { value?: unknown }>, path: string): string {
  const field = fields[path]
  if (!field?.value) return ''
  return String(field.value)
}

export function ArticlePreviewButtons() {
  const { id } = useDocumentInfo()
  const fields = useFormFields(([fieldsState]) => fieldsState)
  const slug = getFieldValue(fields, 'slug')
  const status = getFieldValue(fields, '_status')
  const publishedAt = getFieldValue(fields, 'publishedAt')
  const [unpublishing, setUnpublishing] = useState(false)
  const [unpublishError, setUnpublishError] = useState<string | null>(null)

  if (!id || !slug) return null

  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const previewBase = `${base}/articles/${encodeURIComponent(slug)}?preview=true&id=${encodeURIComponent(String(id))}`

  const openPreview = (mode: 'desktop' | 'mobile') => {
    const url = `${previewBase}&device=${mode}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const canUnpublish = status === 'published' || (status !== 'draft' && Boolean(publishedAt))

  const handleUnpublish = async () => {
    const confirmed = window.confirm(
      'Unpublish this article? It will be taken offline and moved to Unpublished Articles. The live version will no longer be visible on the website.',
    )
    if (!confirmed) return

    setUnpublishing(true)
    setUnpublishError(null)

    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(String(id))}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ _status: 'draft' }),
      })

      if (!res.ok) {
        throw new Error('Failed to unpublish article')
      }

      window.location.assign(
        '/admin/collections/articles?listView=unpublished&view=unpublished-by-category',
      )
    } catch {
      setUnpublishError('Could not unpublish. Please try again.')
      setUnpublishing(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
      <button
        type="button"
        onClick={() => openPreview('desktop')}
        style={{
          padding: '0.35rem 0.75rem',
          fontSize: '0.82rem',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-200)',
          background: 'var(--theme-elevation-0)',
          cursor: 'pointer',
        }}
      >
        Preview Desktop
      </button>
      <button
        type="button"
        onClick={() => openPreview('mobile')}
        style={{
          padding: '0.35rem 0.75rem',
          fontSize: '0.82rem',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-200)',
          background: 'var(--theme-elevation-0)',
          cursor: 'pointer',
        }}
      >
        Preview Mobile
      </button>
      {canUnpublish && (
        <button
          type="button"
          onClick={() => void handleUnpublish()}
          disabled={unpublishing}
          title="Take this article offline and move it to Unpublished Articles"
          style={{
            padding: '0.35rem 0.75rem',
            fontSize: '0.82rem',
            borderRadius: '4px',
            border: '1px solid var(--theme-error-300)',
            background: 'var(--theme-error-50)',
            color: 'var(--theme-error-600)',
            cursor: unpublishing ? 'not-allowed' : 'pointer',
            opacity: unpublishing ? 0.7 : 1,
          }}
        >
          {unpublishing ? 'Unpublishing…' : 'Unpublish'}
        </button>
      )}
      {unpublishError && (
        <span style={{ fontSize: '0.78rem', color: 'var(--theme-error-500)' }}>{unpublishError}</span>
      )}
    </div>
  )
}
