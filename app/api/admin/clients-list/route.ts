import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

const CAL_API_BASE = 'https://api.cal.com/v2'
const CAL_API_VERSION = '2024-08-13'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'CAL_API_KEY missing' }, { status: 500 })

  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

  const query = new URLSearchParams({
    status: 'past',
    startTime: twelveMonthsAgo.toISOString(),
    endTime: new Date().toISOString(),
    take: '250',
  })

  const res = await fetch(`${CAL_API_BASE}/bookings?${query.toString()}`, {
    headers: { Authorization: `Bearer ${apiKey}`, 'cal-api-version': CAL_API_VERSION },
    cache: 'no-store',
  })
  if (!res.ok) return NextResponse.json({ error: 'Cal.com error' }, { status: 500 })
  const json = await res.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookings: any[] = json.data ?? []

  // Aggregate unique clients (exclude Pause)
  const clientMap = new Map<string, {
    name: string; email: string; phone?: string
    count: number; first: string; last: string
  }>()

  for (const b of bookings) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const att = b.attendees?.find((a: any) => a.name !== 'Pause')
    if (!att?.email) continue
    const email = att.email.toLowerCase()
    const existing = clientMap.get(email)
    const start: string = b.start ?? ''
    if (!existing) {
      clientMap.set(email, {
        name: att.name ?? '',
        email,
        phone: att.phoneNumber ?? b.responses?.phone ?? b.responses?.phoneNumber ?? undefined,
        count: 1, first: start, last: start,
      })
    } else {
      existing.count++
      if (start < existing.first) existing.first = start
      if (start > existing.last) existing.last = start
      if (!existing.phone && (att.phoneNumber || b.responses?.phone)) {
        existing.phone = att.phoneNumber ?? b.responses?.phone
      }
    }
  }

  const emails = Array.from(clientMap.keys())
  if (emails.length === 0) return NextResponse.json([])

  const [
    { data: notesData },
    { data: blockedData },
    { data: cancellationsData },
  ] = await Promise.all([
    supabaseAdmin.from('client_notes').select('email, note').in('email', emails),
    supabaseAdmin.from('blocked_clients').select('email').in('email', emails),
    supabaseAdmin.from('cancellations').select('email').in('email', emails),
  ])

  const notesMap = new Map((notesData ?? []).map(n => [n.email, n.note]))
  const blockedSet = new Set((blockedData ?? []).map(b => b.email))
  const cancCount = new Map<string, number>()
  for (const c of cancellationsData ?? []) {
    cancCount.set(c.email, (cancCount.get(c.email) ?? 0) + 1)
  }

  const clients = Array.from(clientMap.values()).map(c => ({
    email: c.email,
    name: c.name,
    phone: c.phone ?? null,
    total_bookings: c.count,
    first_booking: c.first,
    last_booking_date: c.last,
    last_cancelled_at: null as string | null,
    cancellation_count: cancCount.get(c.email) ?? 0,
    is_blocked: blockedSet.has(c.email),
    note: notesMap.get(c.email) ?? null,
  }))

  clients.sort((a, b) => b.last_booking_date.localeCompare(a.last_booking_date))

  return NextResponse.json(clients)
}
