'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ClientSummary } from '@/lib/types'
import ClientDetailModal from '@/components/ClientDetailModal'
import { ADMIN_FROM_DATE } from '@/lib/admin-config'

export default function AllClientsSection() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'blocked' | 'signaled'>('all')
  const [selected, setSelected] = useState<ClientSummary | null>(null)
  const [hiddenEmails, setHiddenEmails] = useState<Set<string>>(new Set())
  const [showHidden, setShowHidden] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin-hidden-clients')
    if (saved) setHiddenEmails(new Set(JSON.parse(saved)))
  }, [])

  useEffect(() => {
    fetch('/api/admin/clients-list')
      .then(r => r.ok ? r.json() : [])
      .then(setClients)
      .finally(() => setLoading(false))
  }, [])

  const handleBlock = useCallback(async (email: string, name: string) => {
    if (!confirm(`Bloquer ${name} ?\nElle ne pourra plus réserver en ligne.`)) return
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

  const handleHide = useCallback((email: string) => {
    setHiddenEmails(prev => {
      const next = new Set(prev)
      next.add(email)
      localStorage.setItem('admin-hidden-clients', JSON.stringify([...next]))
      return next
    })
  }, [])

  const handleUnhide = useCallback((email: string) => {
    setHiddenEmails(prev => {
      const next = new Set(prev)
      next.delete(email)
      localStorage.setItem('admin-hidden-clients', JSON.stringify([...next]))
      return next
    })
  }, [])

  // Clients passant le filtre de date (complètement invisibles sinon)
  const afterDate = clients.filter(c =>
    c.last_booking_date ? c.last_booking_date >= ADMIN_FROM_DATE : false
  )

  const q = search.toLowerCase()
  const visible = afterDate.filter(c => {
    if (!showHidden && hiddenEmails.has(c.email)) return false
    if (filter === 'blocked' && !c.is_blocked) return false
    if (filter === 'signaled' && (c.is_blocked || c.cancellation_count < 2)) return false
    if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false
    return true
  })

  const currentClient = selected
    ? (clients.find(c => c.email === selected.email) ?? selected)
    : null

  const blocked = afterDate.filter(c => c.is_blocked).length
  const signaled = afterDate.filter(c => !c.is_blocked && c.cancellation_count >= 2).length
  // Ne compte que les clients après ADMIN_FROM_DATE qui sont manuellement masqués
  const hiddenCount = afterDate.filter(c => hiddenEmails.has(c.email)).length

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
          onBlock={(email) => handleBlock(email, currentClient?.name ?? email)}
          onUnblock={handleUnblock}
          onNoteUpdate={handleNoteUpdate}
        />
      )}

      {/* Résumé */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">{afterDate.length} client{afterDate.length > 1 ? 's' : ''} au total</span>
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
        {hiddenCount > 0 && (
          <button
            onClick={() => setShowHidden(v => !v)}
            className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {showHidden ? `Masquer les ${hiddenCount} cachée${hiddenCount > 1 ? 's' : ''}` : `${hiddenCount} cachée${hiddenCount > 1 ? 's' : ''} — Afficher`}
          </button>
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
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map(c => {
                const isSignaled = !c.is_blocked && c.cancellation_count >= 2
                const rowClass = c.is_blocked ? 'bg-red-50' : isSignaled ? 'bg-orange-50' : ''
                return (
                  <tr key={c.email} className={`${rowClass} hover:bg-gray-50 transition-colors`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <button onClick={() => setSelected(c)} className="hover:underline hover:text-blush text-left">
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
                        {c.note ? <span className="text-gray-600">{c.note}</span> : <span className="italic">Ajouter…</span>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {c.is_blocked ? (
                          <button onClick={() => handleUnblock(c.email)} className="text-xs text-blue-600 hover:underline whitespace-nowrap text-left">
                            Débloquer
                          </button>
                        ) : (
                          <button onClick={() => handleBlock(c.email, c.name)} className="text-xs text-red-600 hover:underline whitespace-nowrap text-left">
                            Bloquer
                          </button>
                        )}
                        {hiddenEmails.has(c.email) ? (
                          <button onClick={() => handleUnhide(c.email)} className="text-xs text-gray-400 hover:underline whitespace-nowrap text-left">
                            Réafficher
                          </button>
                        ) : (
                          <button onClick={() => handleHide(c.email)} className="text-xs text-gray-400 hover:underline whitespace-nowrap text-left">
                            Masquer
                          </button>
                        )}
                      </div>
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
