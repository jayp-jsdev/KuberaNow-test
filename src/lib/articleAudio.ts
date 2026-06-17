export const STATIC_ARTICLE_AUDIO_URL = '/Podcast.mp3'

type LegacyArticleAudio = {
  enabled?: boolean | null
  kept?: boolean | null
  audioUrl?: string | null
}

export function getArticleAudioUrl(article: {
  hasArticleAudio?: boolean | null
  articleAudio?: LegacyArticleAudio | null
}): string | null {
  if (article.hasArticleAudio) return STATIC_ARTICLE_AUDIO_URL

  const legacy = article.articleAudio
  if (legacy?.enabled && legacy?.kept) return STATIC_ARTICLE_AUDIO_URL

  return null
}

export function hasKeptArticleAudio(article: {
  hasArticleAudio?: boolean | null
  articleAudio?: LegacyArticleAudio | null
}): boolean {
  return Boolean(getArticleAudioUrl(article))
}
