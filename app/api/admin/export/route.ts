import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getBookingPrice } from '@/lib/prices'
import ExcelJS from 'exceljs'

const CAL_API_BASE = 'https://api.cal.com/v2'
const CAL_API_VERSION = '2024-08-13'
const JOURS   = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const C = {
  headerBg:  'FF1F2937', headerFg:  'FFFFFFFF',
  rowEven:   'FFF9FAFB', rowOdd:    'FFFFFFFF',
  greenText: 'FF065F46', greenBg:   'FFD1FAE5',
  redText:   'FF991B1B', redBg:     'FFFEE2E2',
  grayText:  'FF6B7280', grayBg:    'FFF3F4F6',
  summaryBg: 'FFE5E7EB', totalBg:   'FF1F2937', totalFg: 'FFFFFFFF',
  border:    'FFD1D5DB',
}

function bd(): Partial<ExcelJS.Borders> {
  const s = { style: 'thin' as const, color: { argb: C.border } }
  return { top: s, bottom: s, left: s, right: s }
}

// ── Cal.com fetch helpers ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchCalBookings(apiKey: string, startTime: Date, endTime: Date, status: 'past' | 'upcoming'): Promise<any[]> {
  const res = await fetch(
    `${CAL_API_BASE}/bookings?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}&status=${status}&take=250`,
    { headers: { Authorization: `Bearer ${apiKey}`, 'cal-api-version': CAL_API_VERSION }, cache: 'no-store' }
  )
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchMonthBookings(apiKey: string, year: number, month: number, now: Date): Promise<any[]> {
  const start = new Date(year, month - 1, 1)
  const end   = new Date(year, month, 0, 23, 59, 59, 999)
  const effectiveEnd = end < now ? end : now

  const [past, upcoming] = await Promise.all([
    fetchCalBookings(apiKey, start, effectiveEnd, 'past'),
    end > now ? fetchCalBookings(apiKey, now, end, 'upcoming') : Promise.resolve([]),
  ])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return [...past, ...upcoming].sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

// ── Excel sheet builder ──────────────────────────────────────────
interface MonthTotals { encaisse: number; absent: number; prevu: number; numEnc: number; numAbs: number; numPrev: number }

function buildMonthSheet(
  ws: ExcelJS.Worksheet,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bookings: any[],
  attendanceMap: Map<string, string>,
  monthName: string,
  year: number,
  now: Date,
  exportDate: string,
  exportTime: string,
): MonthTotals {
  ws.columns = [
    { key: 'num',        width: 6  },
    { key: 'date',       width: 13 },
    { key: 'jour',       width: 12 },
    { key: 'heure',      width: 8  },
    { key: 'client',     width: 24 },
    { key: 'prestation', width: 32 },
    { key: 'montant',    width: 13 },
    { key: 'statut',     width: 16 },
  ]

  // Header block
  ws.mergeCells('A1:H1')
  const t = ws.getCell('A1')
  t.value = 'ELECTROLYSE SIGNATURE'
  t.font  = { bold: true, size: 15, color: { argb: 'FF1F2937' } }
  t.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 28

  ws.mergeCells('A2:H2')
  const s = ws.getCell('A2')
  s.value = 'Livre de recettes — Registre des prestations'
  s.font  = { italic: true, size: 11, color: { argb: 'FF4B5563' } }
  s.alignment = { horizontal: 'center' }

  ws.mergeCells('A3:H3')
  ws.getCell('A3').value = `Période : ${monthName} ${year}`
  ws.getCell('A3').font  = { size: 10, color: { argb: 'FF6B7280' } }

  ws.mergeCells('A4:H4')
  ws.getCell('A4').value = `Exporté le : ${exportDate} à ${exportTime}`
  ws.getCell('A4').font  = { size: 10, color: { argb: 'FF6B7280' } }

  ws.addRow([])

  const hr = ws.addRow(['N°', 'Date', 'Jour', 'Heure', 'Client', 'Prestation', 'Montant (€)', 'Statut'])
  hr.height = 22
  hr.eachCell(cell => {
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } }
    cell.font      = { bold: true, color: { argb: C.headerFg }, size: 10 }
    cell.border    = bd()
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prestations = bookings.filter((b: any) => b.attendees?.[0]?.name !== 'Pause')
  let totalEnc = 0, totalAbs = 0, totalPrev = 0
  let numEnc = 0, numAbs = 0, numPrev = 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prestations.forEach((b: any, i: number) => {
    const start    = new Date(b.start)
    const end      = new Date(b.end)
    const attendee = b.attendees?.[0]
    const price    = getBookingPrice(b.start, b.end, b.title)
    const isPast   = start < now
    const presence = attendanceMap.get(String(b.id))
    const service  = b.title.replace(/entre Electrolyse signature et .+$/, '').trim() || b.title

    let statut: string, sBg: string, sFg: string
    if (!isPast || !presence) {
      statut = isPast ? 'Non marqué' : 'À venir'; sBg = C.grayBg; sFg = C.grayText
      totalPrev += price; numPrev++
    } else if (presence === 'present') {
      statut = 'Encaissé'; sBg = C.greenBg; sFg = C.greenText
      totalEnc += price; numEnc++
    } else {
      statut = 'Absent'; sBg = C.redBg; sFg = C.redText
      totalAbs += price; numAbs++
    }

    const dr = ws.addRow([
      i + 1,
      start.toLocaleDateString('fr-FR'),
      JOURS[start.getDay()],
      start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      attendee?.name ?? '—',
      service,
      price > 0 ? price : null,
      statut,
    ])
    dr.height = 18
    const bg = i % 2 === 1 ? C.rowEven : C.rowOdd
    dr.eachCell((cell, col) => {
      cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
      cell.border = bd(); cell.font = { size: 10 }; cell.alignment = { vertical: 'middle' }
      if (col === 1) cell.alignment = { horizontal: 'center', vertical: 'middle' }
      if (col === 7 && price > 0) { cell.numFmt = '#,##0 "€"'; cell.alignment = { horizontal: 'right', vertical: 'middle' }; cell.font = { bold: true, size: 10 } }
      if (col === 8) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sBg } }; cell.font = { bold: true, size: 10, color: { argb: sFg } }; cell.alignment = { horizontal: 'center', vertical: 'middle' } }
    })
  })

  // Summary
  ws.addRow([])
  const sepR = ws.addRow(['RÉCAPITULATIF'])
  ws.mergeCells(`A${sepR.number}:H${sepR.number}`)
  sepR.height = 20; sepR.getCell(1).font = { bold: true, size: 11 }
  sepR.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.summaryBg } }
  sepR.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }

  const addSum = (label: string, count: number, amount: number, dark = false) => {
    ws.mergeCells(`A${ws.rowCount + 1}:F${ws.rowCount + 1}`)
    const r = ws.addRow([`${label}  (${count})`, '', '', '', '', '', amount || null, ''])
    r.height = 20
    r.eachCell((cell, col) => {
      const bg = dark ? C.totalBg : C.summaryBg
      const fg = dark ? C.totalFg : 'FF1F2937'
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
      cell.font = { bold: dark, size: 10, color: { argb: fg } }; cell.alignment = { vertical: 'middle' }
      if (col === 1) cell.value = dark ? label : `${label}  (${count})`
      if (col === 7 && amount >= 0) { cell.numFmt = '#,##0 "€"'; cell.alignment = { horizontal: 'right', vertical: 'middle' } }
    })
  }

  addSum('Séances encaissées', numEnc, totalEnc)
  addSum('Absences (non encaissées)', numAbs, totalAbs)
  addSum('Non marqués / À venir', numPrev, totalPrev)
  ws.addRow([])
  addSum('TOTAL ENCAISSÉ', 0, totalEnc, true)
  ws.addRow([])
  const tva = ws.addRow(['TVA non applicable — Art. 293 B du CGI'])
  ws.mergeCells(`A${tva.number}:H${tva.number}`)
  tva.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF9CA3AF' } }

  return { encaisse: totalEnc, absent: totalAbs, prevu: totalPrev, numEnc, numAbs, numPrev }
}

