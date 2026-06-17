import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import {
  AdEventValidationError,
  safeRecordAdEvent,
  validateAdEventInput,
} from '@/lib/ads/recordEvent'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { placement } = validateAdEventInput(body)

    const payload = await getPayload({ config: configPromise })
    const result = await safeRecordAdEvent(payload, {
      adId: id,
      placement,
      eventType: 'click',
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof AdEventValidationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
