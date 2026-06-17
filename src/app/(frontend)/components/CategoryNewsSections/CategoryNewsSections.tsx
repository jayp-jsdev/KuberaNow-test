'use client'

import './CategoryNewsSections.css'
import Link from 'next/link'
import type { CategoryNewsSection } from '@/lib/categoryNews'
import { getArticleThumbUrl } from '@/lib/display'
import { getArticleUrl } from '@/lib/slug'
import type { Article } from '@/payload-types'
import OptimizedImage from '../OptimizedImage/OptimizedImage'

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function renderThumb(imageUrl: string | null, title: string) {
  if (imageUrl) {
    return (
      <OptimizedImage
        src={imageUrl}
        alt={title}
        className="sidebar-category-news-thumb-v2"
        width={64}
        height={48}
        sizes="64px"
      />
    )
  }
  return (
    <div
      className="sidebar-category-news-thumb-v2 sidebar-category-news-thumb-placeholder-v2"
      aria-hidden="true"
    >
      KN
    </div>
  )
}

type Props = {
  sections: CategoryNewsSection[]
}

export default function CategoryNewsSections({ sections }: Props) {
  const visibleSections = (sections ?? []).filter((section) => section.articles?.length > 0)
  if (visibleSections.length === 0) return null

  return (
    <>
      {visibleSections.map(({ category, articles }) => (
        <section className="sidebar-category-news-v2" key={category.id}>
          <div className="sidebar-category-news-header-v2">
            <h3 className="sidebar-category-news-title-v2">{category.title}</h3>
            <Link href={`/category/${category.slug}`} className="sidebar-widget-more-v2">
              View all →
            </Link>
          </div>
          <div className="sidebar-category-news-list-v2">
            {articles.map((article: Article) => {
              const imageUrl = getArticleThumbUrl(article)
              return (
                <Link
                  href={getArticleUrl(article.slug)}
                  className="sidebar-category-news-item-v2"
                  key={article.id}
                >
                  {renderThumb(imageUrl, article.title)}
                  <div className="sidebar-category-news-body-v2">
                    <h4 className="sidebar-category-news-headline-v2">{article.title}</h4>
                    <span className="sidebar-category-news-date-v2">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </>
  )
}
