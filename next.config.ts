import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const extraDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : []

const isDev = process.env.NODE_ENV === 'development'
// Netlify: `/_next/image` must fetch `/api/media/file/*` in a second serverless
// function (Payload + Mongo + base64 decode). That double-hop often 502s/timeouts.
const isNetlify = process.env.NETLIFY === 'true'

const nextConfig: NextConfig = {
  // Allow HMR + dev assets when accessing `next dev` through a tunnel (ngrok, etc.)
  allowedDevOrigins: [
    '*.ngrok-free.dev',
    '*.ngrok-free.app',
    '*.ngrok.io',
    '*.ngrok.app',
    ...extraDevOrigins,
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [96, 160, 256, 384],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'earnest-phoenix-4eede9.netlify.app',
      },
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  expireTime: 60 * 60 * 24 * 30
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
