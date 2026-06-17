import type { Block } from 'payload'
import { adSlotFields } from '@/lib/adSlotFields'
import {
  carouselPhotoFields,
  sectionEnabledField,
  sectionTitleField,
} from './sharedSectionFields'

export const homeLeaderboardAdBlock: Block = {
  slug: 'leaderboardAd',
  labels: {
    singular: 'Top Leaderboard Ad',
    plural: 'Top Leaderboard Ads',
  },
  fields: [
    sectionEnabledField,
    {
      name: 'ad',
      type: 'group',
      label: 'Leaderboard Ad (728 × 90)',
      fields: adSlotFields(),
    },
  ],
}

export const homePhotoCarouselBlock: Block = {
  slug: 'photoCarousel',
  labels: {
    singular: 'Photo Carousel',
    plural: 'Photo Carousels',
  },
  fields: [
    sectionEnabledField,
    {
      name: 'photos',
      type: 'array',
      label: 'Carousel Slides',
      maxRows: 4,
      admin: {
        description:
          'Add, edit, reorder, or remove slides. If empty, the site falls back to the latest published articles.',
        initCollapsed: false,
        components: {
          RowLabel: '@/components/admin/CarouselSlideRowLabel#CarouselSlideRowLabel',
        },
      },
      fields: carouselPhotoFields,
    },
  ],
}

export const homePinnedNewsBlock: Block = {
  slug: 'pinnedNews',
  labels: {
    singular: 'Pinned News',
    plural: 'Pinned News',
  },
  fields: [
    sectionEnabledField,
    sectionTitleField('Pinned News'),
    {
      name: 'showCount',
      type: 'checkbox',
      label: 'Show Pinned Count',
      defaultValue: true,
    },
    {
      name: 'pinnedItems',
      type: 'array',
      label: 'Pinned Articles',
      maxRows: 4,
      admin: {
        description: 'Add, edit, reorder, or remove pinned articles. Maximum 4.',
        initCollapsed: false,
        components: {
          RowLabel: '@/components/admin/PinnedArticleRowLabel#PinnedArticleRowLabel',
        },
      },
      fields: [
        {
          name: 'article',
          type: 'relationship',
          relationTo: 'articles',
          label: 'Article',
          required: true,
          filterOptions: {
            _status: {
              equals: 'published',
            },
          },
        },
      ],
    },
  ],
}

export const homeTrendingNewsBlock: Block = {
  slug: 'trendingNews',
  labels: {
    singular: 'Trending News',
    plural: 'Trending News',
  },
  fields: [
    sectionEnabledField,
    sectionTitleField('Trending'),
    {
      name: 'limit',
      type: 'number',
      label: 'Number of Articles',
      defaultValue: 5,
      min: 1,
      max: 10,
      required: true,
    },
  ],
}

export const homeLatestNewsBlock: Block = {
  slug: 'latestNews',
  labels: {
    singular: 'Latest News',
    plural: 'Latest News',
  },
  fields: [
    sectionEnabledField,
    sectionTitleField('Latest news'),
    {
      name: 'perPage',
      type: 'number',
      label: 'Articles Per Page',
      defaultValue: 10,
      min: 4,
      max: 24,
      required: true,
    },
  ],
}

export const homePageBlocks = [
  homeLeaderboardAdBlock,
  homePhotoCarouselBlock,
  homePinnedNewsBlock,
  homeTrendingNewsBlock,
  homeLatestNewsBlock,
]
