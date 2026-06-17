import './page.css'
import Link from 'next/link'
import { getArticleUrl } from '@/lib/slug'
import { findArticleCards } from '@/lib/articleCards'
import { getArticleThumbUrl as getThumbUrl, getCategoryTitle } from '@/lib/display'
import { HighlightText } from '@/lib/highlightText'
import OptimizedImage from '../components/OptimizedImage/OptimizedImage'
import { buildPageMetadata } from '@/lib/seo'
import type { Article } from '@/payload-types'
import { getPayloadSafe } from '@/lib/safePayload'
import { emptyFindResult, safeDb } from '@/lib/safePayload.shared'

export const dynamic = 'force-dynamic'

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() || ''
  const path = query ? `/search?q=${encodeURIComponent(query)}` : '/search'

  return buildPageMetadata({
    title: query ? `Search: ${query}` : 'Search',
    description: query
      ? `Search results for "${query}" on KuberaNow.`
      : 'Search business news, market updates, and economy stories on KuberaNow.',
    path,
    noIndex: Boolean(query),
  })
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  const payload = await getPayloadSafe()

  const articlesResult =
    query && payload
      ? await safeDb(
        () =>
            findArticleCards(payload, {
              limit: 30,
              sort: '-publishedAt',
              where: {
                and: [{ _status: { equals: 'published' } }, { title: { contains: query } }],
              },
            }),
        emptyFindResult(),
      )
      : emptyFindResult()

  const articles = (articlesResult.docs ?? []) as Article[]

  return (
    <div className="search-page">
      <div className="search-page-inner">
        <h1 className="search-page-title">Search Results</h1>

        {!query ? (
          <p className="search-page-empty">Enter a search term in the header to find articles.</p>
        ) : articles.length === 0 ? (
          <p className="search-page-empty">
            No articles found for &ldquo;<HighlightText text={query} query={query} />&rdquo;. Try a
            different keyword.
          </p>
        ) : (
          <>
            <p className="search-page-count" role="status" aria-live="polite">
              {articlesResult.totalDocs ?? 0} result{(articlesResult.totalDocs ?? 0) !== 1 ? 's' : ''} for
              &ldquo;<HighlightText text={query} query={query} />&rdquo;
            </p>
            <div className="search-results">
              {articles.map((article) => (
                <Link
                  href={getArticleUrl(article.slug)}
                  key={article.id}
                  className="headline-item"
                >
                  {getThumbUrl(article) ? (
                    <OptimizedImage
                      src={getThumbUrl(article)!}
                      alt=""
                      className="headline-thumb"
                      width={96}
                      height={72}
                      sizes="96px"
                    />
                  ) : (
                    <div className="headline-thumb headline-thumb--ph" aria-hidden="true">
                      📰
                    </div>
                  )}
                  <div className="headline-body">
                    <span className="headline-cat">{getCategoryTitle(article)}</span>
                    <h2 className="headline-title">
                      <HighlightText text={article.title} query={query} />
                    </h2>
                    <span className="headline-date">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
