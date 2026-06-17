'use client'

import './SaveArticleButton.css'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../AuthProvider/AuthProvider'

type Props = {
  articleId: string
}

export default function SaveArticleButton({ articleId }: Props) {
  const { user, loading, openLoginModal } = useAuth()
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!user || checked) return

    fetch('/api/auth/saved', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.savedArticles) return
        const ids = data.savedArticles.map((item: { id: string } | string) =>
          typeof item === 'string' ? item : item.id,
        )
        setSaved(ids.includes(articleId))
      })
      .finally(() => setChecked(true))
  }, [user, articleId, checked])

  if (loading) return null

  if (!user) {
    return (
      <button type="button" className="save-article-btn" onClick={openLoginModal}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
        </svg>
        Sign in to save
      </button>
    )
  }

  async function toggleSave() {
    setBusy(true)
    try {
      const res = await fetch('/api/auth/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ articleId }),
      })

      if (res.ok) {
        const data = await res.json()
        setSaved(Boolean(data.saved))
      }
    } finally {
      setBusy(false)
    }
  }

  function getButtonLabel() {
    if (busy) return saved ? 'Removing…' : 'Saving…'
    return saved ? 'Saved' : 'Save article'
  }

  return (
    <button
      type="button"
      className={`save-article-btn${saved ? ' is-saved' : ''}`}
      onClick={toggleSave}
      disabled={busy}
      aria-pressed={saved}
      aria-busy={busy}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
      </svg>
      {getButtonLabel()}
    </button>
  )
}
