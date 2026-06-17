type LogContext = Record<string, unknown>

export function logAdAnalyticsError(message: string, error: unknown, context?: LogContext): void {
  console.error(`[ad-analytics] ${message}`, {
    ...context,
    error: error instanceof Error ? error.message : error,
  })
}

export function logAdAnalyticsInfo(message: string, context?: LogContext): void {
  console.info(`[ad-analytics] ${message}`, context ?? {})
}
