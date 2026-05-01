import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const email: string | undefined = body?.email
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('blocked_clients')
    .delete()
    .eq('email', email.toLowerCase())

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
