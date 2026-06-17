import RichTextRenderer from '@/app/(frontend)/components/RichTextRenderer/RichTextRenderer'
import HomePhotoCarousel, {
  type CarouselSlide,
} from '@/app/(frontend)/components/HomePhotoCarousel/HomePhotoCarousel'
import NativeVideoPlayer from '@/app/(frontend)/components/NativeVideoPlayer/NativeVideoPlayer'
import OptimizedImage from '@/app/(frontend)/components/OptimizedImage/OptimizedImage'
import ShareRow from '@/app/(frontend)/components/ShareRow/ShareRow'
import SaveArticleButton from '@/app/(frontend)/components/auth/SaveArticleButton/SaveArticleButton'
import YouTubeVideoPlayer from '@/app/(frontend)/components/YouTubeVideoPlayer/YouTubeVideoPlayer'
import ArticleAudioPlayer from '@/app/(frontend)/components/ArticleAudioPlayer/ArticleAudioPlayer'
import {
  isDisplaySectionOn,
  resolveArticleDisplayOrder,
  type ArticleDisplaySectionType,
} from '@/lib/articles/displaySections'
import {
  getArticleHeroImageUrl,
  getArticleLocalVideoMimeType,
  getArticleLocalVideoUrl,
  getArticleVideoPosterUrl,
  getArticleYoutubeId,
  getArticleYoutubeUrl,
  getSummaryText,
  hasUploadedTitleVideo,
} from '@/lib/display'
import { getMediaUrl } from '@/lib/carousel'
import { getYoutubeThumbnailUrl } from '@/lib/youtube'
import { getArticleAudioUrl } from '@/lib/articleAudio'
import type { ArticlePageLayoutData } from '@/lib/pageLayouts/fetchArticlePageLayout'
import type { ArticleDisplay } from '@/lib/display'

type CarouselImage = {
  image?: { url?: string } | string | null
  caption?: string | null
  altText?: string | null
}

export type ArticleViewModel = ArticleDisplay & {
  id: string
  title: string
  subtitle?: string | null
  content: unknown
  imageCredits?: string | null
  quotes?: string | null
  quotesCredits?: string | null
  showCarousel?: boolean | null
  carouselImages?: CarouselImage[] | null
  publisher?: string | null
  author?: { name?: string; email?: string } | string | null
  publishedAt?: string | null
  createdAt: string
  estimatedReadingTimeMinutes?: number | null
  reactions?: Record<string, number> | null
  tags?: Array<{ id: string; title: string } | string> | null
  hasArticleAudio?: boolean | null
}

type Props = {
  article: ArticleViewModel
  pageLayout: ArticlePageLayoutData
  shareUrl: string
  formatDate: (date: string | null) => string
  showShareTop?: boolean
}

function buildCarouselSlides(article: ArticleViewModel): CarouselSlide[] {
  if (article.showCarousel === false) return []
  const images = (article.carouselImages ?? []) as CarouselImage[]
  return images
    .map((item, index): CarouselSlide | null => {
      if (!item) return null
      const imageUrl = getMediaUrl(item.image)
      if (!imageUrl) return null
      return {
        id: `article-carousel-${index}`,
        imageUrl,
        href: '#',
        title: item.caption || undefined,
        altText: item.altText || article.title,
      }
    })
    .filter((slide): slide is CarouselSlide => slide !== null)
}

function renderHeroImage(article: ArticleViewModel, priority = false) {
  const heroImage = getArticleHeroImageUrl(article)
  if (!heroImage) return null
  return (
    <figure className="article-hero-figure-v2">
      <OptimizedImage
        src={heroImage}
        alt={article.title}
        className="article-hero-v2"
        width={1200}
        height={675}
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 956px"
      />
      {article.imageCredits ? (
        <figcaption className="article-hero-caption-v2">{article.imageCredits}</figcaption>
      ) : null}
    </figure>
  )
}

