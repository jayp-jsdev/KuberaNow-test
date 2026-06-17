import {
  BlocksFeature,
  lexicalEditor,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import {
  contentImageBlock,
  contentVideoBlock,
  contentYoutubeBlock,
} from '@/blocks/articleContentBlocks'

/** Rich text editor for article body — supports inline images, videos, and YouTube blocks. */
export const articleContentEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    UploadFeature({
      enabledCollections: ['media'],
      maxDepth: 1,
    }),
    BlocksFeature({
      blocks: [contentImageBlock, contentVideoBlock, contentYoutubeBlock],
    }),
  ],
})
