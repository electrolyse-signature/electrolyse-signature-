import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { DEFAULT_PRICES } from '@/lib/prices'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data } = await supabaseAdmin.from('service_prices').select('duration_minutes, price')
  if (data && data.length > 0) {
    return NextResponse.json(Object.fromEntries(data.map(r => [r.duration_minutes, r.price])))
  }
  return NextResponse.json(DEFAULT_PRICES)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user?.email !== 'electrolyse.signature@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: Record<string, number> = await request.json()
  const rows = Object.entries(body).map(([d, p]) => ({
    duration_minutes: Number(d),
    price: Number(p),
  }))

  const { error } = await supabaseAdmin
    .from('service_prices')
    .upsert(rows, { onConflict: 'duration_minutes' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
