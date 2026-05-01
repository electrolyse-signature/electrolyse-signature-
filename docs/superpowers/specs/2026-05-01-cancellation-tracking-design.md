# Cancellation Tracking — Design Spec
**Date:** 2026-05-01  
**Project:** Electrolyse Signature (Site Amal)  
**Status:** Approved

---

## Problem

Amal needs to identify clients who repeatedly cancel appointments. Cal.com handles all bookings but provides no built-in report for repeat cancellers. Amal wants to see these clients and be able to mark them as blocked.

---

## Requirements

| # | Requirement |
|---|-------------|
| 1 | Record every cancellation event from Cal.com automatically |
| 2 | Flag a client after **2 or more** cancellations |
| 3 | Display flagged clients in an admin dashboard at `/admin/annulations` |
| 4 | Allow Amal to manually block a client (inserted into a blocked list) |
| 5 | Admin page protected by Google login (only `soufiane.saidy@gmail.com`) |

---

## Architecture

```
Cal.com → Webhook POST → /api/webhooks/cal → Supabase DB
                                                    ↓
                              /admin/annulations (NextAuth Google)
```

### Components

| Component | Responsibility |
|-----------|----------------|
| **Supabase** | Persists cancellation events and blocked clients list |
| **`/api/webhooks/cal`** | Next.js API route — receives Cal.com `BOOKING_CANCELLED` events, validates signature, writes to Supabase |
| **NextAuth (Google)** | Protects all `/admin/*` routes; only allows `soufiane.saidy@gmail.com` |
| **`/admin/annulations`** | Server-rendered admin page — shows cancellation counts per client, highlights repeat offenders, block button |

---

## Database Schema (Supabase)

### Table: `cancellations`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` (PK) | auto-generated |
| `email` | `text` | client email from Cal.com payload |
| `name` | `text` | client full name |
| `booking_id` | `text` | Cal.com booking UID |
| `cancelled_at` | `timestamptz` | timestamp of cancellation event |
| `reason` | `text` (nullable) | cancellation reason if provided |

### Table: `blocked_clients`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` (PK) | auto-generated |
| `email` | `text` (unique) | blocked client's email |
| `blocked_at` | `timestamptz` | when Amal blocked them |
| `notes` | `text` (nullable) | optional notes from Amal |

---

## Webhook Route `/api/webhooks/cal`

- Accepts `POST` requests from Cal.com
- Validates the request using a shared secret (`CAL_WEBHOOK_SECRET` env var) via HMAC-SHA256 signature check on the raw body
- Filters for event type `BOOKING_CANCELLED`
- Extracts: `attendees[0].email`, `attendees[0].name`, `uid`, `cancellationReason`, `cancelledAt`
- Inserts a row into `cancellations`
- Returns `200 OK` on success, `400` on invalid signature, `500` on DB error

---

## Admin Page `/admin/annulations`

- Server component — fetches data server-side (no client-side data exposure)
- Protected by NextAuth middleware: redirects to `/api/auth/signin` if unauthenticated
- Only the email `soufiane.saidy@gmail.com` is allowed; others get a 403
- Displays:
  - Table of all clients with ≥1 cancellation, sorted by count descending
  - Columns: Name, Email, Cancellations (count), Last cancelled (date), Status (Normal / Signalé ≥2 / Bloqué)
  - Clients with ≥2 cancellations highlighted in orange
  - Blocked clients highlighted in red
  - "Bloquer" button per row → calls `/api/admin/block` (POST with email)
  - "Débloquer" button for already-blocked clients → calls `/api/admin/unblock`

---

## API Routes (Admin Actions)

### `POST /api/admin/block`
- Auth-guarded (NextAuth session check)
- Body: `{ email: string, notes?: string }`
- Upserts row into `blocked_clients`

### `POST /api/admin/unblock`
- Auth-guarded
- Body: `{ email: string }`
- Deletes row from `blocked_clients`

---

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (read-only, public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (write, server-only) |
| `CAL_WEBHOOK_SECRET` | Shared secret for Cal.com webhook signature validation |
| `NEXTAUTH_SECRET` | Random string for NextAuth session encryption |
| `NEXTAUTH_URL` | Production URL (e.g. `https://electrolyse-signature.vercel.app`) |
| `GOOGLE_CLIENT_ID` | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret |

---

## Scope Boundaries

**In scope:**
- Recording cancellations via webhook
- Admin dashboard with block/unblock actions
- Google auth protection

**Out of scope:**
- Automatically preventing a blocked client from booking in Cal.com (Cal.com does not expose this via API in the free plan)
- Email notifications to Amal when a blocked client books
- Mobile-specific UI optimizations
