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
  const email: string | undefined = body?.email
  const note: string | undefined = body?.note

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('client_notes')
    .upsert(
      { email: email.toLowerCase(), note: note ?? '', updated_at: new Date().toISOString() },
      { onConflict: 'email' }
    )

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
