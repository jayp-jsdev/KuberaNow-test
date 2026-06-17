import '../NewsCardGrid/NewsCardGrid.css'
import './TrendingNews.css'
import Link from 'next/link'
import { getArticleUrl } from '@/lib/slug'
import type { TrendingArticleItem } from '@/lib/trending/fetchTrending'
import OptimizedImage from '../OptimizedImage/OptimizedImage'

type Props = {
  articles?: TrendingArticleItem[]
  title?: string
}

function renderThumb(image: string | null, title: string) {
  if (image) {
    return (
      <OptimizedImage
        src={image}
        alt={title}
        className="trending-thumb-v2"
        width={72}
        height={54}
        sizes="72px"
        fetchPriority="low"
      />
    )
  }
  return (
    <div className="trending-thumb-v2 trending-thumb-placeholder-v2" aria-hidden="true">
      KN
    </div>
  )
}

export default function TrendingNews({ articles = [], title = 'Trending' }: Props) {
  if (!articles?.length) return null

  return (
    <section className="trending-section-v2">
      <div className="section-header-v2">
        <div className="section-title-v2">
          <span className="section-title-bar-v2" />
          {title}
        </div>
      </div>
      <div className="trending-list-v2">
        {articles.map((article, index) => (
          <Link href={getArticleUrl(article.slug)} className="trending-item-v2" key={article.id}>
            <span className="trending-num-v2">{index + 1}</span>
            {renderThumb(article.image, article.title)}
            <span className="trending-title-v2">{article.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
