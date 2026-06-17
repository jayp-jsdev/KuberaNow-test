export type LegalSection = {
  id: string
  title: string
  content: unknown
}

type LegalSectionInput = {
  id?: string | null
  sectionNumber?: string | null
  title?: string | null
  content?: unknown
}

export function formatSectionTitle(section: LegalSectionInput): string {
  const title = section.title?.trim() || ''
  const number = section.sectionNumber?.trim()

  if (number && title) return `${number}. ${title}`
  return number || title
}

export function getLegalSections(sections: LegalSectionInput[] | null | undefined): LegalSection[] {
  if (!sections?.length) return []

  return sections.flatMap((section, index) => {
    if (!section.content || typeof section.content !== 'object') return []

    const title = formatSectionTitle(section)
    if (!title) return []

    return [
      {
        id: section.id || `section-${index + 1}`,
        title,
        content: section.content,
      },
    ]
  })
}

export function formatLegalDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
