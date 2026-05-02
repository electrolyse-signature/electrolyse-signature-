'use client'

import { useState, useEffect } from 'react'
import ExportCSVButton from '@/components/ExportCSVButton'

interface CAStats { reel: number; prevu: number }
interface MonthData { month: number; label: string; reel: number; prevu: number; seances: number }
interface ServiceStat { name: string; count: number; revenue: number }
interface ClientStat { name: string; count: number; revenue: number }
interface YearlyStats {
  monthly: MonthData[]
  topServices: ServiceStat[]
  topClients: ClientStat[]
}

interface Props {
  caToday: CAStats
  caWeek: CAStats
  caMonth: CAStats
}

const MOIS_FULL = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

export default function ComptaSection({ caToday, caWeek, caMonth }: Props) {
  const [stats, setStats] = useState<YearlyStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/compta-stats')
      .then(r => r.ok ? r.json() : null)
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const curMonth = now.getMonth()
  const year = now.getFullYear()

  const maxReel = stats ? Math.max(...stats.monthly.map(m => m.reel), 1) : 1

  return (
    <div className="space-y-8">

      {/* ── 3 cartes CA ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Aujourd'hui", stats: caToday, color: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50' },
          { label: 'Cette semaine', stats: caWeek,  color: 'text-teal-600',   border: 'border-teal-100',   bg: 'bg-teal-50'   },
          { label: 'Ce mois',       stats: caMonth, color: 'text-green-700',  border: 'border-green-100',  bg: 'bg-green-50'  },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border ${card.border} ${card.bg} px-5 py-4`}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-3">CA — {card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.stats.reel} €</p>
            {card.stats.prevu > 0 && (
              <p className="text-sm text-gray-400 mt-1">{card.stats.prevu} € prévu</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Graphique mensuel ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-gray-700">CA mensuel — {year}</h3>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Encaissé</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" /> Prévu</span>
          </div>
        </div>
        {loading ? (
          <div className="h-40 flex items-center justify-center text-sm text-gray-400">Chargement…</div>
        ) : (
          <div className="flex items-end gap-1.5 h-40">
            {(stats?.monthly ?? []).map((m, i) => {
              const isCurrentMonth = i === curMonth
              const isFuture = i > curMonth
              const totalHeight = ((m.reel + m.prevu) / maxReel) * 100
              const reelHeight = (m.reel / maxReel) * 100
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-2 whitespace-nowrap shadow-lg">
                      <p className="font-semibold">{MOIS_FULL[i]} {year}</p>
                      {m.reel > 0 && <p className="text-emerald-400">{m.reel} € encaissé</p>}
                      {m.prevu > 0 && <p className="text-gray-300">{m.prevu} € prévu</p>}
                      {m.seances > 0 && <p className="text-gray-400">{m.seances} séance{m.seances > 1 ? 's' : ''}</p>}
                      {m.reel === 0 && m.prevu === 0 && <p className="text-gray-400">—</p>}
                    </div>
                    <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                  </div>
                  {/* Barre */}
                  <div className="w-full flex flex-col justify-end" style={{ height: '128px' }}>
                    {isFuture ? (
                      m.prevu > 0 ? (
                        <div className="w-full rounded-t-sm bg-gray-200" style={{ height: `${totalHeight}%` }} />
                      ) : null
                    ) : (
                      <div className="w-full flex flex-col justify-end" style={{ height: `${Math.max(totalHeight, m.reel > 0 || m.prevu > 0 ? 4 : 0)}%` }}>
                        {m.prevu > 0 && (
                          <div className="w-full bg-gray-200" style={{ height: `${m.reel > 0 ? (m.prevu / (m.reel + m.prevu)) * 100 : 100}%` }} />
                        )}
                        {m.reel > 0 && (
                          <div className={`w-full rounded-t-sm ${isCurrentMonth ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                            style={{ height: `${reelHeight > 0 ? (m.reel / (m.reel + m.prevu || m.reel)) * 100 : 0}%` }} />
                        )}
                      </div>
                    )}
                  </div>
                  {/* Label mois */}
                  <p className={`text-[10px] font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>{m.label}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Top prestations + Top clientes ── */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Top prestations */}
          {stats.topServices.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Top prestations — {MOIS_FULL[curMonth]}
              </h3>
              <div className="space-y-3">
                {stats.topServices.map((s, i) => {
                  const maxRev = stats.topServices[0]?.revenue || 1
                  const pct = maxRev > 0 ? (s.revenue / maxRev) * 100 : 0
                  return (
                    <div key={s.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-700 truncate max-w-[65%]">
                          <span className="text-gray-400 mr-1.5">{i + 1}.</span>
                          {s.name}
                        </span>
                        <span className="text-gray-500 shrink-0 ml-2">
                          {s.revenue > 0 ? `${s.revenue} €` : '—'} · ×{s.count}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-teal-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top clientes */}
          {stats.topClients.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Top clientes — {MOIS_FULL[curMonth]}
              </h3>
              <div className="space-y-2.5">
                {stats.topClients.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}.</span>
                      <span className="text-xs font-medium text-gray-700 truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-xs text-gray-400">×{c.count}</span>
                      <span className="text-xs font-semibold text-emerald-600 min-w-[48px] text-right">
                        {c.revenue > 0 ? `${c.revenue} €` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.topServices.length === 0 && stats.topClients.length === 0 && (
            <p className="col-span-2 text-sm text-gray-400 text-center py-4">
              Aucune prestation encaissée ce mois-ci
            </p>
          )}
        </div>
      )}

      {/* ── Export ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Exporter le livre de recettes</h3>
            <p className="text-xs text-gray-400 mt-0.5">Format Excel (.xlsx) — TVA non applicable art. 293 B CGI</p>
          </div>
          <ExportCSVButton />
        </div>
      </div>

    </div>
  )
}
