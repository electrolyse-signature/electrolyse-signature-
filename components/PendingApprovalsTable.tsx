'use client'

import { useState } from 'react'

export interface PendingApproval {
  id: string
  booking_uid: string
  email: string
  name: string
  start_time: string | null
  end_time: string | null
  title: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function PendingApprovalsTable({
  approvals: initial,
}: {
  approvals: PendingApproval[]
}) {
  const [approvals, setApprovals] = useState(initial)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)

  async function decide(approval: PendingApproval, action: 'approve' | 'reject') {
    setLoadingId(approval.id)
    setErrorId(null)
    try {
      const endpoint = action === 'approve' ? '/api/admin/approve' : '/api/admin/reject'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: approval.id, booking_uid: approval.booking_uid }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('[PendingApprovals] error:', res.status, data)
        setErrorId(approval.id)
        return
      }
      setApprovals(prev =>
        prev.map(a =>
          a.id === approval.id ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a
        )
      )
    } catch (err) {
      console.error('[PendingApprovals] fetch error:', err)
      setErrorId(approval.id)
    } finally {
      setLoadingId(null)
    }
  }

  const pending = approvals.filter(a => a.status === 'pending')

  if (approvals.length === 0) return null

  return (
    <section>
      <h2 className="text-lg font-medium text-gray-700 mb-3 flex items-center gap-2">
        Demandes de réservation — clients bloqués
        {pending.length > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold w-5 h-5">
            {pending.length}
          </span>
        )}
      </h2>
      <div className="rounded-lg border border-red-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-red-50 border-b border-red-200">
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-red-700">Client</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-red-700 hidden md:table-cell">Email</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-red-700">Prestation</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-red-700">Date / Heure</th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-red-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {approvals.map(a => {
              const dateStr = a.start_time
                ? new Date(a.start_time).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })
                : '—'
              const timeStr = a.start_time && a.end_time
                ? `${new Date(a.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} – ${new Date(a.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                : '—'
              const isLoading = loadingId === a.id
              const hasError = errorId === a.id

              return (
                <tr
                  key={a.id}
                  className={
                    a.status === 'pending'
                      ? 'bg-yellow-50'
                      : a.status === 'approved'
                      ? 'bg-green-50 opacity-60'
                      : 'bg-red-50 opacity-60'
                  }
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{a.email}</td>
                  <td className="px-4 py-3 text-gray-600">{a.title ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    <span className="capitalize">{dateStr}</span>
                    <br />
                    <span className="text-xs text-gray-400">{timeStr}</span>
                  </td>
                  <td className="px-4 py-3 w-48">
                    {a.status === 'pending' ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          <button
                            onClick={() => decide(a, 'approve')}
                            disabled={isLoading}
                            className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                          >
                            {isLoading ? '…' : '✓ Approuver'}
                          </button>
                          <button
                            onClick={() => decide(a, 'reject')}
                            disabled={isLoading}
                            className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            {isLoading ? '…' : '✗ Refuser'}
                          </button>
                        </div>
                        {hasError && (
                          <span className="text-xs text-red-500">Erreur — réessaie</span>
                        )}
                      </div>
                    ) : (
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        a.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {a.status === 'approved' ? '✓ Approuvé' : '✗ Refusé'}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
