import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getBookingPrice } from '@/lib/prices'

const CAL_API_BASE = 'https://api.cal.com/v2'
const CAL_API_VERSION = '2024-08-13'

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

function q(v: string | number) {
  return `"${String(v).replace(/"/g, '""')}"`
}

function row(...cols: (string | number)[]) {
  return cols.map(c => q(c)).join(',')
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'CAL_API_KEY manquant' }, { status: 500 })

  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)
  const now = new Date()
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
  const allRaw = [...pastRaw, ...upcomingRaw].sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const bookingIds = allRaw.map((b: { id: number }) => String(b.id))
  const { data: attendanceRows } = bookingIds.length > 0
    ? await supabaseAdmin.from('attendance').select('booking_id, status').in('booking_id', bookingIds)
    : { data: [] }

  const attendanceMap = new Map((attendanceRows ?? []).map((a: { booking_id: string; status: string }) => [a.booking_id, a.status]))

  const monthName = monthStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const exportDate = now.toLocaleDateString('fr-FR')
  const exportTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prestations = allRaw.filter((b: any) => b.attendees?.[0]?.name !== 'Pause')

  let totalEncaisse = 0
  let totalAbsent = 0
  let totalPrevu = 0
  let numEncaisse = 0
  let numAbsent = 0
  let numPrevu = 0

  const lines: string[] = []

  lines.push(row('ELECTROLYSE SIGNATURE', '', '', '', '', '', '', ''))
  lines.push(row('Livre de recettes — Registre des prestations', '', '', '', '', '', '', ''))
  lines.push(row(`Période : ${monthName}`, '', '', '', '', '', '', ''))
  lines.push(row(`Exporté le : ${exportDate} à ${exportTime}`, '', '', '', '', '', '', ''))
  lines.push(row('', '', '', '', '', '', '', ''))
  lines.push(row('N°', 'Date', 'Jour', 'Heure', 'Client', 'Prestation', 'Montant (€)', 'Statut'))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prestations.forEach((b: any, i: number) => {
    const start = new Date(b.start)
    const end = new Date(b.end)
    const attendee = b.attendees?.[0]
    const price = getBookingPrice(b.start, b.end, b.title)
    const isPast = start < now
    const presenceStatus = attendanceMap.get(String(b.id))

    let statut: string
    if (!isPast) {
      statut = 'À venir'
      totalPrevu += price
      numPrevu++
    } else if (presenceStatus === 'present') {
      statut = 'Encaissé'
      totalEncaisse += price
      numEncaisse++
    } else if (presenceStatus === 'absent') {
      statut = 'Absent'
      totalAbsent += price
      numAbsent++
    } else {
      statut = 'Non marqué'
      totalPrevu += price
      numPrevu++
    }

    const dateStr = start.toLocaleDateString('fr-FR')
    const jour = JOURS[start.getDay()]
    const heure = start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const duree = Math.round((end.getTime() - start.getTime()) / 60000)
    const service = b.title.replace(/entre Electrolyse signature et .+$/, '').trim()

    lines.push(row(i + 1, dateStr, jour, heure, attendee?.name ?? '—', service || b.title, price > 0 ? price : '—', statut))
  })

  lines.push(row('', '', '', '', '', '', '', ''))
  lines.push(row('', '', '', '', '', '', '', ''))
  lines.push(row('── RÉCAPITULATIF ──', '', '', '', '', '', '', ''))
  lines.push(row('', '', '', '', '', '', '', ''))
  lines.push(row(`Séances encaissées`, `${numEncaisse}`, '', '', '', '', `${totalEncaisse} €`, ''))
  lines.push(row(`Absences (non encaissées)`, `${numAbsent}`, '', '', '', '', totalAbsent > 0 ? `${totalAbsent} €` : '0 €', ''))
  lines.push(row(`Non marqués / À venir`, `${numPrevu}`, '', '', '', '', totalPrevu > 0 ? `${totalPrevu} €` : '0 €', ''))
  lines.push(row('', '', '', '', '', '', '', ''))
  lines.push(row('TOTAL ENCAISSÉ', '', '', '', '', '', `${totalEncaisse} €`, ''))
  lines.push(row('', '', '', '', '', '', '', ''))
  lines.push(row('TVA non applicable — Art. 293 B du CGI', '', '', '', '', '', '', ''))

  const csv = '﻿' + lines.join('\r\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="Livre-recettes-${year}-${String(month).padStart(2, '0')}.csv"`,
    },
  })
}
