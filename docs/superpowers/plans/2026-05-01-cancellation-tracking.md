# Cancellation Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Track Cal.com booking cancellations in Supabase, display repeat offenders in a Google-authenticated admin dashboard at `/admin/annulations`, and allow blocking clients.

**Architecture:** Cal.com sends `BOOKING_CANCELLED` webhooks to `/api/webhooks/cal`, which validates the HMAC-SHA256 signature and writes to Supabase. A Next.js 16 App Router admin page at `/admin/annulations`, protected by a NextAuth v5 Google proxy, reads from Supabase and lets Amal flag/block repeat cancellers.

**Tech Stack:** Next.js 16.2.4 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (PostgreSQL), NextAuth v5 (Google OAuth), Jest 29 (unit tests)

> **Next.js 16 breaking change:** `middleware.ts` is deprecated and renamed to `proxy.ts`. The exported function should be named `proxy` or a default export. See `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.

---

## File Map

```
New files:
  lib/cal-webhook.ts                          # Pure functions: signature validation + payload extraction
  lib/client-summaries.ts                     # Pure function: aggregate cancellations into per-client summaries
  lib/supabase.ts                             # Supabase admin client (service role key, server-only)
  auth.ts                                     # NextAuth v5 config (Google provider, allowed email)
  proxy.ts                                    # Route protection — replaces middleware.ts in Next.js 16
  app/api/webhooks/cal/route.ts               # Receives Cal.com BOOKING_CANCELLED webhook events
  app/api/auth/[...nextauth]/route.ts         # NextAuth route handler (GET + POST)
  app/api/admin/block/route.ts                # POST — upsert email into blocked_clients
  app/api/admin/unblock/route.ts              # POST — delete email from blocked_clients
  app/admin/annulations/page.tsx              # Server component — admin dashboard
  components/AdminTable.tsx                   # Client component — interactive table with block/unblock
  jest.config.js                              # Jest configuration using next/jest
  __tests__/lib/types.test.ts                 # Structural tests for new types
  __tests__/lib/cal-webhook.test.ts           # Unit tests for signature validation + extraction
  __tests__/lib/client-summaries.test.ts      # Unit tests for summary aggregation

Modify:
  lib/types.ts      # Append Cancellation, BlockedClient, ClientSummary interfaces
  package.json      # Add @supabase/supabase-js, next-auth@beta, jest, @types/jest; add test script
  .env.local        # Add Supabase, NextAuth, Cal.com env vars
```

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install @supabase/supabase-js next-auth@beta
```

Expected: `added N packages` with no peer dependency errors.

- [ ] **Step 2: Install dev dependencies**

```bash
npm install --save-dev jest @types/jest
```

Expected: `added N packages`.

- [ ] **Step 3: Add test script to package.json**

In `package.json`, add `"test": "jest"` to the `"scripts"` section so it reads:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "jest"
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase, next-auth, and jest dependencies"
```

---

### Task 2: Set up Supabase (manual)

**Files:** (none — external setup in Supabase dashboard)

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com, create an account and a new project. Name it `electrolyse-signature`. Select a region close to France (e.g. `eu-west-1`).

- [ ] **Step 2: Create tables**

In the Supabase dashboard → SQL Editor, run:

```sql
create table public.cancellations (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  name text not null default '',
  booking_id text not null default '',
  cancelled_at timestamptz not null default now(),
  reason text
);

create index cancellations_email_idx on public.cancellations(email);
create index cancellations_cancelled_at_idx on public.cancellations(cancelled_at desc);

create table public.blocked_clients (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  blocked_at timestamptz not null default now(),
  notes text
);

alter table public.cancellations enable row level security;
alter table public.blocked_clients enable row level security;
```

Expected: both tables appear in Table Editor. RLS is enabled but has no policies — only the service role key (used server-side) can access them.

- [ ] **Step 3: Collect credentials**

Go to Project Settings → API. Note:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

### Task 3: Configure environment variables

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Generate secrets**

Run this command twice (once per secret):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] **Step 2: Add variables to .env.local**

Add to `.env.local` (replace placeholders with real values):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CAL_WEBHOOK_SECRET=<first-random-hex>
NEXTAUTH_SECRET=<second-random-hex>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=to-be-filled-in-task-9
GOOGLE_CLIENT_SECRET=to-be-filled-in-task-9
```

- [ ] **Step 3: Verify .env.local is in .gitignore**

```bash
grep -r ".env.local" .gitignore
```

Expected: line found. If not: `echo ".env.local" >> .gitignore`

---

### Task 4: Add TypeScript types

**Files:**
- Create: `__tests__/lib/types.test.ts`
- Modify: `lib/types.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/types.test.ts`:

```typescript
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
  }
  expect(s.cancellation_count).toBe(3)
})
```

- [ ] **Step 2: Set up Jest config (needed to run tests)**

Create `jest.config.js` at project root:

```js
const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })
module.exports = createJestConfig({ testEnvironment: 'node' })
```

- [ ] **Step 3: Run tests — expect failure**

```bash
npm test -- __tests__/lib/types.test.ts
```