// ── Route ────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const year     = parseInt(searchParams.get('year')  ?? String(new Date().getFullYear()))
  const monthParam = searchParams.get('month')
  const isYear   = !monthParam

  if (isNaN(year)) return NextResponse.json({ error: 'Année invalide' }, { status: 400 })

  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'CAL_API_KEY manquant' }, { status: 500 })

  const now         = new Date()
  const exportDate  = now.toLocaleDateString('fr-FR')
  const exportTime  = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Electrolyse Signature'; wb.created = now

  if (!isYear) {
    // ── Export mensuel ──────────────────────────────────────────
    const month = parseInt(monthParam!)
    if (isNaN(month) || month < 1 || month > 12) return NextResponse.json({ error: 'Mois invalide' }, { status: 400 })

    const bookings = await fetchMonthBookings(apiKey, year, month, now)
    const ids = bookings.map((b: { id: number }) => String(b.id))
    const { data: attRows } = ids.length > 0
      ? await supabaseAdmin.from('attendance').select('booking_id, status').in('booking_id', ids)
      : { data: [] }
    const attMap = new Map((attRows ?? []).map((a: { booking_id: string; status: string }) => [a.booking_id, a.status]))

    const ws = wb.addWorksheet(MOIS_FR[month - 1], { pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 } })
    buildMonthSheet(ws, bookings, attMap, MOIS_FR[month - 1], year, now, exportDate, exportTime)

    const buffer = await wb.xlsx.writeBuffer()
    return new Response(buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Livre-recettes-${year}-${String(month).padStart(2, '0')}.xlsx"`,
      },
    })
  }

  // ── Export annuel ─────────────────────────────────────────────
  // Fetch all months (sequentially to avoid Cal.com rate limiting)
  const monthsData: { bookings: any[]; totals: MonthTotals }[] = [] // eslint-disable-line @typescript-eslint/no-explicit-any

  // Fetch all year bookings in 2 calls then split by month
  const yearStart = new Date(year, 0, 1)
  const yearEnd   = new Date(year, 11, 31, 23, 59, 59, 999)
  const effectiveYearEnd = yearEnd < now ? yearEnd : now

  const [allPast, allUpcoming] = await Promise.all([
    fetchCalBookings(apiKey, yearStart, effectiveYearEnd, 'past'),
    yearEnd > now ? fetchCalBookings(apiKey, now, yearEnd, 'upcoming') : Promise.resolve([]),
  ])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allYearBookings = [...allPast, ...allUpcoming].sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const allIds = allYearBookings.map((b: { id: number }) => String(b.id))
  const { data: allAttRows } = allIds.length > 0
    ? await supabaseAdmin.from('attendance').select('booking_id, status').in('booking_id', allIds)
    : { data: [] }
  const globalAttMap = new Map((allAttRows ?? []).map((a: { booking_id: string; status: string }) => [a.booking_id, a.status]))

  // Split by month and build sheets
  for (let m = 1; m <= 12; m++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthBookings = allYearBookings.filter((b: any) => new Date(b.start).getMonth() + 1 === m)
    const ws = wb.addWorksheet(MOIS_FR[m - 1], { pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 } })
    const totals = buildMonthSheet(ws, monthBookings, globalAttMap, MOIS_FR[m - 1], year, now, exportDate, exportTime)
    monthsData.push({ bookings: monthBookings, totals })
  }

  // ── Feuille Résumé annuel (ajoutée en dernier, réordonnée manuellement via tabs) ──
  const summary = wb.addWorksheet('Résumé annuel')
  // Reorder: move summary to position 0 by splicing the internal _worksheets array
  const sheets = (wb as any)._worksheets // eslint-disable-line @typescript-eslint/no-explicit-any
  const idx = sheets.findIndex((s: any) => s && s.name === 'Résumé annuel') // eslint-disable-line @typescript-eslint/no-explicit-any
  if (idx > 1) { const [ws] = sheets.splice(idx, 1); sheets.splice(1, 0, ws) }

  summary.columns = [
    { key: 'mois',    width: 14 },
    { key: 'seances', width: 16 },
    { key: 'enc',     width: 16 },
    { key: 'abs',     width: 16 },
    { key: 'prev',    width: 16 },
    { key: 'total',   width: 18 },
  ]

  summary.mergeCells('A1:F1')
  const t1 = summary.getCell('A1')
  t1.value = 'ELECTROLYSE SIGNATURE'; t1.font = { bold: true, size: 15, color: { argb: 'FF1F2937' } }; t1.alignment = { horizontal: 'center', vertical: 'middle' }
  summary.getRow(1).height = 28

  summary.mergeCells('A2:F2')
  const t2 = summary.getCell('A2')
  t2.value = `Bilan annuel ${year}`; t2.font = { italic: true, size: 12, color: { argb: 'FF4B5563' } }; t2.alignment = { horizontal: 'center' }

  summary.mergeCells('A3:F3')
  summary.getCell('A3').value = `Exporté le : ${exportDate} à ${exportTime}`
  summary.getCell('A3').font = { size: 10, color: { argb: 'FF6B7280' } }

  summary.addRow([])

  // Column headers
  const sh = summary.addRow(['Mois', 'Séances encaissées', 'CA encaissé', 'CA absences', 'CA prévu / non marqué', 'TOTAL ENCAISSÉ'])
  sh.height = 22
  sh.eachCell((cell: ExcelJS.Cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } }
    cell.font = { bold: true, color: { argb: C.headerFg }, size: 10 }
    cell.border = bd(); cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  let grandEnc = 0, grandAbs = 0, grandPrev = 0, grandSeances = 0
  monthsData.forEach(({ bookings, totals }, i) => {
    const hasFuture = new Date(year, i, 1) > now
    const monthHasData = bookings.filter((b: any) => b.attendees?.[0]?.name !== 'Pause').length > 0 // eslint-disable-line @typescript-eslint/no-explicit-any
    const bg = i % 2 === 0 ? C.rowOdd : C.rowEven

    const r = summary.addRow([
      MOIS_FR[i],
      hasFuture ? '—' : totals.numEnc,
      hasFuture ? '—' : (totals.encaisse > 0 ? totals.encaisse : null),
      hasFuture ? '—' : (totals.absent > 0 ? totals.absent : null),
      hasFuture ? '—' : (totals.prevu > 0 ? totals.prevu : null),
      hasFuture ? '—' : (totals.encaisse > 0 ? totals.encaisse : null),
    ])
    r.height = 18
    r.eachCell((cell: ExcelJS.Cell, col: number) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
      cell.border = bd(); cell.font = { size: 10 }; cell.alignment = { vertical: 'middle' }
      if (col === 1) cell.font = { bold: true, size: 10 }
      if ([3, 4, 5, 6].includes(col) && typeof cell.value === 'number') {
        cell.numFmt = '#,##0 "€"'; cell.alignment = { horizontal: 'right', vertical: 'middle' }
      }
      if (col === 6 && typeof cell.value === 'number') cell.font = { bold: true, size: 10, color: { argb: C.greenText } }
      if (col === 2) cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })

    if (!hasFuture) {
      grandEnc += totals.encaisse; grandAbs += totals.absent; grandPrev += totals.prevu; grandSeances += totals.numEnc
    }
  })

  // Total row
  summary.addRow([])
  const tr = summary.addRow(['TOTAL', grandSeances, grandEnc || null, grandAbs || null, grandPrev || null, grandEnc || null])
  tr.height = 24
  tr.eachCell((cell: ExcelJS.Cell, col: number) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.totalBg } }
    cell.font = { bold: true, size: 11, color: { argb: C.totalFg } }
    cell.border = bd(); cell.alignment = { vertical: 'middle' }
    if ([3, 4, 5, 6].includes(col) && typeof cell.value === 'number') { cell.numFmt = '#,##0 "€"'; cell.alignment = { horizontal: 'right', vertical: 'middle' } }
    if (col === 2) cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  summary.addRow([])
  const tvaRow = summary.addRow(['TVA non applicable — Art. 293 B du CGI'])
  summary.mergeCells(`A${tvaRow.number}:F${tvaRow.number}`)
  tvaRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF9CA3AF' } }

  const buffer = await wb.xlsx.writeBuffer()
  return new Response(buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Bilan-annuel-${year}.xlsx"`,
    },
  })
}
