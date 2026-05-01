const PRICE_BY_DURATION: Record<number, number> = {
  5: 20,
  10: 30,
  15: 40,
  20: 55,
  25: 65,
  30: 75,
  35: 85,
  40: 90,
  45: 100,
  50: 110,
  55: 120,
  60: 130,
  90: 175,
}

export function getBookingPrice(startTime: string, endTime: string, title: string): number {
  if (title.toLowerCase().includes('consultation')) return 0
  const durationMin = Math.round(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
  )
  return PRICE_BY_DURATION[durationMin] ?? 0
}

export function formatEuros(amount: number): string {
  return `${amount} €`
}
