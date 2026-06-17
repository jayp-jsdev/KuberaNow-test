import './page.css'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import RichTextRenderer from '../../components/RichTextRenderer/RichTextRenderer'
import ArticlePageSections from '../../components/ArticlePageSections/ArticlePageSections'
import type { ArticleViewModel } from '../../components/ArticleDisplaySections/ArticleDisplaySections'
import ShareRow from '../../components/ShareRow/ShareRow'
import SaveArticleButton from '../../components/auth/SaveArticleButton/SaveArticleButton'
import ReactionBar from '../../components/ReactionBar/ReactionBar'
import { fetchArticleForDisplayCached } from '@/lib/articles'
import { fetchArticlePageLayout } from '@/lib/pageLayouts/fetchArticlePageLayout'
import { getPayloadCached } from '@/lib/safePayload'
import { decodeSlugParam, getArticleUrl, titleToSlug } from '@/lib/slug'
import { getArticleThumbUrl, getCategorySlug, getCategoryTitle, getSummaryText } from '@/lib/display'
import { recordArticleView } from '@/lib/trending/recordView'
import { buildPageMetadata } from '@/lib/seo'
import { buildArticlePageJsonLd } from '@/lib/structuredData'
import JsonLd from '../../components/JsonLd/JsonLd'

export const dynamic = 'force-dynamic'

type CategoryRef = { title?: string; slug?: string } | string

interface ArticleDoc {
  id: string
  title: string
  slug: string
  subtitle?: string | null
  summary?: unknown
  aiSummary?: string | null
  content: unknown
  image?: {
    mediaType?: string
    imageAsset?: { url?: string } | string | null
    videoFile?: { url?: string } | string | null
    videoPoster?: { url?: string } | string | null
  } | { url?: string } | string | null
  thumbnail?: { url?: string } | string | null
  imageCredits?: string | null
  youtubeLink?: string | null
  youtubeVideoUrl?: string | null
  videoUrl?: string | null
  youtubeThumbnailUrl?: string | null
  articleHyperlink?: (ArticleDoc | string)[] | ArticleDoc | string | null
  alsoReadArticles?: Array<ArticleDoc | string> | null
  alsoReadArticle?: ArticleDoc | string | null
  quotes?: string | null
  quotesCredits?: string | null
  showCarousel?: boolean | null
  carouselImages?: Array<{
    image?: { url?: string } | string | null
    caption?: string | null
    altText?: string | null
  }> | null
  tags?: Array<{ id: string; title: string } | string> | null
  categories?: CategoryRef[] | null
  category?: CategoryRef | null
  author?: { name?: string; email?: string } | string | null
  publisher?: string | null
  isPinned?: boolean | null
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  _status?: 'draft' | 'published' | null
  viewCount?: number | null
  estimatedReadingTimeMinutes?: number | null
  reactions?: Record<string, number> | null
}

function formatArticleDate(dateStr: string | null): string {
  if (!dateStr) return '5 May, 2026 · 2:17 PM IST'
  const date = new Date(dateStr)
  const day = date.getDate()
  const year = date.getFullYear()
  const month = date.toLocaleDateString('en-GB', { month: 'long' })
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const formattedHours = hours % 12 || 12

  return `${day} ${month}, ${year} · ${formattedHours}:${minutes} ${ampm} IST`
}

