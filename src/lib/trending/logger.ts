const PREFIX = '[trending]'

export function logTrendingInfo(message: string, meta?: Record<string, unknown>): void {
  if (meta) {
    console.info(PREFIX, message, meta)
    return
  }
  console.info(PREFIX, message)
}

export function logTrendingError(message: string, error: unknown, meta?: Record<string, unknown>): void {
  console.error(PREFIX, message, {
    ...meta,
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
  })
}

export function logTrendingWarn(message: string, meta?: Record<string, unknown>): void {
  if (meta) {
    console.warn(PREFIX, message, meta)
    return
  }
  console.warn(PREFIX, message)
}
