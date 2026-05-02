interface CAStats {
  reel: number
  prevu: number
}

interface Props {
  todayCount: number
  weekCount: number
  cancellations30d: number
  signaledCount: number
  unmarkedCount: number
  caToday: CAStats
  caWeek: CAStats
  caMonth: CAStats
}

export default function StatsCards({
  todayCount, weekCount, cancellations30d, signaledCount, unmarkedCount,
  caToday, caWeek, caMonth,
}: Props) {
  const planningCards = [
    { label: "RDV aujourd'hui", value: todayCount, color: 'text-blue-600' },
    { label: 'RDV cette semaine', value: weekCount, color: 'text-indigo-600' },
    { label: 'Annulations (30j)', value: cancellations30d, color: 'text-orange-600' },
    { label: 'Clients signalés', value: signaledCount, color: 'text-red-600' },
    { label: 'À marquer', value: unmarkedCount, color: unmarkedCount > 0 ? 'text-amber-600' : 'text-gray-400' },
  ]

  const caCards = [
    { label: "Aujourd'hui", stats: caToday, color: 'text-emerald-600' },
    { label: 'Cette semaine', stats: caWeek, color: 'text-teal-600' },
    { label: 'Ce mois', stats: caMonth, color: 'text-green-700' },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {planningCards.map(card => (
          <div key={card.label} className="rounded-lg border border-gray-200 bg-white shadow-sm px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {caCards.map(card => (
          <div key={card.label} className="rounded-lg border border-gray-200 bg-white shadow-sm px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">CA — {card.label}</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-500">Réel</span>
                <span className={`text-2xl font-bold ${card.color}`}>{card.stats.reel} €</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-400">Prévu</span>
                <span className="text-base font-medium text-gray-400">{card.stats.prevu} €</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
