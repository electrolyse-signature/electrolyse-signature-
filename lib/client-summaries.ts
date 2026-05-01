import type { ClientSummary } from './types'

export function buildClientSummaries(
  cancellations: Array<{ email: string; name: string; cancelled_at: string }>,
  blocked: Array<{ email: string }>
): ClientSummary[] {
  const blockedEmails = new Set(blocked.map(b => b.email))
  const byEmail = new Map<string, { name: string; count: number; last: string }>()

  for (const c of cancellations) {
    const existing = byEmail.get(c.email)
    if (!existing) {
      byEmail.set(c.email, { name: c.name, count: 1, last: c.cancelled_at })
    } else {
      existing.count++
      if (c.cancelled_at > existing.last) existing.last = c.cancelled_at
    }
  }

  return Array.from(byEmail.entries())
    .map(([email, { name, count, last }]) => ({
      email,
      name,
      cancellation_count: count,
      last_cancelled_at: last,
      is_blocked: blockedEmails.has(email),
    }))
    .sort((a, b) => b.cancellation_count - a.cancellation_count)
}
