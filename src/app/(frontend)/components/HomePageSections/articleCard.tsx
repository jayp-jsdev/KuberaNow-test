import Link from 'next/link'
import { getArticleUrl } from '@/lib/slug'
import type { NormalizedArticle } from '@/lib/pageLayouts/normalizeArticle'
import OptimizedImage from '@/app/(frontend)/components/OptimizedImage/OptimizedImage'

export function renderArticleImage(
  imageUrl: string | null,
  title: string,
  className: string,
  priority = false,
) {
  if (imageUrl) {
    return (
      <OptimizedImage
        src={imageUrl}
        alt={title}
        className={className}
        width={640}
        height={400}
        sizes="(max-width: 768px) 50vw, 25vw"
        priority={priority}
        fetchPriority={priority ? 'high' : 'low'}
      />
    )
  }

  return (
    <div
      className={`${className}-placeholder`}
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #fcefe9, #f5e2c7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Lora, serif',
        fontSize: '20px',
        color: 'var(--primary)',
        fontWeight: 700,
      }}
    >
      KuberaNow
    </div>
  )
}

export function NewsCard({
  article,
  pinned = false,
  priority = false,
}: {
  article: NormalizedArticle
  pinned?: boolean
  priority?: boolean
}) {
  return (
    <div className={`grid-card-v2${pinned ? ' grid-card-v2--pinned' : ''}`}>
      <div className="grid-card-img-wrap">
        {renderArticleImage(article.imageUrl, article.title, 'grid-card-img', priority)}
        {pinned ? <span className="grid-card-pin-badge">Pinned</span> : null}
      </div>
      <div className="grid-card-body">
        <span className="grid-card-badge">{article.category}</span>
        <h4 className="grid-card-title">
          <Link href={getArticleUrl(article.slug)}>{article.title}</Link>
        </h4>
        <p className="grid-card-excerpt">{article.excerpt}</p>
        <div className="grid-card-date">{article.publishedAt?.split('·')[0]?.trim() ?? ''}</div>
      </div>
    </div>
  )
}
