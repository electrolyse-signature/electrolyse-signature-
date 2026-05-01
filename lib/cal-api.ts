import 'server-only'

export interface CalBooking {
  id: number
  title: string
  startTime: string
  endTime: string
  status: string
  attendees: Array<{ name: string; email: string }>
}

async function fetchBookings(dateFrom: string, dateTo: string, status: string): Promise<CalBooking[]> {
  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return []

  const res = await fetch(
    `https://api.cal.com/v1/bookings?apiKey=${apiKey}&dateFrom=${dateFrom}&dateTo=${dateTo}&status=${status}`,
    { next: { revalidate: 0 } }
  )
  if (!res.ok) return []
  const json = await res.json()
  return json.bookings ?? []
}

export async function getRecentAndUpcomingBookings(): Promise<CalBooking[]> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const future = new Date()
  future.setDate(future.getDate() + 7)

  const dateFrom = yesterday.toISOString().split('T')[0]
  const dateTo = future.toISOString().split('T')[0]

  const [upcoming, past] = await Promise.all([
    fetchBookings(dateFrom, dateTo, 'upcoming'),
    fetchBookings(dateFrom, yesterday.toISOString().split('T')[0], 'past'),
  ])

  // Merge and sort by startTime
  return [...past, ...upcoming].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )
}

export async function getUpcomingBookings(days = 7): Promise<CalBooking[]> {
  const today = new Date()
  const future = new Date(today)
  future.setDate(future.getDate() + days)

  return fetchBookings(
    today.toISOString().split('T')[0],
    future.toISOString().split('T')[0],
    'upcoming'
  )
}

export async function getMonthBookings(): Promise<CalBooking[]> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [past, upcoming] = await Promise.all([
    fetchBookings(monthStart.toISOString().split('T')[0], now.toISOString().split('T')[0], 'past'),
    fetchBookings(now.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0], 'upcoming'),
  ])

  return [...past, ...upcoming]
}
