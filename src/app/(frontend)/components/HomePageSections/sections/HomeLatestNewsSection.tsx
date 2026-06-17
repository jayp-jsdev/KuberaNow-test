import HeadlinesPagination from '@/app/(frontend)/components/HeadlinesPagination/HeadlinesPagination'
import { NewsCard } from '@/app/(frontend)/components/HomePageSections/articleCard'
import { fetchHomeLatestNews } from '@/lib/pageLayouts/homePageData'
import { normalizeArticle } from '@/lib/pageLayouts/normalizeArticle'
import type { HomePage } from '@/payload-types'

type Section = Extract<NonNullable<HomePage['mainSections']>[number], { blockType: 'latestNews' }>

type Props = {
  section: Section
  currentPage: number
  pinnedIds: string[]
}

export default async function HomeLatestNewsSection({
  section,
  currentPage,
  pinnedIds,
}: Props) {
  const perPage = section.perPage ?? 10
  const { articles, totalPages } = await fetchHomeLatestNews(currentPage, perPage, pinnedIds)
  const latestNewsArticles = articles.map(normalizeArticle)

  return (
    <section>
      <div className="section-header-v2">
        <div className="section-title-v2">
          <span className="section-title-bar-v2" />
          {section.sectionTitle || 'Latest news'}
        </div>
      </div>
      <section id="latest-headlines" className="home-news-feed-v2">
        <div className="home-news-columns-v2">
          {latestNewsArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
        <HeadlinesPagination currentPage={currentPage} totalPages={totalPages} />
      </section>
    </section>
  )
}
