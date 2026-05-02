'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const INTERVAL = 60_000

export default function AdminRefresher() {
  const router = useRouter()
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)

  function refresh() {
    setRefreshing(true)
    router.refresh()
    setLastRefresh(new Date())
    setTimeout(() => setRefreshing(false), 800)
  }

  useEffect(() => {
    const id = setInterval(refresh, INTERVAL)
    return () => clearInterval(id)
  }, [])

  const timeStr = lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Màj {timeStr}</span>
      <button
        onClick={refresh}
        disabled={refreshing}
        className="text-xs text-gray-500 hover:text-gray-700 hover:underline disabled:opacity-50"
      >
        {refreshing ? '…' : '↻ Rafraîchir'}
      </button>
    </div>
  )
}
