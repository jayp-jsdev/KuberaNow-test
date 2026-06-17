import Link from 'next/link'
import ReactionBar from '@/app/(frontend)/components/ReactionBar/ReactionBar'
import ShareRow from '@/app/(frontend)/components/ShareRow/ShareRow'
import OptimizedImage from '@/app/(frontend)/components/OptimizedImage/OptimizedImage'
import ArticleDisplaySections, {
  type ArticleViewModel,
} from '@/app/(frontend)/components/ArticleDisplaySections/ArticleDisplaySections'
import { getCategoryTitle, getSummaryText, type ArticleDisplay } from '@/lib/display'
import { isSectionEnabled } from '@/lib/pageLayouts/defaults'
import type { ArticlePageLayoutData } from '@/lib/pageLayouts/fetchArticlePageLayout'
import type { ArticlePageLayout } from '@/payload-types'
import { getArticleUrl } from '@/lib/slug'

type AlsoReadArticle = ArticleDisplay & {
  id: string
  title: string
  slug: string
  subtitle?: string | null
}

type Props = {
  sections: NonNullable<ArticlePageLayout['sections']>
  pageLayout: ArticlePageLayoutData
  article: ArticleViewModel
  categoryTitle: string
  categorySlug: string
  breadcrumbLabel: string
  shareUrl: string
  formatDate: (date: string | null) => string
  alsoReadArticles: AlsoReadArticle[]
  getThumbUrl: (article: AlsoReadArticle) => string | null
}

export default function ArticlePageSections({
  sections,
  pageLayout,
  article,
  categoryTitle,
  categorySlug,
  breadcrumbLabel,
  shareUrl,
  formatDate,
  alsoReadArticles,
  getThumbUrl,
}: Props) {
  const hasContentSection = sections.some(
    (section) => section.blockType === 'articleContent' && isSectionEnabled(section),
  )

  return (
    <>
      {sections.map((section, index) => {
        if (!isSectionEnabled(section)) return null

        switch (section.blockType) {
          case 'breadcrumbs':
            return (
              <div className="breadcrumb-v2" key={`${section.blockType}-${index}`}>
                <Link href="/">Home</Link>
                <span className="breadcrumb-separator">›</span>
                <Link href={`/category/${categorySlug}`}>{categoryTitle}</Link>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-current" title={article.title}>
                  {breadcrumbLabel}
                </span>
              </div>
            )

          case 'metaHeader':
            return (
              <div className="article-meta-v2" key={`${section.blockType}-${index}`}>
                <span className="article-meta-badge-v2">{categoryTitle}</span>
                <span className="article-meta-time-v2">
                  <svg
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" strokeLinecap="round" />
                  </svg>
                  {article.estimatedReadingTimeMinutes || 6} min read
                </span>
              </div>
            )

          case 'articleContent':
            return (
              <ArticleDisplaySections
                key={`${section.blockType}-${index}`}
                article={article}
                pageLayout={pageLayout}
                shareUrl={shareUrl}
                formatDate={formatDate}
                showShareTop
              />
            )

          case 'tags': {
            const tags = (article as { tags?: Array<{ id: string; title: string } | string> })
              .tags
            if (!tags?.length) return null
            return (
              <div className="article-tags-row-v2" key={`${section.blockType}-${index}`}>
                <span className="article-tags-label-v2">Tags:</span>
                {tags.map((tag) => {
                  const title = typeof tag === 'object' ? tag.title : tag
                  return (
                    <Link
                      key={typeof tag === 'object' ? tag.id : tag}
                      href={`/search?q=${encodeURIComponent(title)}`}
                      className="article-tag-link-v2"
                    >
                      {title}
                    </Link>
                  )
                })}
              </div>
            )
          }

          case 'reactions':
            return (
              <ReactionBar
                key={`${section.blockType}-${index}`}
                articleId={article.id}
                initial={(article as { reactions?: Record<string, number> }).reactions || {}}
              />
            )

          case 'shareBar':
            return (
              <ShareRow
                key={`${section.blockType}-${index}`}
                url={shareUrl}
                title={article.title}
                className="article-share-row-v2"
                isCopyLink={false}
              />
            )

          case 'alsoRead':
            if (alsoReadArticles.length === 0) return null
            return (
              <section className="also-read-block-v2" key={`${section.blockType}-${index}`}>
                <h3 className="also-read-title-v2">
                  {pageLayout.getSectionTitle('alsoRead')}
                </h3>
                <div className="also-read-list-v2">
                  {alsoReadArticles.map((alsoRead) => (
                    <Link
                      key={alsoRead.id}
                      href={getArticleUrl(alsoRead.slug)}
                      className="also-read-card-v2"
                    >
                      {getThumbUrl(alsoRead) ? (
                        <OptimizedImage
                          src={getThumbUrl(alsoRead)!}
                          alt=""
                          className="also-read-thumb-v2"
                          width={200}
                          height={120}
                          sizes="(max-width: 768px) 100vw, 200px"
                        />
                      ) : (
                        <div className="also-read-thumb-placeholder-v2" aria-hidden="true">
                          KN
                        </div>
                      )}
                      <div className="also-read-body-v2">
                        <span className="also-read-cat-v2">{getCategoryTitle(alsoRead)}</span>
                        <h4 className="also-read-headline-v2">{alsoRead.title}</h4>
                        {getSummaryText(alsoRead) ? (
                          <p className="also-read-excerpt-v2">{getSummaryText(alsoRead)}</p>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )

          default:
            return null
        }
      })}
      {!hasContentSection ? (
        <ArticleDisplaySections
          article={article}
          pageLayout={pageLayout}
          shareUrl={shareUrl}
          formatDate={formatDate}
          showShareTop
        />
      ) : null}
    </>
  )
}
