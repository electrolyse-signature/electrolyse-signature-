'use client'

import { useState, useEffect } from 'react'
import type { CalBooking } from '@/lib/cal-api'
import { ADMIN_FROM_DATE } from '@/lib/admin-config'
import type { ClientSummary } from '@/lib/types'
import { getBookingPrice } from '@/lib/prices'
import ClientDetailModal from '@/components/ClientDetailModal'

interface AttendanceRecord {
  booking_id: string
  status: 'present' | 'absent'
}

export default function BookingsTable({
  bookings: initial,
  blockedEmails,
  attendance: initialAttendance,
}: {
  bookings: CalBooking[]
  blockedEmails: string[]
  attendance: AttendanceRecord[]
}) {
  const [bookings, setBookings] = useState(initial)
  const [attendance, setAttendance] = useState<Map<string, 'present' | 'absent'>>(
    new Map(initialAttendance.map(a => [a.booking_id, a.status]))
  )
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null)
  const [hiddenBookings, setHiddenBookings] = useState<Set<string>>(new Set())
  const [showHidden, setShowHidden] = useState(false)
  const blocked = new Set(blockedEmails)

  useEffect(() => {
    const saved = localStorage.getItem('admin-hidden-bookings')
    if (saved) setHiddenBookings(new Set(JSON.parse(saved)))
  }, [])

  function hideBooking(id: string) {
    setHiddenBookings(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem('admin-hidden-bookings', JSON.stringify([...next]))
      return next
    })
  }

  function unhideBooking(id: string) {
    setHiddenBookings(prev => {
      const next = new Set(prev)
      next.delete(id)
      localStorage.setItem('admin-hidden-bookings', JSON.stringify([...next]))
      return next
    })
  }

  async function openClient(attendee: { name: string; email: string }) {
    const email = attendee.email.toLowerCase()
    const res = await fetch(`/api/admin/client-summary?email=${encodeURIComponent(email)}`)
    const data = res.ok ? await res.json() : {}
    setSelectedClient({
      name: attendee.name,
      email,
      is_blocked: data.is_blocked ?? blocked.has(email),
      cancellation_count: data.cancellation_count ?? 0,
      last_cancelled_at: data.last_cancelled_at ?? null,
      note: data.note ?? null,
    })
  }

  function handleBlockUpdate(email: string, is_blocked: boolean) {
    setSelectedClient(prev => prev?.email === email ? { ...prev, is_blocked } : prev)
  }

  function handleNoteUpdate(email: string, note: string) {
    setSelectedClient(prev => prev?.email === email ? { ...prev, note } : prev)
  }

  async function handleBlock(email: string) {
    await fetch('/api/admin/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    handleBlockUpdate(email, true)
  }

  async function handleUnblock(email: string) {
    await fetch('/api/admin/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    handleBlockUpdate(email, false)
  }
  const now = new Date()

  async function markAttendance(booking: CalBooking, status: 'present' | 'absent') {
    const attendee = booking.attendees?.[0]
    const date = new Date(booking.startTime).toISOString().split('T')[0]
    await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: String(booking.id),
        email: attendee?.email ?? '',
        name: attendee?.name ?? '',
        date,
        status,
      }),
    })
    setAttendance(prev => new Map(prev).set(String(booking.id), status))
  }

  async function cancelBooking(booking: CalBooking, defaultReason: string) {
    const name = booking.attendees?.[0]?.name ?? 'ce client'
    const isPauseBooking = booking.attendees?.[0]?.name === 'Pause'
    const label = isPauseBooking ? 'cette pause' : `le RDV de ${name}`
    const reason = isPauseBooking
      ? (window.confirm(`Supprimer ${label} ?`) ? defaultReason : null)
      : window.prompt(`Motif d'annulation pour ${name} (sera inclus dans le mail client) :`, defaultReason)
    if (reason === null) return
    setCancellingId(booking.id)
    try {
      const res = await fetch('/api/admin/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: booking.uid, reason }),
      })
      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== booking.id))
      }
    } finally {
      setCancellingId(null)
    }
  }

  // Seules les réservations à partir de ADMIN_FROM_DATE sont visibles
  const afterDate = bookings.filter(b => b.startTime >= ADMIN_FROM_DATE)
  const hiddenCount = afterDate.filter(b => hiddenBookings.has(String(b.id))).length

  // Group by day (filter hidden unless showHidden)
  const byDay = new Map<string, CalBooking[]>()
  for (const b of afterDate) {
    if (!showHidden && hiddenBookings.has(String(b.id))) continue
    const day = new Date(b.startTime).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    const list = byDay.get(day) ?? []
    list.push(b)
    byDay.set(day, list)
  }

  if (afterDate.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-gray-400 text-sm rounded-lg border border-gray-200 bg-white">
        Aucun rendez-vous
      </p>
    )
  }

  return (
    <>
    {hiddenCount > 0 && (
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowHidden(v => !v)}
          className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full px-3 py-1 bg-white"
        >
          {showHidden ? `Masquer les ${hiddenCount} entrée${hiddenCount > 1 ? 's' : ''} cachée${hiddenCount > 1 ? 's' : ''}` : `${hiddenCount} entrée${hiddenCount > 1 ? 's' : ''} cachée${hiddenCount > 1 ? 's' : ''} — Afficher`}
        </button>
      </div>
    )}
    {selectedClient && (
      <ClientDetailModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
        onNoteUpdate={handleNoteUpdate}
      />
    )}
    <div className="space-y-4">
      {Array.from(byDay.entries()).map(([day, dayBookings]) => (
        <div key={day} className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 capitalize">{day}</p>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {dayBookings.map(booking => {
                const attendee = booking.attendees?.[0]
                const isPause = attendee?.name === 'Pause'
                const isBlocked = !isPause && attendee?.email ? blocked.has(attendee.email.toLowerCase()) : false
                const isPast = new Date(booking.startTime) < now
                const bookingIdStr = String(booking.id)
                const attendanceStatus = attendance.get(bookingIdStr)
                const start = new Date(booking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const end = new Date(booking.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const price = getBookingPrice(booking.startTime, booking.endTime, booking.title)
                const isCancelling = cancellingId === booking.id

                if (isPause) {
                  return (
                    <tr key={booking.id} className="bg-gray-100">
                      <td className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap w-28">{start} – {end}</td>
                      <td colSpan={4} className="px-4 py-3 text-gray-400 italic text-sm">— Pause —</td>
                      <td className="px-4 py-3 w-40">
                        {!isPast && (
                          <button
                            onClick={() => cancelBooking(booking, 'Pause annulée')}
                            disabled={isCancelling}
                            className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-300 disabled:opacity-50"
                          >
                            {isCancelling ? '…' : '✕ Supprimer'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={booking.id} className={isBlocked ? 'bg-red-50' : isPast && !attendanceStatus ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap w-28">
                      {start} – {end}
                    </td>
                    <td className="px-4 py-3">
                      {attendee?.email ? (
                        <button
                          onClick={() => openClient(attendee as { name: string; email: string })}
                          className="text-gray-700 font-medium hover:underline hover:text-blush text-left"
                        >
                          {attendee.name ?? '—'}
                        </button>
                      ) : (
                        <p className="text-gray-700 font-medium">{attendee?.name ?? '—'}</p>
                      )}
                      {attendee?.phoneNumber && (
                        <a href={`tel:${attendee.phoneNumber}`} className="text-xs text-blue-500 hover:underline">
                          {attendee.phoneNumber}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {attendee?.email
                        ? <a href={`mailto:${attendee.email}`} className="text-gray-500 hover:text-blue-500 hover:underline">{attendee.email}</a>
                        : <span className="text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{booking.title}</td>
                    <td className="px-4 py-3 whitespace-nowrap w-16">
                      {price > 0 ? (
                        <span className={isPast
                          ? attendanceStatus === 'present' ? 'font-semibold text-emerald-600' : 'text-gray-400 line-through'
                          : 'text-gray-400 italic'
                        }>
                          {price} €
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 w-40">
                      {isPast ? (
                        <div className="flex flex-col gap-1">
                          {attendanceStatus ? (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                attendanceStatus === 'present'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {attendanceStatus === 'present' ? '✓ Venu' : '✗ Absent'}
                              </span>
                              <button
                                onClick={() => markAttendance(booking, attendanceStatus === 'present' ? 'absent' : 'present')}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                Changer
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                onClick={() => markAttendance(booking, 'present')}
                                className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 hover:bg-green-200"
                              >
                                ✓ Venu
                              </button>
                              <button
                                onClick={() => markAttendance(booking, 'absent')}
                                className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-200"
                              >
                                ✗ Absent
                              </button>
                            </div>
                          )}
                          {hiddenBookings.has(bookingIdStr) ? (
                            <button onClick={() => unhideBooking(bookingIdStr)} className="text-xs text-gray-400 hover:underline text-left">Réafficher</button>
                          ) : (
                            <button onClick={() => hideBooking(bookingIdStr)} className="text-xs text-gray-400 hover:underline text-left">Masquer</button>
                          )}
                        </div>
                      ) : isBlocked ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                            Bloqué
                          </span>
                          <button
                            onClick={() => cancelBooking(booking, 'Annulé par le salon')}
                            disabled={isCancelling}
                            className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-200 disabled:opacity-50"
                          >
                            {isCancelling ? '…' : 'Annuler'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => cancelBooking(booking, 'Annulé par le salon')}
                          disabled={isCancelling}
                          className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-200 disabled:opacity-50"
                        >
                          {isCancelling ? '…' : 'Annuler'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
    </>
  )
}
