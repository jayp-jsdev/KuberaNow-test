import AdSlot from '@/app/(frontend)/components/AdSlot/AdSlot'
import { resolveAdSlotDataWithMedia } from '@/lib/ads'
import { getAdTracking } from '@/lib/ads/fetchAdRegistry'
import { getPayloadCached } from '@/lib/safePayload'
import { getSidebarData } from '@/lib/sidebar'
import type { HomePage } from '@/payload-types'

type Section = Extract<NonNullable<HomePage['mainSections']>[number], { blockType: 'leaderboardAd' }>

type Props = {
  section: Section
}

export default async function HomeLeaderboardSection({ section }: Props) {
  if (!section.ad?.isEnabled) return null

  const payload = await getPayloadCached()
  const ad = payload ? await resolveAdSlotDataWithMedia(payload, section.ad) : null
  if (!ad?.isEnabled) return null

  const { adRegistry } = await getSidebarData()

  return (
    <AdSlot
      ad={ad}
      variant="leaderboard"
      fallbackSize="728 × 90"
      fallbackDesc="Leaderboard"
      tracking={getAdTracking(adRegistry, 'homeLeaderboard')}
    />
  )
}
