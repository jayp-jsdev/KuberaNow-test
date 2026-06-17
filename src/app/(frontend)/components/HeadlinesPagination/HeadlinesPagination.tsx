'use client'

import './HeadlinesPagination.css'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect } from 'react'

type Props = {
  currentPage: number
  totalPages: number
}

function getPageHref(page: number) {
  return page <= 1 ? '/' : `/?page=${page}`
}

function HeadlinesPaginationInner({ currentPage, totalPages }: Props) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10)
    if (pageParam > 1) {
      document.getElementById('latest-headlines')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchParams])

  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="headlines-pagination" aria-label="Headlines pagination">
      {currentPage > 1 ? (
        <Link
          href={getPageHref(currentPage - 1)}
          scroll={false}
          className="pagination-btn"
        >
          ← Prev
        </Link>
      ) : (
        <span className="pagination-btn disabled" aria-disabled="true">
          ← Prev
        </span>
      )}

      <div className="pagination-pages">
        {pages.map((page) => (
          <Link
            key={page}
            href={getPageHref(page)}
            scroll={false}
            className={`pagination-page${page === currentPage ? ' active' : ''}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        ))}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={getPageHref(currentPage + 1)}
          scroll={false}
          className="pagination-btn"
        >
          Next →
        </Link>
      ) : (
        <span className="pagination-btn disabled" aria-disabled="true">
          Next →
        </span>
      )}
    </nav>
  )
}

export default function HeadlinesPagination(props: Props) {
  return (
    <Suspense fallback={null}>
      <HeadlinesPaginationInner {...props} />
    </Suspense>
  )
}
