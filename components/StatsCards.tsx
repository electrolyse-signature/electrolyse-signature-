interface CAStats {
  reel: number
  prevu: number
}

interface Props {
  caToday: CAStats
  caWeek: CAStats
  caMonth: CAStats
}

export default function StatsCards({ caToday, caWeek, caMonth }: Props) {
  const cards = [
    { label: "Aujourd'hui", stats: caToday,  color: 'text-emerald-600' },
    { label: 'Cette semaine', stats: caWeek,  color: 'text-teal-600'   },
    { label: 'Ce mois',       stats: caMonth, color: 'text-green-700'  },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(card => (
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
  )
}
