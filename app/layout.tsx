import type { Metadata } from 'next'
import { Cormorant_Garamond, Lato } from 'next/font/google'
import Script from 'next/script'
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
      <Script
        id="cal-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
            Cal("init", "secret", {origin:"https://app.cal.com"});
            Cal.ns.secret("ui", {"cssVarsPerTheme":{"light":{"cal-brand":"#C9A99A"},"dark":{"cal-brand":"#292929"}},"hideEventTypeDetails":false,"layout":"month_view"});
          `
        }}
      />
    </html>
  )
}
