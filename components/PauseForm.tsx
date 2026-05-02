'use client'

import { useState } from 'react'

export default function PauseForm() {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/admin/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Erreur inconnue')
        setStatus('error')
      } else {
        setStatus('ok')
        setDate('')
        setTime('')
      }
    } catch {
      setErrorMsg('Erreur réseau')
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2 className="text-lg font-medium text-gray-700 mb-3">Bloquer un créneau — Pause 30 min</h2>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm px-6 py-5">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
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

          {status === 'ok' && (
            <span className="text-sm text-green-600 font-medium">✓ Créneau bloqué</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-600">{errorMsg}</span>
          )}
        </form>
        <p className="mt-3 text-xs text-gray-400">La pause apparaîtra dans le planning et bloquera le créneau dans Cal.com.</p>
      </div>
    </section>
  )
}
