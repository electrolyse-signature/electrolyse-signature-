'use client'

import { useState } from 'react'

// Kept for backward compat — no longer used in the page but exported to avoid TS errors
export interface ExportRow {
  date: string
  heure: string
  name: string
  email: string
  service: string
  price: number
  presence: string
}

export default function ExportCSVButton() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [loading, setLoading] = useState(false)

  const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  function prev() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function next() {
    const nextIsAfterNow = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)
    if (nextIsAfterNow) return
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  async function download() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/export?year=${year}&month=${month}`)
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Livre-recettes-${year}-${String(month).padStart(2, '0')}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white overflow-hidden text-xs">
        <button
          onClick={prev}
          className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          ‹
        </button>
        <span className="px-2 py-1.5 font-medium text-gray-700 min-w-[110px] text-center">
          {MOIS[month - 1]} {year}
        </span>
        <button
          onClick={next}
          disabled={isCurrentMonth}
          className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30"
        >
          ›
        </button>
      </div>
      <button
        onClick={download}
        disabled={loading}
        className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {loading ? '…' : '↓ Exporter'}
      </button>
    </div>
  )
}
