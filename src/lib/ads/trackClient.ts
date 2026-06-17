import type { AdPlacement } from './placements'

type TrackAdEventInput = {
  adId: string
  placement: AdPlacement
  eventType: 'impression' | 'click'
}

export async function trackAdEvent({ adId, placement, eventType }: TrackAdEventInput): Promise<void> {
  const endpoint = eventType === 'impression' ? 'impression' : 'click'

  await fetch(`/api/ads/${encodeURIComponent(adId)}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ placement }),
    keepalive: eventType === 'click',
  })
}
