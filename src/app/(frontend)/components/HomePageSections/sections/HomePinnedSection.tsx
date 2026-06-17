import { NewsCard } from '@/app/(frontend)/components/HomePageSections/articleCard'
import { fetchHomePinnedArticles } from '@/lib/pageLayouts/homePageData'
import { normalizeArticle } from '@/lib/pageLayouts/normalizeArticle'
import type { HomePage } from '@/payload-types'

type Section = Extract<NonNullable<HomePage['mainSections']>[number], { blockType: 'pinnedNews' }>

type Props = {
  section: Section
}

export default async function HomePinnedSection({ section }: Props) {
  const articles = await fetchHomePinnedArticles(section)
  if (articles.length === 0) return null

  const pinnedArticles = articles.map(normalizeArticle)

  return (
    <section>
      <div className="section-header-v2">
        <div className="section-title-v2">
          <span className="section-title-bar-v2" />
          {section.sectionTitle || 'Pinned News'}
        </div>
        {section.showCount !== false ? (
          <span className="sidebar-widget-more-v2">{pinnedArticles.length} pinned</span>
        ) : null}
      </div>
      <div
        className={`grid-4-v2 pinned-stories-grid-v2${
          pinnedArticles.length < 4 ? ` grid-4-v2--${pinnedArticles.length}` : ''
        }`}
      >
        {pinnedArticles.map((article) => (
          <NewsCard key={article.id} article={article} pinned />
        ))}
      </div>
    </section>
  )
}
