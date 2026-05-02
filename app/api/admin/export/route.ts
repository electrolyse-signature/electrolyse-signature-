import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getBookingPrice } from '@/lib/prices'
import ExcelJS from 'exceljs'

const CAL_API_BASE = 'https://api.cal.com/v2'
const CAL_API_VERSION = '2024-08-13'
const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const C = {
  headerBg:    'FF1F2937',
  headerFg:    'FFFFFFFF',
  rowEven:     'FFF9FAFB',
  rowOdd:      'FFFFFFFF',
  greenText:   'FF065F46',
  greenBg:     'FFD1FAE5',
  redText:     'FF991B1B',
  redBg:       'FFFEE2E2',
  grayText:    'FF6B7280',
  grayBg:      'FFF3F4F6',
  summaryBg:   'FFE5E7EB',
  totalBg:     'FF1F2937',
  totalFg:     'FFFFFFFF',
  border:      'FFD1D5DB',
}

function border(): Partial<ExcelJS.Borders> {
  const side = { style: 'thin' as const, color: { argb: C.border } }
  return { top: side, bottom: side, left: side, right: side }
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const year  = parseInt(searchParams.get('year')  ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'CAL_API_KEY manquant' }, { status: 500 })

  const monthStart   = new Date(year, month - 1, 1)
  const monthEnd     = new Date(year, month, 0, 23, 59, 59, 999)
  const now          = new Date()
  const effectiveEnd = monthEnd < now ? monthEnd : now

  const [pastRes, upcomingRes] = await Promise.all([
    fetch(
      `${CAL_API_BASE}/bookings?startTime=${monthStart.toISOString()}&endTime=${effectiveEnd.toISOString()}&status=past&take=250`,
      { headers: { Authorization: `Bearer ${apiKey}`, 'cal-api-version': CAL_API_VERSION }, cache: 'no-store' }
    ),
    monthEnd > now
      ? fetch(
          `${CAL_API_BASE}/bookings?startTime=${now.toISOString()}&endTime=${monthEnd.toISOString()}&status=upcoming&take=250`,
          { headers: { Authorization: `Bearer ${apiKey}`, 'cal-api-version': CAL_API_VERSION }, cache: 'no-store' }
        )
      : Promise.resolve(null),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseBookings = async (res: Response | null): Promise<any[]> => {
    if (!res || !res.ok) return []
    const json = await res.json()
    return json.data ?? []
  }

  const [pastRaw, upcomingRaw] = await Promise.all([parseBookings(pastRes), parseBookings(upcomingRes)])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allRaw = [...pastRaw, ...upcomingRaw]
    .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prestations = allRaw.filter((b: any) => b.attendees?.[0]?.name !== 'Pause')

  const bookingIds = prestations.map((b: { id: number }) => String(b.id))
  const { data: attendanceRows } = bookingIds.length > 0
    ? await supabaseAdmin.from('attendance').select('booking_id, status').in('booking_id', bookingIds)
    : { data: [] }
  const attendanceMap = new Map(
    (attendanceRows ?? []).map((a: { booking_id: string; status: string }) => [a.booking_id, a.status])
  )

  const monthName = monthStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const exportDate = now.toLocaleDateString('fr-FR')
  const exportTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  // ── Build workbook ──────────────────────────────────────────────
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Electrolyse Signature'
  wb.created = now

  const ws = wb.addWorksheet('Livre de recettes', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  })

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

  // ── Header block ────────────────────────────────────────────────
  ws.mergeCells('A1:H1')
  const title = ws.getCell('A1')
  title.value = 'ELECTROLYSE SIGNATURE'
  title.font = { bold: true, size: 15, color: { argb: 'FF1F2937' } }
  title.alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getRow(1).height = 28

  ws.mergeCells('A2:H2')
  const subtitle = ws.getCell('A2')
  subtitle.value = 'Livre de recettes — Registre des prestations'
  subtitle.font = { italic: true, size: 11, color: { argb: 'FF4B5563' } }
  subtitle.alignment = { horizontal: 'center' }

  ws.mergeCells('A3:H3')
  ws.getCell('A3').value = `Période : ${monthName}`
  ws.getCell('A3').font = { size: 10, color: { argb: 'FF6B7280' } }

  ws.mergeCells('A4:H4')
  ws.getCell('A4').value = `Exporté le : ${exportDate} à ${exportTime}`
  ws.getCell('A4').font = { size: 10, color: { argb: 'FF6B7280' } }

  ws.addRow([])

  // ── Column headers ──────────────────────────────────────────────
  const headerRow = ws.addRow(['N°', 'Date', 'Jour', 'Heure', 'Client', 'Prestation', 'Montant (€)', 'Statut'])
  headerRow.height = 22
  headerRow.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } }
    cell.font   = { bold: true, color: { argb: C.headerFg }, size: 10 }
    cell.border = border()
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })

  // ── Data rows ───────────────────────────────────────────────────
  let totalEncaisse = 0, totalAbsent = 0, totalPrevu = 0
  let numEncaisse = 0, numAbsent = 0, numPrevu = 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prestations.forEach((b: any, i: number) => {
    const start    = new Date(b.start)
    const end      = new Date(b.end)
    const attendee = b.attendees?.[0]
    const price    = getBookingPrice(b.start, b.end, b.title)
    const isPast   = start < now
    const presence = attendanceMap.get(String(b.id))

    let statut: string
    let statutBg: string
    let statutFg: string

    if (!isPast || !presence) {
      statut = isPast ? 'Non marqué' : 'À venir'
      statutBg = C.grayBg; statutFg = C.grayText
      totalPrevu += price; numPrevu++
    } else if (presence === 'present') {
      statut = 'Encaissé'
      statutBg = C.greenBg; statutFg = C.greenText
      totalEncaisse += price; numEncaisse++
    } else {
      statut = 'Absent'
      statutBg = C.redBg; statutFg = C.redText
      totalAbsent += price; numAbsent++
    }

    const service = b.title.replace(/entre Electrolyse signature et .+$/, '').trim() || b.title
    const isEven = i % 2 === 1
    const rowBg = isEven ? C.rowEven : C.rowOdd

    const dataRow = ws.addRow([
      i + 1,
      start.toLocaleDateString('fr-FR'),
      JOURS[start.getDay()],
      start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      attendee?.name ?? '—',
      service,
      price > 0 ? price : null,
      statut,
    ])
    dataRow.height = 18

    dataRow.eachCell((cell, col) => {
      cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } }
      cell.border = border()
      cell.font   = { size: 10 }
      cell.alignment = { vertical: 'middle' }

      if (col === 1) cell.alignment = { horizontal: 'center', vertical: 'middle' }
      if (col === 7 && price > 0) {
        cell.numFmt = '#,##0 "€"'
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
        cell.font = { bold: true, size: 10 }
      }
      if (col === 8) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statutBg } }
        cell.font = { bold: true, size: 10, color: { argb: statutFg } }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
      }
    })
  })

  // ── Summary section ─────────────────────────────────────────────
  ws.addRow([])

  const addSummaryRow = (label: string, count: number | null, amount: number | null, bold = false, dark = false) => {
    ws.mergeCells(`A${ws.rowCount + 1}:E${ws.rowCount + 1}`)
    const r = ws.addRow([label, '', '', '', '', '', amount, ''])
    r.height = 20
    r.eachCell((cell, col) => {
      const bg = dark ? C.totalBg : C.summaryBg
      const fg = dark ? C.totalFg : 'FF1F2937'
      cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
      cell.font   = { bold: bold || dark, size: 10, color: { argb: fg } }
      cell.alignment = { vertical: 'middle' }
      if (col === 1) cell.value = count != null ? `${label}  (${count})` : label
      if (col === 7 && amount != null) {
        cell.numFmt = '#,##0 "€"'
        cell.alignment = { horizontal: 'right', vertical: 'middle' }
      }
    })
  }

  const sepRow = ws.addRow(['RÉCAPITULATIF'])
  sepRow.height = 20
  ws.mergeCells(`A${sepRow.number}:H${sepRow.number}`)
  sepRow.getCell(1).font = { bold: true, size: 11, color: { argb: 'FF1F2937' } }
  sepRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.summaryBg } }
  sepRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }

  addSummaryRow('Séances encaissées', numEncaisse, totalEncaisse)
  addSummaryRow('Absences (non encaissées)', numAbsent, totalAbsent)
  addSummaryRow('Non marqués / À venir', numPrevu, totalPrevu > 0 ? totalPrevu : 0)

  ws.addRow([])

  addSummaryRow('TOTAL ENCAISSÉ', null, totalEncaisse, true, true)

  ws.addRow([])

  const tvaRow = ws.addRow(['TVA non applicable — Art. 293 B du CGI'])
  ws.mergeCells(`A${tvaRow.number}:H${tvaRow.number}`)
  tvaRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF9CA3AF' } }

  // ── Generate buffer ─────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()

  return new Response(buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Livre-recettes-${year}-${String(month).padStart(2, '0')}.xlsx"`,
    },
  })
}
