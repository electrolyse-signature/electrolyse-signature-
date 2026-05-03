const CALCOM_API = 'https://api.cal.com/v1'

export async function createBlockerBooking(
  start: Date,
  end: Date,
  clientName: string,
) {
  const apiKey = process.env.CALCOM_API_KEY
  const eventTypeId = Number(process.env.CALCOM_EVENT_TYPE_ID)

  if (!apiKey || !eventTypeId) throw new Error('CALCOM_API_KEY ou CALCOM_EVENT_TYPE_ID manquant')

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
