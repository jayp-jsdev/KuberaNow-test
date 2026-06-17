import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import { getCronSecret } from '@/lib/trending/config'
import { logTrendingError } from '@/lib/trending/logger'
import { runTrendingJobOnce } from '@/jobs/trendingScheduler'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest): boolean {
  const secret = getCronSecret()
  if (!secret) {
    return process.env.NODE_ENV !== 'production'
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${secret}`) {
    return true
  }

  const querySecret = req.nextUrl.searchParams.get('secret')
  return querySecret === secret
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await runTrendingJobOnce(payload)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    logTrendingError('Manual trending cron run failed', error)
    return NextResponse.json({ error: 'Trending recalculation failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
