import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { articleCardPopulate } from '@/lib/articleQuery'

async function getAuthenticatedUser() {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })
  return { payload, user }
}

export async function GET() {
  const { payload, user } = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 1,
    select: {
      savedArticles: true,
    },
    populate: {
      articles: articleCardPopulate,
    },
  })

  const savedArticles = Array.isArray(profile.savedArticles) ? profile.savedArticles : []

  return NextResponse.json({ savedArticles })
}

export async function POST(req: Request) {
  const { payload, user } = await getAuthenticatedUser()

  if (!user) {
    return NextResponse.json({ error: 'Login required to save articles.' }, { status: 401 })
  }

  const body = await req.json()
  const articleId = typeof body.articleId === 'string' ? body.articleId : ''

  if (!articleId) {
    return NextResponse.json({ error: 'Article ID is required.' }, { status: 400 })
  }

  const profile = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
    select: {
      savedArticles: true,
    },
  })

  const currentIds = (profile.savedArticles || []).map((item) =>
    typeof item === 'string' ? item : item.id,
  )

  const isSaved = currentIds.includes(articleId)
  const savedArticles = isSaved
    ? currentIds.filter((id) => id !== articleId)
    : [...currentIds, articleId]

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { savedArticles },
  })

  return NextResponse.json({ saved: !isSaved, savedArticles })
}