function getAlsoReadArticles(article: ArticleDoc): ArticleDoc[] {
  const fromHyperlink = Array.isArray(article.articleHyperlink)
    ? article.articleHyperlink
    : article.articleHyperlink
      ? [article.articleHyperlink]
      : []

  const fromList = (article.alsoReadArticles || [])
    .filter((item): item is ArticleDoc => typeof item === 'object' && item !== null)

  const legacy =
    article.alsoReadArticle && typeof article.alsoReadArticle === 'object'
      ? [article.alsoReadArticle]
      : []

  const combined = [
    ...fromHyperlink.filter((item): item is ArticleDoc => typeof item === 'object' && item !== null),
    ...fromList,
    ...legacy,
  ]
  const seen = new Set<string>()

  return combined.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function getImageUrl(article: ArticleDoc): string | null {
  return getArticleThumbUrl(article)
}

function getSummary(article: ArticleDoc): string {
  return getSummaryText(article)
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string; id?: string }>
}) {
  const { slug: rawSlug } = await params
  const slug = decodeSlugParam(rawSlug)
  const { preview, id } = await searchParams
  const isPreview = preview === 'true'
  const article = (await fetchArticleForDisplayCached(slug, id, isPreview)) as ArticleDoc | null
  if (!article) {
    return buildPageMetadata({
      title: 'Article Not Found',
      description: 'The requested article could not be found on KuberaNow.',
      path: getArticleUrl(slug),
      noIndex: true,
    })
  }

  const authorName =
    article.author && typeof article.author === 'object' ? article.author.name : undefined
  const categoryTitle = getCategoryTitle(article)
  const tagTitles =
    article.tags
      ?.map((tag) => (typeof tag === 'object' && tag !== null ? tag.title : null))
      .filter((tag): tag is string => Boolean(tag)) ?? []

  return buildPageMetadata({
    title: article.title,
    description: getSummary(article) || article.subtitle || article.title,
    path: getArticleUrl(article.slug),
    image: getImageUrl(article),
    type: 'article',
    publishedTime: article.publishedAt || article.createdAt,
    modifiedTime: article.updatedAt,
    authors: authorName ? [authorName] : undefined,
    section: categoryTitle,
    tags: tagTitles.length ? tagTitles : undefined,
    noIndex: isPreview || article._status !== 'published',
  })
}

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string; device?: string; id?: string }>
}) {
  const { slug: rawSlug } = await params
  const slug = decodeSlugParam(rawSlug)
  const { preview, device, id: previewId } = await searchParams
  const isPreview = preview === 'true'
  const isMobilePreview = device === 'mobile'

  const payload = await getPayloadCached()
  if (!payload) notFound()

  const [articleData, pageLayout] = await Promise.all([
    fetchArticleForDisplayCached(slug, previewId, isPreview),
    fetchArticlePageLayout(),
  ])

  if (!articleData) notFound()

  const article = articleData as ArticleDoc

  // Redirect old/bad URLs to canonical slug
  if (
    !isPreview &&
    article.slug &&
    article.slug !== slug &&
    titleToSlug(slug) === titleToSlug(article.slug)
  ) {
    redirect(getArticleUrl(article.slug))
  }

  if (!isPreview) {
    void recordArticleView(payload, {
      articleId: article.id,
      currentViewCount: article.viewCount,
    })
  }

  const alsoReadArticles = getAlsoReadArticles(article)

  const thumbUrl = getImageUrl(article)
  const summary = getSummary(article)
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const shareUrl = `${baseUrl}${getArticleUrl(article.slug)}`

  const deviceClass = isMobilePreview ? 'preview-device-mobile' : 'preview-device-desktop'

  // Check if current article is the mock stock live blog from Figma
  const isLiveBlog = article.slug === 'sensex-today-stock-market-live-update-nifty-23600-icici-bank-top-gainer'

  const categoryTitle = getCategoryTitle(article)
  const categorySlug = getCategorySlug(article)
  const authorName =
    article.author && typeof article.author === 'object' ? article.author.name : null
  const tagTitles =
    article.tags
      ?.map((tag) => (typeof tag === 'object' && tag !== null ? tag.title : null))
      .filter((tag): tag is string => Boolean(tag)) ?? []
  const includeStructuredData = !isPreview && article._status === 'published'

  return (
    <div className={deviceClass}>
      {includeStructuredData && (
        <JsonLd
          data={buildArticlePageJsonLd({
            title: article.title,
            description: summary || article.subtitle || article.title,
            slug: article.slug,
            imageUrl: thumbUrl,
            publishedAt: article.publishedAt || article.createdAt,
            updatedAt: article.updatedAt,
            authorName,
            publisherName: article.publisher,
            categoryTitle,
            tags: tagTitles,
            breadcrumbs: [
              { name: 'Home', path: '/' },
              ...(categorySlug
                ? [{ name: categoryTitle, path: `/category/${categorySlug}` }]
                : []),
              { name: article.title, path: getArticleUrl(article.slug) },
            ],
          })}
        />
      )}
      {isPreview && (
        <div className="article-preview-banner">
          Preview mode — {isMobilePreview ? 'Mobile' : 'Desktop'} view
          {article._status !== 'published' && ' (Draft — not live)'}
        </div>
      )}

      <article className="article-detail-v2">
        {isLiveBlog ? (
          <>
            <div className="breadcrumb-v2">
              <Link href="/">Home</Link>
              <span className="breadcrumb-separator">›</span>
              <Link href={`/category/${getCategorySlug(article)}`}>
                {getCategoryTitle(article)}
              </Link>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current" title={article.title}>
                Sensex Live
              </span>
            </div>

            <div className="article-meta-v2">
              <span className="article-meta-badge-v2">{getCategoryTitle(article)}</span>
              <span className="article-meta-live-v2">
                <span className="article-meta-live-dot" aria-hidden="true" />
                Live Blog
              </span>
              <span className="article-meta-time-v2">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" />
                </svg>
                {article.estimatedReadingTimeMinutes || 6} min read
              </span>
            </div>

            <h1 className="article-h1-v2">{article.title}</h1>

            {(summary || article.subtitle) && (
              <p className="article-deck-v2">{summary || article.subtitle}</p>
            )}

            <div className="byline-v2">
              <div className="byline-avatar-v2">
                <img src="/brand-logo.svg" alt="" className="brand-mark-img brand-mark-img--sm" aria-hidden="true" />
              </div>
              <span className="byline-author-v2">
                {article.publisher || (article.author && typeof article.author === 'object' ? article.author.name : null) || 'desk@kuberanow'}
              </span>
              <span className="byline-sep-v2">·</span>
              <span className="byline-date-v2">
                {formatArticleDate(article.publishedAt || article.createdAt)}
              </span>
            </div>

            <div className="article-actions-v2">
              <ShareRow url={shareUrl} title={article.title} />
              <SaveArticleButton articleId={article.id} />
            </div>

            <figure>
              <div className="live-chart-container-v2">
                <div className="chart-info-box">
                  <div className="chart-title-v2">NIFTY 50 · LIVE</div>
                  <div className="chart-rate-box">
                    <div className="chart-rate-val">22,641.30</div>
                    <div className="chart-rate-change">▲ +176.20 (+0.78%)</div>
                  </div>
                </div>
                <div className="chart-svg-wrap">
                  <svg viewBox="0 0 800 400" width="100%" height="100%" style={{ overflow: 'visible' }}>
                    <line x1="50" y1="50" x2="750" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="50" y1="120" x2="750" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="50" y1="190" x2="750" y2="190" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="50" y1="260" x2="750" y2="260" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="50" y1="330" x2="750" y2="330" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <path
                      d="M 50 330 Q 150 320 220 240 T 400 180 T 550 110 T 750 60"
                      fill="none"
                      stroke="var(--ticker-green)"
                      strokeWidth="3.5"
                    />
                    <circle cx="750" cy="60" r="5" fill="var(--ticker-green)" />
                    <circle cx="750" cy="60" r="10" fill="none" stroke="var(--ticker-green)" strokeWidth="1.5" opacity="0.5" />
                  </svg>
                </div>
              </div>
              <figcaption className="chart-caption-v2">
                <span>Nifty 50 Index · Session movement · 9:15 AM to 3:30 PM IST</span>
                <span className="chart-credits-v2">Source: KuberaNow Graphics</span>
              </figcaption>
            </figure>

            <div className="highlights-box-v2">
              <h3 className="highlights-title-v2">Key Highlights</h3>
              <ul className="highlights-list-v2">
                <li className="highlights-item-v2">
                  <span className="highlights-bullet-v2">●</span>
                  <span>Nifty 50 crossed the 23,600 psychological level, closing the session up 0.78%.</span>
                </li>
                <li className="highlights-item-v2">
                  <span className="highlights-bullet-v2">●</span>
                  <span>ICICI Bank Q4 results beat estimates; net profit rose 24% year on year.</span>
                </li>
                <li className="highlights-item-v2">
                  <span className="highlights-bullet-v2">●</span>
                  <span>FIIs recorded net buying for the sixth straight session — ₹4,820 crore today.</span>
                </li>
                <li className="highlights-item-v2">
                  <span className="highlights-bullet-v2">●</span>
                  <span>Banking index at a record high; focus on Q4 earnings and the upcoming RBI policy review.</span>
                </li>
              </ul>
            </div>

            <div className="article-body article-body-v2">
              <RichTextRenderer content={article.content} />
            </div>

            <div className="market-snapshot-box-v2">
              <h4 className="snapshot-title-v2">Today&apos;s Market Snapshot</h4>
              <div className="snapshot-grid-v2">
                <div className="snapshot-card-v2">
                  <div className="snapshot-card-name-v2">Nifty 50</div>
                  <div className="snapshot-card-val-v2">22,641.30</div>
                  <div className="snapshot-card-change-v2 up">
                    <span>▲</span> +176.20 (+0.78%)
                  </div>
                </div>
                <div className="snapshot-card-v2">
                  <div className="snapshot-card-name-v2">Sensex</div>
                  <div className="snapshot-card-val-v2">74,454.10</div>
                  <div className="snapshot-card-change-v2 up">
                    <span>▲</span> +468.50 (+0.63%)
                  </div>
                </div>
                <div className="snapshot-card-v2">
                  <div className="snapshot-card-name-v2">Bank Nifty</div>
                  <div className="snapshot-card-val-v2">48,220.50</div>
                  <div className="snapshot-card-change-v2 down">
                    <span>▼</span> −150.00 (−0.31%)
                  </div>
                </div>
                <div className="snapshot-card-v2">
                  <div className="snapshot-card-name-v2">FII (Net)</div>
                  <div className="snapshot-card-val-v2">₹4,820 Cr</div>
                  <div className="snapshot-card-change-v2 up">Buying (Day 6)</div>
                </div>
              </div>
            </div>

            <blockquote className="pull-quote-v2">
              <span className="pull-quote-mark">“</span>
              <p className="pull-quote-text-v2">
                This rally is not momentum-driven alone — it is backed by fundamentals. Q4 earnings and the RBI&apos;s upcoming
                policy review will define the path ahead.
              </p>
              <cite className="pull-quote-cite-v2">— Nitin Shah, Chief Investment Strategist</cite>
            </blockquote>

            <div className="live-updates-section-v2">
              <div className="live-updates-header-v2">
                <div className="section-title-v2 live-updates-title-v2">
                  <span className="section-title-bar-v2" />
                  <span className="live-badge-v2">LIVE</span>
                  Live Updates
                </div>
                <span className="live-updates-refresh-info">Newest first · Auto-refresh on</span>
              </div>
              <div className="live-updates-list-v2">
                <div className="live-update-card-v2">
                  <div className="live-update-node-v2" />
                  <div className="live-update-meta-v2">
                    <span className="live-update-time-v2">4:48 PM</span>
                    <span className="live-update-sep-v2">·</span>
                    <span className="live-update-date-v2">5 May, 2026</span>
                  </div>
                  <h4 className="live-update-title-v2">Market close: Nifty at 22,641, Sensex at 74,454</h4>
                  <p className="live-update-body-v2">Indian markets closed higher for the fourth straight session.</p>
                </div>
              </div>
            </div>

            <ReactionBar articleId={article.id} initial={article.reactions || {}} />
            <ShareRow url={shareUrl} title={article.title} className="article-share-row-v2" isCopyLink={false} />
          </>
        ) : (
          <ArticlePageSections
            sections={pageLayout.sections}
            pageLayout={pageLayout}
            article={article as ArticleViewModel}
            categoryTitle={categoryTitle}
            categorySlug={categorySlug}
            breadcrumbLabel={article.title}
            shareUrl={shareUrl}
            formatDate={formatArticleDate}
            alsoReadArticles={alsoReadArticles}
            getThumbUrl={getArticleThumbUrl}
          />
        )}
      </article>
    </div>
  )
}
