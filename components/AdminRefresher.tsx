'use client'

import { useEffect, useState } from 'react'

const INTERVAL = 60_000

export default function AdminRefresher() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => window.location.reload(), INTERVAL)
    return () => clearInterval(id)
  }, [])

  const timeStr = lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Màj {timeStr}</span>
      <button
        onClick={() => { setLastRefresh(new Date()); window.location.reload() }}
        className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
      >
        ↻ Rafraîchir
      </button>
    </div>
  )
}
