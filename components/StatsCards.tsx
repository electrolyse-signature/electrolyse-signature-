interface Props {
  todayCount: number
  weekCount: number
  cancellations30d: number
  signaledCount: number
}

export default function StatsCards({ todayCount, weekCount, cancellations30d, signaledCount }: Props) {
  const cards = [
    { label: "RDV aujourd'hui", value: todayCount, color: 'text-blue-600' },
    { label: 'RDV cette semaine', value: weekCount, color: 'text-indigo-600' },
    { label: 'Annulations (30j)', value: cancellations30d, color: 'text-orange-600' },
    { label: 'Clients signalés', value: signaledCount, color: 'text-red-600' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="rounded-lg border border-gray-200 bg-white shadow-sm px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
          <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
