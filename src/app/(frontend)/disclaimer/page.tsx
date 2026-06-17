import type { Disclaimer } from '@/payload-types'
import { buildPageMetadata } from '@/lib/seo'
import { getLegalSections } from '@/lib/legalPages'
import { fetchGlobalSafe, getPayloadSafe } from '@/lib/safePayload'
import LegalDocumentPage from '../components/LegalDocumentPage/LegalDocumentPage'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const payload = await getPayloadSafe()
  const data = await fetchGlobalSafe<Disclaimer>(payload, 'disclaimer', 0)

  return buildPageMetadata({
    title: data?.pageTitle || 'Disclaimer',
    description:
      'Read the KuberaNow disclaimer covering market data, investment information, editorial content, and liability limitations.',
    path: '/disclaimer',
  })
}

export default async function DisclaimerPage() {
  const payload = await getPayloadSafe()
  const data = await fetchGlobalSafe<Disclaimer>(payload, 'disclaimer', 0)
  const sections = getLegalSections(data?.sections)

  return (
    <LegalDocumentPage
      intro={data?.intro}
      notice={data?.importantNotice}
      sections={sections}
    />
  )
}
