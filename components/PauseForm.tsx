'use client'

import { useState } from 'react'

type Mode = 'creneau' | 'journee' | 'conges'

export default function PauseForm() {
  const [mode, setMode] = useState<Mode>('creneau')

  // Créneau state
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState<'30' | '60'>('30')

  // Journée state
  const [dayDate, setDayDate] = useState('')
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(18)

  // Congés state
  const [congesStart, setCongesStart] = useState('')
  const [congesEnd, setCongesEnd] = useState('')
  const [congesStartHour, setCongesStartHour] = useState(9)
  const [congesEndHour, setCongesEndHour] = useState(18)

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  const today = new Date().toISOString().split('T')[0]

  async function handleCreneauSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/admin/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, duration }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatusMsg(data.error ?? 'Erreur inconnue')
        setStatus('error')
      } else {
        setStatus('ok')
        setStatusMsg('Créneau bloqué')
        setDate('')
        setTime('')
      }
    } catch {
      setStatusMsg('Erreur réseau')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  async function handleCongesSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!congesStart || !congesEnd || congesStart > congesEnd) {
      setStatus('error')
      setStatusMsg('Dates invalides')
      return
    }
    if (congesStartHour >= congesEndHour) {
      setStatus('error')
      setStatusMsg('L\'heure de fin doit être après l\'heure de début')
      return
    }
    setLoading(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/admin/block-period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: congesStart, endDate: congesEnd, startHour: congesStartHour, endHour: congesEndHour }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatusMsg(data.error ?? 'Erreur inconnue')
        setStatus('error')
      } else {
        setStatus('ok')
        setStatusMsg(`${data.days} jour${data.days > 1 ? 's' : ''} bloqué${data.days > 1 ? 's' : ''} — ${data.blocked} créneau${data.blocked > 1 ? 'x' : ''} créé${data.blocked > 1 ? 's' : ''}${data.failed > 0 ? ` (${data.failed} ignoré${data.failed > 1 ? 's' : ''})` : ''}`)
        setCongesStart('')
        setCongesEnd('')
      }
    } catch {
      setStatusMsg('Erreur réseau')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  async function handleJourneeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (startHour >= endHour) {
      setStatus('error')
      setStatusMsg('L\'heure de fin doit être après l\'heure de début')
      return
    }
    setLoading(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/admin/block-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dayDate, startHour, endHour }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatusMsg(data.error ?? 'Erreur inconnue')
        setStatus('error')
      } else {
        setStatus('ok')
        setStatusMsg(`${data.blocked} créneau${data.blocked > 1 ? 'x' : ''} bloqué${data.blocked > 1 ? 's' : ''}${data.failed > 0 ? ` (${data.failed} déjà occupé${data.failed > 1 ? 's' : ''})` : ''}`)
        setDayDate('')
      }
    } catch {
      setStatusMsg('Erreur réseau')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2 className="text-lg font-medium text-gray-700 mb-3">Bloquer des créneaux</h2>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm px-6 py-5">

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm w-fit mb-5">
          <button
            type="button"
            onClick={() => { setMode('creneau'); setStatus('idle') }}
            className={`px-4 py-2 transition-colors cursor-pointer ${mode === 'creneau' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Pause courte
          </button>
          <button
            type="button"
            onClick={() => { setMode('journee'); setStatus('idle') }}
            className={`px-4 py-2 border-l border-gray-200 transition-colors cursor-pointer ${mode === 'journee' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Journée entière
          </button>
          <button
            type="button"
            onClick={() => { setMode('conges'); setStatus('idle') }}
            className={`px-4 py-2 border-l border-gray-200 transition-colors cursor-pointer ${mode === 'conges' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Congés
          </button>
        </div>

        {mode === 'creneau' ? (
          <form onSubmit={handleCreneauSubmit} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Durée</label>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() => setDuration('30')}
                  className={`px-4 py-2 transition-colors cursor-pointer ${duration === '30' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  30 min
                </button>
                <button
                  type="button"
                  onClick={() => setDuration('60')}
                  className={`px-4 py-2 border-l border-gray-200 transition-colors cursor-pointer ${duration === '60' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  1 heure
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input
                type="date"
                required
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blush transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Heure de début</label>
              <input
                type="time"
                required
                step={300}
                value={time}
                onChange={e => setTime(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blush transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gray-800 text-white text-sm px-5 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {loading ? 'Réservation…' : 'Bloquer ce créneau'}
            </button>
            {status === 'ok' && <span className="text-sm text-green-600 font-medium">✓ {statusMsg}</span>}
            {status === 'error' && <span className="text-sm text-red-600">{statusMsg}</span>}
          </form>
        ) : mode === 'journee' ? (
          <form onSubmit={handleJourneeSubmit} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input
                type="date"
                required
                min={today}
                value={dayDate}
                onChange={e => setDayDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blush transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
              <select
                value={startHour}
                onChange={e => setStartHour(Number(e.target.value))}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blush transition-colors"
              >
                {Array.from({ length: 14 }, (_, i) => i + 6).map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}h00</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">À</label>
              <select
                value={endHour}
                onChange={e => setEndHour(Number(e.target.value))}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blush transition-colors"
              >
                {Array.from({ length: 14 }, (_, i) => i + 7).map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}h00</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gray-800 text-white text-sm px-5 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {loading ? 'Blocage en cours…' : 'Bloquer la journée'}
            </button>
            {status === 'ok' && <span className="text-sm text-green-600 font-medium">✓ {statusMsg}</span>}
            {status === 'error' && <span className="text-sm text-red-600">{statusMsg}</span>}
          </form>
        ) : (
          <form onSubmit={handleCongesSubmit} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
              <input
                type="date"
                required
                min={today}
                value={congesStart}
                onChange={e => setCongesStart(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blush transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
              <input
                type="date"
                required
                min={congesStart || today}
                value={congesEnd}
                onChange={e => setCongesEnd(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blush transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
              <select
                value={congesStartHour}
                onChange={e => setCongesStartHour(Number(e.target.value))}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blush transition-colors"
              >
                {Array.from({ length: 14 }, (_, i) => i + 6).map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}h00</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">À</label>
              <select
                value={congesEndHour}
                onChange={e => setCongesEndHour(Number(e.target.value))}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blush transition-colors"
              >
                {Array.from({ length: 14 }, (_, i) => i + 7).map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}h00</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gray-800 text-white text-sm px-5 py-2 hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              {loading ? 'Blocage en cours…' : 'Bloquer les congés'}
            </button>
            {status === 'ok' && <span className="text-sm text-green-600 font-medium">✓ {statusMsg}</span>}
            {status === 'error' && <span className="text-sm text-red-600">{statusMsg}</span>}
          </form>
        )}

        <p className="mt-3 text-xs text-gray-400">
          {mode === 'creneau'
            ? 'La pause bloquera le créneau dans Cal.com.'
            : mode === 'journee'
            ? 'Crée des blocs d\'1h — ajuste les horaires selon ta journée.'
            : 'Bloque chaque jour de la période sélectionnée sur les horaires choisis.'}
        </p>
      </div>
    </section>
  )
}
