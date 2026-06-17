'use client'

import './HomePhotoCarousel.css'
import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import OptimizedImage from '../OptimizedImage/OptimizedImage'

export type CarouselSlide = {
  id: string
  imageUrl: string
  href: string
  title?: string | null
  category?: string | null
  altText?: string | null
}

type Props = {
  slides: CarouselSlide[]
}

export default function HomePhotoCarousel({ slides }: Props) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const goNext = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const goPrev = useCallback(() => {
    setActive((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1 || paused) return
    const timer = setInterval(goNext, 6000)
    return () => clearInterval(timer)
  }, [goNext, slides.length, paused])

  if (slides.length === 0) return null

  return (
    <section
      className="home-carousel"
      aria-label="Featured stories"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="home-carousel-inner">
        <div className="home-carousel-frame">
          {slides.map((s, i) => {
            const isActive = i === active
            return (
              <div
                key={s.id}
                className={`home-carousel-slide${isActive ? ' is-active' : ''}`}
                aria-hidden={!isActive}
                {...(!isActive ? { inert: true } : {})}
                role="tabpanel"
                id={`carousel-slide-${i}`}
                aria-labelledby={`carousel-tab-${i}`}
              >
                <OptimizedImage
                  src={s.imageUrl}
                  alt={s.altText || s.title || 'Carousel slide'}
                  className="home-carousel-img"
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                />
                <div className="home-carousel-overlay" />

                {isActive && (
                  <div className="home-carousel-content">
                    {s.category && (
                      <span className="home-carousel-badge">{s.category.toUpperCase()}</span>
                    )}
                    {(s.title || s.altText) && (
                      <h2 className="home-carousel-headline">{s.title || s.altText}</h2>
                    )}
                    <Link href={s.href} className="home-carousel-cta">
                      Read Full Story
                      <span className="home-carousel-cta-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            )
          })}

          {slides.length > 1 && (
            <>
              <button
                type="button"
                className="home-carousel-nav home-carousel-prev"
                onClick={goPrev}
                aria-label="Previous slide"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="home-carousel-nav home-carousel-next"
                onClick={goNext}
                aria-label="Next slide"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="home-carousel-indicators" role="tablist" aria-label="Carousel slides">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    id={`carousel-tab-${i}`}
                    aria-selected={i === active}
                    aria-controls={`carousel-slide-${i}`}
                    aria-label={`Go to slide ${i + 1}: ${s.title || 'story'}`}
                    className={`home-carousel-indicator${i === active ? ' active' : ''}`}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
