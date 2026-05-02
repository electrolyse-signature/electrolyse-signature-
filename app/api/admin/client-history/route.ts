import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

const CAL_API_BASE = 'https://api.cal.com/v2'
const CAL_API_VERSION = '2024-08-13'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.toLowerCase()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

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
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'cal-api-version': CAL_API_VERSION,
    },
    cache: 'no-store',
  })

  if (!res.ok) return NextResponse.json({ error: 'Cal.com error' }, { status: 500 })
  const json = await res.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allBookings: any[] = json.data ?? []

  // Filter for this client (exclude Pause bookings)
  const clientBookings = allBookings.filter(b => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attendee = b.attendees?.find((a: any) => a.email?.toLowerCase() === email)
    return attendee && attendee.name !== 'Pause'
  })

  // Phone number from first booking that has one
  let phone: string | null = null
  for (const b of clientBookings) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attendee = b.attendees?.find((a: any) => a.email?.toLowerCase() === email)
    if (attendee?.phoneNumber) { phone = attendee.phoneNumber; break }
    // Some Cal.com forms store phone in responses
    if (b.responses?.phone) { phone = b.responses.phone; break }
    if (b.responses?.phoneNumber) { phone = b.responses.phoneNumber; break }
  }

  // Cross-reference with Supabase attendance
  const bookingIds = clientBookings.map((b) => String(b.id))
  const { data: attendanceData } = bookingIds.length > 0
    ? await supabaseAdmin.from('attendance').select('booking_id, status').in('booking_id', bookingIds)
    : { data: [] }

  const attendanceMap = new Map((attendanceData ?? []).map((a) => [a.booking_id, a.status]))

  const presentCount = clientBookings.filter(b => attendanceMap.get(String(b.id)) === 'present').length
  const absentCount  = clientBookings.filter(b => attendanceMap.get(String(b.id)) === 'absent').length

  // Services frequency
  const serviceFreq: Record<string, number> = {}
  for (const b of clientBookings) {
    const title = b.title ?? '?'
    serviceFreq[title] = (serviceFreq[title] ?? 0) + 1
  }
  const services = Object.entries(serviceFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  // Date range
  const sorted = [...clientBookings].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  return NextResponse.json({
    phone,
    totalBookings: clientBookings.length,
    presentCount,
    absentCount,
    services,
    firstBookingDate: sorted[0]?.start ?? null,
    lastBookingDate:  sorted[sorted.length - 1]?.start ?? null,
  })
}
