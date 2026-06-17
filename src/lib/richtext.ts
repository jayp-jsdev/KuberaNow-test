/**
 * Extract plain text from a value that may be:
 *  - a plain string (legacy textarea data)
 *  - a Payload Lexical richText object ({ root: { children: [...] } })
 *  - a Sanity Portable Text array ([{ _type: 'block', children: [{ text }] }])
 *
 * Used for previews/cards where only a short text snippet is needed.
 */
export function richTextToPlainText(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value

  // Sanity Portable Text (array of blocks)
  if (Array.isArray(value)) {
    return value
      .map((block) => {
        if (block && typeof block === 'object' && 'children' in block) {
          const children = (block as { children?: Array<{ text?: string }> }).children || []
          return children.map((child) => child?.text || '').join('')
        }
        return ''
      })
      .join(' ')
      .trim()
  }

  // Payload Lexical ({ root: { children: [...] } })
  if (typeof value === 'object' && value !== null && 'root' in value) {
    const root = (value as { root?: { children?: unknown[] } }).root
    return extractLexical(root?.children).trim()
  }

  return ''
}

function extractLexical(nodes: unknown[] | undefined): string {
  if (!Array.isArray(nodes)) return ''
  return nodes
    .map((node) => {
      if (!node || typeof node !== 'object') return ''
      const n = node as { text?: string; children?: unknown[] }
      if (typeof n.text === 'string') return n.text
      if (Array.isArray(n.children)) return extractLexical(n.children)
      return ''
    })
    .join(' ')
}
