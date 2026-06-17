import type { ContactUs, Media } from '@/payload-types'
import { buildPageMetadata } from '@/lib/seo'
import { batchMediaDataUrls } from '@/lib/mediaFile'
import { fetchGlobalSafe, getPayloadCached } from '@/lib/safePayload'
import ContactUsContent from '../components/ContactUsContent/ContactUsContent'

export const dynamic = 'force-dynamic'

function collectIconFilenames(contactCards?: ContactUs['contactCards']): string[] {
  if (!contactCards?.length) return []

  return contactCards.flatMap((card) => {
    const icon = card.iconImage
    if (!icon || typeof icon !== 'object') return []
    return (icon as Media).filename ? [(icon as Media).filename as string] : []
  })
}

export async function generateMetadata() {
  const payload = await getPayloadCached()
  const data = await fetchGlobalSafe<ContactUs>(payload, 'contact-us', 1)

  return buildPageMetadata({
    title: data?.pageTitle || 'Contact Us',
    description:
      'Contact KuberaNow for general inquiries, news tips, advertising, technical support, press requests, and grievance matters.',
    path: '/contact-us',
  })
}

export default async function ContactUsPage() {
  const payload = await getPayloadCached()
  const data = await fetchGlobalSafe<ContactUs>(payload, 'contact-us', 1)
  const inlineIcons =
    payload && data?.contactCards?.length
      ? await batchMediaDataUrls(payload, collectIconFilenames(data.contactCards))
      : {}

  return (
    <ContactUsContent
      pageTitle={data?.pageTitle}
      responseCommitment={data?.responseCommitment}
      contactCards={data?.contactCards}
      grievanceSection={data?.grievanceSection}
      inlineIcons={inlineIcons}
    />
  )
}
