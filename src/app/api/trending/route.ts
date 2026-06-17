import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import { fetchTrendingArticles } from '@/lib/trending/fetchTrending'
import { logTrendingError } from '@/lib/trending/logger'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const limit = req.nextUrl.searchParams.get('limit')
    const payload = await getPayload({ config: configPromise })
    const result = await fetchTrendingArticles(payload, limit)

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    logTrendingError('Failed to fetch trending articles', error)
    return NextResponse.json({ trending: [] }, { status: 500 })
  }
}
