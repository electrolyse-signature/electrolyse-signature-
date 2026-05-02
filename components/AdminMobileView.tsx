'use client'

import { useState } from 'react'
import type { CalBooking } from '@/lib/cal-api'
import type { ClientSummary } from '@/lib/types'
import type { PendingApproval } from '@/components/PendingApprovalsTable'
import PendingApprovalsTable from '@/components/PendingApprovalsTable'
import AdminRefresher from '@/components/AdminRefresher'
import AllClientsSection from '@/components/AllClientsSection'
import PauseForm from '@/components/PauseForm'
import PricesSection from '@/components/PricesSection'
import ComptaSection from '@/components/ComptaSection'
import ClientDetailModal from '@/components/ClientDetailModal'
import { getBookingPrice } from '@/lib/prices'

type AttendanceRecord = { booking_id: string; status: 'present' | 'absent' }
interface CAStats { reel: number; prevu: number }
type MobileTab = 'planning' | 'clients' | 'compta' | 'pauses' | 'prix'

interface Props {
  today: string
  bookings: CalBooking[]
  blockedEmails: string[]
  attendance: AttendanceRecord[]
  pendingApprovals: PendingApproval[]
  caToday: CAStats
  caWeek: CAStats
  caMonth: CAStats
  todayCount: number
  weekCount: number
  unmarkedCount: number
  onToggleView: () => void
  signOut: () => Promise<void>
}

