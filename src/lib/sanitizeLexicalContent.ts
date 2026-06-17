/** Strip in-progress Lexical uploads (embedded base64) before save to avoid oversized payloads. */
export function sanitizeLexicalForSave(content: unknown): unknown {
  if (!content || typeof content !== 'object') return content

  const root = content as { root?: { children?: unknown[] } }
  if (!root.root?.children) return content

  return {
    ...root,
    root: {
      ...root.root,
      children: sanitizeNodes(root.root.children),
    },
  }
}

function sanitizeNodes(nodes: unknown[]): unknown[] {
  return nodes
    .map((node) => sanitizeNode(node))
    .filter((node) => node !== null)
}

function sanitizeNode(node: unknown): unknown | null {
  if (!node || typeof node !== 'object') return node

  const n = node as Record<string, unknown>

  if (n.type === 'upload') {
    const value = n.value as Record<string, unknown> | string | number | undefined
    const pending = (n as { pending?: unknown }).pending
    if (pending) return null

    if (value && typeof value === 'object' && 'imageData' in value) {
      const { imageData: _removed, ...rest } = value
      return { ...n, value: rest }
    }
  }

  if (n.type === 'block' && n.fields && typeof n.fields === 'object') {
    const fields = n.fields as Record<string, unknown>
    const sanitizedFields = { ...fields }

    for (const key of Object.keys(sanitizedFields)) {
      const fieldValue = sanitizedFields[key]
      if (fieldValue && typeof fieldValue === 'object' && 'imageData' in (fieldValue as object)) {
        const { imageData: _removed, ...rest } = fieldValue as Record<string, unknown>
        sanitizedFields[key] = rest
      }
    }

    return { ...n, fields: sanitizedFields }
  }

  if (Array.isArray(n.children)) {
    return { ...n, children: sanitizeNodes(n.children) }
  }

  return node
}
