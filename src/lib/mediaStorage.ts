import { createHash, randomUUID } from 'crypto'
import { createWriteStream, existsSync, mkdirSync, statSync } from 'fs'
import path from 'path'

const VIDEOS_DIR = path.join(process.cwd(), 'media', 'videos')

export function ensureVideosDir(): void {
  if (!existsSync(VIDEOS_DIR)) {
    mkdirSync(VIDEOS_DIR, { recursive: true })
  }
}

export function getVideoDiskPath(storedName: string): string {
  const safe = path.basename(storedName)
  return path.join(VIDEOS_DIR, safe)
}

export function createStoredVideoName(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase() || '.mp4'
  return `${randomUUID()}${ext}`
}

export async function writeVideoToDisk(storedName: string, data: Buffer): Promise<string> {
  ensureVideosDir()
  const filePath = getVideoDiskPath(storedName)
  await new Promise<void>((resolve, reject) => {
    const stream = createWriteStream(filePath)
    stream.on('error', reject)
    stream.on('finish', resolve)
    stream.end(data)
  })
  return filePath
}

export function videoExistsOnDisk(storedName: string): boolean {
  return existsSync(getVideoDiskPath(storedName))
}

export function getVideoFileStat(storedName: string): { size: number } | null {
  const filePath = getVideoDiskPath(storedName)
  if (!existsSync(filePath)) return null
  return { size: statSync(filePath).size }
}

/** Stable name for legacy base64 videos migrated on first request. */
export function legacyStoredVideoName(filename: string): string {
  const ext = path.extname(filename).toLowerCase() || '.mp4'
  const hash = createHash('sha256').update(filename).digest('hex').slice(0, 16)
  return `legacy-${hash}${ext}`
}
