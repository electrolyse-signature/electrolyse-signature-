'use client'

import { useState, useEffect } from 'react'

const DURATION_LABELS: Record<number, string> = {
  5: '5 min', 10: '10 min', 15: '15 min', 20: '20 min',
  25: '25 min', 30: '30 min', 35: '35 min', 40: '40 min',
  45: '45 min', 50: '50 min', 55: '55 min', 60: '1h', 90: '1h30',
}

export default function PricesSection() {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    fetch('/api/admin/prices')
      .then(r => r.ok ? r.json() : {})
      .then(data => { setPrices(data); setDirty(false) })
      .finally(() => setLoading(false))
  }, [])

  function handleChange(duration: string, value: string) {
    const num = parseInt(value, 10)
    setPrices(prev => ({ ...prev, [duration]: isNaN(num) ? 0 : num }))
    setDirty(true)
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/admin/prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prices),
    })
    setSaving(false)
    setSaved(true)
    setDirty(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const durations = Object.keys(prices).map(Number).sort((a, b) => a - b)

  return (
    <div className="max-w-md">
      <p className="text-sm text-gray-500 mb-5">
        Ces tarifs sont utilisés pour calculer le chiffre d&apos;affaires dans la section Comptabilité.
        Le prix est basé sur la durée de la prestation.
      </p>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          Chargement des tarifs…
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Durée</th>
                  <th className="px-4 py-3">Prix (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {durations.map(d => (
                  <tr key={d} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-700">
                      {DURATION_LABELS[d] ?? `${d} min`}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          step={5}
                          value={prices[String(d)] ?? 0}
                          onChange={e => handleChange(String(d), e.target.value)}
                          className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blush"
                        />
                        <span className="text-gray-400 text-xs">€</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer les tarifs'}
            </button>
            {saved && <span className="text-sm text-green-600">Enregistré ✓</span>}
          </div>
        </>
      )}
    </div>
  )
}
