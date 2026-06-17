import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div
      style={{
        background: '#0f0f0f',
        color: '#f0f0f0',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        margin: 0,
      }}
    >
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: 80, fontWeight: 800, color: '#c0392b', lineHeight: 1 }}>404</div>
        <p style={{ fontSize: 22, fontWeight: 600, margin: '12px 0 24px' }}>Page not found</p>
        <p style={{ color: '#aaa', marginBottom: 24 }}>
          The article or page you were looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            background: '#c0392b',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          ← Back to NewsHub
        </Link>
      </div>
    </div>
  )
}
