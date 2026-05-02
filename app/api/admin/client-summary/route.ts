import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const email = new URL(request.url).searchParams.get('email')?.toLowerCase()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const [
    { data: noteData },
    { data: blockedData },
    { data: cancellationsData },
  ] = await Promise.all([
    supabaseAdmin.from('client_notes').select('note').eq('email', email).maybeSingle(),
    supabaseAdmin.from('blocked_clients').select('email').eq('email', email).maybeSingle(),
    supabaseAdmin.from('cancellations').select('cancelled_at').eq('email', email).order('cancelled_at', { ascending: false }),
  ])

  return NextResponse.json({
    note: noteData?.note ?? null,
    is_blocked: !!blockedData,
    cancellation_count: cancellationsData?.length ?? 0,
    last_cancelled_at: cancellationsData?.[0]?.cancelled_at ?? null,
  })
}
