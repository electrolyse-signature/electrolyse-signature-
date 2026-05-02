'use client'

import { useState } from 'react'

export interface ExportRow {
  date: string; heure: string; name: string; email: string
  service: string; price: number; presence: string
}

export default function ExportCSVButton() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [loadingMonth, setLoadingMonth] = useState(false)
  const [loadingYear,  setLoadingYear]  = useState(false)

  const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  function prev() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function next() {
    const atCurrent = year === now.getFullYear() && month >= now.getMonth() + 1
    if (atCurrent) return
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  const atCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  async function download(url: string, filename: string, setLoading: (v: boolean) => void) {
    setLoading(true)
    try {
      const res = await fetch(url)
      if (!res.ok) return
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Ligne mois */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white overflow-hidden text-xs">
          <button onClick={prev} className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors">‹</button>
          <span className="px-2 py-1.5 font-medium text-gray-700 min-w-[110px] text-center">
            {MOIS[month - 1]} {year}
          </span>
          <button onClick={next} disabled={atCurrentMonth} className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors">›</button>
        </div>
        <button
          onClick={() => download(
            `/api/admin/export?year=${year}&month=${month}`,
            `Livre-recettes-${year}-${String(month).padStart(2, '0')}.xlsx`,
            setLoadingMonth
          )}
          disabled={loadingMonth}
          className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loadingMonth ? '…' : '↓ Mois'}
        </button>
      </div>

      {/* Ligne année */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white overflow-hidden text-xs">
          <button onClick={() => setYear(y => y - 1)} className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors">‹</button>
          <span className="px-2 py-1.5 font-medium text-gray-700 min-w-[110px] text-center">{year}</span>
          <button onClick={() => setYear(y => Math.min(y + 1, now.getFullYear()))} disabled={year >= now.getFullYear()} className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors">›</button>
        </div>
        <button
          onClick={() => download(
            `/api/admin/export?year=${year}`,
            `Bilan-annuel-${year}.xlsx`,
            setLoadingYear
          )}
          disabled={loadingYear}
          className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loadingYear ? '…' : '↓ Année'}
        </button>
      </div>
    </div>
  )
}