Expected: compilation error — `Cannot find 'Cancellation'` (types don't exist yet).

- [ ] **Step 4: Append types to lib/types.ts**

At the end of `lib/types.ts`, add:

```typescript
export interface Cancellation {
  id: string
  email: string
  name: string
  booking_id: string
  cancelled_at: string
  reason: string | null
}

export interface BlockedClient {
  id: string
  email: string
  blocked_at: string
  notes: string | null
}

export interface ClientSummary {
  email: string
  name: string
  cancellation_count: number
  last_cancelled_at: string
  is_blocked: boolean
}
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npm test -- __tests__/lib/types.test.ts
```

Expected: `3 tests passed`.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts __tests__/lib/types.test.ts jest.config.js
git commit -m "feat: add Cancellation, BlockedClient, ClientSummary types"
```

---

### Task 5: Implement cal-webhook business logic (TDD)

**Files:**
- Create: `__tests__/lib/cal-webhook.test.ts`
- Create: `lib/cal-webhook.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/cal-webhook.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- __tests__/lib/cal-webhook.test.ts
```

Expected: `Cannot find module '@/lib/cal-webhook'`.

- [ ] **Step 3: Implement lib/cal-webhook.ts**

Create `lib/cal-webhook.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- __tests__/lib/cal-webhook.test.ts
```

Expected: `8 tests passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/cal-webhook.ts __tests__/lib/cal-webhook.test.ts
git commit -m "feat: add cal-webhook signature validation and payload extraction"
```

---

### Task 6: Implement client-summaries business logic (TDD)

**Files:**
- Create: `__tests__/lib/client-summaries.test.ts`
- Create: `lib/client-summaries.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/lib/client-summaries.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- __tests__/lib/client-summaries.test.ts
```

Expected: `Cannot find module '@/lib/client-summaries'`.

- [ ] **Step 3: Implement lib/client-summaries.ts**

Create `lib/client-summaries.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- __tests__/lib/client-summaries.test.ts
```

Expected: `6 tests passed`.

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: `17 tests passed` (3 + 8 + 6).

- [ ] **Step 6: Commit**

```bash
git add lib/client-summaries.ts __tests__/lib/client-summaries.test.ts
git commit -m "feat: add buildClientSummaries aggregation logic"
```

---

### Task 7: Create Supabase client

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: Create the Supabase admin client**

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: add Supabase admin client"
```

---

### Task 8: Implement Cal.com webhook handler

**Files:**
- Create: `app/api/webhooks/cal/route.ts`

- [ ] **Step 1: Create the route handler**

Create `app/api/webhooks/cal/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { verifyCalSignature, extractCancellationData, CalWebhookEvent } from '@/lib/cal-webhook'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const signature = request.headers.get('X-Cal-Signature-256') ?? ''
  const rawBody = await request.text()

  if (!verifyCalSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event: CalWebhookEvent = JSON.parse(rawBody)

  if (event.triggerEvent !== 'BOOKING_CANCELLED') {
    return NextResponse.json({ ok: true })
  }

  const data = extractCancellationData(event)
  if (!data) {
    return NextResponse.json({ error: 'Missing attendee data' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('cancellations').insert(data)

  if (error) {
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/webhooks/cal/route.ts
git commit -m "feat: add Cal.com webhook handler"
```

---

### Task 9: Set up Google OAuth credentials (manual)

**Files:** (none — external setup)

- [ ] **Step 1: Go to Google Cloud Console**

Visit https://console.cloud.google.com → Create a new project named `electrolyse-signature`.

- [ ] **Step 2: Create OAuth 2.0 Client ID**

APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID:
- Application type: Web application
- Authorized redirect URIs (add both):
  - `http://localhost:3000/api/auth/callback/google`
  - `https://your-vercel-domain.vercel.app/api/auth/callback/google`

- [ ] **Step 3: Copy credentials to .env.local**

Replace the placeholders in `.env.local`:

```
GOOGLE_CLIENT_ID=<Client ID from Google>
GOOGLE_CLIENT_SECRET=<Client Secret from Google>
```

---

### Task 10: Set up NextAuth v5

**Files:**
- Create: `auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create NextAuth config at project root**

Create `auth.ts`:

```typescript
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const ALLOWED_EMAIL = 'soufiane.saidy@gmail.com'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      return profile?.email === ALLOWED_EMAIL
    },
  },
})
```

- [ ] **Step 2: Create NextAuth route handler**

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add auth.ts "app/api/auth/[...nextauth]/route.ts"
git commit -m "feat: set up NextAuth v5 with Google provider"
```

---

### Task 11: Protect admin routes with proxy

**Files:**
- Create: `proxy.ts`

> Note: In Next.js 16, `middleware.ts` is deprecated and replaced by `proxy.ts`. The file exports a default function (or one named `proxy`) plus an optional `config` object.

- [ ] **Step 1: Create proxy.ts at project root**

Create `proxy.ts`:

```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  if (!req.auth) {
    const url = new URL('/api/auth/signin', req.url)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "feat: protect /admin routes with NextAuth proxy"
```

