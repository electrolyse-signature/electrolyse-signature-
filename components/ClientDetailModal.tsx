'use client'

import { useEffect, useRef, useState } from 'react'
import type { ClientSummary, ClientHistory } from '@/lib/types'

interface Props {
  client: ClientSummary
  onClose: () => void
  onBlock: (email: string) => void
  onUnblock: (email: string) => void
}

export default function ClientDetailModal({ client, onClose, onBlock, onUnblock }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [history, setHistory]         = useState<ClientHistory | null>(null)
  const [historyLoading, setLoading]  = useState(true)

  useEffect(() => {
    fetch(`/api/admin/client-history?email=${encodeURIComponent(client.email)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setHistory(data) })
      .finally(() => setLoading(false))
  }, [client.email])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const isSignaled = !client.is_blocked && client.cancellation_count >= 2

  function fmtDate(d: string | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Fermer"
        >
          ×
        </button>

        {/* En-tête */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-semibold text-gray-900">{client.name}</h2>
            {client.is_blocked ? (
              <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Bloquée</span>
            ) : isSignaled ? (
              <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">Signalée</span>
            ) : (
              <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Normale</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{client.email}</p>
          {/* Téléphone */}
          {historyLoading ? (
            <p className="text-xs text-gray-300 mt-0.5">chargement…</p>
          ) : history?.phone ? (
            <a href={`tel:${history.phone}`} className="text-sm text-blush font-medium mt-0.5 block hover:underline">
              {history.phone}
            </a>
          ) : (
            <p className="text-xs text-gray-300 mt-0.5 italic">Numéro non renseigné</p>
          )}
        </div>

        {/* Stats annulations (données déjà chargées) */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Annulations</p>
            <p className="text-2xl font-bold text-orange-600">{client.cancellation_count}</p>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dernière annulation</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{fmtDate(client.last_cancelled_at)}</p>
          </div>
        </div>

        {/* Stats Cal.com (chargées à la demande) */}
        {historyLoading ? (
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-4 mb-3 text-center text-xs text-gray-400">
            Chargement de l&apos;historique…
          </div>
        ) : history && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-3 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Venues</p>
                <p className="text-xl font-bold text-emerald-600">{history.presentCount}</p>
              </div>
              <div className="rounded-xl bg-red-50 border border-red-100 px-3 py-3 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Absentes</p>
                <p className="text-xl font-bold text-red-500">{history.absentCount}</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-3 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total RDV</p>
                <p className="text-xl font-bold text-gray-700">{history.totalBookings}</p>
              </div>
            </div>

            {/* Première / dernière visite */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Première visite</p>
                <p className="text-xs font-medium text-gray-700">{fmtDate(history.firstBookingDate)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dernière visite</p>
                <p className="text-xs font-medium text-gray-700">{fmtDate(history.lastBookingDate)}</p>
              </div>
            </div>

            {/* Services */}
            {history.services.length > 0 && (
              <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Prestations (12 mois)</p>
                <div className="space-y-1">
                  {history.services.slice(0, 5).map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700 truncate max-w-[200px]">{s.name}</span>
                      <span className="text-xs font-medium text-gray-500 ml-2 shrink-0">×{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Note */}
        {client.note && (
          <div className="mb-5 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Note</p>
            <p className="text-sm text-gray-700">{client.note}</p>
          </div>
        )}

        {/* Action */}
        <div className="pt-4 border-t border-gray-100">
          {client.is_blocked ? (
            <button
              onClick={() => { onUnblock(client.email); onClose() }}
              className="w-full rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Débloquer cette cliente
            </button>
          ) : (
            <button
              onClick={() => { onBlock(client.email); onClose() }}
              className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              Bloquer cette cliente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
