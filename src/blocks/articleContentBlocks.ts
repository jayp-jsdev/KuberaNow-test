import type { Block } from 'payload'

export const contentImageBlock: Block = {
  slug: 'contentImage',
  labels: {
    singular: 'Image',
    plural: 'Images',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Image',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description: 'Optional caption shown below the image.',
      },
    },
  ],
}

export const contentVideoBlock: Block = {
  slug: 'contentVideo',
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  fields: [
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Video File',
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      label: 'Poster Image',
      admin: {
        description: 'Optional thumbnail shown before the video plays.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
    },
  ],
}

export const contentYoutubeBlock: Block = {
  slug: 'contentYoutube',
  labels: {
    singular: 'YouTube Video',
    plural: 'YouTube Videos',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'YouTube URL',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
    },
  ],
}
