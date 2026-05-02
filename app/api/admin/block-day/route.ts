import { NextResponse } from 'next/server'
import { auth } from '@/auth'

const CAL_API_BASE = 'https://api.cal.com/v2'
const CAL_API_VERSION = '2024-08-13'
const PAUSE_60_EVENT_TYPE_ID = 5564998

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { date, startHour, endHour } = body as { date: string; startHour: number; endHour: number }

  if (!date || startHour == null || endHour == null || startHour >= endHour) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'CAL_API_KEY manquant' }, { status: 500 })

  let blocked = 0
  let failed = 0

  for (let hour = startHour; hour < endHour; hour++) {
    const start = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`)
    const res = await fetch(`${CAL_API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'cal-api-version': CAL_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventTypeId: PAUSE_60_EVENT_TYPE_ID,
        start: start.toISOString(),
        attendee: {
          name: 'Pause',
          email: 'electrolyse.signature@gmail.com',
          timeZone: 'Europe/Paris',
          language: 'fr',
        },
      }),
    })
    if (res.ok) blocked++
    else failed++
  }

  return NextResponse.json({ ok: true, blocked, failed })
}
