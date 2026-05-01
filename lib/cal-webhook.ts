import { createHmac } from 'crypto'

export interface CalWebhookEvent {
  triggerEvent: string
  createdAt: string
  payload: {
    uid: string
    attendees: Array<{ email: string; name: string }>
    cancellationReason?: string | null
  }
}

export interface CancellationInsert {
  email: string
  name: string
  booking_id: string
  cancelled_at: string
  reason: string | null
}

export function verifyCalSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  return expected === signature
}

export function extractCancellationData(event: CalWebhookEvent): CancellationInsert | null {
  const attendee = event.payload?.attendees?.[0]
  if (!attendee?.email) return null
  return {
    email: attendee.email.toLowerCase(),
    name: attendee.name ?? '',
    booking_id: event.payload.uid ?? '',
    cancelled_at: event.createdAt ?? new Date().toISOString(),
    reason: event.payload.cancellationReason ?? null,
  }
}
