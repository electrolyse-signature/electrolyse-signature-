import { NextResponse } from 'next/server'
import { verifyCalSignature, extractCancellationData, CalWebhookEvent } from '@/lib/cal-webhook'
import { supabaseAdmin } from '@/lib/supabase'

const AUTO_BLOCK_THRESHOLD = 3

export async function POST(request: Request) {
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const signature = request.headers.get('X-Cal-Signature-256') ?? ''
  const rawBody = await request.text()

  if (!verifyCalSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event: CalWebhookEvent = JSON.parse(rawBody)

  if (event.triggerEvent !== 'BOOKING_CANCELLED') {
    return NextResponse.json({ ok: true })
  }

  const data = extractCancellationData(event)
  if (!data) {
    return NextResponse.json({ error: 'Missing attendee data' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('cancellations').insert(data)
  if (error) {
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  // Auto-block after AUTO_BLOCK_THRESHOLD cancellations
  const { count } = await supabaseAdmin
    .from('cancellations')
    .select('*', { count: 'exact', head: true })
    .eq('email', data.email)

  if ((count ?? 0) >= AUTO_BLOCK_THRESHOLD) {
    await supabaseAdmin
      .from('blocked_clients')
      .upsert(
        { email: data.email, blocked_at: new Date().toISOString(), notes: 'Bloqué automatiquement' },
        { onConflict: 'email' }
      )
  }

  return NextResponse.json({ ok: true })
}
