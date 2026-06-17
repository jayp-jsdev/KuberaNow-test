'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type CategoryRef = { id: string; title?: string } | string

type DraftArticle = {
  id: string
  title?: string | null
  slug?: string | null
  subtitle?: string | null
  updatedAt: string
  publishedAt?: string | null
  _status?: ('draft' | 'published') | null
  categories?: CategoryRef[] | null
  category?: CategoryRef | null
}

type ListMode = 'drafts' | 'unpublished'

function getListMode(searchParams: URLSearchParams): ListMode | null {
  const view = searchParams.get('view')
  if (view === 'drafts-by-category') return 'drafts'
  if (view === 'unpublished-by-category') return 'unpublished'
  return null
}

/** Draft listing: new drafts + published articles with unsaved draft edits. */
function belongsInDraftListing(parent?: DraftArticle): boolean {
  if (!parent) return true
  if (parent._status === 'published') return true
  if (!parent.publishedAt) return true
  return false
}

/** Unpublished listing: previously published articles taken fully offline. */
function belongsInUnpublishedListing(parent: DraftArticle): boolean {
  return parent._status === 'draft' && !!parent.publishedAt
}

function getArticleDisplayTitle(article: DraftArticle): string {
  const title = article.title?.trim()
  if (title) return title

  const subtitle = article.subtitle?.trim()
  if (subtitle) return subtitle

  const slug = article.slug?.trim()
  if (slug) return slug

  return 'Untitled draft'
}

function mergeDraftWithParent(draft: DraftArticle, parent?: DraftArticle): DraftArticle {
  if (!parent) return draft

  return {
    ...parent,
    ...draft,
    title: draft.title?.trim() || parent.title?.trim() || '',
    slug: draft.slug?.trim() || parent.slug?.trim() || '',
    subtitle: draft.subtitle?.trim() || parent.subtitle?.trim() || '',
    categories:
      Array.isArray(draft.categories) && draft.categories.length > 0
        ? draft.categories
        : parent.categories,
    category: draft.category ?? parent.category ?? null,
    publishedAt: draft.publishedAt ?? parent.publishedAt,
    updatedAt: draft.updatedAt || parent.updatedAt,
  }
}

async function fetchArticlesByIds(ids: string[], draft: boolean): Promise<Map<string, DraftArticle>> {
  if (ids.length === 0) return new Map()

  const params = new URLSearchParams({
    depth: '1',
    limit: String(ids.length),
    draft: String(draft),
  })

  ids.forEach((id, index) => {
    params.append(`where[id][in][${index}]`, id)
  })

  const res = await fetch(`/api/articles?${params.toString()}`, {
    credentials: 'include',
  })

  if (!res.ok) {
    return new Map()
  }

  const data = await res.json()
  return new Map((data.docs as DraftArticle[]).map((doc) => [doc.id, doc]))
}

const CUSTOM_LIST_STYLE_ID = 'articles-custom-list-style'

function setCustomListMode(enabled: boolean) {
  if (enabled) {
    document.documentElement.classList.add('articles-custom-list-view')
    if (!document.getElementById(CUSTOM_LIST_STYLE_ID)) {
      const style = document.createElement('style')
      style.id = CUSTOM_LIST_STYLE_ID
      style.textContent = `
        html.articles-custom-list-view .collection-list--articles .list-controls,
        html.articles-custom-list-view .collection-list--articles .collection-list__tables,
        html.articles-custom-list-view .collection-list--articles .collection-list__list-selection,
        html.articles-custom-list-view .collection-list--articles .page-controls,
        html.articles-custom-list-view .collection-list--articles .no-results {
          display: none !important;
        }
      `
      document.head.appendChild(style)
    }
    return
  }

  document.documentElement.classList.remove('articles-custom-list-view')
}

function getDraftBadge(parent?: DraftArticle): string | null {
  if (parent?._status === 'published' && parent.publishedAt) {
    return 'Pending changes'
  }
  return null
}

type ArticleRow = DraftArticle & { badge?: string | null }

type CategoryGroup = {
  categoryId: string
  categoryTitle: string
  articles: ArticleRow[]
}

function getCategoryLabel(article: DraftArticle): { id: string; title: string } {
  const primary =
    Array.isArray(article.categories) && article.categories.length > 0
      ? article.categories[0]
      : article.category

  if (primary && typeof primary === 'object') {
    return {
      id: primary.id,
      title: primary.title || 'Uncategorized',
    }
  }
  return { id: 'uncategorized', title: 'Uncategorized' }
}

