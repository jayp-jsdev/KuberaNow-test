import React from 'react'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

type HighlightTextProps = {
  text: string
  query: string
}

/**
 * Highlights case-insensitive matches of `query` within `text` using semantic <mark>.
 */
export function HighlightText({ text, query }: HighlightTextProps) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery || !text) {
    return <>{text}</>
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmedQuery)})`, 'gi'))

  if (parts.length === 1) {
    return <>{text}</>
  }

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="search-highlight">
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        ),
      )}
    </>
  )
}
