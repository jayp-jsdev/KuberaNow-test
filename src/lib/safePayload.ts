import { cache } from 'react'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'

export type { SafeFindResult } from './safePayload.shared'
export { emptyFindResult, safeDb } from './safePayload.shared'

/** One Payload instance per request (dedupes layout, page, and metadata fetches). */
export const getPayloadCached = cache(async (): Promise<Payload | null> => {
  try {
    const payloadConfig = await config
    return await getPayload({ config: payloadConfig })
  } catch {
    return null
  }
})

/** Returns a Payload instance, or null when the database is unreachable. */
export async function getPayloadSafe(): Promise<Payload | null> {
  return getPayloadCached()
}

type GlobalSlug =
  | 'photo-carousel'
  | 'about-us'
  | 'terms-of-use'
  | 'disclaimer'
  | 'privacy-policy'
  | 'contact-us'
  | 'site-ads'

/** Fetches a Payload global, returning null when unavailable. */
export async function fetchGlobalSafe<T>(
  payload: Payload | null,
  slug: GlobalSlug,
  depth = 0,
): Promise<T | null> {
  if (!payload) return null
  const { safeDb } = await import('./safePayload.shared')
  return safeDb(() => payload.findGlobal({ slug, depth }) as Promise<T>, null)
}

/** Resolves the admin route from config without requiring a live database. */
export async function getAdminUrl(): Promise<string> {
  try {
    const payloadConfig = await config
    return payloadConfig.routes?.admin ?? '/admin'
  } catch {
    return '/admin'
  }
}
