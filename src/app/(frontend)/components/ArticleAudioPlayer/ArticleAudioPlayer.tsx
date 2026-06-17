'use client'

import './ArticleAudioPlayer.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  title?: string
  className?: string
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M9 7.5v9l7.5-4.5L9 7.5z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M7 6h3v12H7V6zm7 0h3v12h-3V6z" fill="currentColor" />
    </svg>
  )
}

export default function ArticleAudioPlayer({ src, title, className = '' }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ready, setReady] = useState(false)

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      void audio.play()
    } else {
      audio.pause()
    }
  }, [])

  const handleSeek = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const next = Number(event.target.value)
    audio.currentTime = next

    setCurrentTime(next)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    setReady(false)
    setDuration(0)
    setCurrentTime(0)

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)

    const syncDuration = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return
      setDuration(audio.duration)
      setReady(true)
    }
    const onEnded = () => setPlaying(false)

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', syncDuration)
    audio.addEventListener('durationchange', syncDuration)
    audio.addEventListener('canplay', syncDuration)
    audio.addEventListener('ended', onEnded)

    // Handle cached/preloaded media where metadata is already available.
    syncDuration()

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', syncDuration)
      audio.removeEventListener('durationchange', syncDuration)
      audio.removeEventListener('canplay', syncDuration)
      audio.removeEventListener('ended', onEnded)
    }
  }, [src])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const wrapClass = `article-audio-player ${className}`.trim()

  return (
    <div className={wrapClass}>
      <div className="article-audio-player__header">
        <span className="article-audio-player__badge">Listen</span>
        <p className="article-audio-player__label">
          {title ? `Listen to: ${title}` : 'Listen to this article'}
        </p>
      </div>

      <div className="article-audio-player__controls">
        <button
          type="button"
          className="article-audio-player__play-btn"
          onClick={togglePlay}
          aria-label={playing ? 'Pause audio' : 'Play audio'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="article-audio-player__track">
          <input
            type="range"
            className="article-audio-player__seek"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Audio progress"
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
            disabled={!ready}
          />
          <div className="article-audio-player__times">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  )
}
