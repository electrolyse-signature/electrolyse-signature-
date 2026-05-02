import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email: string | undefined = body?.email
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const { data } = await supabaseAdmin
    .from('blocked_clients')
    .select('email')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  return NextResponse.json({ blocked: !!data })
}
