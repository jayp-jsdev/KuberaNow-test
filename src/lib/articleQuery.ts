/** Fields to omit when articles are populated as relationships (e.g. saved articles). */
export const articleCardPopulate = {
  content: false,
  carouselImages: false,
} as const

/** Fields required by home/category list cards and trending thumbnails. */
export const articleCardSelect = {
  title: true,
  slug: true,
  subtitle: true,
  summary: true,
  publishedAt: true,
  createdAt: true,
  categories: true,
  image: {
    imageAsset: true,
    videoPoster: true,
  },
  youtubeLink: true,
  youtubeThumbnailUrl: true,
  viewCount: true,
  _status: true,
} as const

/** Lightweight queries for list/card views — only card-display fields. */
export const articleCardFindOptions = {
  depth: 0,
  select: articleCardSelect,
} as const

/** Full fetch for article detail pages. */
export const articleDetailFindOptions = {
  depth: 1,
} as const
