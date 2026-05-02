'use client'

import { useState } from 'react'
import type { ClientSummary } from '@/lib/types'
import ClientDetailModal from '@/components/ClientDetailModal'

export default function AdminTable({ clients }: { clients: ClientSummary[] }) {
  const [data, setData] = useState(clients)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteValues, setNoteValues] = useState<Record<string, string>>(
    Object.fromEntries(clients.map(c => [c.email, c.note ?? '']))
  )
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(null)

  async function handleBlock(email: string) {
    const res = await fetch('/api/admin/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) { alert('Erreur lors du blocage. Veuillez réessayer.'); return }
    setData(prev => prev.map(c => c.email === email ? { ...c, is_blocked: true } : c))
  }

  async function handleUnblock(email: string) {
    const res = await fetch('/api/admin/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) { alert('Erreur lors du déblocage. Veuillez réessayer.'); return }
    setData(prev => prev.map(c => c.email === email ? { ...c, is_blocked: false } : c))
  }

  async function handleSaveNote(email: string) {
    const note = noteValues[email] ?? ''
    await fetch('/api/admin/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, note }),
    })
    setData(prev => prev.map(c => c.email === email ? { ...c, note } : c))
    setEditingNote(null)
  }

  const currentClient = selectedClient
    ? (data.find(c => c.email === selectedClient.email) ?? selectedClient)
    : null

  return (
    <>
      {currentClient && (
        <ClientDetailModal
          client={currentClient}
          onClose={() => setSelectedClient(null)}
          onBlock={handleBlock}
          onUnblock={handleUnblock}
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Annulations</th>
              <th className="px-4 py-3">Dernière annulation</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map(client => {
              const isSignaled = !client.is_blocked && client.cancellation_count >= 2
              const rowClass = client.is_blocked ? 'bg-red-50' : isSignaled ? 'bg-orange-50' : ''
              const isEditing = editingNote === client.email

              return (
                <tr key={client.email} className={rowClass}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="hover:underline hover:text-blush text-left"
                    >
                      {client.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{client.email}</td>
                  <td className="px-4 py-3 font-semibold">{client.cancellation_count}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(client.last_cancelled_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <input
                          autoFocus
                          className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                          value={noteValues[client.email] ?? ''}
                          onChange={e => setNoteValues(prev => ({ ...prev, [client.email]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveNote(client.email) }}
                        />
                        <button onClick={() => handleSaveNote(client.email)} className="text-xs text-green-600 hover:underline">✓</button>
                        <button onClick={() => setEditingNote(null)} className="text-xs text-gray-400 hover:underline">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingNote(client.email)}
                        className="text-left text-xs text-gray-500 hover:text-gray-700 hover:underline truncate max-w-[180px] block"
                      >
                        {client.note ? client.note : <span className="text-gray-300 italic">Ajouter une note…</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {client.is_blocked ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Bloqué</span>
                    ) : isSignaled ? (
                      <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">Signalé</span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Normal</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {client.is_blocked ? (
                      <button onClick={() => handleUnblock(client.email)} className="text-xs text-blue-600 hover:underline">Débloquer</button>
                    ) : (
                      <button onClick={() => handleBlock(client.email)} className="text-xs text-red-600 hover:underline">Bloquer</button>
                    )}
                  </td>
                </tr>
              )
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Aucune annulation enregistrée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
