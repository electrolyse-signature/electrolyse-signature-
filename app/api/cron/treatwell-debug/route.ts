import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const oauth2 = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
    )
    oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })
    const gmail = google.gmail({ version: 'v1', auth: oauth2 })

    // Test 1 : lister les 5 derniers emails (sans filtre)
    const all = await gmail.users.messages.list({ userId: 'me', maxResults: 5 })
    const allMessages = all.data.messages ?? []

    const previews = []
    for (const msg of allMessages) {
      const full = await gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date'] })
      const headers = full.data.payload?.headers ?? []
      previews.push({
        id: msg.id,
        subject: headers.find(h => h.name === 'Subject')?.value,
        from: headers.find(h => h.name === 'From')?.value,
        date: headers.find(h => h.name === 'Date')?.value,
      })
    }

    // Test 2 : chercher avec le mot "treatwell"
    const search = await gmail.users.messages.list({ userId: 'me', q: 'treatwell', maxResults: 5 })
    const found = search.data.messages?.length ?? 0

    return NextResponse.json({
      gmail_connected: true,
      last_5_emails: previews,
      treatwell_search_count: found,
    })
  } catch (err: any) {
    return NextResponse.json({ gmail_connected: false, error: err.message })
  }
}
