import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { buildClientSummaries } from '@/lib/client-summaries'
import { getRecentAndUpcomingBookings, getUpcomingBookings, getMonthBookings, type CalBooking } from '@/lib/cal-api'
import { getBookingPrice } from '@/lib/prices'
import AdminLayout, { type AdminData } from '@/components/AdminLayout'
import type { PendingApproval } from '@/components/PendingApprovalsTable'
import { handleSignOut } from '../actions'

export const dynamic = 'force-dynamic'

interface CAStats { reel: number; prevu: number }

function computeCA(bookings: CalBooking[], attendanceMap: Map<string, string>, now: Date): CAStats {
  return bookings.reduce(
    (acc, b) => {
      const price = getBookingPrice(b.startTime, b.endTime, b.title)
      if (new Date(b.startTime) < now) {
        if (attendanceMap.get(String(b.id)) === 'present') acc.reel += price
      } else {
        acc.prevu += price
      }
      return acc
    },
    { reel: 0, prevu: 0 }
  )
}

export default async function AnnulationsPage() {
  const session = await auth()
  if (!session) redirect('/api/auth/signin')

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    { data: cancellations, error: cancellationsError },
    { data: blocked, error: blockedError },
    { data: notes },
    { data: attendanceRows },
    { count: cancellations30d },
    { data: pendingApprovalsRaw },
    allBookings,
    upcomingOnly,
    monthBookings,
  ] = await Promise.all([
    supabaseAdmin.from('cancellations').select('email, name, cancelled_at').order('cancelled_at', { ascending: false }),
    supabaseAdmin.from('blocked_clients').select('email'),
    supabaseAdmin.from('client_notes').select('email, note'),
    supabaseAdmin.from('attendance').select('booking_id, status'),
    supabaseAdmin.from('cancellations').select('*', { count: 'exact', head: true }).gte('cancelled_at', thirtyDaysAgo.toISOString()),
    supabaseAdmin.from('pending_approvals').select('*').order('created_at', { ascending: false }).limit(50),
    getRecentAndUpcomingBookings(),
    getUpcomingBookings(7),
    getMonthBookings(),
  ])

  if (cancellationsError || blockedError) throw new Error('Erreur chargement données')

  const clients = buildClientSummaries(cancellations ?? [], blocked ?? [], notes ?? [])
  const pendingApprovals = (pendingApprovalsRaw ?? []) as PendingApproval[]
  const blockedEmails = (blocked ?? []).map(b => b.email)
  const attendance = (attendanceRows ?? []) as { booking_id: string; status: 'present' | 'absent' }[]
  const attendanceMap = new Map(attendance.map(a => [a.booking_id, a.status]))

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const todayCount = upcomingOnly.filter((b: CalBooking) =>
    new Date(b.startTime).toISOString().split('T')[0] === todayStr
  ).length
  const weekCount = upcomingOnly.length
  const signaledCount = clients.filter(c => !c.is_blocked && c.cancellation_count >= 2).length
  const unmarkedCount = allBookings.filter(
    b => new Date(b.startTime) < now && !attendanceMap.has(String(b.id))
  ).length

  const todayBookings = monthBookings.filter(b =>
    new Date(b.startTime).toISOString().split('T')[0] === todayStr
  )
  const weekBookings = monthBookings.filter(b => {
    const t = new Date(b.startTime)
    return t >= weekStart && t <= weekEnd
  })

  const data: AdminData = {
    today: now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
    bookings: allBookings,
    blockedEmails,
    attendance,
    pendingApprovals,
    clients,
    caToday: computeCA(todayBookings, attendanceMap, now),
    caWeek:  computeCA(weekBookings,  attendanceMap, now),
    caMonth: computeCA(monthBookings, attendanceMap, now),
    todayCount,
    weekCount,
    unmarkedCount,
    signaledCount,
    cancellations30d: cancellations30d ?? null,
  }

  return <AdminLayout data={data} signOut={handleSignOut} />
}
