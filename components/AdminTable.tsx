'use client'

import { useState } from 'react'
import type { ClientSummary } from '@/lib/types'

export default function AdminTable({ clients }: { clients: ClientSummary[] }) {
  const [data, setData] = useState(clients)

  async function handleBlock(email: string) {
    await fetch('/api/admin/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setData(prev => prev.map(c => c.email === email ? { ...c, is_blocked: true } : c))
  }

  async function handleUnblock(email: string) {
    await fetch('/api/admin/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setData(prev => prev.map(c => c.email === email ? { ...c, is_blocked: false } : c))
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Annulations</th>
            <th className="px-4 py-3">Dernière annulation</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map(client => {
            const isSignaled = !client.is_blocked && client.cancellation_count >= 2
            const rowClass = client.is_blocked
              ? 'bg-red-50'
              : isSignaled
              ? 'bg-orange-50'
              : ''
            return (
              <tr key={client.email} className={rowClass}>
                <td className="px-4 py-3 font-medium text-gray-900">{client.name}</td>
                <td className="px-4 py-3 text-gray-600">{client.email}</td>
                <td className="px-4 py-3 font-semibold">{client.cancellation_count}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(client.last_cancelled_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  {client.is_blocked ? (
                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                      Bloqué
                    </span>
                  ) : isSignaled ? (
                    <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                      Signalé
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      Normal
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {client.is_blocked ? (
                    <button
                      onClick={() => handleUnblock(client.email)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Débloquer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlock(client.email)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Bloquer
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                Aucune annulation enregistrée
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
