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
