import type { CollectionConfig } from 'payload'
import { titleToSlug } from '../lib/slug'
import { getYoutubeId } from '../lib/youtube'
import { articleContentEditor } from '../lib/lexicalEditor'
import { sanitizeLexicalForSave } from '../lib/sanitizeLexicalContent'

function estimateReadingTime(content: unknown): number {
  try {
    const text = JSON.stringify(content)
    const wordCount = text.split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / 200))
  } catch {
    return 1
  }
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Article',
    plural: 'Articles',
  },
  admin: {
    group: 'Articles',
    useAsTitle: 'title',
    defaultColumns: ['title', 'approvalStatus', 'isPinned', '_status', 'publishedAt', 'updatedAt'],
    description:
      'Create and manage news articles. Use Draft/Published status to control live visibility.',
    preview: (doc) => {
      const slug = doc?.slug as string | undefined
      const id = doc?.id as string | undefined
      if (!slug || !id) return null
      const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return `${base}/articles/${encodeURIComponent(slug)}?preview=true&id=${encodeURIComponent(String(id))}`
    },
    components: {
      beforeList: ['./components/admin/ArticleListNav#ArticleListNav'],
      beforeListTable: ['./components/admin/DraftsByCategoryView#DraftsByCategoryView'],
      edit: {
        beforeDocumentControls: ['./components/admin/ArticlePreviewButtons#ArticlePreviewButtons'],
      },
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 8000,
      },
    },
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Always ensure slug is URL-safe (mirrors Sanity slug { source: 'title' })
        if (data.title && (!data.slug || String(data.slug).trim() === '')) {
          data.slug = titleToSlug(String(data.title))
        } else if (data.slug) {
          const normalized = titleToSlug(String(data.slug))
          if (normalized) data.slug = normalized
        }

        if (data.content) {
          data.content = sanitizeLexicalForSave(data.content)
          data.estimatedReadingTimeMinutes = estimateReadingTime(data.content)
        }

        if (data._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }

        // Auto-generate YouTube thumbnail URL from the youtube hyperlink
        const videoUrl = data.youtubeLink as string | undefined
        if (videoUrl) {
          const videoId = getYoutubeId(videoUrl)
          if (videoId) {
            data.youtubeThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          }
        } else {
          data.youtubeThumbnailUrl = null
        }

        // Mirror Sanity "publisher" (read-only, set from the current user)
        if (!data.publisher && req?.user) {
          const user = req.user as { name?: string; email?: string }
          data.publisher = user.name || user.email || null
        }

        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Article Content',
          description: 'Title, subtitle, summary, body, and quotes.',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Article Content (Title)',
              admin: {
                description: 'The main headline of the article.',
              },
            },
            {
              name: 'subtitle',
              type: 'text',
              required: true,
              label: 'Article Content (Subtitle)',
              admin: {
                description: 'Secondary headline displayed below the title.',
              },
            },
            {
              name: 'summary',
              type: 'richText',
              label: 'Article Summary',
              admin: {
                description: 'Optional summary shown in article cards and previews.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              label: 'Article Content',
              editor: articleContentEditor,
              admin: {
                description:
                  'Article body. Use the toolbar to insert images, uploaded videos, or YouTube blocks. You can also paste a YouTube URL on its own line.',
              },
            },
            {
              name: 'quotes',
              type: 'textarea',
              label: 'Quotes',
              admin: {
                description: 'Add a quote (optional).',
                rows: 2,
              },
            },
            {
              name: 'quotesCredits',
              type: 'text',
              label: 'Quotes Credits',
              admin: {
                description: 'Add quotes credits (optional).',
              },
            },
            {
              name: 'articleAudioControl',
              type: 'ui',
              admin: {
                components: {
                  Field: './components/admin/ArticleAudioField#ArticleAudioField',
                },
              },
            },
            {
              name: 'hasArticleAudio',
              type: 'checkbox',
              defaultValue: false,
              admin: { hidden: true },
            },
          ],
        },
        {
          label: 'Title Media & Links',
          description: 'Title photo/video, image carousel, YouTube link, and related article.',
          fields: [
            {
              name: 'image',
              type: 'group',
              label: 'Title Media',
              admin: {
                description:
                  'Add a hero image, an uploaded video, or both. You can also add a YouTube link separately below.',
              },
              fields: [
                {
                  name: 'imageAsset',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Hero Image',
                  admin: {
                    description: 'Main photo shown at the top of the article.',
                  },
                },
                {
                  name: 'videoFile',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Uploaded Video',
                  admin: {
                    description: 'MP4/WebM video file for this article (can be used alongside the hero image).',
                  },
                },
                {
                  name: 'videoPoster',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Video Poster Image',
                  admin: {
                    description: 'Optional thumbnail shown before the uploaded video plays.',
                  },
                },
              ],
            },
            {
              name: 'imageCredits',
              type: 'text',
              label: 'Image Credits',
              admin: {
                description: 'Add image credits (optional).',
              },
            },
            {
              name: 'showCarousel',
              type: 'checkbox',
              label: 'Show Article Photo Carousel',
              defaultValue: true,
              admin: {
                description:
                  'Toggle to show or hide the photo gallery/carousel on the article page.',
              },
            },
            {
              name: 'carouselImages',
              type: 'array',
              label: 'Article Photo Carousel',
              admin: {
                description:
                  'Add multiple images to display as a slider/carousel inside this specific article.',
                initCollapsed: true,
                condition: (data) => Boolean(data?.showCarousel),
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  label: 'Image Caption',
                  admin: {
                    description: 'Caption or description for this specific carousel slide.',
                  },
                },
                {
                  name: 'altText',
                  type: 'text',
                  label: 'Alternative Text (SEO)',
                  admin: {
                    description: 'Important for accessibility and SEO describing the image.',
                  },
                },
              ],
            },
            {
              name: 'youtubeLink',
              type: 'text',
              label: 'YouTube Video Hyperlink',
              admin: {
                description:
                  'Paste a YouTube URL. Thumbnail preview displays at 9:16 ratio (1080×1920).',
                components: {
                  Field: './components/admin/YouTubeUrlField#YouTubeUrlField',
                },
              },
            },
            {
              name: 'youtubeThumbnailUrl',
              type: 'text',
              admin: {
                hidden: true,
                readOnly: true,
              },
            },
            {
              name: 'articleHyperlink',
              type: 'relationship',
              relationTo: 'articles',
              hasMany: true,
              label: 'Article Hyperlink (Also Read)',
              admin: {
                description:
                  'Select one or more articles to display in the "Also Read" section.',
              },
              filterOptions: ({ id }) => ({
                id: {
                  not_equals: id,
                },
              }),
            },
          ],
        },
        {
          label: 'Classification',
          description: 'Categories and tags for organizing articles.',
          fields: [
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              required: true,
              minRows: 1,
              label: 'Categories',
              admin: {
                description: 'Select one or more categories for this article.',
              },
            },
            {
              name: 'tags',
              type: 'text',
              hasMany: true,
              label: 'Tags',
              admin: {
                description: 'Add tags in a news article (optional).',
              },
            },
          ],
        },
        {
          label: 'Pinning',
          description: 'Pin articles on specific pages.',
          fields: [
            {
              name: 'isPinned',
              type: 'checkbox',
              label: 'Pin Article',
              defaultValue: false,
              admin: {
                description: 'Enable to mark this article as eligible for pinning.',
              },
            },
            {
              name: 'pinnedPage',
              type: 'select',
              label: 'Pin article on a particular page',
              options: [
                { label: 'Home Page', value: 'home' },
                { label: 'Trending Section', value: 'trending' },
                { label: 'Category Top', value: 'category_top' },
              ],
              admin: {
                description: 'Select which page view this article should stick to.',
                condition: (data) => Boolean(data?.isPinned),
              },
            },
          ],
        },
      ],
    },
    // Sidebar fields
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: {
        position: 'sidebar',
        description:
          'URL-friendly identifier. Auto-generated from title. Saved as lowercase with hyphens.',
      },
    },
    {
      name: 'approvalStatus',
      type: 'select',
      label: 'Verify & Approve Status',
      defaultValue: 'pending',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Disapproved', value: 'disapproved' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publisher',
      type: 'text',
      label: 'Publisher',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Automatically set to the user who created the article.',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        description: 'The author of this article.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Schedule Article Publication',
      admin: {
        position: 'sidebar',
        description:
          'Pick a date/time to schedule, or leave it for instant action. Auto-set when first published.',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Automatically tracked view count.',
        position: 'sidebar',
      },
    },
    {
      name: 'estimatedReadingTimeMinutes',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Auto-calculated from content length.',
        position: 'sidebar',
      },
    },
    {
      name: 'reactions',
      type: 'group',
      admin: {
        description: 'Reader reaction counts.',
        position: 'sidebar',
      },
      fields: [
        { name: 'like', type: 'number', defaultValue: 0 },
        { name: 'insightful', type: 'number', defaultValue: 0 },
        { name: 'sad', type: 'number', defaultValue: 0 },
        { name: 'happy', type: 'number', defaultValue: 0 },
        { name: 'angry', type: 'number', defaultValue: 0 },
      ],
    },
  ],
}
