'use client'

import './AdSlot.css'
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import type { ResolvedAdSlot } from '@/lib/ads.shared'
import type { AdPlacement } from '@/lib/ads/placements'
import { trackAdEvent } from '@/lib/ads/trackClient'
import Image from 'next/image'

type TrackingProps = {
  adId: string
  placement: AdPlacement
}

type Props = {
  ad: ResolvedAdSlot | null
  variant: 'leaderboard' | 'mpu'
  fallbackSize: string
  fallbackDesc: string
  priority?: boolean
  tracking?: TrackingProps
}

function Placeholder({ size, desc }: { size: string; desc: string }) {
  return (
    <div className="ad-placeholder-v2">
      <div className="ad-size-v2">{size}</div>
      <div className="ad-desc-v2">{desc}</div>
    </div>
  )
}

export default function AdSlot({
  ad,
  variant,
  fallbackSize,
  fallbackDesc,
  priority = false,
  tracking,
}: Props) {
  const containerClass = variant === 'leaderboard' ? 'ad-leaderboard-v2' : 'ad-mpu-v2'
  const isActive = ad?.isEnabled === true
  const showLabel = isActive && ad?.showLabel !== false
  const labelText = ad?.labelText?.trim() || 'Advertisement'
  const impressionTracked = useRef(false)

  // useEffect(() => {
  //   if (!tracking || !isActive || impressionTracked.current) {
  //     return
  //   }

  //   impressionTracked.current = true

  //   void trackAdEvent({
  //     adId: tracking.adId,
  //     placement: tracking.placement,
  //     eventType: 'impression',
  //   }).catch(() => {
  //     impressionTracked.current = false
  //   })
  // }, [tracking, isActive])

  const handleAdClick = () => {
    if (!tracking || !isActive) return

    void trackAdEvent({
      adId: tracking.adId,
      placement: tracking.placement,
      eventType: 'click',
    })
  }

  let content: React.ReactNode = <Placeholder size={fallbackSize} desc={fallbackDesc} />

  if (isActive) {
    if (ad.adType === 'custom' && ad.customHtml?.trim()) {
      content = (
        <div
          className="ad-custom-v2"
          dangerouslySetInnerHTML={{ __html: ad.customHtml }}
          onClick={tracking ? handleAdClick : undefined}
          role={tracking ? 'button' : undefined}
          aria-label={tracking ? 'Advertisement' : undefined}
          tabIndex={tracking ? 0 : undefined}
          onKeyDown={
            tracking
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    handleAdClick()
                  }
                }
              : undefined
          }
        />
      )
    } else if (ad.adType === 'image' && ad.imageSrc) {
      const image = (
        <Image
          src={ad.imageSrc}
          alt={ad.altText?.trim() || 'Advertisement'}
          className="ad-image-v2"
          width={variant === 'leaderboard' ? 728 : 300}
          height={variant === 'leaderboard' ? 90 : 250}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
        />
      )

      content = ad.linkUrl?.trim() ? (
        <Link
          href={ad.linkUrl.trim()}
          className="ad-image-link-v2"
          target={ad.openInNewTab !== false ? '_blank' : '_self'}
          rel={ad.openInNewTab !== false ? 'noopener noreferrer sponsored' : 'sponsored'}
          onClick={tracking ? handleAdClick : undefined}
        >
          {image}
        </Link>
      ) : (
        image
      )
    }
  }

  const hasImageAd = isActive && ad?.adType === 'image' && Boolean(ad.imageSrc)

  return (
    <div className={`${containerClass}${hasImageAd ? ' ad-slot-v2--image' : ''}`}>
      {showLabel && <span className="ad-label-v2">{labelText}</span>}
      {content}
    </div>
  )
}
