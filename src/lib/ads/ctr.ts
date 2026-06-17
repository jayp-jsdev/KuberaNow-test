/** CTR = (clicks / impressions) × 100, rounded to 2 decimal places. */
export function calculateCtr(impressions: number, clicks: number): number {
  if (impressions <= 0) {
    return 0
  }

  return Math.round((clicks / impressions) * 10000) / 100
}
