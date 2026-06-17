'use client'

import { useEffect } from 'react'
import { useAuth } from '../AuthProvider/AuthProvider'
import LoginForm from '../LoginForm/LoginForm'
import RegisterForm from '../RegisterForm/RegisterForm'

export default function AuthModal() {
  const { authModal, closeAuthModal, openLoginModal, openRegisterModal, user } = useAuth()

  useEffect(() => {
    if (!authModal) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeAuthModal()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [authModal, closeAuthModal])

  useEffect(() => {
    if (user && authModal) {
      closeAuthModal()
    }
  }, [user, authModal, closeAuthModal])

  if (!authModal) return null

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal} role="presentation">
      <div
        className="auth-modal auth-modal--form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="auth-modal-close auth-modal-close--form"
          onClick={closeAuthModal}
          aria-label="Close"
        >
          ×
        </button>

        {authModal === 'login' ? (
          <LoginForm
            onSuccess={closeAuthModal}
            onSwitchToRegister={openRegisterModal}
          />
        ) : (
          <RegisterForm
            onSuccess={closeAuthModal}
            onSwitchToLogin={openLoginModal}
          />
        )}
      </div>
    </div>
  )
}
