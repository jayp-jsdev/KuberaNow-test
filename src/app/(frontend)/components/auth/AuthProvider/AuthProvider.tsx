'use client'

import './AuthProvider.css'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@/payload-types'
import { isStaffRole } from '@/lib/auth/roles'
import AuthModal from '../AuthModal/AuthModal'

type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'preferences' | 'savedArticles'>
type AuthModalView = 'login' | 'register' | null

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  isStaff: boolean
  authModal: AuthModalView
  refreshUser: () => Promise<void>
  setUser: (user: AuthUser | null) => void
  logout: () => Promise<void>
  openLoginModal: () => void
  openRegisterModal: () => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type Props = {
  initialUser: AuthUser | null
  children: React.ReactNode
}

export function AuthProvider({ initialUser, children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [loading, setLoading] = useState(!initialUser)
  const [authModal, setAuthModal] = useState<AuthModalView>(null)

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/users/me', { credentials: 'include' })
      if (!res.ok) {
        setUser(null)
        return
      }

      const data = await res.json()
      const nextUser = data.user || data
      setUser(nextUser?.id ? nextUser : null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }, [])

  const openLoginModal = useCallback(() => setAuthModal('login'), [])
  const openRegisterModal = useCallback(() => setAuthModal('register'), [])
  const closeAuthModal = useCallback(() => setAuthModal(null), [])

  useEffect(() => {
    if (!initialUser) {
      void refreshUser()
    }
  }, [initialUser, refreshUser])

  const value = useMemo(
    () => ({
      user,
      loading,
      isStaff: isStaffRole(user?.role),
      authModal,
      refreshUser,
      setUser,
      logout,
      openLoginModal,
      openRegisterModal,
      closeAuthModal,
    }),
    [user, loading, authModal, refreshUser, logout, openLoginModal, openRegisterModal, closeAuthModal],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
