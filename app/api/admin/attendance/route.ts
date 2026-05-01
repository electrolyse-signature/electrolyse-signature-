import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { booking_id, email, name, date, status } = body

  if (!booking_id || !status) {
    return NextResponse.json({ error: 'booking_id and status required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('attendance')
    .upsert(
      { booking_id, email: email?.toLowerCase() ?? '', name: name ?? '', date, status, marked_at: new Date().toISOString() },
      { onConflict: 'booking_id' }
    )

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
