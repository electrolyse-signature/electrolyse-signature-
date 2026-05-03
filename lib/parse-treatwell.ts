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
    text.includes('réservation') ||
    text.includes('reservation') ||
    text.includes('rendez-vous') ||
    text.includes('félicitations') ||
    text.includes('felicitations') ||
    text.includes('booking')
  )
}

function extractDate(text: string): { day: number; month: number; year: number } | null {
  // Pattern 1: "19 mai 2026" ou "mardi 19 mai 2026"
  const m1 = text.match(
    /(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)?\s*(\d{1,2})\s+(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s+(\d{4})/i,
  )
  if (m1) {
    const monthKey = m1[2].toLowerCase()
      .replace('é', 'e').replace('è', 'e').replace('û', 'u').replace('î', 'i').replace('â', 'a')
    const month = FRENCH_MONTHS[m1[2].toLowerCase()] ?? FRENCH_MONTHS[monthKey] ?? 0
    return { day: parseInt(m1[1]), month, year: parseInt(m1[3]) }
  }

  // Pattern 2: "13/05/2026" ou "13-05-2026"
  const m2 = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/)
  if (m2) {
    return { day: parseInt(m2[1]), month: parseInt(m2[2]) - 1, year: parseInt(m2[3]) }
  }

  return null
}

function extractTime(text: string): { hours: number; minutes: number } | null {
  // Pattern Treatwell : "19 mai 2026 at 11:30"
  const mAt = text.match(/at\s+(\d{1,2}):(\d{2})/i)
  if (mAt) return { hours: parseInt(mAt[1]), minutes: parseInt(mAt[2]) }

  // Pattern français : "à 10h30", "à 10h"
  const mH = text.match(/[àa]\s+(\d{1,2})h(\d{2})?/i)
  if (mH) return { hours: parseInt(mH[1]), minutes: parseInt(mH[2] ?? '0') }

  // Pattern générique : "10h30", "10:30"
  const mG = text.match(/(\d{1,2})[h:](\d{2})/)
  if (mG) return { hours: parseInt(mG[1]), minutes: parseInt(mG[2]) }

  return null
}

function extractDuration(text: string): number {
  // Pattern : "15 minutes", "30 min", "1h30", "1 heure"
  const mMin = text.match(/(\d+)\s*min(?:utes?)?/i)
  if (mMin) {
    const total = parseInt(mMin[1])
    if (total > 0 && total <= 240) return total
  }
  const mHour = text.match(/(\d+)\s*h(?:eure(?:s)?)?\s*(\d+)?\s*(?:min)?/i)
  if (mHour) {
    const total = parseInt(mHour[1]) * 60 + parseInt(mHour[2] ?? '0')
    if (total > 0 && total <= 240) return total
  }
  return 30
}

function extractClient(text: string): string {
  // Pattern Treatwell : "Nom du client     Soufiane SAIDY"
  const mNom = text.match(/nom\s+du\s+client\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s\-]+?)(?:\s{2,}|\n|\r)/i)
  if (mNom) return mNom[1].trim()

  // Pattern : "Avec     Amal"
  const mAvec = text.match(/avec\s+([A-Za-zÀ-ÿ][a-zà-ÿ]+(?:\s+[A-Za-zÀ-Ÿ][a-zà-ÿ]+)*)/i)
  if (mAvec) return mAvec[1].trim()

  // Pattern : "Cliente : Marie"
  const mClient = text.match(/cliente?\s*:\s*([A-Za-zÀ-ÿ][a-zà-ÿ]+(?:\s+[A-Za-zÀ-Ÿ][a-zà-ÿ]+)*)/i)
  if (mClient) return mClient[1].trim()

  return 'Cliente Treatwell'
}

function extractService(text: string): string {
  // Pattern Treatwell : "Nom de la prestation     OBLIGATOIRE : ..."
  const mPrest = text.match(/nom\s+de\s+la\s+prestation\s+([^\n\r]+)/i)
  if (mPrest) return mPrest[1].trim()

  const mService = text.match(/(?:prestation|service|soin)\s*:?\s*([^\n\r]+)/i)
  if (mService) return mService[1].trim()

  return 'Électrolyse'
}

export function parseTreatwellEmail(subject: string, body: string): TreatwellBooking | null {
  if (!isBookingEmail(subject, body)) return null

  const fullText = subject + '\n' + body

  const date = extractDate(fullText)
  const time = extractTime(fullText)

  if (!date || !time) return null

  const durationMinutes = extractDuration(fullText)
  const clientName = extractClient(fullText)
  const serviceName = extractService(fullText)

  const start = new Date(date.year, date.month, date.day, time.hours, time.minutes, 0)
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

  return { start, end, serviceName, clientName, durationMinutes }
}
