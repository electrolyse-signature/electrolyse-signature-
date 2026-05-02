import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const deletes = await Promise.all([
    supabaseAdmin.from('cancellations').delete().neq('booking_id', ''),
    supabaseAdmin.from('blocked_clients').delete().neq('email', ''),
    supabaseAdmin.from('client_notes').delete().neq('email', ''),
    supabaseAdmin.from('attendance').delete().neq('booking_id', ''),
    supabaseAdmin.from('pending_approvals').delete().neq('booking_uid', ''),
  ])

  const failed = deletes.find(r => r.error)
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
