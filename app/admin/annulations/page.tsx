import { redirect } from 'next/navigation'
import { auth, signOut } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { buildClientSummaries } from '@/lib/client-summaries'
import { getTodayBookings, type CalBooking } from '@/lib/cal-api'
import AdminTable from '@/components/AdminTable'

export const dynamic = 'force-dynamic'

export default async function AnnulationsPage() {
  const session = await auth()
  if (!session) redirect('/api/auth/signin')

  const [
    { data: cancellations, error: cancellationsError },
    { data: blocked, error: blockedError },
    todayBookings,
  ] = await Promise.all([
    supabaseAdmin
      .from('cancellations')
      .select('email, name, cancelled_at')
      .order('cancelled_at', { ascending: false }),
    supabaseAdmin.from('blocked_clients').select('email'),
    getTodayBookings(),
  ])

  if (cancellationsError || blockedError) {
    throw new Error('Erreur lors du chargement des données')
  }

  const clients = buildClientSummaries(cancellations ?? [], blocked ?? [])

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">{today}</h1>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              Déconnexion
            </button>
          </form>
        </div>

        {/* Planning du jour */}
        <section>
          <h2 className="text-lg font-medium text-gray-700 mb-3">
            Planning du jour — {todayBookings.length} rendez-vous
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            {todayBookings.length === 0 ? (
              <p className="px-4 py-8 text-center text-gray-400 text-sm">
                Aucun rendez-vous aujourd'hui
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Heure</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Prestation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {todayBookings.map((booking: CalBooking) => {
                    const start = new Date(booking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    const end = new Date(booking.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    const attendee = booking.attendees?.[0]
                    return (
                      <tr key={booking.id}>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {start} – {end}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{attendee?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{attendee?.email ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{booking.title}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Annulations */}
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
