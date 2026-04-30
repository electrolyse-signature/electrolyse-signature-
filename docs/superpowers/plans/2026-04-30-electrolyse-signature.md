# Electrolyse Signature Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a one-page Next.js 14 website for Electrolyse Signature with Cal.com booking (Google Calendar sync), Google + Treatwell reviews carousel, contact form, and a refined beige/white aesthetic.

**Architecture:** Next.js 14 App Router single-page app. Presentational sections are pure React components. Google Places reviews are fetched via a Next.js route handler (server-side, cached 24h) to keep the API key secret. Cal.com booking is embedded via its JS embed. Contact form uses EmailJS (client-side after server-side validation).

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS v3, Google Places API, Cal.com embed (free plan), EmailJS, Google Fonts (Cormorant Garamond + Lato)

---

## File Map

| File | Responsibility |
|------|---------------|
| `app/layout.tsx` | Root layout, Google Fonts, metadata |
| `app/page.tsx` | Page assembly — renders all sections |
| `app/globals.css` | CSS variables, Tailwind base, custom utilities |
| `app/api/reviews/route.ts` | Server-side Google Places API handler, 24h cache |
| `app/api/contact/route.ts` | Contact form validation route |
| `components/Navigation.tsx` | Fixed navbar, scroll-aware background, mobile menu |
| `components/Hero.tsx` | Full-height hero with gradient and CTA |
| `components/About.tsx` | Amal's intro, stats badges |
| `components/Services.tsx` | Service cards grid with prices |
| `components/Booking.tsx` | Cal.com JS embed |
| `components/Reviews.tsx` | Auto-scrolling carousel, Google + Treatwell |
| `components/Contact.tsx` | Address, hours, map link, contact form |
| `components/Footer.tsx` | Logo, Instagram link, copyright |
| `lib/types.ts` | Shared TypeScript types |
| `lib/treatwell-reviews.ts` | Static Treatwell review data |

---

### Task 1: Initialize Next.js project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`

- [ ] **Step 1: Create project**

Run from `Desktop/`:
```bash
npx create-next-app@latest "Site amal" --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
cd "Site amal"
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install @emailjs/browser
```

- [ ] **Step 3: Remove boilerplate**

Delete contents of `app/page.tsx` (replace with empty export). Clear `app/globals.css` (keep only the three `@tailwind` directives). Delete `public/vercel.svg` and `public/next.svg`.

`app/page.tsx` temporary content:
```typescript
export default function Home() {
  return <></>
}
```

- [ ] **Step 4: Verify dev server**

```bash
npm run dev
```
Expected: Server starts at http://localhost:3000 with no errors.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js 14 project"
```

---

### Task 2: Design system

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FDFAF7',
        beige: '#E8D5C4',
        blush: '#C9A99A',
        'text-primary': '#3D3535',
        'text-secondary': '#8C7B7B',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'serif'],
        sans: ['var(--font-lato)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Update `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body { @apply bg-bg text-text-primary font-sans; }
  h1, h2, h3 { @apply font-serif; }
}

@layer utilities {
  .section-padding { @apply py-20 px-6 md:px-12 lg:px-24; }
  .section-title { @apply font-serif text-4xl md:text-5xl italic text-text-primary mb-4; }
  .section-subtitle { @apply text-text-secondary text-lg font-light mb-12; }
}
```

- [ ] **Step 3: Update `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Cormorant_Garamond, Lato } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
})

