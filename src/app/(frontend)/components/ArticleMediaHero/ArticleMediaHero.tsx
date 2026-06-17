import NativeVideoPlayer from '../NativeVideoPlayer/NativeVideoPlayer'
import OptimizedImage from '../OptimizedImage/OptimizedImage'
import YouTubeVideoPlayer from '../YouTubeVideoPlayer/YouTubeVideoPlayer'
import {
  getArticleHeroImageUrl,
  getArticleLocalVideoMimeType,
  getArticleLocalVideoUrl,
  getArticleVideoPosterUrl,
  getArticleYoutubeId,
  getArticleYoutubeUrl,
  hasUploadedTitleVideo,
  type ArticleDisplay,
} from '@/lib/display'
import { getYoutubeThumbnailUrl } from '@/lib/youtube'

type Props = {
  article: ArticleDisplay & { title: string; imageCredits?: string | null }
  priority?: boolean
}

export default function ArticleMediaHero({ article, priority = false }: Props) {
  const heroImage = getArticleHeroImageUrl(article)
  const videoUrl = getArticleLocalVideoUrl(article)
  const videoMime = getArticleLocalVideoMimeType(article)
  const videoPoster = getArticleVideoPosterUrl(article)
  const youtubeId = getArticleYoutubeId(article)
  const youtubeUrl = getArticleYoutubeUrl(article) || undefined
  const youtubeThumb =
    article.youtubeThumbnailUrl ||
    (youtubeId ? getYoutubeThumbnailUrl(youtubeId) : null)

  const hasMedia = heroImage || hasUploadedTitleVideo(article) || youtubeId
  if (!hasMedia) return null

  return (
    <div className="article-media-hero-v2">
      {heroImage && (
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
          {article.imageCredits && (
            <figcaption className="article-hero-caption-v2">{article.imageCredits}</figcaption>
          )}
        </figure>
      )}

      {videoUrl && (
        <NativeVideoPlayer
          src={videoUrl}
          poster={videoPoster}
          mimeType={videoMime}
          title={article.title}
        />
      )}

      {youtubeId && (
        <YouTubeVideoPlayer
          videoId={youtubeId}
          thumbnailUrl={youtubeThumb || undefined}
          videoUrl={youtubeUrl}
          title={article.title}
          variant="auto"
        />
      )}
    </div>
  )
}
