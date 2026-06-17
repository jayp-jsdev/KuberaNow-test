import type { MongooseAdapter } from '@payloadcms/db-mongodb'
import type { Payload } from 'payload'
import {
  createStoredVideoName,
  getVideoDiskPath,
  getVideoFileStat,
  legacyStoredVideoName,
  videoExistsOnDisk,
  writeVideoToDisk,
} from './mediaStorage'

type MediaFileRecord = {
  _id?: unknown
  filename?: string
  imageData?: { v?: string }
  mimeType?: string
  filesize?: number
  storedPath?: string
  mediaKind?: string
}

export type MediaFileSource =
  | { type: 'disk'; path: string; mimeType: string; size: number }
  | { type: 'buffer'; buffer: Buffer; mimeType: string }

function getMediaCollection(payload: Payload) {
  const adapter = payload.db as unknown as MongooseAdapter
  return adapter.collections?.media?.collection ?? adapter.connection?.collection('media')
}

function decodeBase64Payload(rawData: string): { buffer: Buffer; mimeType: string } | null {
  const commaIndex = rawData.indexOf(',')
  if (commaIndex === -1) return null

  const mimeType = rawData.substring(0, commaIndex).replace('data:', '').replace(';base64', '')
  const base64 = rawData.substring(commaIndex + 1)
  return { buffer: Buffer.from(base64, 'base64'), mimeType }
}

async function migrateLegacyVideoToDisk(
  payload: Payload,
  doc: MediaFileRecord,
  filename: string,
  buffer: Buffer,
): Promise<string | null> {
  const collection = getMediaCollection(payload)
  if (!collection || !doc._id) return null

  const storedPath = doc.storedPath || legacyStoredVideoName(filename)
  if (!videoExistsOnDisk(storedPath)) {
    await writeVideoToDisk(storedPath, buffer)
  }

  await collection.updateOne(
    { _id: doc._id },
    { $set: { storedPath, filesize: buffer.length }, $unset: { imageData: '' } },
  )

  return storedPath
}

export type MediaUrlDoc = {
  id: string
  url?: string | null
  filename?: string | null
}

function mapMediaDoc(id: string, doc: { url?: string | null; filename?: string | null }): MediaUrlDoc {
  return { id, url: doc.url, filename: doc.filename }
}

/** Load public media URLs by ID — never reads imageData buffers. */
export async function batchMediaUrlsByIds(
  payload: Payload,
  ids: string[],
): Promise<Map<string, MediaUrlDoc>> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return new Map()

  const collection = getMediaCollection(payload)
  if (!collection) return new Map()

  const { ObjectId } = await import('mongodb')
  const objectIds = unique.flatMap((id) => {
    try {
      return [new ObjectId(id)]
    } catch {
      return []
    }
  })

  if (objectIds.length === 0) return new Map()

  const docs = (await collection
    .find({ _id: { $in: objectIds } }, { projection: { url: 1, filename: 1 } })
    .toArray()) as Array<{ _id: unknown; url?: string | null; filename?: string | null }>

  const result = new Map<string, MediaUrlDoc>()
  for (const doc of docs) {
    const id = String(doc._id)
    result.set(id, mapMediaDoc(id, doc))
  }

  return result
}

/** Load category labels for card views. */
export async function batchCategoryLabels(
  payload: Payload,
  ids: string[],
): Promise<Map<string, { id: string; title?: string | null; slug?: string | null }>> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return new Map()

  const result = await payload.find({
    collection: 'categories',
    where: { id: { in: unique } },
    depth: 0,
    select: {
      title: true,
      slug: true,
    },
    limit: unique.length,
  })

  return new Map(
    (result.docs ?? []).map((category) => [
      String(category.id),
      {
        id: String(category.id),
        title: category.title,
        slug: category.slug,
      },
    ]),
  )
}

/** Batch-load small image data URIs in one Mongo query (avoids N HTTP round-trips). */
export async function batchMediaDataUrls(
  payload: Payload,
  filenames: string[],
): Promise<Record<string, string>> {
  const unique = [...new Set(filenames.filter(Boolean))]
  if (!unique.length) return {}

  const collection = getMediaCollection(payload)
  if (!collection) return {}

  const docs = (await collection
    .find(
      { filename: { $in: unique } },
      { projection: { filename: 1, imageData: 1, mimeType: 1, mediaKind: 1 } },
    )
    .toArray()) as MediaFileRecord[]

  const result: Record<string, string> = {}

  for (const doc of docs) {
    const filename = typeof doc.filename === 'string' ? doc.filename : null
    if (!filename) continue

    const rawData = doc.imageData?.v
    if (rawData) {
      result[filename] = rawData
    }
  }

  return result
}

/** Resolve file bytes for serving — videos stream from disk when possible. */
export async function resolveMediaFileSource(
  payload: Payload,
  filename: string,
): Promise<MediaFileSource | null> {
  const collection = getMediaCollection(payload)
  if (!collection) return null

  const doc = (await collection.findOne(
    { filename },
    { projection: { imageData: 1, mimeType: 1, filesize: 1, storedPath: 1, mediaKind: 1 } },
  )) as MediaFileRecord | null

  if (!doc) return null

  const mimeType = doc.mimeType || 'application/octet-stream'
  const isVideo = doc.mediaKind === 'video' || mimeType.startsWith('video/')

  if (isVideo && doc.storedPath && videoExistsOnDisk(doc.storedPath)) {
    const stat = getVideoFileStat(doc.storedPath)
    if (stat) {
      return {
        type: 'disk',
        path: getVideoDiskPath(doc.storedPath),
        mimeType,
        size: stat.size,
      }
    }
  }

  const rawData = doc.imageData?.v
  if (!rawData) return null

  const decoded = decodeBase64Payload(rawData)
  if (!decoded) return null

  if (isVideo) {
    const storedPath = await migrateLegacyVideoToDisk(payload, doc, filename, decoded.buffer)
    if (storedPath && videoExistsOnDisk(storedPath)) {
      const stat = getVideoFileStat(storedPath)
      if (stat) {
        return {
          type: 'disk',
          path: getVideoDiskPath(storedPath),
          mimeType: doc.mimeType || decoded.mimeType,
          size: stat.size,
        }
      }
    }
  }

  return {
    type: 'buffer',
    buffer: decoded.buffer,
    mimeType: doc.mimeType || decoded.mimeType,
  }
}

/** Read file bytes via Mongo projection — used for images and legacy fallbacks. */
export async function readMediaFileByFilename(
  payload: Payload,
  filename: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const source = await resolveMediaFileSource(payload, filename)
  if (!source) return null

  if (source.type === 'buffer') {
    return { buffer: source.buffer, mimeType: source.mimeType }
  }

  const { readFile } = await import('fs/promises')
  const buffer = await readFile(source.path)
  return { buffer, mimeType: source.mimeType }
}

export { createStoredVideoName }
