'use client'

import React, { useState } from 'react'
import { useAuth } from '../AuthProvider/AuthProvider'

type Props = {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

type RegisterFields = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const initialFields: RegisterFields = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: Props) {
  const { setUser } = useAuth()

  const [fields, setFields] = useState<RegisterFields>(initialFields)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function setField(name: keyof RegisterFields, value: string) {
    const trimmed = value.trim()
    setFields((prev) => ({
      ...prev,
      [name]: trimmed.length > 0 ? trimmed : '',
    }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setField(name as keyof RegisterFields, value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { name, email, password, confirmPassword } = fields

    if (password.length === 0 || confirmPassword.length === 0) {
      setError('Password cannot be empty.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed.')
        return
      }

      if (data.user) {
        setUser(data.user)
      }

      onSuccess?.()
    } catch {
      setError('Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <p className="auth-card-eyebrow">KuberaNow</p>
        <h2 id="auth-modal-title" className="auth-card-title">Create account</h2>
        <p className="auth-card-subtitle">
          Join free to save articles, set alerts, and pick up where you left off.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-error">{error}</p>}

        <label className="auth-field">
          <span>Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            value={fields.name}
            onChange={handleChange}
            placeholder="Your name"
          />
        </label>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={fields.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            value={fields.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
          />
        </label>

        <label className="auth-field">
          <span>Confirm password</span>
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            value={fields.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
          />
        </label>

        <button type="submit" className="auth-btn auth-btn--primary auth-btn--block" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-card-footer">
        Already have an account?{' '}
        <button type="button" className="auth-link auth-link-btn" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>
    </div>
  )
}
