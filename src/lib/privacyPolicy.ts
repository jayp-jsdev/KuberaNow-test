export function formatPrivacySectionTitle(
  sectionNumber?: string | null,
  title?: string | null,
): string {
  const label = title?.trim() || ''
  const number = sectionNumber?.trim()

  if (number && label) return `${number} ${label}`
  return number || label
}

export function getPrivacySectionId(block: { id?: string | null; blockType?: string | null }, index: number): string {
  return block.id || `${block.blockType || 'section'}-${index + 1}`
}