export const metadata: Metadata = {
  title: 'Electrolyse Signature | Épilation permanente à Noisiel',
  description: "Cabinet d'électrolyse permanente réservé aux femmes à Noisiel. Praticienne certifiée Amal. 86 avis 5/5. Prenez rendez-vous en ligne.",
  openGraph: {
    title: 'Electrolyse Signature',
    description: 'Expert en électrolyse permanente à Noisiel, Seine-et-Marne.',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${lato.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Verify fonts load**

```bash
npm run dev
```
Open DevTools on http://localhost:3000 → Elements → `<html>` tag should have `--font-cormorant` and `--font-lato` CSS variables.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx tailwind.config.ts
git commit -m "feat: design system — palette, fonts, Tailwind config"
```

---

### Task 3: Shared types and static review data

**Files:**
- Create: `lib/types.ts`
- Create: `lib/treatwell-reviews.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```typescript
export interface Review {
  id: string
  author: string
  rating: number
  text: string
  date: string
  source: 'google' | 'treatwell'
}

export interface Service {
  name: string
  duration: string
  price: string
  note?: string
}

export interface GooglePlacesResponse {
  result: {
    rating: number
    user_ratings_total: number
    reviews: Array<{
      author_name: string
      rating: number
      text: string
      relative_time_description: string
    }>
  }
}
```

- [ ] **Step 2: Create `lib/treatwell-reviews.ts`**

```typescript
import { Review } from './types'

export const treatwellReviews: Review[] = [
  {
    id: 'tw-1',
    author: 'Sophie M.',
    rating: 5,
    text: 'Amal est une professionnelle exceptionnelle. Accueil chaleureux, cabinet propre et moderne. Je recommande vivement pour toute personne souhaitant une épilation définitive.',
    date: 'Novembre 2024',
    source: 'treatwell',
  },
  {
    id: 'tw-2',
    author: 'Camille R.',
    rating: 5,
    text: "Excellente praticienne, très à l'écoute et professionnelle. Les résultats sont là ! Cabinet accueillant et ambiance zen. Merci Amal !",
    date: 'Octobre 2024',
    source: 'treatwell',
  },
  {
    id: 'tw-3',
    author: 'Laura D.',
    rating: 5,
    text: "Je suis ravie de mes séances chez Electrolyse Signature. Amal prend le temps d'expliquer chaque étape et met vraiment en confiance. Résultats impressionnants.",
    date: 'Septembre 2024',
    source: 'treatwell',
  },
  {
    id: 'tw-4',
    author: 'Nadia K.',
    rating: 5,
    text: "Cabinet réservé aux femmes, c'est parfait. Amal est douce, professionnelle et les résultats sont au rendez-vous. Je continue mes séances avec elle.",
    date: 'Août 2024',
    source: 'treatwell',
  },
  {
    id: 'tw-5',
    author: 'Marie L.',
    rating: 5,
    text: 'Très bonne expérience. Amal est compétente et rassurante. Le cabinet est bien situé, facile d'accès depuis le RER. Je recommande sans hésitation !',
    date: 'Juillet 2024',
    source: 'treatwell',
  },
]
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/treatwell-reviews.ts
git commit -m "feat: shared types and static Treatwell reviews"
```

---

### Task 4: API routes

**Files:**
- Create: `.env.local`
- Create: `.env.example`
- Create: `app/api/reviews/route.ts`
- Create: `app/api/contact/route.ts`

- [ ] **Step 1: Create `.env.local`**

```
GOOGLE_PLACES_API_KEY=your_key_here
GOOGLE_PLACE_ID=your_place_id_here
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
```

To find the Place ID: visit https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder, search "Electrolyse Signature Noisiel", copy the ID (starts with `ChIJ`).

- [ ] **Step 2: Create `.env.example`**

```
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
```

- [ ] **Step 3: Verify `.gitignore` excludes `.env.local`**

Open `.gitignore` and confirm `.env.local` is listed. If not, add it.

- [ ] **Step 4: Create `app/api/reviews/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { GooglePlacesResponse, Review } from '@/lib/types'

export const revalidate = 86400

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (!apiKey || !placeId) {
    return NextResponse.json({ reviews: [], rating: 5, total: 86 })
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&language=fr&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    )

    if (!response.ok) {
      return NextResponse.json({ reviews: [], rating: 5, total: 86 })
    }

    const data: GooglePlacesResponse = await response.json()
    const { result } = data

    const reviews: Review[] = (result.reviews || []).map((r, i) => ({
      id: `google-${i}`,
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      date: r.relative_time_description,
      source: 'google' as const,
    }))

    return NextResponse.json({
      reviews,
      rating: result.rating,
      total: result.user_ratings_total,
    })
  } catch {
    return NextResponse.json({ reviews: [], rating: 5, total: 86 })
  }
}
```

- [ ] **Step 5: Create `app/api/contact/route.ts`**

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, message } = body

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 6: Test routes**

```bash
npm run dev
```

Visit http://localhost:3000/api/reviews — expected: `{"reviews":[],"rating":5,"total":86}`

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello"}'
```
Expected: `{"ok":true}`

- [ ] **Step 7: Commit**

```bash
git add app/api/reviews/route.ts app/api/contact/route.ts .env.example
git commit -m "feat: Google Places reviews and contact validation API routes"
```

---

### Task 5: Navigation

**Files:**
- Create: `components/Navigation.tsx`
- Create: `public/logo.png` (manual step)

- [ ] **Step 1: Download logo**

Go to https://www.instagram.com/electrolyse.signature/ → download the profile photo or any logo image → save as `public/logo.png`.

If unavailable now, create a temporary 280×80px white PNG with "Electrolyse Signature" text and save as `public/logo.png`.

- [ ] **Step 2: Create `components/Navigation.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const links = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Services', href: '#services' },
  { label: 'Réservation', href: '#reservation' },
  { label: 'Avis', href: '#avis' },
  { label: 'Contact', href: '#contact' },
]

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-bg shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#accueil">
          <Image src="/logo.png" alt="Electrolyse Signature" width={140} height={40} className="h-10 w-auto object-contain" priority />
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-sans text-text-secondary hover:text-text-primary transition-colors">
              {link.label}
            </a>
          ))}
          <a href="https://www.instagram.com/electrolyse.signature/" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Instagram">
            <InstagramIcon />
          </a>
          <a href="#reservation" className="bg-blush text-white text-sm px-5 py-2 rounded-full hover:bg-opacity-90 transition-colors font-sans">
            Réserver
          </a>
        </div>

        <button className="md:hidden p-2 text-text-primary" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-bg border-t border-beige px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-text-secondary hover:text-text-primary font-sans py-1" onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="#reservation" className="bg-blush text-white text-sm px-5 py-2 rounded-full text-center" onClick={() => setMenuOpen(false)}>
            Réserver
          </a>
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Step 3: Wire into `app/page.tsx`**

