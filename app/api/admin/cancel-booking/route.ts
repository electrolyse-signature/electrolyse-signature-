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
  const uid: string | undefined = body?.uid
  const reason: string = body?.reason ?? 'Annulé par le salon'

  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 })

  const apiKey = process.env.CAL_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'CAL_API_KEY missing' }, { status: 500 })

  // Flag this UID before calling Cal.com so the webhook knows it's admin-initiated
  await supabaseAdmin.from('admin_cancellations').insert({ booking_uid: uid, reason })

  const res = await fetch(`${CAL_API_BASE}/bookings/${uid}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'cal-api-version': CAL_API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cancellationReason: reason }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    console.error('[cancel-booking] Cal.com error:', res.status, data)
    // Clean up the flag since the cancellation didn't go through
    await supabaseAdmin.from('admin_cancellations').delete().eq('booking_uid', uid)
    return NextResponse.json({ error: data?.error?.message ?? 'Erreur Cal.com' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
