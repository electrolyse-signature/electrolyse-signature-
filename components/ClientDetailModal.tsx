'use client'

import { useEffect, useRef, useState } from 'react'
import type { ClientSummary, ClientHistory } from '@/lib/types'

interface Props {
  client: ClientSummary
  onClose: () => void
  onBlock: (email: string) => void
  onUnblock: (email: string) => void
  onNoteUpdate?: (email: string, note: string) => void
}

export default function ClientDetailModal({ client, onClose, onBlock, onUnblock, onNoteUpdate }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [history, setHistory]       = useState<ClientHistory | null>(null)
  const [historyLoading, setLoading] = useState(true)
  const [note, setNote]             = useState(client.note ?? '')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteSaved, setNoteSaved]   = useState(false)

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

  async function saveNote() {
    setNoteSaving(true)
    await fetch('/api/admin/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: client.email, note }),
    })
    setNoteSaving(false)
    setNoteSaved(true)
    onNoteUpdate?.(client.email, note)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const isSignaled = !client.is_blocked && client.cancellation_count >= 2

  function fmtDate(d: string | null | undefined) {
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
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Fermer">×</button>

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
          <a href={`mailto:${client.email}`} className="text-sm text-gray-500 hover:underline block">{client.email}</a>
          {historyLoading ? (
            <p className="text-xs text-gray-300 mt-0.5">chargement…</p>
          ) : history?.phone ? (
            <a href={`tel:${history.phone}`} className="text-sm text-blue-500 font-medium mt-0.5 block hover:underline">{history.phone}</a>
          ) : (
            <p className="text-xs text-gray-300 mt-0.5 italic">Numéro non renseigné</p>
          )}
        </div>

        {/* Stats annulations */}
        {client.cancellation_count > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl bg-orange-50 border border-orange-100 px-4 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Annulations</p>
              <p className="text-2xl font-bold text-orange-600">{client.cancellation_count}</p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Dernière annulation</p>
              <p className="text-sm font-medium text-gray-700 mt-1">{fmtDate(client.last_cancelled_at)}</p>
            </div>
          </div>
        )}

        {/* Stats Cal.com */}
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

        {/* Note éditable */}
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Note</p>
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); setNoteSaved(false) }}
            placeholder="Ajouter une note sur cette cliente…"
            rows={3}
            className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 resize-none"
          />
          <div className="flex items-center justify-end mt-2 gap-2">
            {noteSaved && <span className="text-xs text-green-600">Enregistré ✓</span>}
            <button
              onClick={saveNote}
              disabled={noteSaving}
              className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-200 disabled:opacity-50 transition-colors"
            >
              {noteSaving ? '…' : 'Enregistrer'}
            </button>
          </div>
        </div>

        {/* Action bloquer/débloquer */}
        <div className="pt-4 border-t border-gray-100">
          {client.is_blocked ? (
            <button onClick={() => { onUnblock(client.email); onClose() }}
              className="w-full rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
              Débloquer cette cliente
            </button>
          ) : (
            <button onClick={() => { onBlock(client.email); onClose() }}
              className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors">
              Bloquer cette cliente
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
