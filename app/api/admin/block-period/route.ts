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
  const { startDate, endDate, startHour, endHour } = body as {
    startDate: string
    endDate: string
    startHour: number
    endHour: number
  }

  if (!startDate || !endDate || startHour == null || endHour == null || startHour >= endHour) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'CAL_API_KEY manquant' }, { status: 500 })

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return NextResponse.json({ error: 'Dates invalides' }, { status: 400 })
  }

  let totalBlocked = 0
  let totalFailed = 0

  const current = new Date(start)
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0]

    const slots = []
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`))
    }

    const results = await Promise.all(
      slots.map(slotStart =>
        fetch(`${CAL_API_BASE}/bookings`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'cal-api-version': CAL_API_VERSION,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventTypeId: PAUSE_60_EVENT_TYPE_ID,
            start: slotStart.toISOString(),
            attendee: {
              name: 'Pause',
              email: 'electrolyse.signature@gmail.com',
              timeZone: 'Europe/Paris',
              language: 'fr',
            },
          }),
        }).then(r => r.ok)
      )
    )

    totalBlocked += results.filter(Boolean).length
    totalFailed += results.filter(r => !r).length

    current.setDate(current.getDate() + 1)
  }

  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1

  return NextResponse.json({ ok: true, days, blocked: totalBlocked, failed: totalFailed })
}
