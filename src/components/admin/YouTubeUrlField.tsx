'use client'

import React from 'react'
import type { TextFieldClientComponent } from 'payload'
import { TextField, useField } from '@payloadcms/ui'

function getYoutubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\s]+)/)
  return match ? match[1] : null
}

export const YouTubeUrlField: TextFieldClientComponent = (props) => {
  const { path } = props
  const { value } = useField<string>({ path })
  const videoId = getYoutubeId(value || '')
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null

  return (
    <div>
      <TextField {...props} />

      {thumbnailUrl && (
        <div style={{ marginTop: '1rem' }}>
          <p
            style={{
              fontSize: '0.78rem',
              opacity: 0.7,
              marginBottom: '0.5rem',
            }}
          >
            YouTube thumbnail preview (9:16 ratio — 1080×1920)
          </p>
          <div
            style={{
              width: '270px',
              aspectRatio: '9 / 16',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid var(--theme-elevation-200)',
              background: 'var(--theme-elevation-100)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt="YouTube video thumbnail"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (videoId) {
                  target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
