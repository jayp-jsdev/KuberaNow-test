'use client'

import './MorningBrief.css'
import React, { useState } from 'react'

export default function MorningBrief() {
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return
    setSubmitted(true)
  }

  return (
    <div className="brief-card-v2">
      <div className="brief-header-v2">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ color: 'var(--accent)' }}>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path d="M22 6l-10 7L2 6" />
        </svg>
        <span className="brief-title-v2">MORNING BRIEF</span>
      </div>

      <p className="brief-desc-v2">
        Get the top 5 business stories before markets open — delivered to your inbox at 7:30 AM IST.
      </p>

      {submitted ? (
        <p style={{ fontFamily: 'Hind Vadodara', fontSize: 13, color: 'var(--accent)' }}>
          Thank you! You have subscribed.
        </p>
      ) : (
        <form className="brief-form-v2" onSubmit={handleSubmit}>
          <input
            type="tel"
            className="brief-input-v2"
            placeholder="Enter Whatsapp Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-label="WhatsApp number"
          />
          <button type="submit" className="brief-btn-v2">
            Subscribe Free
          </button>
        </form>
      )}

      <div className="brief-stats-v2">
        <span>● 24,000+ readers</span>
        <span>● Daily 7:30 AM</span>
      </div>
    </div>
  )
}
