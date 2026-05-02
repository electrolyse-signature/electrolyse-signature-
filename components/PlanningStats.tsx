interface Props {
  todayCount: number
  weekCount: number
  unmarkedCount: number
}

export default function PlanningStats({ todayCount, weekCount, unmarkedCount }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm">
        <span className="font-bold text-blue-700">{todayCount}</span>
        <span className="text-blue-600">aujourd'hui</span>
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm">
        <span className="font-bold text-indigo-700">{weekCount}</span>
        <span className="text-indigo-600">cette semaine</span>
      </span>
      {unmarkedCount > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm">
          <span className="font-bold text-amber-700">{unmarkedCount}</span>
          <span className="text-amber-600">à marquer</span>
        </span>
      )}
    </div>
  )
}
