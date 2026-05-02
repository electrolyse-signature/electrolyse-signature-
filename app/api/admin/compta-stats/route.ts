import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getBookingPrice } from '@/lib/prices'

const CAL_API_BASE = 'https://api.cal.com/v2'
const CAL_API_VERSION = '2024-08-13'
const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchBookings(apiKey: string, start: Date, end: Date, status: 'past' | 'upcoming'): Promise<any[]> {
  const query = new URLSearchParams({
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    status,
    take: '250',
  })
  const res = await fetch(`${CAL_API_BASE}/bookings?${query}`, {
    headers: { Authorization: `Bearer ${apiKey}`, 'cal-api-version': CAL_API_VERSION },
    cache: 'no-store',
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'CAL_API_KEY missing' }, { status: 500 })

  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)

  const [pastBookings, upcomingBookings] = await Promise.all([
    fetchBookings(apiKey, yearStart, now, 'past'),
    fetchBookings(apiKey, now, yearEnd, 'upcoming'),
  ])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allBookings: any[] = [...pastBookings, ...upcomingBookings]

  const ids = allBookings.map(b => String(b.id))
  const { data: attRows } = ids.length > 0
    ? await supabaseAdmin.from('attendance').select('booking_id, status').in('booking_id', ids)
    : { data: [] }
  const attMap = new Map((attRows ?? []).map(a => [a.booking_id, a.status]))

  // Filter out Pause bookings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const real = allBookings.filter(b => b.attendees?.[0]?.name !== 'Pause')

  // ── Monthly breakdown ──
  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: MOIS[i],
    reel: 0,
    prevu: 0,
    seances: 0,
  }))

  for (const b of real) {
    const start = new Date(b.start)
    const m = start.getMonth()
    const price = getBookingPrice(b.start, b.end, b.title)
    const isPast = start < now
    const presence = attMap.get(String(b.id))

    if (isPast && presence === 'present') {
      monthly[m].reel += price
      monthly[m].seances++
    } else {
      monthly[m].prevu += price
    }
  }

  // ── Top services (current month) ──
  const curMonth = now.getMonth()
  const curMonthBookings = real.filter(b => new Date(b.start).getMonth() === curMonth)
  const serviceMap = new Map<string, { count: number; revenue: number }>()
  for (const b of curMonthBookings) {
    const title = (b.title as string).replace(/entre Electrolyse signature et .+$/, '').trim() || (b.title as string)
    const price = getBookingPrice(b.start, b.end, b.title)
    const presence = attMap.get(String(b.id))
    const revenue = presence === 'present' ? price : 0
    const existing = serviceMap.get(title) ?? { count: 0, revenue: 0 }
    serviceMap.set(title, { count: existing.count + 1, revenue: existing.revenue + revenue })
  }
  const topServices = Array.from(serviceMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue || b[1].count - a[1].count)
    .slice(0, 6)
    .map(([name, s]) => ({ name, ...s }))

  // ── Top clients (current month, by revenue) ──
  const clientMap = new Map<string, { name: string; count: number; revenue: number }>()
  for (const b of curMonthBookings) {
    const att = b.attendees?.[0]
    if (!att?.email) continue
    const price = getBookingPrice(b.start, b.end, b.title)
    const presence = attMap.get(String(b.id))
    const revenue = presence === 'present' ? price : 0
    const existing = clientMap.get(att.email) ?? { name: att.name ?? att.email, count: 0, revenue: 0 }
    clientMap.set(att.email, { ...existing, count: existing.count + 1, revenue: existing.revenue + revenue })
  }
  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
    .slice(0, 5)

  return NextResponse.json({ monthly, topServices, topClients })
}
