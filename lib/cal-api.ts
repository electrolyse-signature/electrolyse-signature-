import 'server-only'

export interface CalBooking {
  id: number
  uid: string
  title: string
  startTime: string
  endTime: string
  duration: number
  status: string
  attendees: Array<{ name: string; email: string }>
}

const CAL_API_BASE = 'https://api.cal.com/v2'
const CAL_API_VERSION = '2024-08-13'

async function fetchBookings(params: {
  startTime?: string
  endTime?: string
  status?: string
}): Promise<CalBooking[]> {
  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return []

  const query = new URLSearchParams()
  if (params.startTime) query.set('startTime', params.startTime)
  if (params.endTime) query.set('endTime', params.endTime)
  if (params.status) query.set('status', params.status)
  query.set('take', '250')

  const res = await fetch(`${CAL_API_BASE}/bookings?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'cal-api-version': CAL_API_VERSION,
    },
    cache: 'no-store',
  })

  if (!res.ok) return []
  const json = await res.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (json.data ?? []).map((b: any) => ({
    id: b.id,
    uid: b.uid,
    title: b.title,
    startTime: b.start,
    endTime: b.end,
    duration: b.duration,
    status: b.status,
    attendees: (b.attendees ?? []).map((a: { name: string; email: string }) => ({
      name: a.name,
      email: a.email,
    })),
  }))
}

export async function getRecentAndUpcomingBookings(): Promise<CalBooking[]> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const future = new Date()
  future.setDate(future.getDate() + 7)
  future.setHours(23, 59, 59, 999)

  const [upcoming, past] = await Promise.all([
    fetchBookings({ startTime: new Date().toISOString(), endTime: future.toISOString(), status: 'upcoming' }),
    fetchBookings({ startTime: yesterday.toISOString(), endTime: new Date().toISOString(), status: 'past' }),
  ])

  return [...past, ...upcoming].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )
}

export async function getUpcomingBookings(days = 7): Promise<CalBooking[]> {
  const future = new Date()
  future.setDate(future.getDate() + days)

  return fetchBookings({
    startTime: new Date().toISOString(),
    endTime: future.toISOString(),
    status: 'upcoming',
  })
}

export async function getMonthBookings(): Promise<CalBooking[]> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const [past, upcoming] = await Promise.all([
    fetchBookings({ startTime: monthStart.toISOString(), endTime: now.toISOString(), status: 'past' }),
    fetchBookings({ startTime: now.toISOString(), endTime: monthEnd.toISOString(), status: 'upcoming' }),
  ])

  return [...past, ...upcoming]
}
