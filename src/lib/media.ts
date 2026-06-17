export type MediaDoc = {
  url?: string | null
  alt?: string | null
  mimeType?: string | null
  filename?: string | null
  filesize?: number | null
  mediaKind?: 'image' | 'video' | null
}

const VIDEO_MIME_PREFIXES = ['video/']

export function isVideoMimeType(mimeType?: string | null): boolean {
  if (!mimeType) return false
  return VIDEO_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))
}

export function resolveMediaDoc(media: MediaDoc | string | null | undefined): MediaDoc | null {
  if (!media || typeof media !== 'object') return null
  return media
}

export function buildMediaFileUrl(filename?: string | null): string | null {
  if (!filename) return null
  return `/api/media/file/${encodeURIComponent(filename)}`
}

export function resolveMediaUrl(media: MediaDoc | string | null | undefined): string | null {
  const doc = resolveMediaDoc(media)
  if (!doc) return null
  if (doc.url) {
    if (doc.url.startsWith('http')) {
      try {
        return new URL(doc.url).pathname
      } catch {
        return doc.url
      }
    }
    return doc.url
  }
  return buildMediaFileUrl(doc.filename)
}

export function resolveMediaMimeType(media: MediaDoc | string | null | undefined): string | null {
  const doc = resolveMediaDoc(media)
  return doc?.mimeType || null
}

export function isVideoMedia(media: MediaDoc | string | null | undefined): boolean {
  const doc = resolveMediaDoc(media)
  if (!doc) return false
  if (doc.mediaKind === 'video') return true
  return isVideoMimeType(doc.mimeType)
}
