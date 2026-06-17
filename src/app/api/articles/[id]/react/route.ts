import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

type ReactionType = 'like' | 'insightful' | 'sad' | 'happy' | 'angry'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { type, action } = body as { type: ReactionType; action: 'add' | 'remove' }

    const validTypes: ReactionType[] = ['like', 'insightful', 'sad', 'happy', 'angry']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    const article = await payload.findByID({ collection: 'articles', id, depth: 0 })
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const current = (article.reactions as any)?.[type] || 0
    const newValue = action === 'add' ? current + 1 : Math.max(0, current - 1)

    await payload.update({
      collection: 'articles',
      id,
      data: {
        reactions: {
          ...(article.reactions as any),
          [type]: newValue,
        },
      },
    })

    return NextResponse.json({ success: true, type, count: newValue })
  } catch (err) {
    console.error('Reaction error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
