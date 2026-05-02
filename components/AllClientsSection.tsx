'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ClientSummary } from '@/lib/types'
import ClientDetailModal from '@/components/ClientDetailModal'

export default function AllClientsSection() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'blocked' | 'signaled'>('all')
  const [selected, setSelected] = useState<ClientSummary | null>(null)

  useEffect(() => {
    fetch('/api/admin/clients-list')
      .then(r => r.ok ? r.json() : [])
      .then(setClients)
      .finally(() => setLoading(false))
  }, [])

  const handleBlock = useCallback(async (email: string) => {
    await fetch('/api/admin/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setClients(prev => prev.map(c => c.email === email ? { ...c, is_blocked: true } : c))
  }, [])

  const handleUnblock = useCallback(async (email: string) => {
    await fetch('/api/admin/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setClients(prev => prev.map(c => c.email === email ? { ...c, is_blocked: false } : c))
  }, [])

  const handleNoteUpdate = useCallback((email: string, note: string) => {
    setClients(prev => prev.map(c => c.email === email ? { ...c, note } : c))
  }, [])

  const q = search.toLowerCase()
  const visible = clients.filter(c => {
    if (filter === 'blocked' && !c.is_blocked) return false
    if (filter === 'signaled' && (c.is_blocked || c.cancellation_count < 2)) return false
    if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false
    return true
  })

  const currentClient = selected
    ? (clients.find(c => c.email === selected.email) ?? selected)
    : null

  const blocked = clients.filter(c => c.is_blocked).length
  const signaled = clients.filter(c => !c.is_blocked && c.cancellation_count >= 2).length

  function fmtDate(d: string | null | undefined) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      {currentClient && (
        <ClientDetailModal
          client={currentClient}
          onClose={() => setSelected(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onNoteUpdate={handleNoteUpdate}
        />
      )}

      {/* Résumé */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">{clients.length} client{clients.length > 1 ? 's' : ''} au total</span>
        {blocked > 0 && (
          <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
            {blocked} bloquée{blocked > 1 ? 's' : ''}
          </span>
        )}
        {signaled > 0 && (
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
            {signaled} signalée{signaled > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Barre de recherche + filtres */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="search"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blush shadow-sm"
        />
        <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden text-xs font-medium">
          {(['all', 'signaled', 'blocked'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {f === 'all' ? 'Toutes' : f === 'signaled' ? 'Signalées' : 'Bloquées'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          Chargement de la liste…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 hidden md:table-cell">Annulations</th>
                <th className="px-4 py-3 hidden md:table-cell">Total RDV</th>
                <th className="px-4 py-3 hidden lg:table-cell">Dernier RDV</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map(c => {
                const isSignaled = !c.is_blocked && c.cancellation_count >= 2
                const rowClass = c.is_blocked ? 'bg-red-50' : isSignaled ? 'bg-orange-50' : ''
                return (
                  <tr key={c.email} className={`${rowClass} hover:bg-gray-50 transition-colors`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <button
                        onClick={() => setSelected(c)}
                        className="hover:underline hover:text-blush text-left"
                      >
                        {c.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      <a href={`mailto:${c.email}`} className="hover:underline hover:text-blue-500">{c.email}</a>
                    </td>
                    <td className="px-4 py-3">
                      {c.is_blocked ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Bloquée</span>
                      ) : isSignaled ? (
                        <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">Signalée</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Normale</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.cancellation_count || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.total_bookings ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{fmtDate(c.last_booking_date)}</td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <button
                        onClick={() => setSelected(c)}
                        className="text-left text-xs text-gray-400 hover:text-gray-600 truncate block max-w-full"
                        title={c.note ?? undefined}
                      >
                        {c.note ? (
                          <span className="text-gray-600">{c.note}</span>
                        ) : (
                          <span className="italic">Ajouter…</span>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    {search || filter !== 'all' ? 'Aucune cliente ne correspond à ce filtre' : 'Aucune cliente enregistrée'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
