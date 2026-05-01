import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { buildClientSummaries } from '@/lib/client-summaries'
import AdminTable from '@/components/AdminTable'

export const dynamic = 'force-dynamic'

export default async function AnnulationsPage() {
  const session = await auth()
  if (!session) redirect('/api/auth/signin')

  const [{ data: cancellations }, { data: blocked }] = await Promise.all([
    supabaseAdmin
      .from('cancellations')
      .select('email, name, cancelled_at')
      .order('cancelled_at', { ascending: false }),
    supabaseAdmin.from('blocked_clients').select('email'),
  ])

  const clients = buildClientSummaries(cancellations ?? [], blocked ?? [])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Annulations — {clients.length} client{clients.length !== 1 ? 's' : ''}
          </h1>
          <a
            href="/api/auth/signout"
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            Déconnexion
          </a>
        </div>
        <AdminTable clients={clients} />
      </div>
    </main>
  )
}