---

### Task 12: Implement block/unblock API routes

**Files:**
- Create: `app/api/admin/block/route.ts`
- Create: `app/api/admin/unblock/route.ts`

- [ ] **Step 1: Create block endpoint**

Create `app/api/admin/block/route.ts`:

```typescript
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
    .upsert(
      { email: email.toLowerCase(), blocked_at: new Date().toISOString() },
      { onConflict: 'email' }
    )

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create unblock endpoint**

Create `app/api/admin/unblock/route.ts`:

```typescript
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
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/
git commit -m "feat: add block and unblock admin API routes"
```

---

### Task 13: Build admin dashboard

**Files:**
- Create: `components/AdminTable.tsx`
- Create: `app/admin/annulations/page.tsx`

- [ ] **Step 1: Create the interactive table component**

Create `components/AdminTable.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { ClientSummary } from '@/lib/types'

export default function AdminTable({ clients }: { clients: ClientSummary[] }) {
  const [data, setData] = useState(clients)

  async function handleBlock(email: string) {
    await fetch('/api/admin/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setData(prev => prev.map(c => c.email === email ? { ...c, is_blocked: true } : c))
  }

  async function handleUnblock(email: string) {
    await fetch('/api/admin/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setData(prev => prev.map(c => c.email === email ? { ...c, is_blocked: false } : c))
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Annulations</th>
            <th className="px-4 py-3">Dernière annulation</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map(client => {
            const isSignaled = !client.is_blocked && client.cancellation_count >= 2
            const rowClass = client.is_blocked
              ? 'bg-red-50'
              : isSignaled
              ? 'bg-orange-50'
              : ''
            return (
              <tr key={client.email} className={rowClass}>
                <td className="px-4 py-3 font-medium text-gray-900">{client.name}</td>
                <td className="px-4 py-3 text-gray-600">{client.email}</td>
                <td className="px-4 py-3 font-semibold">{client.cancellation_count}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(client.last_cancelled_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  {client.is_blocked ? (
                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                      Bloqué
                    </span>
                  ) : isSignaled ? (
                    <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                      Signalé
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      Normal
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {client.is_blocked ? (
                    <button
                      onClick={() => handleUnblock(client.email)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Débloquer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlock(client.email)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Bloquer
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                Aucune annulation enregistrée
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Create the admin page**

Create `app/admin/annulations/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { buildClientSummaries } from '@/lib/client-summaries'
import AdminTable from '@/components/AdminTable'

export const dynamic = 'force-dynamic'

export default async function AnnulationsPage() {
  const session = await auth()
  if (!session) redirect('/api/auth/signin')

  const [{ data: cancellations }, { data: blocked }] = await Promise.all([
    supabaseAdmin
      .from('cancellations')
      .select('email, name, cancelled_at')
      .order('cancelled_at', { ascending: false }),
    supabaseAdmin.from('blocked_clients').select('email'),
  ])

  const clients = buildClientSummaries(cancellations ?? [], blocked ?? [])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Annulations — {clients.length} client{clients.length !== 1 ? 's' : ''}
          </h1>
          <a
            href="/api/auth/signout"
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            Déconnexion
          </a>
        </div>
        <AdminTable clients={clients} />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Run all tests**

```bash
npm test
```

Expected: `17 tests passed`.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/AdminTable.tsx app/admin/
git commit -m "feat: add admin dashboard with block/unblock functionality"
```

---

### Task 14: Configure Cal.com webhook and smoke test (manual)

**Files:** (none — external setup)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: `ready on http://localhost:3000`.

- [ ] **Step 2: Expose localhost to Cal.com (for local testing)**

In a second terminal:

```bash
npx ngrok http 3000
```

Note the HTTPS URL (e.g. `https://abc123.ngrok-free.app`).

- [ ] **Step 3: Create webhook in Cal.com**

Cal.com Dashboard → Settings → Developer → Webhooks → New Webhook:
- **Payload URL**: `https://abc123.ngrok-free.app/api/webhooks/cal`
- **Events**: check only `BOOKING_CANCELLED`
- **Secret**: paste the value of `CAL_WEBHOOK_SECRET` from `.env.local`

- [ ] **Step 4: Cancel a test booking**

Create a test booking in Cal.com and cancel it. Check the Supabase `cancellations` table — a row should appear within seconds.

- [ ] **Step 5: Verify admin dashboard**

Visit `http://localhost:3000/admin/annulations`. Sign in with `soufiane.saidy@gmail.com` via Google. Verify the cancellation row appears.

- [ ] **Step 6: Test block/unblock**

Click "Bloquer" on a client row. Verify the row turns red and the button changes to "Débloquer". Click "Débloquer". Verify it returns to normal.

- [ ] **Step 7: Update NEXTAUTH_URL for production**

Before deploying, update `.env.local` (and Vercel env vars):
```
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

Also add the production Google redirect URI in the Google Cloud Console (step already done in Task 9 if you included both URLs).

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "feat: cancellation tracking — full feature complete"
git push
```
