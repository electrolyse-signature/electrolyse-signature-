import 'server-only'

export interface CalBooking {
  id: number
  title: string
  startTime: string
  endTime: string
  status: string
  attendees: Array<{ name: string; email: string }>
}

export async function getTodayBookings(): Promise<CalBooking[]> {
  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return []

  const today = new Date()
  const dateFrom = today.toISOString().split('T')[0]
  const dateTo = dateFrom

  const res = await fetch(
    `https://api.cal.com/v1/bookings?apiKey=${apiKey}&dateFrom=${dateFrom}&dateTo=${dateTo}&status=upcoming`,
    { next: { revalidate: 0 } }
  )

  if (!res.ok) return []

  const json = await res.json()
  return json.bookings ?? []
}
