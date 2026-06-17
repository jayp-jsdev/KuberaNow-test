'use client'

import './NativeVideoPlayer.css'
import React, { useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  poster?: string | null
  mimeType?: string
  title?: string
  className?: string
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" className="native-video-play-svg">
      <path d="M9 7.5v9l7.5-4.5L9 7.5z" fill="currentColor" />
    </svg>
  )
}

export default function NativeVideoPlayer({
  src,
  poster,
  mimeType = 'video/mp4',
  title,
  className = '',
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!active) return
    const video = videoRef.current
    if (!video) return
    void video.play().catch(() => {
      // Autoplay blocked or load failed — user can press play on native controls.
    })
  }, [active])

  const wrapClass = `native-video-wrap ${className}`.trim()

  if (!active) {
    return (
      <div className={wrapClass}>
        <button
          type="button"
          className="native-video-poster-btn"
          onClick={() => setActive(true)}
          aria-label={title ? `Play video: ${title}` : 'Play video'}
        >
          {poster ? (
            <img src={poster} alt={title || 'Video poster'} className="native-video-poster" />
          ) : (
            <div className="native-video-poster native-video-poster--placeholder" aria-hidden="true" />
          )}
          <span className="native-video-play-overlay" aria-hidden="true">
            <span className="native-video-play-control">
              <span className="native-video-play-icon">
                <PlayIcon />
              </span>
              <span className="native-video-play-label">Play video</span>
            </span>
          </span>
          <span className="native-video-type-badge">Video</span>
        </button>
      </div>
    )
  }

  return (
    <div className={wrapClass}>
      <video
        ref={videoRef}
        className="native-video"
        controls
        playsInline
        autoPlay
        preload="auto"
        poster={poster || undefined}
        aria-label={title || 'Article video'}
      >
        <source src={src} type={mimeType} />
        Your browser does not support embedded video.
      </video>
    </div>
  )
}
