'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../AuthProvider/AuthProvider'
import UserProfileModal from '../UserProfileModal/UserProfileModal'

type Props = {
  adminUrl: string
}

export default function UserAuthMenu({ adminUrl }: Props) {
  const { user, loading, isStaff, openLoginModal, openRegisterModal } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  if (loading) {
    return (
      <span className="auth-guest-avatar auth-guest-avatar--loading" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
        </svg>
      </span>
    )
  }

  if (!user) {
    return (
      <div className={`auth-menu${menuOpen ? ' is-open' : ''}`}>
        <button
          type="button"
          className="auth-guest-trigger"
          aria-label="Account menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="auth-guest-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
              <circle cx="12" cy="8" r="3.5" />
            </svg>
          </span>
          <span className="auth-guest-label">Account</span>
          <svg
            className="auth-guest-chevron"
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              className="auth-menu-backdrop"
              aria-label="Close account menu"
              onClick={() => setMenuOpen(false)}
            />
            <div className="auth-menu-dropdown">
              <button
                type="button"
                className="auth-menu-item"
                onClick={() => {
                  setMenuOpen(false)
                  openLoginModal()
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Sign in
              </button>
              <button
                type="button"
                className="auth-menu-item auth-menu-item--accent"
                onClick={() => {
                  setMenuOpen(false)
                  openRegisterModal()
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M19 8v6M22 11h-6" strokeLinecap="round" />
                </svg>
                Create account
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="auth-menu auth-menu--signed-in">
        {isStaff && (
          <Link href={adminUrl} className="topbar-icon-link" aria-label="Admin panel" title="Admin panel">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </Link>
        )}

        <button
          type="button"
          className="topbar-icon-link topbar-icon-link--signed-in"
          aria-label="Open profile"
          onClick={() => setProfileOpen(true)}
        >
          <span className="auth-avatar">{user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}</span>
        </button>
      </div>

      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} adminUrl={adminUrl} />
    </>
  )
}
