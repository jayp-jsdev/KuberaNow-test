'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../AuthProvider/AuthProvider'
import { getArticleUrl } from '@/lib/slug'

type SavedArticle = {
  id: string
  title: string
  slug: string
}

type Props = {
  open: boolean
  onClose: () => void
  adminUrl: string
}

export default function UserProfileModal({ open, onClose, adminUrl }: Props) {
  const { user, logout, isStaff, refreshUser } = useAuth()
  const [tab, setTab] = useState<'profile' | 'preferences' | 'saved'>('profile')
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([])
  const [morningBrief, setMorningBrief] = useState(false)
  const [articleAlerts, setArticleAlerts] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(false)

  useEffect(() => {
    if (!open) return

    setMorningBrief(Boolean(user?.preferences?.morningBrief))
    setArticleAlerts(Boolean(user?.preferences?.articleAlerts))
  }, [open, user])

  useEffect(() => {
    if (!open || tab !== 'saved' || !user) return

    setLoadingSaved(true)
    fetch('/api/auth/saved', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        const articles = (data.savedArticles || []).filter(
          (item: SavedArticle | string) => typeof item === 'object' && item?.id,
        )
        setSavedArticles(articles)
      })
      .finally(() => setLoadingSaved(false))
  }, [open, tab, user])

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !user) return null

  async function handleSavePreferences() {
    setSavingPrefs(true)
    try {
      await fetch('/api/auth/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ morningBrief, articleAlerts }),
      })
      await refreshUser()
    } finally {
      setSavingPrefs(false)
    }
  }

  async function handleLogout() {
    await logout()
    onClose()
  }

  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-header">
          <div>
            <p className="auth-modal-eyebrow">Your account</p>
            <h2 id="profile-modal-title" className="auth-modal-title">
              {user.name || user.email}
            </h2>
          </div>
          <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close profile">
            ×
          </button>
        </div>

        <div className="auth-modal-tabs">
          <button
            type="button"
            className={`auth-modal-tab${tab === 'profile' ? ' is-active' : ''}`}
            onClick={() => setTab('profile')}
          >
            Profile
          </button>
          <button
            type="button"
            className={`auth-modal-tab${tab === 'preferences' ? ' is-active' : ''}`}
            onClick={() => setTab('preferences')}
          >
            Preferences
          </button>
          <button
            type="button"
            className={`auth-modal-tab${tab === 'saved' ? ' is-active' : ''}`}
            onClick={() => setTab('saved')}
          >
            Saved
          </button>
        </div>

        <div className="auth-modal-body">
          {tab === 'profile' && (
            <div className="auth-modal-section">
              <dl className="auth-profile-list">
                <div>
                  <dt>Name</dt>
                  <dd>{user.name || '—'}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt>Account type</dt>
                  <dd className="auth-role-badge">{user.role || 'reader'}</dd>
                </div>
              </dl>

              {isStaff && (
                <a href={adminUrl} className="auth-btn auth-btn--secondary auth-btn--block">
                  Open admin panel
                </a>
              )}
            </div>
          )}

          {tab === 'preferences' && (
            <div className="auth-modal-section">
              <label className="auth-pref-row">
                <span>
                  <strong>Morning Brief</strong>
                  <small>Top business stories before markets open</small>
                </span>
                <input
                  type="checkbox"
                  checked={morningBrief}
                  onChange={(e) => setMorningBrief(e.target.checked)}
                />
              </label>

              <label className="auth-pref-row">
                <span>
                  <strong>Breaking news alerts</strong>
                  <small>Get notified on major market-moving stories</small>
                </span>
                <input
                  type="checkbox"
                  checked={articleAlerts}
                  onChange={(e) => setArticleAlerts(e.target.checked)}
                />
              </label>

              <button
                type="button"
                className="auth-btn auth-btn--primary"
                onClick={handleSavePreferences}
                disabled={savingPrefs}
              >
                {savingPrefs ? 'Saving…' : 'Save preferences'}
              </button>
            </div>
          )}

          {tab === 'saved' && (
            <div className="auth-modal-section">
              {loadingSaved ? (
                <p className="auth-muted">Loading saved articles…</p>
              ) : savedArticles.length === 0 ? (
                <div className="auth-empty-state">
                  <p>No saved articles yet.</p>
                  <Link href="/" className="auth-link" onClick={onClose}>
                    Browse latest news
                  </Link>
                </div>
              ) : (
                <ul className="auth-saved-list">
                  {savedArticles.map((article) => (
                    <li key={article.id}>
                      <Link href={getArticleUrl(article.slug)} onClick={onClose}>
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="auth-modal-footer">
          <button type="button" className="auth-btn auth-btn--ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
