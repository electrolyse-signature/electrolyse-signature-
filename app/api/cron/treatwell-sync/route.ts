import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fetchTreatwellEmails } from '@/lib/gmail'
import { parseTreatwellEmail } from '@/lib/parse-treatwell'
import { createBlockerBooking } from '@/lib/calcom'

export async function GET(req: Request) {
  const secret =
    req.headers.get('x-cron-secret') ??
    new URL(req.url).searchParams.get('secret')

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let emails
  try {
    emails = await fetchTreatwellEmails()
  } catch (err: any) {
    return NextResponse.json({ error: `Gmail: ${err.message}` }, { status: 500 })
  }

  if (emails.length === 0) {
    return NextResponse.json({ processed: 0, results: [], debug: 'Aucun email Treatwell trouvé dans Gmail (7 derniers jours)' })
  }

  const results = []

  for (const email of emails) {
    // Déduplique — ne traite pas deux fois le même email
    const { data: existing } = await supabaseAdmin
      .from('treatwell_sync_log')
      .select('id')
      .eq('gmail_message_id', email.id)
      .maybeSingle()

    if (existing) continue

    const parsed = parseTreatwellEmail(email.subject, email.body)

    if (!parsed) {
      await supabaseAdmin.from('treatwell_sync_log').insert({
        gmail_message_id: email.id,
        raw_subject: email.subject,
        status: 'parse_error',
        error_message: 'Impossible d\'extraire la date/heure',
      })
      results.push({ id: email.id, status: 'parse_error', subject: email.subject })
      continue
    }

    try {
      const booking = await createBlockerBooking(parsed.start, parsed.end, parsed.clientName, parsed.durationMinutes)
      await supabaseAdmin.from('treatwell_sync_log').insert({
        gmail_message_id: email.id,
        raw_subject: email.subject,
        parsed_start: parsed.start.toISOString(),
        parsed_end: parsed.end.toISOString(),
        calcom_booking_uid: String(booking.uid ?? booking.id ?? ''),
        status: 'synced',
      })
      results.push({ id: email.id, status: 'synced', start: parsed.start })
    } catch (err: any) {
      await supabaseAdmin.from('treatwell_sync_log').insert({
        gmail_message_id: email.id,
        raw_subject: email.subject,
        parsed_start: parsed.start.toISOString(),
        status: 'calcom_error',
        error_message: err.message,
      })
      results.push({ id: email.id, status: 'calcom_error', error: err.message })
    }
  }

  return NextResponse.json({ processed: results.length, results })
}
