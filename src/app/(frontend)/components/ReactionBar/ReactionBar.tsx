'use client'
import './ReactionBar.css'
import React, { useState } from 'react'

interface Reactions {
  like?: number | null
  insightful?: number | null
  sad?: number | null
  happy?: number | null
  angry?: number | null
}

const EMOJIS: Record<keyof Reactions, string> = {
  like: '👍',
  insightful: '💡',
  sad: '😢',
  happy: '😊',
  angry: '😠',
}

const LABELS: Record<keyof Reactions, string> = {
  like: 'Like',
  insightful: 'Insightful',
  sad: 'Sad',
  happy: 'Happy',
  angry: 'Angry',
}

export default function ReactionBar({ articleId, initial }: { articleId: string; initial: Reactions }) {
  const [counts, setCounts] = useState<Reactions>(initial || {})
  const [active, setActive] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function react(type: keyof Reactions) {
    if (loading) return
    setLoading(true)
    const newActive = active === type ? null : type
    setActive(newActive)
    const newCounts = { ...counts }
    if (active && active !== type) newCounts[active as keyof Reactions] = Math.max(0, (newCounts[active as keyof Reactions] || 0) - 1)
    if (newActive) newCounts[type] = (newCounts[type] || 0) + 1
    else newCounts[type] = Math.max(0, (newCounts[type] || 0) - 1)
    setCounts(newCounts)
    try {
      await fetch(`/api/articles/${articleId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, action: newActive ? 'add' : 'remove' }),
      })
    } catch {}
    setLoading(false)
  }

  return (
    <div className="reactions-bar" role="group" aria-label="Article reactions">
      <span className="reactions-label" id="reactions-label">
        How did this story make you feel?
      </span>
      {(Object.keys(EMOJIS) as (keyof Reactions)[]).map((type) => (
        <button
          key={type}
          type="button"
          className={`reaction-btn${active === type ? ' active' : ''}`}
          onClick={() => react(type)}
          aria-label={`${LABELS[type]} reaction, ${counts[type] || 0} total`}
          aria-pressed={active === type}
          disabled={loading}
        >
          <span aria-hidden="true">{EMOJIS[type]}</span>
          <span className="reaction-count" aria-hidden="true">
            {counts[type] || 0}
          </span>
          <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{LABELS[type]}</span>
        </button>
      ))}
    </div>
  )
}
