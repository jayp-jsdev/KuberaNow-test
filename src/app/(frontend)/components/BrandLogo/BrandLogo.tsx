import './BrandLogo.css'
import React from 'react'

interface BrandLogoProps {
  size?: 'sm' | 'md'
  showTagline?: boolean
  showLogo?: boolean
  className?: string
}

export default function BrandLogo({ size = 'md', showTagline = true, showLogo = true, className = '' }: BrandLogoProps) {
  const isSmall = size === 'sm'

  return (
    <div className={`brand-lockup ${isSmall ? 'brand-lockup--sm' : ''} ${className}`.trim()}>
      {showLogo && <img
        src="/brand-logo.svg"
        alt=""
        className={`brand-mark-img ${isSmall ? 'brand-mark-img--sm' : ''}`}
        width={isSmall ? 36 : 42}
        height={isSmall ? 36 : 42}
        aria-hidden="true"
      />}
      <span className="brand-lockup-text">
        <span className={`brand-lockup-name ${isSmall ? 'brand-lockup-name--sm' : ''}`}>KuberaNow</span>
        {showTagline && (
          <span className="brand-lockup-tagline">BUSINESS · MARKETS · ECONOMY</span>
        )}
      </span>
    </div>
  )
}
