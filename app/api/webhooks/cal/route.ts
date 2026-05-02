import { NextResponse } from 'next/server'
import { verifyCalSignature, extractCancellationData, CalWebhookEvent } from '@/lib/cal-webhook'
import { supabaseAdmin } from '@/lib/supabase'
import { sendBlockedClientAlert } from '@/lib/mailer'

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

  if (event.triggerEvent === 'BOOKING_CREATED') {
    return handleBookingCreated(event)
  }

  if (event.triggerEvent === 'BOOKING_CANCELLED') {
    return handleBookingCancelled(event)
  }

  return NextResponse.json({ ok: true })
}

async function handleBookingCreated(event: CalWebhookEvent) {
  const attendee = event.payload?.attendees?.[0]
  if (!attendee?.email) return NextResponse.json({ ok: true })

  const email = attendee.email.toLowerCase()
  if (email === ADMIN_EMAIL) return NextResponse.json({ ok: true })

  const { data: blockedRow } = await supabaseAdmin
    .from('blocked_clients')
    .select('email')
    .eq('email', email)
    .maybeSingle()

  if (!blockedRow) return NextResponse.json({ ok: true })

  const name = attendee.name ?? ''
  const startTime = event.payload.startTime ?? null
  const title = event.payload.title ?? null

  await supabaseAdmin.from('pending_approvals').insert({
    booking_uid: event.payload.uid,
    email,
    name,
    start_time: startTime,
    end_time: event.payload.endTime ?? null,
    title,
    status: 'pending',
    created_at: event.createdAt ?? new Date().toISOString(),
  })

  await sendBlockedClientAlert({ name, email, title, startTime })

  return NextResponse.json({ ok: true })
}

const ADMIN_EMAIL = 'electrolyse.signature@gmail.com'

async function handleBookingCancelled(event: CalWebhookEvent) {
  const attendeeEmail = event.payload?.attendees?.[0]?.email?.toLowerCase() ?? ''
  if (attendeeEmail === ADMIN_EMAIL) return NextResponse.json({ ok: true })

  // Ignore cancellations triggered by the salon rejecting a blocked client's booking
  const { data: rejected } = await supabaseAdmin
    .from('pending_approvals')
    .select('id')
    .eq('booking_uid', event.payload.uid)
    .eq('status', 'rejected')
    .maybeSingle()

  if (rejected) return NextResponse.json({ ok: true })

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
