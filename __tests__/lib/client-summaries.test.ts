import { buildClientSummaries } from '@/lib/client-summaries'

const cancellations = [
  { email: 'alice@example.com', name: 'Alice', cancelled_at: '2026-04-20T10:00:00Z' },
  { email: 'alice@example.com', name: 'Alice', cancelled_at: '2026-04-01T10:00:00Z' },
  { email: 'bob@example.com',   name: 'Bob',   cancelled_at: '2026-04-10T10:00:00Z' },
]

describe('buildClientSummaries', () => {
  it('counts cancellations per unique email', () => {
    const result = buildClientSummaries(cancellations, [])
    expect(result.find(c => c.email === 'alice@example.com')?.cancellation_count).toBe(2)
    expect(result.find(c => c.email === 'bob@example.com')?.cancellation_count).toBe(1)
  })

  it('sorts by cancellation count descending', () => {
    const result = buildClientSummaries(cancellations, [])
    expect(result[0].email).toBe('alice@example.com')
    expect(result[1].email).toBe('bob@example.com')
  })

  it('tracks the most recent cancellation date', () => {
    const result = buildClientSummaries(cancellations, [])
    expect(result.find(c => c.email === 'alice@example.com')?.last_cancelled_at).toBe('2026-04-20T10:00:00Z')
  })

  it('marks emails in blocked list as is_blocked: true', () => {
    const result = buildClientSummaries(cancellations, [{ email: 'bob@example.com' }])
    expect(result.find(c => c.email === 'bob@example.com')?.is_blocked).toBe(true)
    expect(result.find(c => c.email === 'alice@example.com')?.is_blocked).toBe(false)
  })

  it('returns empty array for empty input', () => {
    expect(buildClientSummaries([], [])).toEqual([])
  })

  it('preserves client name', () => {
    const result = buildClientSummaries(cancellations, [])
    expect(result.find(c => c.email === 'alice@example.com')?.name).toBe('Alice')
  })
})
