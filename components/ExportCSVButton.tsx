'use client'

export interface ExportRow {
  date: string
  heure: string
  name: string
  email: string
  service: string
  price: number
  presence: string
}

export default function ExportCSVButton({
  rows,
  month,
}: {
  rows: ExportRow[]
  month: string
}) {
  function download() {
    const header = ['Date', 'Heure', 'Client', 'Email', 'Prestation', 'Prix (€)', 'Présence']
    const lines = rows.map(r =>
      [r.date, r.heure, r.name, r.email, r.service, r.price > 0 ? r.price : '', r.presence]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [header.join(','), ...lines].join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CA-${month}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={download}
      className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
    >
      ↓ Exporter CSV — {month}
    </button>
  )
}
