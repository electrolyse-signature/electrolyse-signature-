import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

const CAL_API_BASE = 'https://api.cal.com/v2'
const CAL_API_VERSION = '2024-08-13'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const id: string | undefined = body?.id
  const bookingUid: string | undefined = body?.booking_uid
  if (!id || !bookingUid) {
    return NextResponse.json({ error: 'ID and booking_uid required' }, { status: 400 })
  }

  // Mark as rejected BEFORE calling Cal.com so the incoming BOOKING_CANCELLED
  // webhook can detect this is a salon-initiated cancellation and skip recording it.
  const { error } = await supabaseAdmin
    .from('pending_approvals')
    .update({ status: 'rejected', decided_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })

  const apiKey = process.env.CAL_API_KEY
  if (apiKey) {
    await fetch(`${CAL_API_BASE}/bookings/${bookingUid}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'cal-api-version': CAL_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'Client bloqué — réservation refusée par le salon' }),
    })
  }

  return NextResponse.json({ ok: true })
}
