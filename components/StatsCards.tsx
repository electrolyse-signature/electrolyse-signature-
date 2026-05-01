interface Props {
  todayCount: number
  weekCount: number
  cancellations30d: number
  signaledCount: number
  caToday: number
  caWeek: number
  caMonth: number
}

export default function StatsCards({
  todayCount, weekCount, cancellations30d, signaledCount,
  caToday, caWeek, caMonth,
}: Props) {
  const planningCards = [
    { label: "RDV aujourd'hui", value: todayCount, color: 'text-blue-600', suffix: '' },
    { label: 'RDV cette semaine', value: weekCount, color: 'text-indigo-600', suffix: '' },
    { label: 'Annulations (30j)', value: cancellations30d, color: 'text-orange-600', suffix: '' },
    { label: 'Clients signalés', value: signaledCount, color: 'text-red-600', suffix: '' },
  ]

  const caCards = [
    { label: "CA du jour", value: caToday, color: 'text-emerald-600' },
    { label: 'CA cette semaine', value: caWeek, color: 'text-teal-600' },
    { label: 'CA ce mois', value: caMonth, color: 'text-green-700' },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value} €</p>
          </div>
        ))}
      </div>
    </div>
  )
}
