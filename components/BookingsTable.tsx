'use client'

import { useState } from 'react'
import type { CalBooking } from '@/lib/cal-api'

export default function BookingsTable({
  bookings,
  blockedEmails,
}: {
  bookings: CalBooking[]
  blockedEmails: string[]
}) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const blocked = new Set(blockedEmails)

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
        Aucun rendez-vous à venir
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
                const start = new Date(booking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                const end = new Date(booking.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

                return (
                  <tr key={booking.id} className={isAlerted ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap w-28">
                      {start} – {end}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{attendee?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{attendee?.email ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{booking.title}</td>
                    <td className="px-4 py-3 w-24">
                      {isAlerted ? (
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
