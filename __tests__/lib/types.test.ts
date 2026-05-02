import type { Cancellation, BlockedClient, ClientSummary } from '@/lib/types'

it('Cancellation type has required fields', () => {
  const c: Cancellation = {
    id: 'uuid',
    email: 'a@b.com',
    name: 'Alice',
    booking_id: 'uid-123',
    cancelled_at: '2026-05-01T00:00:00Z',
    reason: null,
  }
  expect(c.email).toBe('a@b.com')
})

it('BlockedClient type has required fields', () => {
  const b: BlockedClient = {
    id: 'uuid',
    email: 'a@b.com',
    blocked_at: '2026-05-01T00:00:00Z',
    notes: null,
  }
  expect(b.email).toBe('a@b.com')
})

it('ClientSummary type has required fields', () => {
  const s: ClientSummary = {
    email: 'a@b.com',
    name: 'Alice',
    cancellation_count: 3,
    last_cancelled_at: '2026-05-01T00:00:00Z',
    is_blocked: false,
    note: null,
  }
  expect(s.cancellation_count).toBe(3)
})
