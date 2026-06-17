import { headers } from 'next/headers'
import type { User } from '@/payload-types'
import { getPayloadSafe } from '@/lib/safePayload'

export async function getCurrentUser(): Promise<User | null> {
  const payload = await getPayloadSafe()
  if (!payload) return null

  try {
    const headersList = await headers()
    const { user } = await payload.auth({ headers: headersList })
    if (!user) return null
    return user as User
  } catch {
    return null
  }
}
