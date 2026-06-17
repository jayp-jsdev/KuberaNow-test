import type { PrivacyPolicy } from '@/payload-types'
import { buildPageMetadata } from '@/lib/seo'
import { fetchGlobalSafe, getPayloadSafe } from '@/lib/safePayload'
import PrivacyPolicyContent from '../components/PrivacyPolicyContent/PrivacyPolicyContent'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const payload = await getPayloadSafe()
  const data = await fetchGlobalSafe<PrivacyPolicy>(payload, 'privacy-policy', 0)

  return buildPageMetadata({
    title: data?.pageTitle || 'Privacy Policy',
    description:
      'Read the KuberaNow privacy policy to understand how we collect, use, store, and protect your personal information.',
    path: '/privacy-policy',
  })
}

export default async function PrivacyPolicyPage() {
  const payload = await getPayloadSafe()
  const data = await fetchGlobalSafe<PrivacyPolicy>(payload, 'privacy-policy', 0)

  return <PrivacyPolicyContent sections={data?.sections} />
}
