'use client'

import { useState, useEffect } from 'react'
import type { CalBooking } from '@/lib/cal-api'
import type { ClientSummary } from '@/lib/types'
import type { PendingApproval } from '@/components/PendingApprovalsTable'
import AdminRefresher from '@/components/AdminRefresher'
import BookingsTable from '@/components/BookingsTable'
import PendingApprovalsTable from '@/components/PendingApprovalsTable'
import StatsCards from '@/components/StatsCards'
import PlanningStats from '@/components/PlanningStats'
import PauseForm from '@/components/PauseForm'
import AdminMobileView from '@/components/AdminMobileView'
import AllClientsSection from '@/components/AllClientsSection'
import PricesSection from '@/components/PricesSection'
import ComptaSection from '@/components/ComptaSection'

type AttendanceRecord = { booking_id: string; status: 'present' | 'absent' }
interface CAStats { reel: number; prevu: number }

type Tab = 'planning' | 'clients' | 'compta' | 'pauses' | 'prix'

export interface AdminData {
  today: string
  bookings: CalBooking[]
  blockedEmails: string[]
  attendance: AttendanceRecord[]
  pendingApprovals: PendingApproval[]
  clients: ClientSummary[]
  caToday: CAStats
  caWeek: CAStats
  caMonth: CAStats
  todayCount: number
  weekCount: number
  unmarkedCount: number
  signaledCount: number
  cancellations30d: number | null
}

export default function AdminLayout({
  data,
  signOut,
}: {
  data: AdminData
  signOut: () => Promise<void>
}) {
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop')
  const [tab, setTab] = useState<Tab>('planning')

  useEffect(() => {
    const saved = localStorage.getItem('adminView')
    if (saved === 'desktop' || saved === 'mobile') {
      setView(saved)
    } else {
      setView(window.innerWidth < 768 ? 'mobile' : 'desktop')
    }
  }, [])

  function toggle() {
    const next = view === 'desktop' ? 'mobile' : 'desktop'
    setView(next)
    localStorage.setItem('adminView', next)
  }

  if (view === 'mobile') {
    return (
      <AdminMobileView
        today={data.today}
        bookings={data.bookings}
        blockedEmails={data.blockedEmails}
        attendance={data.attendance}
        pendingApprovals={data.pendingApprovals}
        caToday={data.caToday}
        caWeek={data.caWeek}
        caMonth={data.caMonth}
        todayCount={data.todayCount}
        weekCount={data.weekCount}
        unmarkedCount={data.unmarkedCount}
        onToggleView={toggle}
        signOut={signOut}
      />
    )
  }

  // ── Vue bureau ──
  return (
    <main className="min-h-screen bg-gray-50">
      {/* En-tête fixe */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-8 py-3 flex items-center justify-between">
          <h1 className="text-base font-semibold text-gray-900 capitalize">{data.today}</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              title="Passer en vue mobile"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <PhoneIcon />
              Mobile
            </button>
            <AdminRefresher />
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                Déconnexion
              </button>
            </form>
          </div>
        </div>

        {/* Onglets */}
        <div className="max-w-5xl mx-auto px-8">
          <nav className="flex gap-0 -mb-px">
            {([
              { key: 'planning', label: 'Planning' },
              { key: 'clients',  label: `Clients${data.signaledCount > 0 ? ` (${data.signaledCount} signalée${data.signaledCount > 1 ? 's' : ''})` : ''}` },
              { key: 'compta',   label: 'Comptabilité' },
              { key: 'pauses',   label: 'Pauses' },
              { key: 'prix',     label: 'Prix' },
            ] as { key: Tab; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">

        {/* ── Onglet Planning ── */}
        {tab === 'planning' && (
          <>
            {data.pendingApprovals.length > 0 && (
              <PendingApprovalsTable approvals={data.pendingApprovals} />
            )}

            <section>
              <h2 className="text-lg font-medium text-gray-700 mb-3">
                Planning — hier &amp; 7 prochains jours
              </h2>
              <PlanningStats
                todayCount={data.todayCount}
                weekCount={data.weekCount}
                unmarkedCount={data.unmarkedCount}
              />
              <BookingsTable
                bookings={data.bookings}
                blockedEmails={data.blockedEmails}
                attendance={data.attendance}
              />
            </section>

          </>
        )}

        {/* ── Onglet Clients ── */}
        {tab === 'clients' && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-medium text-gray-700">Toutes les clientes</h2>
              {(data.cancellations30d ?? 0) > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                  {data.cancellations30d} annulation{(data.cancellations30d ?? 0) > 1 ? 's' : ''} ces 30 derniers jours
                </span>
              )}
            </div>
            <AllClientsSection />
          </section>
        )}

        {/* ── Onglet Comptabilité ── */}
        {tab === 'compta' && (
          <section>
            <h2 className="text-lg font-medium text-gray-700 mb-6">Comptabilité</h2>
            <ComptaSection caToday={data.caToday} caWeek={data.caWeek} caMonth={data.caMonth} />
          </section>
        )}

        {/* ── Onglet Pauses ── */}
        {tab === 'pauses' && (
          <PauseForm />
        )}

        {/* ── Onglet Prix ── */}
        {tab === 'prix' && (
          <section>
            <h2 className="text-lg font-medium text-gray-700 mb-5">Gestion des tarifs</h2>
            <PricesSection />
          </section>
        )}

      </div>
    </main>
  )
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  )
}
