import type { TermsOfUse } from '@/payload-types'
import { buildPageMetadata } from '@/lib/seo'
import { getLegalSections } from '@/lib/legalPages'
import { fetchGlobalSafe, getPayloadSafe } from '@/lib/safePayload'
import LegalDocumentPage from '../components/LegalDocumentPage/LegalDocumentPage'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const payload = await getPayloadSafe()
  const data = await fetchGlobalSafe<TermsOfUse>(payload, 'terms-of-use', 0)

  return buildPageMetadata({
    title: data?.pageTitle || 'Terms of Use',
    description:
      'Read the KuberaNow terms of use covering eligibility, user conduct, intellectual property, and governing law.',
    path: '/terms-of-use',
  })
}

export default async function TermsOfUsePage() {
  const payload = await getPayloadSafe()
  const data = await fetchGlobalSafe<TermsOfUse>(payload, 'terms-of-use', 0)
  const sections = getLegalSections(data?.sections)

  return (
    <LegalDocumentPage
      intro={data?.intro}
      notice={data?.importantNotice}
      sections={sections}
    />
  )
}
