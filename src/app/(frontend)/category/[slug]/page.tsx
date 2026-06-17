import '../../components/NewsCardGrid/NewsCardGrid.css'
import './page.css'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { getArticleUrl } from '@/lib/slug'
import { getArticleThumbUrl, getCategoryTitle, getSummaryText } from '@/lib/display'
import { fetchCategoryArticlesOrdered } from '@/lib/pinned'
import { fetchCategoryPageAds } from '@/lib/ads'
import { fetchAdRegistryForSlots, getAdTracking } from '@/lib/ads/fetchAdRegistry'
import { getCategoriesForNav } from '@/lib/sidebar'
import AdSlot from '../../components/AdSlot/AdSlot'
import OptimizedImage from '../../components/OptimizedImage/OptimizedImage'
import type { Category } from '@/payload-types'
import { buildPageMetadata } from '@/lib/seo'
import { getPayloadCached } from '@/lib/safePayload'
import { emptyFindResult, safeDb } from '@/lib/safePayload.shared'
import { buildCategoryPageJsonLd } from '@/lib/structuredData'
import JsonLd from '../../components/JsonLd/JsonLd'

export const revalidate = 60

function formatArticleDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function renderImage(imageUrl: string | null, title: string, className: string): React.ReactNode {
  if (imageUrl) {
    return (
      <OptimizedImage
        src={imageUrl}
        alt={title}
        className={className}
        width={640}
        height={400}
        sizes="(max-width: 768px) 50vw, 25vw"
      />
    )
  }
  return <div className={`${className}-placeholder`}>KuberaNow</div>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadCached()
  const result = payload
    ? await safeDb(
        () =>
          payload.find({
            collection: 'categories',
            where: { slug: { equals: slug } },
            limit: 1,
            depth: 0,
            select: {
              title: true,
              slug: true,
            },
          }),
        emptyFindResult<Category>(),
      )
    : emptyFindResult<Category>()
  const cat = result.docs?.[0]
  if (!cat) {
    return buildPageMetadata({
      title: 'Category Not Found',
      description: 'The requested category could not be found on KuberaNow.',
      path: `/category/${slug}`,
      noIndex: true,
    })
  }

  return buildPageMetadata({
    title: cat.title,
    description: `Browse all ${cat.title} news, analysis, and updates on KuberaNow.`,
    path: `/category/${slug}`,
    section: cat.title,
  })
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadCached()

  const categoryAdSlots = ['categoryLeaderboard', 'categoryMidContent'] as const

  const [catResult, categories, categoryAds, adRegistry] = await Promise.all([
    payload
      ? safeDb(
          () =>
            payload.find({
              collection: 'categories',
              where: { slug: { equals: slug } },
              limit: 1,
              depth: 0,
              select: {
                title: true,
                slug: true,
              },
            }),
          emptyFindResult<Category>(),
        )
      : Promise.resolve(emptyFindResult<Category>()),
    getCategoriesForNav(),
    payload ? fetchCategoryPageAds(payload) : Promise.resolve(null),
    payload
      ? fetchAdRegistryForSlots(payload, [...categoryAdSlots])
      : Promise.resolve({}),
  ])

  const category = catResult.docs?.[0]
  if (!category) notFound()

  const { pinnedArticles, regularArticles, totalDocs } = payload
    ? await fetchCategoryArticlesOrdered(payload, {
        categoryId: category.id,
        limit: 20,
      })
    : { pinnedArticles: [], regularArticles: [], totalDocs: 0 }

  const hasArticles = pinnedArticles.length > 0 || regularArticles.length > 0
  const categoryDescription = `Browse all ${category.title} news, analysis, and updates on KuberaNow.`

  return (
    <>
      <JsonLd
        data={buildCategoryPageJsonLd({
          title: category.title,
          description: categoryDescription,
          slug: category.slug,
          breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: category.title, path: `/category/${category.slug}` },
          ],
        })}
      />
      <div className="category-header-v2">
        <div className="breadcrumb-v2">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{category.title}</span>
        </div>
        <h1 className="category-title-v2">{category.title}</h1>
        <p className="category-count-v2">
          {totalDocs} article{totalDocs !== 1 ? 's' : ''} in this category
        </p>
      </div>

      <div className="category-tabs-row-v2">
        <div className="cat-tabs-v2 cat-tabs-v2--scroll">
          <Link href="/" className="cat-tab-v2">
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={`cat-tab-v2${cat.slug === slug ? ' active' : ''}`}
            >
              {cat.title}
            </Link>
          ))}
        </div>
      </div>

      <AdSlot
        ad={categoryAds?.categoryLeaderboard ?? null}
        variant="leaderboard"
        fallbackSize="728 × 90"
        fallbackDesc="Leaderboard"
        tracking={getAdTracking(adRegistry, 'categoryLeaderboard')}
      />

      {!hasArticles ? (
        <div className="empty-state-v2">
          <div className="empty-state-icon-v2" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="40"
              height="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="empty-state-title-v2">No articles yet</h2>
          <p className="empty-state-desc-v2">
            No published articles in the &ldquo;{category.title}&rdquo; category yet.
          </p>
          <Link href="/" className="empty-state-link-v2">
            ← Back to home
          </Link>
        </div>
      ) : (
        <>
          {pinnedArticles.length > 0 && (
            <section>
              <div className="section-header-v2">
                <div className="section-title-v2">
                  <span className="section-title-bar-v2" />
                  Pinned News
                </div>
                <span className="sidebar-widget-more-v2">{pinnedArticles.length} pinned</span>
              </div>
              <div
                className={`grid-4-v2${pinnedArticles.length < 4 ? ` grid-4-v2--${pinnedArticles.length}` : ''}`}
              >
                {pinnedArticles.map((article) => (
                  <div className="grid-card-v2 grid-card-v2--pinned" key={article.id}>
                    <div className="grid-card-img-wrap">
                      {renderImage(getArticleThumbUrl(article), article.title, 'grid-card-img')}
                      <span className="grid-card-pin-badge">Pinned</span>
                    </div>
                    <div className="grid-card-body">
                      <span className="grid-card-badge">{getCategoryTitle(article)}</span>
                      <h4 className="grid-card-title">
                        <Link href={getArticleUrl(article.slug)} prefetch={false}>
                          {article.title}
                        </Link>
                      </h4>
                      <div className="grid-card-date">
                        {formatArticleDate(article.publishedAt || article.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {regularArticles.length > 0 && (
            <section>
              <div className="section-header-v2">
                <div className="section-title-v2">
                  <span className="section-title-bar-v2" />
                  {pinnedArticles.length > 0 ? `Latest in ${category.title}` : category.title}
                </div>
                <span className="sidebar-widget-more-v2">{totalDocs} articles</span>
              </div>
              <div className="grid-8-v2">
                {regularArticles.map((article) => (
                  <div className="grid-card-v2" key={article.id}>
                    <div className="grid-card-img-wrap">
                      {renderImage(getArticleThumbUrl(article), article.title, 'grid-card-img')}
                    </div>
                    <div className="grid-card-body">
                      <span className="grid-card-badge">{getCategoryTitle(article)}</span>
                      <h4 className="grid-card-title">
                        <Link href={getArticleUrl(article.slug)} prefetch={false}>
                          {article.title}
                        </Link>
                      </h4>
                      {getSummaryText(article) && (
                        <p className="grid-card-excerpt">{getSummaryText(article)}</p>
                      )}
                      <div className="grid-card-date">
                        {formatArticleDate(article.publishedAt || article.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {regularArticles.length > 4 && (
            <AdSlot
              ad={categoryAds?.categoryMidContent ?? null}
              variant="leaderboard"
              fallbackSize="728 × 90"
              fallbackDesc="Mid-content"
              tracking={getAdTracking(adRegistry, 'categoryMidContent')}
            />
          )}
        </>
      )}
    </>
  )
}
