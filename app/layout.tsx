import type { Metadata } from 'next'
import { Cormorant_Garamond, Lato } from 'next/font/google'
import Script from 'next/script'
import CookieBanner from '@/components/CookieBanner'
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://electrolyse-signature.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Electrolyse Signature | Épilation permanente à Noisiel',
  description: "Cabinet d'électrolyse permanente réservé aux femmes à Noisiel. Praticienne certifiée Amal. 86 avis 5/5. Prenez rendez-vous en ligne.",
  keywords: ['électrolyse', 'électrolyse permanente', 'épilation définitive', 'Noisiel', 'Seine-et-Marne', 'épilation permanente', 'cabinet électrolyse', 'électrolyse femme'],
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Electrolyse Signature | Épilation permanente à Noisiel',
    description: "Cabinet d'électrolyse permanente réservé aux femmes à Noisiel. Praticienne certifiée Amal. 86 avis 5/5.",
    locale: 'fr_FR',
    type: 'website',
    url: SITE_URL,
    images: [{ url: '/og-image.jpeg', alt: 'Electrolyse Signature – Épilation permanente à Noisiel' }],
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'Electrolyse Signature',
  description: "Cabinet d'électrolyse permanente réservé aux femmes à Noisiel, Seine-et-Marne.",
  url: SITE_URL,
  telephone: '+33769832944',
  email: 'electrolyse.signature@gmail.com',
  priceRange: '€€',
  image: `${SITE_URL}/og-image.jpeg`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Noisiel',
    addressRegion: 'Seine-et-Marne',
    addressCountry: 'FR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 48.8442,
    longitude: 2.6275,
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: '86',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' },
  ],
  sameAs: ['https://www.instagram.com/electrolyse.signature/'],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: "Qu'est-ce que l'électrolyse permanente ?", acceptedAnswer: { '@type': 'Answer', text: "L'électrolyse est la seule méthode d'épilation définitivement reconnue par la FDA. Elle détruit le follicule pileux par un courant électrique de très faible intensité, empêchant définitivement la repousse du poil." } },
    { '@type': 'Question', name: "Quelle est la différence avec le laser ?", acceptedAnswer: { '@type': 'Answer', text: "Contrairement au laser, l'électrolyse fonctionne sur tous les types de poils (blonds, roux, blancs) et toutes les peaux, y compris les peaux foncées. C'est la seule méthode officiellement reconnue comme définitive." } },
    { '@type': 'Question', name: "Combien de séances sont nécessaires ?", acceptedAnswer: { '@type': 'Answer', text: "En moyenne, il faut entre 8 et 15 séances espacées pour obtenir un résultat définitif. Un bilan est réalisé lors de la consultation initiale gratuite." } },
    { '@type': 'Question', name: "La consultation initiale est-elle obligatoire ?", acceptedAnswer: { '@type': 'Answer', text: "Oui, la consultation initiale gratuite est obligatoire pour toute nouvelle cliente. Elle permet d'évaluer votre pilosité et d'établir un protocole de traitement personnalisé." } },
    { '@type': 'Question', name: "Est-ce douloureux ?", acceptedAnswer: { '@type': 'Answer', text: "La sensation est comparable à un léger picotement. L'intensité est ajustée en permanence selon votre confort. La plupart des clientes tolèrent très bien les séances." } },
    { '@type': 'Question', name: "Combien coûte une séance ?", acceptedAnswer: { '@type': 'Answer', text: "Les séances sont facturées à la durée, à partir de 20 € pour 5 minutes. La consultation initiale est entièrement gratuite." } },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${lato.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
      <Script
        id="cal-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
            Cal("init", "secret", {origin:"https://app.cal.com"});
            Cal.ns.secret("ui", {"cssVarsPerTheme":{"light":{"cal-brand":"#C9A99A"},"dark":{"cal-brand":"#292929"}},"hideEventTypeDetails":false,"layout":"month_view"});
            Cal("init", "seance-electrolyse-20", {origin:"https://app.cal.com"});
            Cal.ns["seance-electrolyse-20"]("ui", {"cssVarsPerTheme":{"light":{"cal-brand":"#C9A99A"},"dark":{"cal-brand":"#292929"}},"hideEventTypeDetails":false,"layout":"month_view"});
            Cal("init", "general", {origin:"https://app.cal.com"});
            Cal.ns["general"]("ui", {"cssVarsPerTheme":{"light":{"cal-brand":"#C9A99A"},"dark":{"cal-brand":"#292929"}},"hideEventTypeDetails":false,"layout":"month_view"});
          `
        }}
      />
    </html>
  )
}
