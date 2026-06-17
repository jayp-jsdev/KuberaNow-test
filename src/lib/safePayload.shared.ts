import type { PaginatedDocs } from 'payload'

export type SafeFindResult<T> = Pick<
  PaginatedDocs<T>,
  'docs' | 'totalDocs' | 'totalPages' | 'hasNextPage' | 'hasPrevPage' | 'limit' | 'pagingCounter' | 'page'
>

export function emptyFindResult<T>(): SafeFindResult<T> {
  return {
    docs: [],
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 0,
    pagingCounter: 0,
    page: 1,
  }
}

/** Runs a database call and returns a fallback when the query fails. */
export async function safeDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}
