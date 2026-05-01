import { createHmac } from 'crypto'
import { verifyCalSignature, extractCancellationData, CalWebhookEvent } from '@/lib/cal-webhook'

describe('verifyCalSignature', () => {
  const secret = 'test-secret'
  const body = '{"triggerEvent":"BOOKING_CANCELLED"}'

  it('returns true for a valid HMAC-SHA256 signature', () => {
    const hex = createHmac('sha256', secret).update(body).digest('hex')
    expect(verifyCalSignature(body, `sha256=${hex}`, secret)).toBe(true)
  })

  it('returns false for a tampered signature', () => {
    expect(verifyCalSignature(body, 'sha256=aabbcc', secret)).toBe(false)
  })

  it('returns false for an empty signature', () => {
    expect(verifyCalSignature(body, '', secret)).toBe(false)
  })

  it('returns false when sha256= prefix is missing', () => {
    const hex = createHmac('sha256', secret).update(body).digest('hex')
    expect(verifyCalSignature(body, hex, secret)).toBe(false)
  })
})

describe('extractCancellationData', () => {
  const baseEvent: CalWebhookEvent = {
    triggerEvent: 'BOOKING_CANCELLED',
    createdAt: '2026-05-01T10:00:00.000Z',
    payload: {
      uid: 'booking-abc',
      attendees: [{ email: 'Client@Example.com', name: 'Client Name' }],
      cancellationReason: 'Changed my mind',
    },
  }

  it('normalises email to lowercase', () => {
    expect(extractCancellationData(baseEvent)?.email).toBe('client@example.com')
  })

  it('maps all fields correctly', () => {
    expect(extractCancellationData(baseEvent)).toEqual({
      email: 'client@example.com',
      name: 'Client Name',
      booking_id: 'booking-abc',
      cancelled_at: '2026-05-01T10:00:00.000Z',
      reason: 'Changed my mind',
    })
  })

  it('returns null when attendees array is empty', () => {
    const event = { ...baseEvent, payload: { ...baseEvent.payload, attendees: [] } }
    expect(extractCancellationData(event)).toBeNull()
  })

  it('sets reason to null when cancellationReason is absent', () => {
    const event: CalWebhookEvent = {
      ...baseEvent,
      payload: { uid: 'x', attendees: [{ email: 'a@b.com', name: 'A' }] },
    }
    expect(extractCancellationData(event)?.reason).toBeNull()
  })
})
