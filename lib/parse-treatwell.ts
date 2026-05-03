const FRENCH_MONTHS: Record<string, number> = {
  janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10,
  décembre: 11, decembre: 11,
}

export interface TreatwellBooking {
  start: Date
  end: Date
  serviceName: string
  clientName: string
  durationMinutes: number
}

export function isBookingEmail(subject: string, body: string): boolean {
  const text = (subject + ' ' + body).toLowerCase()
  return (
    text.includes('nouvelle réservation') ||
    text.includes('nouveau rendez-vous') ||
    text.includes('réservation confirmée') ||
    text.includes('new booking') ||
    text.includes('appointment confirmed')
  )
}

function extractDate(text: string): { day: number; month: number; year: number } | null {
  // Pattern 1: "13 mai 2026" (with optional day name: "mardi 13 mai 2026")
  const m1 = text.match(
    /(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)?\s*(\d{1,2})\s+(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s+(\d{4})/i,
  )
  if (m1) {
    const month = FRENCH_MONTHS[m1[2].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')]
    return { day: parseInt(m1[1]), month: month ?? 0, year: parseInt(m1[3]) }
  }

  // Pattern 2: "13/05/2026" or "13-05-2026"
  const m2 = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (m2) {
    return { day: parseInt(m2[1]), month: parseInt(m2[2]) - 1, year: parseInt(m2[3]) }
  }

  return null
}

function extractTime(text: string): { hours: number; minutes: number } | null {
  // Pattern: "à 10h30", "10h30", "10:30"
  const m = text.match(/[àa]\s*(\d{1,2})h(\d{2})?/i) || text.match(/(\d{1,2})[h:](\d{2})/)
  if (!m) return null
  return { hours: parseInt(m[1]), minutes: parseInt(m[2] ?? '0') }
}

function extractDuration(text: string): number {
  // Pattern: "1h30", "1 heure 30", "45 min", "30 minutes"
  const mHour = text.match(/(\d+)\s*h(?:eure(?:s)?)?\s*(\d+)?\s*(?:min)?/i)
  if (mHour) {
    const h = parseInt(mHour[1])
    const m = parseInt(mHour[2] ?? '0')
    const total = h * 60 + m
    if (total > 0 && total <= 240) return total
  }
  const mMin = text.match(/(\d+)\s*min(?:utes?)?/i)
  if (mMin) {
    const total = parseInt(mMin[1])
    if (total > 0 && total <= 240) return total
  }
  return 30 // default
}

export function parseTreatwellEmail(subject: string, body: string): TreatwellBooking | null {
  if (!isBookingEmail(subject, body)) return null

  const fullText = subject + '\n' + body

  const date = extractDate(fullText)
  const time = extractTime(fullText)

  if (!date || !time) return null

  const durationMinutes = extractDuration(fullText)

  const clientMatch = fullText.match(
    /(?:avec|cliente?\s*:)\s*([A-ZÀ-Ÿa-zà-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)*)/i,
  )
  const clientName = clientMatch?.[1]?.trim() ?? 'Cliente Treatwell'

  const serviceMatch = fullText.match(/(?:prestation|service|soin)\s*:?\s*([^\n\r]+)/i)
  const serviceName = serviceMatch?.[1]?.trim() ?? 'Électrolyse'

  const start = new Date(date.year, date.month, date.day, time.hours, time.minutes, 0)
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

  return { start, end, serviceName, clientName, durationMinutes }
}
