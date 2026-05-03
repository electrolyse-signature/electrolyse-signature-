const CALCOM_API = 'https://api.cal.com/v1'

interface CalEventType {
  id: number
  slug: string
  length: number // durée en minutes
  title: string
}

let cachedEventTypes: CalEventType[] | null = null

async function getEventTypes(apiKey: string): Promise<CalEventType[]> {
  if (cachedEventTypes) return cachedEventTypes

  const res = await fetch(`${CALCOM_API}/event-types?apiKey=${apiKey}`)
  if (!res.ok) throw new Error(`Cal.com event-types ${res.status}`)

  const json = await res.json()
  // Cal.com v1 retourne { event_types: [...] } ou { eventTypes: [...] }
  const list: CalEventType[] = json.event_types ?? json.eventTypes ?? []
  cachedEventTypes = list
  return list
}

// Trouve l'event type dont la durée est la plus proche par excès de durationMinutes.
async function resolveEventTypeId(apiKey: string, durationMinutes: number): Promise<number> {
  const types = await getEventTypes(apiKey)
  if (types.length === 0) throw new Error('Aucun event type trouvé dans Cal.com')

  const sorted = [...types].sort((a, b) => a.length - b.length)
  const match = sorted.find(t => t.length >= durationMinutes) ?? sorted[sorted.length - 1]
  return match.id
}

export async function createBlockerBooking(
  start: Date,
  end: Date,
  clientName: string,
  durationMinutes: number,
) {
  const apiKey = process.env.CALCOM_API_KEY
  if (!apiKey) throw new Error('CALCOM_API_KEY manquant')

  const eventTypeId = await resolveEventTypeId(apiKey, durationMinutes)

  const res = await fetch(`${CALCOM_API}/bookings?apiKey=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventTypeId,
      start: start.toISOString(),
      end: end.toISOString(),
      responses: {
        name: `Treatwell — ${clientName}`,
        email: 'treatwell-sync@noreply.local',
      },
      metadata: { source: 'treatwell-sync' },
      timeZone: 'Europe/Paris',
      language: 'fr',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cal.com ${res.status}: ${err}`)
  }

  return res.json() as Promise<{ uid?: string; id?: string | number }>
}
