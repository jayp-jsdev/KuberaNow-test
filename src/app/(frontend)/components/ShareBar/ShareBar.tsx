'use client'

import './ShareBar.css'
import React, { useState } from 'react'

type Props = {
  url: string
  title: string
}

export default function ShareBar({ url, title }: Props) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: '💬',
    },
    {
      id: 'twitter',
      label: 'Twitter',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: '𝕏',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: 'f',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: 'in',
    },
  ]

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="share-bar">
      <span className="share-bar-label">Share this article</span>
      <div className="share-bar-buttons">
        {shareLinks.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`share-btn share-btn-${link.id}`}
            title={`Share on ${link.label}`}
            aria-label={`Share on ${link.label}`}
          >
            <span className="share-btn-icon">{link.icon}</span>
            <span className="share-btn-label">{link.label}</span>
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          className="share-btn share-btn-copy"
          title="Copy link"
          aria-label="Copy link"
        >
          <span className="share-btn-icon">{copied ? '✓' : '🔗'}</span>
          <span className="share-btn-label">{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  )
}
