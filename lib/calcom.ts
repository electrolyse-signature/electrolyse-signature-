const CALCOM_API = 'https://api.cal.com/v1'

// CALCOM_EVENT_TYPES = JSON map durée → ID, ex: {"5":111,"15":222,"30":333,"45":444,"60":555,"90":666}
// CALCOM_EVENT_TYPE_ID = ID de secours si le map n'est pas défini
function resolveEventTypeId(durationMinutes: number): number {
  const raw = process.env.CALCOM_EVENT_TYPES
  if (raw) {
    try {
      const map: Record<string, number> = JSON.parse(raw)
      // Cherche la durée exacte, sinon prend la durée la plus proche par excès
      const durations = Object.keys(map).map(Number).sort((a, b) => a - b)
      const match = durations.find(d => d >= durationMinutes) ?? durations[durations.length - 1]
      return map[String(match)]
    } catch {}
  }
  return Number(process.env.CALCOM_EVENT_TYPE_ID)
}

export async function createBlockerBooking(
  start: Date,
  end: Date,
  clientName: string,
  durationMinutes: number,
) {
  const apiKey = process.env.CALCOM_API_KEY
  const eventTypeId = resolveEventTypeId(durationMinutes)

  if (!apiKey || !eventTypeId) throw new Error('CALCOM_API_KEY ou CALCOM_EVENT_TYPES manquant')

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
