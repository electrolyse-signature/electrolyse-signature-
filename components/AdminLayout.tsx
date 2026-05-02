'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetInput, setResetInput] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const resetInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedView = localStorage.getItem('adminView')
    if (savedView === 'desktop' || savedView === 'mobile') {
      setView(savedView)
    } else {
      setView(window.innerWidth < 768 ? 'mobile' : 'desktop')
    }
    const savedTab = localStorage.getItem('adminTab') as Tab | null
    if (savedTab && ['planning','clients','compta','pauses','prix'].includes(savedTab)) {
      setTab(savedTab)
    }
  }, [])

  async function handleReset() {
    setResetLoading(true)
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' })
      if (res.ok) {
        setResetDone(true)
        setShowResetModal(false)
        setResetInput('')
        setTimeout(() => setResetDone(false), 4000)
        window.location.reload()
      }
    } finally {
      setResetLoading(false)
    }
  }

  function openResetModal() {
    setResetInput('')
    setShowResetModal(true)
    setTimeout(() => resetInputRef.current?.focus(), 50)
  }

  function switchTab(t: Tab) {
    setTab(t)
    localStorage.setItem('adminTab', t)
  }

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
                onClick={() => switchTab(t.key)}
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

        {/* ── Zone danger ── */}
        <div className="border-t border-gray-200 pt-8 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Zone danger</p>
              <p className="text-xs text-gray-400 mt-0.5">Supprime toutes les données de test avant la mise en production.</p>
            </div>
            <button
              onClick={openResetModal}
              className="text-xs text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              Réinitialiser les données
            </button>
          </div>
          {resetDone && (
            <p className="mt-2 text-xs text-green-600 font-medium">Données supprimées avec succès.</p>
          )}
        </div>

      </div>

      {/* ── Modale confirmation reset ── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">Réinitialiser toutes les données</h2>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              Cette action supprime <strong>définitivement</strong> toutes les données de test :
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside mb-4 space-y-0.5">
              <li>Annulations</li>
              <li>Clients bloqués</li>
              <li>Notes clientes</li>
              <li>Présences</li>
              <li>Approbations en attente</li>
            </ul>
            <p className="text-sm text-gray-600 mb-4">
              Les tarifs sont <strong>conservés</strong>. Cette action est irréversible.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tapez <span className="font-mono text-red-600">SUPPRIMER</span> pour confirmer
            </label>
            <input
              ref={resetInputRef}
              type="text"
              value={resetInput}
              onChange={e => setResetInput(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono mb-5 focus:outline-none focus:ring-2 focus:ring-red-300"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowResetModal(false); setResetInput('') }}
                className="text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                disabled={resetInput !== 'SUPPRIMER' || resetLoading}
                className="text-sm text-white bg-red-600 rounded-lg px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resetLoading ? 'Suppression…' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}
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
