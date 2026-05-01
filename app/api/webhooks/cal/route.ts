import { NextResponse } from 'next/server'
import { verifyCalSignature, extractCancellationData, CalWebhookEvent } from '@/lib/cal-webhook'
import { supabaseAdmin } from '@/lib/supabase'

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

  return NextResponse.json({ ok: true })
}