function groupArticlesByCategory(articles: ArticleRow[]): CategoryGroup[] {
  const grouped = new Map<string, CategoryGroup>()

  for (const article of articles) {
    const { id, title } = getCategoryLabel(article)
    if (!grouped.has(id)) {
      grouped.set(id, { categoryId: id, categoryTitle: title, articles: [] })
    }
    grouped.get(id)!.articles.push(article)
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.categoryTitle.localeCompare(b.categoryTitle),
  )
}

export function DraftsByCategoryView() {
  const searchParams = useSearchParams()
  const listMode = getListMode(searchParams)
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCustomListMode(Boolean(listMode))
    return () => setCustomListMode(false)
  }, [listMode])

  useEffect(() => {
    if (!listMode) {
      setGroups([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchDrafts() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          draft: 'true',
          'where[_status][equals]': 'draft',
          depth: '1',
          limit: '200',
          sort: '-updatedAt',
        })

        const res = await fetch(`/api/articles?${params.toString()}`, {
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error('Failed to load draft articles')
        }

        const data = await res.json()
        const draftDocs = (data.docs || []) as DraftArticle[]
        const parentDocs = await fetchArticlesByIds(
          draftDocs.map((article) => article.id),
          false,
        )

        const articles = draftDocs
          .map((draft) => {
            const parent = parentDocs.get(draft.id)
            return {
              ...mergeDraftWithParent(draft, parent),
              badge: getDraftBadge(parent),
            }
          })
          .filter((article) => belongsInDraftListing(parentDocs.get(article.id)))

        if (!cancelled) {
          setGroups(groupArticlesByCategory(articles))
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    async function fetchUnpublished() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          draft: 'false',
          'where[and][0][_status][equals]': 'draft',
          'where[and][1][publishedAt][exists]': 'true',
          depth: '1',
          limit: '200',
          sort: '-updatedAt',
        })

        const res = await fetch(`/api/articles?${params.toString()}`, {
          credentials: 'include',
        })

        if (!res.ok) {
          throw new Error('Failed to load unpublished articles')
        }

        const data = await res.json()
        const articles = ((data.docs || []) as DraftArticle[]).filter(belongsInUnpublishedListing)

        if (!cancelled) {
          setGroups(groupArticlesByCategory(articles))
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (listMode === 'drafts') {
      void fetchDrafts()
    } else {
      void fetchUnpublished()
    }

    return () => {
      cancelled = true
    }
  }, [listMode])

  if (!listMode) return null

  const isDraftView = listMode === 'drafts'

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
      <div style={{ marginBottom: '1rem' }}>
        <strong style={{ fontSize: '0.95rem' }}>
          {isDraftView ? 'Draft Listing — Category Wise' : 'Unpublished Articles — Category Wise'}
        </strong>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
          {isDraftView
            ? 'New drafts and published articles with unsaved changes, grouped by category.'
            : 'Previously published articles that have been taken offline, grouped by category.'}
        </p>
      </div>

      {loading && (
        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
          {isDraftView ? 'Loading drafts…' : 'Loading unpublished articles…'}
        </p>
      )}
      {error && <p style={{ fontSize: '0.85rem', color: 'var(--theme-error-500)' }}>{error}</p>}

      {!loading && !error && groups.length === 0 && (
        <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
          {isDraftView ? 'No draft articles found.' : 'No unpublished articles found.'}
        </p>
      )}

      {groups.map((group) => (
        <div key={group.categoryId} style={{ marginBottom: '1.25rem' }}>
          <h4
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              opacity: 0.8,
            }}
          >
            {group.categoryTitle} ({group.articles.length})
          </h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {group.articles.map((article) => {
              const badge = article.badge
              return (
                <li
                  key={article.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid var(--theme-elevation-100)',
                    fontSize: '0.85rem',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <Link
                      href={`/admin/collections/articles/${article.id}`}
                      style={{ fontWeight: 500, textDecoration: 'none' }}
                    >
                      {getArticleDisplayTitle(article)}
                    </Link>
                    {badge && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '999px',
                          background: 'var(--theme-warning-100)',
                          color: 'var(--theme-warning-700)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <span style={{ opacity: 0.6, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    Updated {new Date(article.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
