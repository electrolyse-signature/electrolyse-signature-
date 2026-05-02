import { NextResponse } from 'next/server'
import { auth } from '@/auth'

const CAL_API_BASE = 'https://api.cal.com/v2'
const CAL_API_VERSION = '2024-08-13'

const EVENT_TYPE_IDS: Record<string, number> = {
  '30': 5564606,
  '60': 5564998,
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { date, time, duration } = body
  if (!date || !time) {
    return NextResponse.json({ error: 'Date et heure requises' }, { status: 400 })
  }

  const eventTypeId = EVENT_TYPE_IDS[String(duration)] ?? EVENT_TYPE_IDS['30']

  const start = new Date(`${date}T${time}:00`)
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 })
  }

  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'CAL_API_KEY non configuré' }, { status: 500 })

  const res = await fetch(`${CAL_API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'cal-api-version': CAL_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventTypeId,
      start: start.toISOString(),
      attendee: {
        name: 'Pause',
        email: 'electrolyse.signature@gmail.com',
        timeZone: 'Europe/Paris',
        language: 'fr',
      },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('[pause] Cal.com error:', data)
    return NextResponse.json({ error: data?.error?.message ?? 'Erreur Cal.com' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
