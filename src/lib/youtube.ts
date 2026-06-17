export function getYoutubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\s]+)/)
  return match ? match[1] : null
}

/** True when the URL points to a YouTube Short (vertical 9:16). */
export function isYoutubeShort(url: string): boolean {
  return /youtube\.com\/shorts\//i.test(url)
}

export function getYoutubeThumbnailUrl(videoId: string, portrait = false): string {
  // WebP thumbnails match YouTube's own player (i.ytimg.com/vi_webp/…)
  if (portrait) {
    return `https://i.ytimg.com/vi_webp/${videoId}/oardefault.webp`
  }
  return `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`
}

export function getYoutubeThumbnailFallbacks(videoId: string): string[] {
  return [
    `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`,
    `https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
  ]
}

export function getYoutubeEmbedUrl(videoId: string, autoplay = false): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    iv_load_policy: '3',
    color: 'white',
  })
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
}

export function getYoutubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

export function isYoutubeUrl(url: string): boolean {
  return getYoutubeId(url) !== null
}

export function resolveYoutubeVariant(
  videoUrl: string | undefined,
  variant: 'portrait' | 'landscape' | 'auto' = 'auto',
): 'portrait' | 'landscape' {
  if (variant !== 'auto') return variant
  if (videoUrl && isYoutubeShort(videoUrl)) return 'portrait'
  return 'landscape'
}