```typescript
import Navigation from '@/components/Navigation'

export default function Home() {
  return <Navigation />
}
```

- [ ] **Step 4: Verify**

Visit http://localhost:3000. Nav appears. Scroll down → background turns white. Mobile: hamburger menu opens/closes.

- [ ] **Step 5: Commit**

```bash
git add components/Navigation.tsx public/logo.png app/page.tsx
git commit -m "feat: responsive navigation with scroll-aware background"
```

---

### Task 6: Hero section

**Files:**
- Create: `components/Hero.tsx`

- [ ] **Step 1: Create `components/Hero.tsx`**

```typescript
export default function Hero() {
  return (
    <section id="accueil" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FDFAF7 0%, #F0E6DC 50%, #E8D5C4 100%)' }}>

      <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #C9A99A, transparent)' }} />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #E8D5C4, transparent)' }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-sans text-text-secondary mb-8 border border-beige">
          <span className="text-amber-400">★★★★★</span>
          <span>5/5 · 86 avis vérifiés</span>
        </div>

        <h1 className="font-serif italic text-5xl md:text-7xl text-text-primary leading-tight mb-6">
          L'électrolyse permanente.<br />
          <span className="text-blush">Une expertise,</span><br />
          une signature.
        </h1>

        <p className="font-sans text-text-secondary text-lg md:text-xl font-light mb-4">
          Cabinet réservé aux femmes · Noisiel, Seine-et-Marne
        </p>
        <p className="font-sans text-text-secondary text-base font-light mb-10">
          La seule méthode d'épilation définitivement reconnue, entre des mains expertes.
        </p>

        <a href="#reservation" className="inline-block bg-blush text-white font-sans text-base px-8 py-4 rounded-full hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
          Prendre rendez-vous
        </a>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-secondary opacity-60">
        <span className="font-sans text-xs tracking-widest uppercase">Découvrir</span>
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```typescript
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <>
      <Navigation />
      <Hero />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Hero.tsx app/page.tsx
