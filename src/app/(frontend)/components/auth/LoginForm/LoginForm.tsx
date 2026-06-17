'use client'

import React, { useState } from 'react'
import { useAuth } from '../AuthProvider/AuthProvider'

type Props = {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: Props) {
  const { setUser, refreshUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.errors?.[0]?.message || data.message || 'Invalid email or password.')
        return
      }

      const nextUser = data.user || data
      if (nextUser?.id) {
        setUser(nextUser)
      } else {
        await refreshUser()
      }

      onSuccess?.()
    } catch {
      setError('Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <p className="auth-card-eyebrow">KuberaNow</p>
        <h2 id="auth-modal-title" className="auth-card-title">Sign in</h2>
        <p className="auth-card-subtitle">
          Read freely — sign in only when you want to save stories and manage preferences.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </label>

        <button type="submit" className="auth-btn auth-btn--primary auth-btn--block" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-card-footer">
        New here?{' '}
        <button type="button" className="auth-link auth-link-btn" onClick={onSwitchToRegister}>
          Create a free account
        </button>
      </p>
    </div>
  )
}
