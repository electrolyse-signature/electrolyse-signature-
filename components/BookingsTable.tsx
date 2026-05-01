'use client'

import { useState } from 'react'
import type { CalBooking } from '@/lib/cal-api'

interface AttendanceRecord {
  booking_id: string
  status: 'present' | 'absent'
}

export default function BookingsTable({
  bookings,
  blockedEmails,
  attendance: initialAttendance,
}: {
  bookings: CalBooking[]
  blockedEmails: string[]
  attendance: AttendanceRecord[]
}) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const [attendance, setAttendance] = useState<Map<string, 'present' | 'absent'>>(
    new Map(initialAttendance.map(a => [a.booking_id, a.status]))
  )
  const blocked = new Set(blockedEmails)
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

  // Group by day
  const byDay = new Map<string, CalBooking[]>()
  for (const b of bookings) {
    const day = new Date(b.startTime).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    const list = byDay.get(day) ?? []
    list.push(b)
    byDay.set(day, list)
  }

  if (bookings.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-gray-400 text-sm rounded-lg border border-gray-200 bg-white">
        Aucun rendez-vous
      </p>
    )
  }

  return (
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
                const isBlocked = attendee?.email ? blocked.has(attendee.email.toLowerCase()) : false
                const isAlerted = isBlocked && !dismissed.has(booking.id)
                const isPast = new Date(booking.startTime) < now
                const bookingIdStr = String(booking.id)
                const attendanceStatus = attendance.get(bookingIdStr)
                const start = new Date(booking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const end = new Date(booking.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

                return (
                  <tr key={booking.id} className={isAlerted ? 'bg-red-50' : isPast && !attendanceStatus ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap w-28">
                      {start} – {end}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{attendee?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{attendee?.email ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{booking.title}</td>
                    <td className="px-4 py-3 w-40">
                      {isPast ? (
                        attendanceStatus ? (
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
                        )
                      ) : isAlerted ? (
                        <button
                          onClick={() => setDismissed(prev => new Set([...prev, booking.id]))}
                          className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          ⚠ Bloqué — OK
                        </button>
                      ) : isBlocked ? (
                        <span className="text-xs text-gray-400">Bloqué</span>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
