'use client'

import React, { useEffect, useState } from 'react'
import type { UIFieldClientComponent } from 'payload'
import { useField, useFormFields } from '@payloadcms/ui'
import { STATIC_ARTICLE_AUDIO_URL } from '@/lib/articleAudio'

const btnBase: React.CSSProperties = {
  padding: '0.4rem 1rem',
  fontSize: '0.82rem',
  borderRadius: '4px',
  cursor: 'pointer',
}

function toggleStyle(active: boolean): React.CSSProperties {
  return {
    ...btnBase,
    border: `1px solid ${active ? 'var(--theme-success-400)' : 'var(--theme-elevation-200)'}`,
    background: active ? 'var(--theme-success-50)' : 'var(--theme-elevation-0)',
    color: active ? 'var(--theme-success-700)' : 'var(--theme-text)',
    fontWeight: active ? 600 : 400,
  }
}

export const ArticleAudioField: UIFieldClientComponent = () => {
  const { value: hasArticleAudio, setValue: setHasArticleAudio } = useField<boolean>({
    path: 'hasArticleAudio',
  })
  const hasContent = useFormFields(([fields]) => Boolean(fields.content?.value))
  const [wantsAudio, setWantsAudio] = useState(false)
  const [hasPreview, setHasPreview] = useState(false)

  const isKept = Boolean(hasArticleAudio)
  const isYes = wantsAudio || isKept

  useEffect(() => {
    if (isKept) {
      setWantsAudio(true)
      setHasPreview(true)
    }
  }, [isKept])

  const setNo = () => {
    setWantsAudio(false)
    setHasPreview(false)
    setHasArticleAudio(false)
  }

  const discardAudio = () => {
    // Remove from DB flag and hide the audio UI immediately.
    setWantsAudio(true)
    setHasPreview(false)
    setHasArticleAudio(false)
  }

  const setYes = () => {
    setWantsAudio(true)
    if (hasContent) setHasPreview(true)
    if (!isKept) setHasArticleAudio(false)
  }

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
        padding: '1rem 1.1rem',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Add Audio for Article
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button type="button" onClick={setNo} style={toggleStyle(!isYes)}>
          No
        </button>
        <button type="button" onClick={setYes} style={toggleStyle(isYes)}>
          Yes
        </button>
      </div>

      {isYes && (
        <p
          style={{
            fontSize: '0.82rem',
            lineHeight: 1.5,
            marginBottom: '1rem',
            padding: '0.75rem 0.9rem',
            background: 'var(--theme-elevation-100)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
          }}
        >
          {hasContent
            ? 'Article audio is generated from the body content. Preview below, then keep or discard.'
            : 'Add article content first.'}
        </p>
      )}

      {isYes && hasContent && !hasPreview && (
        <button
          type="button"
          onClick={() => setHasPreview(true)}
          style={{
            ...btnBase,
            border: '1px solid var(--theme-elevation-200)',
            background: 'var(--theme-elevation-0)',
            marginBottom: '0.75rem',
          }}
        >
          Generate Audio Preview
        </button>
      )}

      {isYes && hasContent && hasPreview && (
        <div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={STATIC_ARTICLE_AUDIO_URL} style={{ width: '100%', marginBottom: '0.75rem' }} />

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setHasArticleAudio(true)}
              style={{
                ...btnBase,
                border: '1px solid var(--theme-success-400)',
                background: 'var(--theme-success-50)',
                color: 'var(--theme-success-700)',
                fontWeight: 600,
                opacity: isKept ? 0.75 : 1,
              }}
            >
              {isKept ? 'Audio Kept' : 'Keep Audio'}
            </button>
            <button
              type="button"
              onClick={discardAudio}
              style={{ ...btnBase, border: '1px solid var(--theme-elevation-200)', background: 'var(--theme-elevation-0)' }}
            >
              Discard Audio
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: isKept ? 'var(--theme-success-600)' : 'var(--theme-text)', margin: 0 }}>
            {isKept
              ? 'Audio is saved. Discard removes it from database on next save.'
              : 'Audio is not saved. Click Keep Audio to store it in database.'}
          </p>
        </div>
      )}
    </div>
  )
}
