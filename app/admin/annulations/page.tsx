import { redirect } from 'next/navigation'
import { auth, signOut } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { buildClientSummaries } from '@/lib/client-summaries'
import { getRecentAndUpcomingBookings, getUpcomingBookings, getMonthBookings, type CalBooking } from '@/lib/cal-api'
import { getBookingPrice } from '@/lib/prices'
import AdminTable from '@/components/AdminTable'
import StatsCards from '@/components/StatsCards'
import BookingsTable from '@/components/BookingsTable'
import PendingApprovalsTable, { type PendingApproval } from '@/components/PendingApprovalsTable'

export const dynamic = 'force-dynamic'

interface CAStats { reel: number; prevu: number }

function computeCA(
  bookings: CalBooking[],
  attendanceMap: Map<string, string>,
  now: Date
): CAStats {
  return bookings.reduce(
    (acc, b) => {
      const price = getBookingPrice(b.startTime, b.endTime, b.title)
      const isPast = new Date(b.startTime) < now
      if (isPast) {
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

  if (cancellationsError || blockedError) {
    throw new Error('Erreur lors du chargement des données')
  }

  const clients = buildClientSummaries(cancellations ?? [], blocked ?? [], notes ?? [])
  const pendingApprovals = (pendingApprovalsRaw ?? []) as PendingApproval[]
  const blockedEmails = (blocked ?? []).map(b => b.email)
  const attendance = (attendanceRows ?? []) as { booking_id: string; status: 'present' | 'absent' }[]
  const attendanceMap = new Map(attendance.map(a => [a.booking_id, a.status]))

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1) // lundi
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

  const caToday = computeCA(todayBookings, attendanceMap, now)
  const caWeek = computeCA(weekBookings, attendanceMap, now)
  const caMonth = computeCA(monthBookings, attendanceMap, now)

  const today = now.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">{today}</h1>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }) }}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
              Déconnexion
            </button>
          </form>
        </div>

        {pendingApprovals.length > 0 && (
          <PendingApprovalsTable approvals={pendingApprovals} />
        )}

        <StatsCards
          todayCount={todayCount}
          weekCount={weekCount}
          cancellations30d={cancellations30d ?? 0}
          signaledCount={signaledCount}
          unmarkedCount={unmarkedCount}
          caToday={caToday}
          caWeek={caWeek}
          caMonth={caMonth}
        />

        <section>
          <h2 className="text-lg font-medium text-gray-700 mb-3">
            Planning — hier &amp; 7 prochains jours
          </h2>
          <BookingsTable
            bookings={allBookings}
            blockedEmails={blockedEmails}
            attendance={attendance}
          />
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-700 mb-3">
            Annulations — {clients.length} client{clients.length !== 1 ? 's' : ''}
          </h2>
          <AdminTable clients={clients} />
        </section>

      </div>
    </main>
  )
}