function renderHeroVideo(article: ArticleViewModel) {
  const videoUrl = getArticleLocalVideoUrl(article)
  if (!videoUrl) return null
  return (
    <NativeVideoPlayer
      src={videoUrl}
      poster={getArticleVideoPosterUrl(article)}
      mimeType={getArticleLocalVideoMimeType(article)}
      title={article.title}
    />
  )
}

function renderYoutube(article: ArticleViewModel) {
  const youtubeId = getArticleYoutubeId(article)
  if (!youtubeId) return null
  const youtubeThumb =
    article.youtubeThumbnailUrl || getYoutubeThumbnailUrl(youtubeId)
  return (
    <YouTubeVideoPlayer
      videoId={youtubeId}
      thumbnailUrl={youtubeThumb || undefined}
      videoUrl={getArticleYoutubeUrl(article) || undefined}
      title={article.title}
      variant="auto"
    />
  )
}

function renderSection(
  type: ArticleDisplaySectionType,
  article: ArticleViewModel,
  props: Props,
) {
  const summary = getSummaryText(article)

  switch (type) {
    case 'title':
      return <h1 className="article-h1-v2">{article.title}</h1>

    case 'subtitle':
      if (!article.subtitle) return null
      return <p className="article-deck-v2 article-deck-v2--subtitle">{article.subtitle}</p>

    case 'summary':
      if (!summary) return null
      return <p className="article-deck-v2">{summary}</p>

    case 'byline':
      return (
        <div className="byline-v2">
          <div className="byline-avatar-v2">
            <img
              src="/brand-logo.svg"
              alt=""
              className="brand-mark-img brand-mark-img--sm"
              aria-hidden="true"
            />
          </div>
          <span className="byline-author-v2">
            {article.publisher ||
              (article.author && typeof article.author === 'object'
                ? article.author.name
                : null) ||
              'desk@kuberanow'}
          </span>
          <span className="byline-sep-v2">·</span>
          <span className="byline-date-v2">
            {props.formatDate(article.publishedAt || article.createdAt)}
          </span>
        </div>
      )

    case 'shareActions':
      return (
        <div className="article-actions-v2">
          {props.showShareTop !== false ? (
            <ShareRow url={props.shareUrl} title={article.title} />
          ) : null}
          <SaveArticleButton articleId={article.id} />
        </div>
      )

    case 'articleAudio': {
      const audioUrl = getArticleAudioUrl(article)
      if (!audioUrl) return null
      return <ArticleAudioPlayer src={audioUrl} title={article.title} />
    }

    case 'heroImage':
      return renderHeroImage(article, true)

    case 'heroVideo':
      if (!hasUploadedTitleVideo(article)) return null
      return <div className="article-media-hero-v2">{renderHeroVideo(article)}</div>

    case 'youtubeVideo':
      if (!getArticleYoutubeId(article)) return null
      return <div className="article-media-hero-v2">{renderYoutube(article)}</div>

    case 'photoCarousel': {
      const slides = buildCarouselSlides(article)
      if (slides.length === 0) return null
      return (
        <div className="home-carousel-wrap article-inline-carousel-v2">
          <HomePhotoCarousel slides={slides} />
        </div>
      )
    }

    case 'quotes':
      if (!article.quotes?.trim()) return null
      return (
        <blockquote className="pull-quote-v2">
          <span className="pull-quote-mark">“</span>
          <p className="pull-quote-text-v2">{article.quotes}</p>
          {article.quotesCredits ? (
            <cite className="pull-quote-cite-v2">— {article.quotesCredits}</cite>
          ) : null}
        </blockquote>
      )

    case 'body':
      return (
        <div className="article-body article-body-v2">
          <RichTextRenderer content={article.content} />
        </div>
      )

    default:
      return null
  }
}

export default function ArticleDisplaySections(props: Props) {
  const sections = resolveArticleDisplayOrder(props.pageLayout.displayOrder)

  return (
    <>
      {sections.map((section, index) => {
        if (!section.enabled) return null
        const content = renderSection(section.blockType, props.article, props)
        if (!content) return null
        return <div key={`${section.blockType}-${index}`}>{content}</div>
      })}
    </>
  )
}

export { isDisplaySectionOn, resolveArticleDisplayOrder }
