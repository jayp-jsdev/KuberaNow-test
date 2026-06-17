import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  // Never return base64 buffers when media is populated as a relationship.
  defaultPopulate: {
    imageData: false,
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  // Disable Payload's built-in filesystem upload so no files are written to disk.
  // This is required for serverless deployments (Netlify, Vercel, etc.)
  upload: {
    disableLocalStorage: true,
  },
  hooks: {
    // beforeChange fires AFTER Payload has parsed the multipart request,
    // so req.file is fully available here with the file buffer.
    beforeChange: [
      async ({ data, req, operation }) => {
        if ((operation === 'create' || operation === 'update') && req.file) {
          const file = req.file

          // Convert the file buffer to a Base64 data-URI.
          // Stored inside a JSON field (no character limit) as { v: "data:..." }
          const base64 = Buffer.from(file.data).toString('base64')
          const dataURI = `data:${file.mimetype};base64,${base64}`

          // json field — wrap in an object so Payload stores it correctly
          data.imageData = { v: dataURI }
          data.mimeType = file.mimetype
          data.filesize = file.size
          data.filename = file.name
          // URL pointing to our custom serving endpoint
          data.url = `/api/media/file/${encodeURIComponent(file.name)}`
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      // Stores full Base64 data-URI as a JSON object: { v: "data:<mime>;base64,..." }
      // Using json type because it has NO character limit, unlike textarea (40k cap).
      name: 'imageData',
      type: 'json',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'mimeType',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'filesize',
      type: 'number',
      admin: { hidden: true },
    },
    {
      name: 'filename',
      type: 'text',
      admin: { hidden: true },
    },
  ],
}