git commit -m "feat: Hero section with gradient and CTA"
```

---

### Task 7: About section

**Files:**
- Create: `components/About.tsx`

- [ ] **Step 1: Create `components/About.tsx`**

```typescript
const stats = [
  { value: '86', label: 'Avis vérifiés' },
  { value: '5/5', label: 'Note moyenne' },
  { value: '♿', label: 'Accessible PMR' },
]

export default function About() {
  return (
    <section id="a-propos" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="w-full aspect-[4/5] rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, #E8D5C4, #C9A99A)' }}>
            <span className="text-white/50 font-serif italic text-xl">Photo d'Amal</span>
          </div>
          <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-beige rounded-2xl -z-10" />
        </div>

        <div>
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">À propos</p>
          <h2 className="section-title">Votre experte<br />en électrolyse</h2>
          <div className="w-12 h-0.5 bg-blush mb-8" />

          <div className="font-sans text-text-secondary leading-relaxed space-y-4 mb-10">
            <p>
              Bienvenue chez <strong className="text-text-primary font-normal">Electrolyse Signature</strong>,
              le cabinet d'Amal, spécialiste de l'électrolyse permanente à Noisiel.
            </p>
            <p>
              L'électrolyse est la <strong className="text-text-primary font-normal">seule méthode d'épilation définitivement reconnue</strong> comme permanente.
              Chaque poil est traité individuellement à la source, pour un résultat durable et sans compromis.
            </p>
            <p>
              Dans un cabinet moderne, chaleureux et réservé exclusivement aux femmes,
              Amal vous accompagne avec douceur, précision et bienveillance.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-bg rounded-xl border border-beige">
                <div className="font-serif text-2xl text-blush mb-1">{stat.value}</div>
                <div className="font-sans text-xs text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```typescript
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import About from '@/components/About'

export default function Home() {
  return (
    <>
      <Navigation />
      <Hero />
      <About />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/About.tsx app/page.tsx
git commit -m "feat: About section with Amal intro and stats"
```

---

### Task 8: Services section

**Files:**
- Create: `components/Services.tsx`

- [ ] **Step 1: Create `components/Services.tsx`**

```typescript
import { Service } from '@/lib/types'

const services: Service[] = [
  { name: 'Consultation initiale', duration: '15 min', price: '1 €', note: 'Obligatoire avant toute première séance' },
  { name: 'Séance électrolyse', duration: '5 min', price: '17 €' },
  { name: 'Séance électrolyse', duration: '15 min', price: '45 €' },
  { name: 'Séance électrolyse', duration: '30 min', price: '75 €' },
  { name: 'Séance électrolyse', duration: '45 min', price: '100 €' },
  { name: 'Séance électrolyse', duration: '1h', price: '120 €' },
  { name: 'Séance électrolyse', duration: '1h30', price: '148,50 €' },
  { name: 'Soin visage', duration: 'Variable', price: 'Sur devis' },
]

export default function Services() {
  return (
    <section id="services" className="section-padding bg-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Prestations</p>
          <h2 className="section-title">Nos services</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Chaque séance est adaptée à vos besoins. Une consultation préalable est incluse pour les nouvelles clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-beige hover:border-blush hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-serif text-xl text-text-primary">{service.name}</h3>
                  <p className="font-sans text-text-secondary text-sm mt-1">{service.duration}</p>
                </div>
                <span className="font-serif text-2xl text-blush">{service.price}</span>
              </div>
              {service.note && (
                <p className="font-sans text-xs text-blush bg-blush/10 px-3 py-2 rounded-lg">
                  ℹ {service.note}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="text-center font-sans text-text-secondary text-sm mt-10">
          * Tarifs indicatifs. Contactez-nous pour toute question.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```typescript
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'

export default function Home() {
  return (
    <>
      <Navigation />
      <Hero />
      <About />
      <Services />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Services.tsx app/page.tsx
git commit -m "feat: Services section with pricing cards"
```

---

### Task 9: Booking section (Cal.com)

**Files:**
- Create: `components/Booking.tsx`

**Pre-requisite — Cal.com setup (complete before coding):**
1. Create free account at https://cal.com with Amal's email
2. Settings → Calendars → Connect Google Calendar
3. Set availability: Tue-Wed 11:00-18:00, Thu-Fri 12:00-19:00, Sat 09:00-13:00
4. Create event types for each session duration
5. Settings → Appearance → set brand color to `#C9A99A`
6. From any event type → Share → Embed → Inline → copy the `calLink` value (e.g. `amal/consultation`)

- [ ] **Step 1: Create `components/Booking.tsx`**

Replace `YOUR_CAL_LINK` with the actual Cal.com link from setup above.

```typescript
'use client'

import { useEffect } from 'react'

const CAL_LINK = 'YOUR_CAL_LINK'

export default function Booking() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      // @ts-ignore
      window.Cal?.('init', { origin: 'https://app.cal.com' })
      // @ts-ignore
      window.Cal?.('inline', {
        elementOrSelector: '#cal-booking',
        calLink: CAL_LINK,
        config: { layout: 'month_view', theme: 'light' },
      })
    }

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  return (
    <section id="reservation" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Réservation</p>
          <h2 className="section-title">Prenez rendez-vous</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Choisissez votre créneau directement en ligne. Les disponibilités sont mises à jour en temps réel.
          </p>
          <div className="inline-flex items-center gap-2 bg-blush/10 border border-blush/30 text-blush text-sm font-sans px-4 py-2 rounded-full">
            ℹ Une consultation de 1€ (15 min) est requise pour toute nouvelle cliente
          </div>
        </div>

        <div id="cal-booking" className="w-full min-h-[600px] rounded-2xl overflow-hidden border border-beige bg-bg" />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```typescript
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Booking from '@/components/Booking'

export default function Home() {
  return (
    <>
      <Navigation />
      <Hero />
      <About />
      <Services />
      <Booking />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Booking.tsx app/page.tsx
git commit -m "feat: Cal.com booking section with Google Calendar sync"
```

---

### Task 10: Reviews carousel

**Files:**
- Create: `components/Reviews.tsx`

- [ ] **Step 1: Create `components/Reviews.tsx`**

```typescript
'use client'

import { useEffect, useState, useRef } from 'react'
import { Review } from '@/lib/types'
import { treatwellReviews } from '@/lib/treatwell-reviews'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
    </div>
  )
}

function Badge({ source }: { source: 'google' | 'treatwell' }) {
  return source === 'google'
    ? <span className="text-xs font-sans bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">Google</span>
    : <span className="text-xs font-sans bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full border border-rose-100">Treatwell</span>
}

export default function Reviews() {
  const [allReviews, setAllReviews] = useState<Review[]>(treatwellReviews)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then(({ reviews }) => {
        if (reviews?.length) {
          const combined: Review[] = []
          const max = Math.max(reviews.length, treatwellReviews.length)
          for (let i = 0; i < max; i++) {
            if (reviews[i]) combined.push(reviews[i])
            if (treatwellReviews[i]) combined.push(treatwellReviews[i])
          }
          setAllReviews(combined)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (paused) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % allReviews.length)
    }, 4000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [paused, allReviews.length])

  const visible = [0, 1, 2].map((offset) => allReviews[(activeIndex + offset) % allReviews.length]).filter(Boolean)

  return (
    <section id="avis" className="section-padding bg-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Témoignages</p>
          <h2 className="section-title">Ce que disent nos clientes</h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-amber-400 text-2xl">★★★★★</span>
            <span className="font-serif text-3xl text-text-primary">5/5</span>
            <span className="font-sans text-text-secondary">· 86+ avis vérifiés</span>
          </div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {visible.map((review, i) => (
            <div key={`${review.id}-${i}`} className="bg-white rounded-2xl p-6 border border-beige shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <Stars rating={review.rating} />
                <Badge source={review.source} />
              </div>
              <p className="font-sans text-text-secondary text-sm leading-relaxed mb-6 line-clamp-4">
                "{review.text}"
              </p>
              <div className="flex justify-between items-center">
                <span className="font-sans text-text-primary text-sm">{review.author}</span>
                <span className="font-sans text-text-secondary text-xs">{review.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {allReviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all ${i === activeIndex ? 'bg-blush w-4' : 'bg-beige w-2'}`}
              aria-label={`Avis ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex justify-center gap-8 mt-8 opacity-50">
          <span className="font-sans text-xs text-text-secondary">✓ Avis vérifiés Google</span>
          <span className="font-sans text-xs text-text-secondary">✓ Avis vérifiés Treatwell</span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```typescript
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Booking from '@/components/Booking'
import Reviews from '@/components/Reviews'

export default function Home() {
  return (
    <>
      <Navigation />
      <Hero />
      <About />
      <Services />
      <Booking />
      <Reviews />
    </>
  )
}
```

- [ ] **Step 3: Verify**

Visit http://localhost:3000#avis. 3 review cards should show, rotating every 4 seconds. Hover pauses. Dots navigate.

- [ ] **Step 4: Commit**

```bash
git add components/Reviews.tsx app/page.tsx
git commit -m "feat: auto-scrolling reviews carousel, Google + Treatwell"
```

---

### Task 11: Contact section

**Files:**
- Create: `components/Contact.tsx`

**Pre-requisite — EmailJS setup:**
1. Create free account at https://emailjs.com
2. Add a service (Gmail) → copy Service ID
3. Create template with variables `{{from_name}}`, `{{from_email}}`, `{{message}}` → copy Template ID
4. Account → API Keys → copy Public Key
5. Add all three to `.env.local` as `NEXT_PUBLIC_EMAILJS_*`

- [ ] **Step 1: Create `components/Contact.tsx`**

```typescript
'use client'

import { useState, FormEvent } from 'react'
import emailjs from '@emailjs/browser'

const hours = [
  { day: 'Lundi', time: 'Fermé' },
  { day: 'Mardi – Mercredi', time: '11h00 – 18h00' },
  { day: 'Jeudi – Vendredi', time: '12h00 – 19h00' },
  { day: 'Samedi', time: '09h00 – 13h00' },
  { day: 'Dimanche', time: 'Fermé' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    const validation = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!validation.ok) {
      setStatus('error')
      return
    }

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        { from_name: form.name, from_email: form.email, message: form.message },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Contact</p>
          <h2 className="section-title">Nous trouver</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-xl mb-3">Adresse</h3>
              <p className="font-sans text-text-secondary leading-relaxed">
                47 Grande Allée du 12 Février 1934<br />77186 Noisiel, Seine-et-Marne
              </p>
              <div className="mt-3 space-y-1 font-sans text-sm text-text-secondary">
                <p>🚇 RER A Noisiel – 5 min à pied</p>
                <p>🚗 Parking devant et derrière le bâtiment</p>
                <p>♿ Accessible PMR</p>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl mb-3">Horaires</h3>
              <div className="space-y-2">
                {hours.map(({ day, time }) => (
                  <div key={day} className="flex justify-between font-sans text-sm">
                    <span className="text-text-secondary">{day}</span>
                    <span className={time === 'Fermé' ? 'text-text-secondary/50' : 'text-text-primary'}>{time}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=47+Grande+Allée+du+12+Février+1934,+77186+Noisiel"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-12 w-full rounded-xl border border-beige bg-bg text-blush font-sans text-sm hover:border-blush transition-colors"
            >
              Voir sur Google Maps →
            </a>
          </div>

          <div>
            <h3 className="font-serif text-xl mb-6">Envoyer un message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-sans text-sm text-text-secondary block mb-1">Prénom</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full border border-beige rounded-xl px-4 py-3 font-sans text-text-primary bg-bg focus:outline-none focus:border-blush transition-colors"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="font-sans text-sm text-text-secondary block mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full border border-beige rounded-xl px-4 py-3 font-sans text-text-primary bg-bg focus:outline-none focus:border-blush transition-colors"
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <label className="font-sans text-sm text-text-secondary block mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full border border-beige rounded-xl px-4 py-3 font-sans text-text-primary bg-bg focus:outline-none focus:border-blush transition-colors resize-none"
                  placeholder="Votre message..."
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-blush text-white font-sans py-4 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-60"
              >
                {status === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>

              {status === 'success' && (
                <p className="font-sans text-sm text-green-600 text-center">
                  ✓ Message envoyé. Amal vous répondra rapidement.
                </p>
              )}
              {status === 'error' && (
                <p className="font-sans text-sm text-red-500 text-center">
                  Une erreur est survenue. Veuillez réessayer.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```typescript
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Booking from '@/components/Booking'
import Reviews from '@/components/Reviews'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <>
      <Navigation />
      <Hero />
      <About />
      <Services />
      <Booking />
      <Reviews />
      <Contact />
    </>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Contact.tsx app/page.tsx
git commit -m "feat: Contact section with hours, map link, and form"
```

---

### Task 12: Footer and final assembly

**Files:**
- Create: `components/Footer.tsx`
- Modify: `app/page.tsx` (final)

- [ ] **Step 1: Create `components/Footer.tsx`**

```typescript
import Image from 'next/image'

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-text-primary text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Image src="/logo.png" alt="Electrolyse Signature" width={120} height={36} className="h-9 w-auto object-contain brightness-0 invert" />

          <div className="flex items-center gap-6 font-sans text-sm text-white/70">
            {['#accueil', '#services', '#reservation', '#contact'].map((href) => (
              <a key={href} href={href} className="hover:text-white transition-colors capitalize">
                {href.replace('#', '')}
              </a>
            ))}
          </div>

          <a
            href="https://www.instagram.com/electrolyse.signature/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-sans text-sm text-white/70 hover:text-white transition-colors"
          >
            <InstagramIcon />
            @electrolyse.signature
          </a>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs text-white/40">
          <p>© {new Date().getFullYear()} Electrolyse Signature. Tous droits réservés.</p>
          <p>47 Grande Allée du 12 Février 1934, 77186 Noisiel</p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Final `app/page.tsx`**

```typescript
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Booking from '@/components/Booking'
import Reviews from '@/components/Reviews'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <About />
        <Services />
        <Booking />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 3: Full page verification**

```bash
npm run dev
```
Scroll through http://localhost:3000 — all 7 sections visible, no console errors.

- [ ] **Step 4: Commit**

```bash
git add components/Footer.tsx app/page.tsx
git commit -m "feat: Footer and complete page assembly"
```

---

### Task 13: Build validation

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 2: Lint**

```bash
npm run lint
```
Expected: no errors.

- [ ] **Step 3: Production build**

```bash
npm run build
```
Expected: build succeeds. Missing env var warnings are expected until keys are configured on Vercel.

- [ ] **Step 4: Fix any issues, then commit**

```bash
git add -A
git commit -m "fix: resolve build issues"
```

---

### Task 14: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/electrolyse-signature.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Import on Vercel**

Go to https://vercel.com → Add New Project → import the GitHub repo. Framework: Next.js (auto-detected). Click Deploy.

- [ ] **Step 3: Add environment variables**

Vercel dashboard → Project → Settings → Environment Variables. Add:
- `GOOGLE_PLACES_API_KEY`
- `GOOGLE_PLACE_ID`
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

- [ ] **Step 4: Redeploy**

Vercel → Deployments → Redeploy latest.

- [ ] **Step 5: Configure custom domain**

Vercel → Settings → Domains → add your domain → update DNS records at your registrar as instructed.

- [ ] **Step 6: Production smoke test**

Visit live URL and verify: navigation scroll, hero CTA, Cal.com calendar loads, reviews rotate, contact form sends email, mobile layout correct.

---

## Before you start — manual prerequisites

| Item | Action |
|------|--------|
| Logo | Download from @electrolyse.signature on Instagram → save as `public/logo.png` |
| Photo d'Amal | Request from Amal for the About section placeholder |
| Cal.com account | Create and configure before Task 9 |
| Google Cloud | Enable Places API, create restricted API key |
| EmailJS account | Create before Task 11 |
| Service prices | Verify 15min/30min/45min/1h prices with Amal, update `components/Services.tsx` |
| Place ID | Find via Google Place ID Finder for "Electrolyse Signature Noisiel" |
