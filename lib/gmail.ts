import { google } from 'googleapis'

function getGmailClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
  )
  oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN })
  return google.gmail({ version: 'v1', auth: oauth2 })
}

function decodeBase64(data: string): string {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
}

function extractBody(payload: any): string {
  if (payload?.body?.data) return decodeBase64(payload.body.data)
  for (const part of payload?.parts ?? []) {
    if (part.mimeType === 'text/plain' && part.body?.data) return decodeBase64(part.body.data)
  }
  for (const part of payload?.parts ?? []) {
    if (part.mimeType === 'text/html' && part.body?.data) return decodeBase64(part.body.data)
  }
  return ''
}

export interface GmailMessage {
  id: string
  subject: string
  from: string
  body: string
}

export async function fetchTreatwellEmails(): Promise<GmailMessage[]> {
  const gmail = getGmailClient()

  const list = await gmail.users.messages.list({
    userId: 'me',
    q: 'from:treatwell newer_than:1d',
    maxResults: 20,
  })

  const messages = list.data.messages ?? []
  const results: GmailMessage[] = []

  for (const msg of messages) {
    const full = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id!,
      format: 'full',
    })

    const headers = full.data.payload?.headers ?? []
    const subject = headers.find(h => h.name === 'Subject')?.value ?? ''
    const from = headers.find(h => h.name === 'From')?.value ?? ''
    const body = extractBody(full.data.payload)

    results.push({ id: msg.id!, subject, from, body })
  }

  return results
}
