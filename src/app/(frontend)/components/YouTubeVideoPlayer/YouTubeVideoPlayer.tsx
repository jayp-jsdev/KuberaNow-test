'use client'

import './YouTubeVideoPlayer.css'
import React, { useMemo, useState } from 'react'
import {
  getYoutubeEmbedUrl,
  getYoutubeThumbnailFallbacks,
  getYoutubeThumbnailUrl,
  getYoutubeWatchUrl,
  resolveYoutubeVariant,
} from '@/lib/youtube'

type Props = {
  videoId: string
  thumbnailUrl?: string
  title?: string
  videoUrl?: string
  /** auto = detect Shorts vs regular video from URL */
  variant?: 'portrait' | 'landscape' | 'auto'
}

function YouTubePlayIcon() {
  return (
    <svg viewBox="0 0 67 60" width="72" height="64" aria-hidden="true">
      <path
        d="M63 14.87a7.885 7.885 0 00-5.56-5.56C52.54 8 32.88 8 32.88 8S13.23 8 8.32 9.31c-2.7.72-4.83 2.85-5.56 5.56C1.45 19.77 1.45 30 1.45 30s0 10.23 1.31 15.13c.72 2.7 2.85 4.83 5.56 5.56C13.23 52 32.88 52 32.88 52s19.66 0 24.56-1.31c2.7-.72 4.83-2.85 5.56-5.56C64.31 40.23 64.31 30 64.31 30s0-10.23-1.31-15.13z"
        fill="#f03"
      />
      <path fill="#fff" d="M26.6 39.43L42.93 30 26.6 20.57z" />
    </svg>
  )
}

export default function YouTubeVideoPlayer({
  videoId,
  thumbnailUrl,
  title,
  videoUrl,
  variant = 'auto',
}: Props) {
  const [playing, setPlaying] = useState(false)
  const [thumbIndex, setThumbIndex] = useState(0)

  const resolvedVariant = useMemo(
    () => resolveYoutubeVariant(videoUrl, variant),
    [videoUrl, variant],
  )

  const thumbSources = useMemo(() => {
    const preferred = thumbnailUrl || getYoutubeThumbnailUrl(videoId, resolvedVariant === 'portrait')
    const fallbacks = getYoutubeThumbnailFallbacks(videoId)
    return [preferred, ...fallbacks.filter((src) => src !== preferred)]
  }, [thumbnailUrl, videoId, resolvedVariant])

  const currentThumb = thumbSources[thumbIndex] || thumbSources[0]
  const wrapClass = `youtube-player-wrap youtube-player-wrap--${resolvedVariant}`
  const watchUrl = getYoutubeWatchUrl(videoId)

  if (playing) {
    return (
      <div className={wrapClass}>
        <div className="youtube-player-stage">
          <div className="youtube-player-embed">
            <iframe
              src={getYoutubeEmbedUrl(videoId, true)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={title || 'Article video'}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={wrapClass}>
      <div className="youtube-player-stage">
        <button
          type="button"
          className="youtube-player-thumb"
          onClick={() => setPlaying(true)}
          aria-label={title ? `Play video: ${title}` : 'Play video'}
        >
          <img
            src={currentThumb}
            alt={title || 'Video thumbnail'}
            onError={() => {
              setThumbIndex((prev) => (prev + 1 < thumbSources.length ? prev + 1 : prev))
            }}
          />
          <span className="youtube-player-gradient" aria-hidden="true" />
          <span className="youtube-play-btn" aria-hidden="true">
            <YouTubePlayIcon />
          </span>
        </button>

        <a
          href={watchUrl}
          className="youtube-watch-link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          Watch on YouTube
        </a>
      </div>
    </div>
  )
}
