const DEFAULT_RECALC_INTERVAL_MS = 5 * 60 * 1000
const DEFAULT_TRENDING_LIMIT = 10
const MAX_TRENDING_LIMIT = 50

export const TRENDING_WEIGHTS = {
  views1h: 5,
  views6h: 3,
  views24h: 1,
  shares: 10,
  comments: 5,
} as const

export function getTrendingRecalcIntervalMs(): number {
  const parsed = Number.parseInt(process.env.TRENDING_RECALC_INTERVAL_MS || '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RECALC_INTERVAL_MS
}

export function isTrendingCronEnabled(): boolean {
  return process.env.TRENDING_CRON_ENABLED !== 'false'
}

export function getTrendingDefaultLimit(): number {
  return DEFAULT_TRENDING_LIMIT
}

export function parseTrendingLimit(value: string | null | undefined): number {
  const parsed = Number.parseInt(value || '', 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_TRENDING_LIMIT
  }
  return Math.min(parsed, MAX_TRENDING_LIMIT)
}

export function getCronSecret(): string | undefined {
  const secret = process.env.TRENDING_CRON_SECRET || process.env.CRON_SECRET
  return secret?.trim() || undefined
}
