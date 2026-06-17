import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { readMediaFileByFilename } from '@/lib/mediaFile'

let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null

async function getPayloadInstance() {
  if (!payloadInstance) {
    const payloadConfig = await config
    payloadInstance = await getPayload({ config: payloadConfig })
  }
  return payloadInstance
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params
    const decodedFilename = decodeURIComponent(filename)
    const payload = await getPayloadInstance()
    const file = await readMediaFileByFilename(payload, decodedFilename)

    if (!file) {
      return new NextResponse('Image not found', { status: 404 })
    }

    const body = new Uint8Array(file.buffer)

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType,
        'Content-Length': body.byteLength.toString(),
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (err) {
    console.error('[media/file] error:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
