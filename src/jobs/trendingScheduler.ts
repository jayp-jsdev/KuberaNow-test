import type { Payload } from 'payload'
import { getTrendingRecalcIntervalMs, isTrendingCronEnabled } from '@/lib/trending/config'
import { recalculateTrendingScores } from '@/lib/trending/calculateTrending'
import { logTrendingError, logTrendingInfo } from '@/lib/trending/logger'

let schedulerStarted = false
let intervalHandle: ReturnType<typeof setInterval> | undefined
let recalcTimer: ReturnType<typeof setTimeout> | undefined
let isRunning = false

async function runTrendingJob(payload: Payload): Promise<void> {
  if (isRunning) {
    logTrendingInfo('Skipping trending recalculation because a previous run is still in progress')
    return
  }

  isRunning = true
  try {
    await recalculateTrendingScores(payload)
  } catch (error) {
    logTrendingError('Scheduled trending recalculation failed', error)
  } finally {
    isRunning = false
  }
}

export function startTrendingScheduler(payload: Payload): void {
  if (schedulerStarted || !isTrendingCronEnabled()) {
    return
  }

  schedulerStarted = true
  const intervalMs = getTrendingRecalcIntervalMs()

  logTrendingInfo('Starting trending scheduler', { intervalMs })

  // Defer first run so page requests are not blocked on server startup.
  setTimeout(() => {
    void runTrendingJob(payload)
  }, 60_000)

  intervalHandle = setInterval(() => {
    void runTrendingJob(payload)
  }, intervalMs)

  if (typeof intervalHandle.unref === 'function') {
    intervalHandle.unref()
  }
}

export function stopTrendingScheduler(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle)
    intervalHandle = undefined
  }
  schedulerStarted = false
}

export async function runTrendingJobOnce(payload: Payload) {
  return recalculateTrendingScores(payload)
}

/** Debounced recalc after view events so scores appear without waiting for the interval. */
export function requestTrendingRecalc(payload: Payload, delayMs = 3000): void {
  if (recalcTimer) {
    clearTimeout(recalcTimer)
  }

  recalcTimer = setTimeout(() => {
    void runTrendingJob(payload)
  }, delayMs)

  if (typeof recalcTimer.unref === 'function') {
    recalcTimer.unref()
  }
}
