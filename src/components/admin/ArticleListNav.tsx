'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'

const VIEWS = [
  {
    id: 'all',
    label: 'Article Listing',
    description: 'List all articles',
    href: '/admin/collections/articles?listView=all',
  },
  {
    id: 'drafts',
    label: 'Draft Listing',
    description: 'New drafts and published articles with unsaved changes',
    href: '/admin/collections/articles?listView=drafts&view=drafts-by-category',
  },
  {
    id: 'published',
    label: 'Published Articles',
    description: 'Live on website',
    href: '/admin/collections/articles?listView=published&where[_status][equals]=published',
  },
  {
    id: 'unpublished',
    label: 'Unpublished Articles',
    description: 'Previously published articles taken offline',
    href:
      '/admin/collections/articles?listView=unpublished&view=unpublished-by-category&where[and][0][_status][equals]=draft&where[and][1][publishedAt][exists]=true',
  },
] as const

function getActiveView(searchParams: URLSearchParams): string {
  const listView = searchParams.get('listView')
  if (listView && VIEWS.some((view) => view.id === listView)) {
    return listView
  }

  // Backward compatibility for older bookmarked URLs
  if (
    searchParams.get('view') === 'drafts-by-category' ||
    searchParams.get('view') === 'unpublished-by-category'
  ) {
    if (searchParams.get('listView') === 'unpublished') return 'unpublished'
    return 'drafts'
  }
  if (searchParams.get('where[_status][equals]') === 'published') return 'published'
  if (
    searchParams.get('where[_status][equals]') === 'draft' &&
    searchParams.get('where[publishedAt][exists]') === 'true'
  ) {
    return 'unpublished'
  }
  return 'all'
}

function navigateToView(href: string) {
  // Full page navigation resets Payload's ListQueryProvider client state,
  // which otherwise keeps stale `where` filters across soft route changes.
  window.location.assign(href)
}

export function ArticleListNav() {
  const searchParams = useSearchParams()
  const active = getActiveView(searchParams)

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        padding: '1rem 1.25rem',
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
      }}
    >
      <div style={{ marginBottom: '0.75rem' }}>
        <strong style={{ fontSize: '0.95rem' }}>Articles</strong>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
          Navigate between article listings: all, drafts, published, and unpublished.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {VIEWS.map((view) => {
          const isActive = active === view.id
          return (
            <button
              key={view.id}
              type="button"
              title={view.description}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => navigateToView(view.href)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.4rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                cursor: 'pointer',
                border: isActive
                  ? '1px solid var(--theme-elevation-800)'
                  : '1px solid var(--theme-elevation-200)',
                background: isActive ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-0)',
                color: isActive ? 'var(--theme-elevation-0)' : 'inherit',
              }}
            >
              {view.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
