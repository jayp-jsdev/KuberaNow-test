import type { Block } from 'payload'
import { sectionEnabledField } from './sharedSectionFields'

const displayBlock = (
  slug: string,
  singular: string,
  description: string,
): Block => ({
  slug,
  labels: { singular, plural: singular },
  admin: {
    disableBlockName: true,
  },
  fields: [
    sectionEnabledField,
    {
      name: 'info',
      type: 'text',
      label: 'Content',
      defaultValue: description,
      admin: { readOnly: true },
    },
  ],
})

export const articleDisplayBlocks = [
  displayBlock('title', 'Title', 'Article headline'),
  displayBlock('subtitle', 'Subtitle', 'Secondary headline below the title'),
  displayBlock('summary', 'Summary', 'Rich-text summary / description'),
  displayBlock('byline', 'Byline', 'Author and publish date'),
  displayBlock('shareActions', 'Share & Save', 'Top share row and save button'),
  displayBlock('articleAudio', 'Article Audio', 'Listen to article audio player'),
  displayBlock('heroImage', 'Hero Image', 'Main title image with credits'),
  displayBlock('heroVideo', 'Uploaded Video', 'MP4/WebM video from Title Media'),
  displayBlock('youtubeVideo', 'YouTube Video', 'Embedded YouTube player'),
  displayBlock('photoCarousel', 'Photo Carousel', 'In-article image gallery'),
  displayBlock('quotes', 'Quotes', 'Pull quote and attribution'),
  displayBlock('body', 'Article Body', 'Main rich-text content'),
]