export default function AdminMobileView({
  today, bookings: initial, blockedEmails, attendance: initialAttendance,
  pendingApprovals, caToday, caWeek, caMonth, todayCount, weekCount, unmarkedCount,
  onToggleView, signOut,
}: Props) {
  const [tab, setTab] = useState<MobileTab>('planning')
  const [bookings, setBookings] = useState(initial)
  const [attendance, setAttendance] = useState<Map<string, 'present' | 'absent'>>(
    new Map(initialAttendance.map(a => [a.booking_id, a.status]))
  )
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [weekOpen, setWeekOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null)

  const blocked = new Set(blockedEmails)
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const todayBookings = bookings.filter(b =>
    new Date(b.startTime).toISOString().split('T')[0] === todayStr
  )
  const upcomingBookings = bookings.filter(b =>
    new Date(b.startTime).toISOString().split('T')[0] > todayStr
  )

  const byDay = new Map<string, { label: string; items: CalBooking[] }>()
  for (const b of upcomingBookings) {
    const d = new Date(b.startTime).toISOString().split('T')[0]
    if (!byDay.has(d)) {
      byDay.set(d, {
        label: new Date(b.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
        items: [],
      })
    }
    byDay.get(d)!.items.push(b)
  }

  const nextBooking = bookings.find(b => new Date(b.startTime) > now && b.attendees?.[0]?.name !== 'Pause')

  async function markAttendance(booking: CalBooking, status: 'present' | 'absent') {
    const attendee = booking.attendees?.[0]
    await fetch('/api/admin/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: String(booking.id),
        email: attendee?.email ?? '',
        name: attendee?.name ?? '',
        date: new Date(booking.startTime).toISOString().split('T')[0],
        status,
      }),
    })
    setAttendance(prev => new Map(prev).set(String(booking.id), status))
  }

  async function cancelBooking(booking: CalBooking) {
    const isPause = booking.attendees?.[0]?.name === 'Pause'
    const name = booking.attendees?.[0]?.name ?? 'ce client'
    const reason = isPause
      ? (window.confirm('Supprimer cette pause ?') ? 'Pause annulée' : null)
      : window.prompt(`Motif d'annulation pour ${name} :`, 'Annulé par le salon')
    if (reason === null) return
    setCancellingId(booking.id)
    try {
      const res = await fetch('/api/admin/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: booking.uid, reason }),
      })
      if (res.ok) setBookings(prev => prev.filter(b => b.id !== booking.id))
    } finally {
      setCancellingId(null)
    }
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

  async function handleBlock(email: string) {
    await fetch('/api/admin/block', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setSelectedClient(prev => prev?.email === email ? { ...prev, is_blocked: true } : prev)
  }

  async function handleUnblock(email: string) {
    await fetch('/api/admin/unblock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setSelectedClient(prev => prev?.email === email ? { ...prev, is_blocked: false } : prev)
  }

  const tabs: { key: MobileTab; label: string; icon: React.ReactNode }[] = [
    { key: 'planning', label: 'Planning', icon: <CalIcon /> },
    { key: 'clients',  label: 'Clients',  icon: <UsersIcon /> },
    { key: 'compta',   label: 'Compta',   icon: <ChartIcon /> },
    { key: 'pauses',   label: 'Pauses',   icon: <PauseIcon /> },
    { key: 'prix',     label: 'Prix',     icon: <TagIcon /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
          onNoteUpdate={(email, note) => setSelectedClient(prev => prev?.email === email ? { ...prev, note } : prev)}
        />
      )}

      {/* ── Header sticky ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-semibold text-gray-900 capitalize truncate max-w-[160px]">{today}</h1>
          <div className="flex items-center gap-2">
            <AdminRefresher />
            <button
              onClick={onToggleView}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <MonitorIcon />
              Bureau
            </button>
            <form action={signOut}>
              <button type="submit" className="text-xs text-gray-400 hover:text-gray-600 px-1">Déco.</button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-4 space-y-5">

          {/* ── Planning ── */}
          {tab === 'planning' && (
            <>
              {pendingApprovals.length > 0 && <PendingApprovalsTable approvals={pendingApprovals} />}

              {/* Stats rapides */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white border border-gray-200 px-3 py-3 text-center">
                  <p className="text-xs text-gray-400 mb-0.5 leading-tight">RDV aujourd&apos;hui</p>
                  <p className="text-xl font-bold text-gray-800">{todayCount}</p>
                </div>
                <div className="rounded-xl bg-white border border-gray-200 px-3 py-3 text-center">
                  <p className="text-xs text-gray-400 mb-0.5 leading-tight">À venir semaine</p>
                  <p className="text-xl font-bold text-gray-800">{weekCount}</p>
                </div>
                {unmarkedCount > 0 ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-3 text-center">
                    <p className="text-xs text-amber-600 mb-0.5 leading-tight">Non marqués</p>
                    <p className="text-xl font-bold text-amber-600">{unmarkedCount}</p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-white border border-gray-200 px-3 py-3 text-center">
                    <p className="text-xs text-gray-400 mb-0.5 leading-tight">CA encaissé auj.</p>
                    <p className="text-lg font-bold text-emerald-600">{caToday.reel}€</p>
                  </div>
                )}
              </div>

              {/* RDV du jour */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Aujourd&apos;hui</p>
                {todayBookings.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-8 bg-white rounded-xl border border-gray-200">
                    Aucun RDV aujourd&apos;hui
                  </p>
                ) : (
                  <div className="space-y-3">
                    {todayBookings.map(booking => {
                      const attendee = booking.attendees?.[0]
                      const isPause = attendee?.name === 'Pause'
                      const isBlocked = !isPause && !!attendee?.email && blocked.has(attendee.email.toLowerCase())
                      const isPast = new Date(booking.startTime) < now
                      const attendanceStatus = attendance.get(String(booking.id))
                      const isNext = booking.id === nextBooking?.id
                      const isCancelling = cancellingId === booking.id
                      const start = new Date(booking.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      const end = new Date(booking.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      const price = getBookingPrice(booking.startTime, booking.endTime, booking.title)

                      if (isPause) {
                        return (
                          <div key={booking.id} className="rounded-xl bg-gray-100 border border-gray-200 px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-gray-500">{start} – {end}</p>
                              <p className="text-sm text-gray-400 italic">— Pause —</p>
                            </div>
                            {!isPast && (
                              <button onClick={() => cancelBooking(booking)} disabled={isCancelling}
                                className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-300 disabled:opacity-50">
                                {isCancelling ? '…' : '✕'}
                              </button>
                            )}
                          </div>
                        )
                      }

                      return (
                        <div key={booking.id} className={`rounded-xl border px-4 py-4 shadow-sm ${
                          isNext && !isPast ? 'border-rose-200 bg-rose-50/40'
                          : isBlocked ? 'border-red-200 bg-red-50'
                          : isPast && !attendanceStatus ? 'border-amber-200 bg-amber-50'
                          : 'border-gray-200 bg-white'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                <span className="text-xs font-medium text-gray-500">{start} – {end}</span>
                                {isNext && !isPast && <span className="text-xs font-semibold text-rose-600 bg-rose-100 rounded-full px-2 py-0.5">Prochain</span>}
                                {isBlocked && <span className="text-xs font-medium text-red-700 bg-red-100 rounded-full px-2 py-0.5">Bloquée</span>}
                              </div>
                              {attendee?.email ? (
                                <button onClick={() => openClient(attendee as { name: string; email: string })}
                                  className="text-base font-semibold text-gray-900 hover:underline hover:text-blush text-left truncate block max-w-full">
                                  {attendee.name ?? '—'}
                                </button>
                              ) : (
                                <p className="text-base font-semibold text-gray-900 truncate">{attendee?.name ?? '—'}</p>
                              )}
                              {attendee?.phoneNumber && (
                                <a href={`tel:${attendee.phoneNumber}`} className="text-xs text-blue-500 hover:underline block">{attendee.phoneNumber}</a>
                              )}
                              {attendee?.email && (
                                <a href={`mailto:${attendee.email}`} className="text-xs text-gray-400 hover:text-blue-500 hover:underline block truncate">{attendee.email}</a>
                              )}
                              <p className="text-xs text-gray-400 truncate">{booking.title}</p>
                            </div>
                            {price > 0 && (
                              <span className={`text-sm font-semibold ml-3 shrink-0 ${
                                attendanceStatus === 'present' ? 'text-emerald-600'
                                : attendanceStatus === 'absent' ? 'text-gray-300 line-through'
                                : 'text-gray-400'
                              }`}>{price}€</span>
                            )}
                          </div>
                          {isPast ? (
                            attendanceStatus ? (
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${attendanceStatus === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {attendanceStatus === 'present' ? '✓ Venue' : '✗ Absente'}
                                </span>
                                <button onClick={() => markAttendance(booking, attendanceStatus === 'present' ? 'absent' : 'present')}
                                  className="text-xs text-gray-400 hover:text-gray-600 underline">Changer</button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => markAttendance(booking, 'present')}
                                  className="rounded-xl bg-green-100 py-3 text-sm font-semibold text-green-700 hover:bg-green-200 active:scale-95 transition-transform">
                                  ✓ Venue
                                </button>
                                <button onClick={() => markAttendance(booking, 'absent')}
                                  className="rounded-xl bg-red-100 py-3 text-sm font-semibold text-red-700 hover:bg-red-200 active:scale-95 transition-transform">
                                  ✗ Absente
                                </button>
                              </div>
                            )
                          ) : (
                            <div className="flex justify-end">
                              <button onClick={() => cancelBooking(booking)} disabled={isCancelling}
                                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-200 disabled:opacity-50">
                                {isCancelling ? '…' : 'Annuler'}
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* CA */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Caisse</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white border border-gray-200 px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">Aujourd&apos;hui</p>
                    <p className="text-xl font-bold text-emerald-600">{caToday.reel} €</p>
                    {caToday.prevu > 0 && <p className="text-xs text-gray-400 mt-0.5">{caToday.prevu} € prévu</p>}
                  </div>
                  <div className="rounded-xl bg-white border border-gray-200 px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">Ce mois</p>
                    <p className="text-xl font-bold text-emerald-600">{caMonth.reel} €</p>
                    {caMonth.prevu > 0 && <p className="text-xs text-gray-400 mt-0.5">{caMonth.prevu} € prévu</p>}
                  </div>
                </div>
              </section>

              {/* Semaine */}
              {byDay.size > 0 && (
                <section>
                  <button onClick={() => setWeekOpen(o => !o)} className="flex items-center gap-2 w-full text-left py-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Cette semaine</span>
                    <span className={`text-gray-400 text-xs transition-transform duration-150 ${weekOpen ? 'rotate-90' : ''}`}>▶</span>
                    <span className="ml-auto text-xs text-gray-400">{upcomingBookings.length} RDV</span>
                  </button>
                  {weekOpen && (
                    <div className="mt-3 space-y-4">
                      {Array.from(byDay.entries()).map(([dayStr, { label, items }]) => (
                        <div key={dayStr}>
                          <p className="text-xs font-medium text-gray-500 capitalize mb-2">{label}</p>
                          <div className="space-y-1.5">
                            {items.map(b => {
                              const isPause = b.attendees?.[0]?.name === 'Pause'
                              const start = new Date(b.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                              const end = new Date(b.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                              const price = !isPause ? getBookingPrice(b.startTime, b.endTime, b.title) : 0
                              return (
                                <div key={b.id} className="flex items-center gap-3 rounded-lg bg-white border border-gray-100 px-3 py-2.5">
                                  <span className="text-xs font-medium text-gray-500 w-20 shrink-0">{start}–{end}</span>
                                  <span className="text-xs text-gray-700 flex-1 truncate">
                                    {isPause ? <span className="italic text-gray-400">Pause</span> : b.attendees?.[0]?.name}
                                  </span>
                                  {!isPause && price > 0 && <span className="text-xs text-gray-400 shrink-0">{price}€</span>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}

              {/* ── Clients ── */}
          {tab === 'clients' && <AllClientsSection />}

          {/* ── Comptabilité ── */}
          {tab === 'compta' && (
            <section>
              <h2 className="text-base font-semibold text-gray-800 mb-4">Comptabilité</h2>
              <ComptaSection caToday={caToday} caWeek={caWeek} caMonth={caMonth} />
            </section>
          )}

          {/* ── Pauses ── */}
          {tab === 'pauses' && <PauseForm />}

          {/* ── Prix ── */}
          {tab === 'prix' && (
            <section>
              <h2 className="text-base font-semibold text-gray-800 mb-4">Gestion des tarifs</h2>
              <PricesSection />
            </section>
          )}

        </div>
      </div>

      {/* ── Barre de navigation en bas ── */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-10">
        <div className="grid grid-cols-5 h-16">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                tab === t.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className={`transition-transform ${tab === t.key ? 'scale-110' : ''}`}>{t.icon}</span>
              <span className="text-[10px] font-medium">{t.label}</span>
              {tab === t.key && <span className="absolute bottom-0 w-8 h-0.5 bg-gray-900 rounded-full" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChartIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
}
function CalIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function UsersIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function PauseIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>
}
function TagIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
}
function MonitorIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
}
