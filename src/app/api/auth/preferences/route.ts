import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function PATCH(req: Request) {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const preferences: { morningBrief?: boolean; articleAlerts?: boolean } = {}

  if (typeof body.morningBrief === 'boolean') {
    preferences.morningBrief = body.morningBrief
  }

  if (typeof body.articleAlerts === 'boolean') {
    preferences.articleAlerts = body.articleAlerts
  }

  const updated = await payload.update({
    collection: 'users',
    id: user.id,
    data: { preferences },
  })

  return NextResponse.json({ preferences: updated.preferences })
}
