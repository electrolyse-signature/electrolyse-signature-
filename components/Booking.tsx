'use client'

import Script from 'next/script'

export default function Booking() {
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
            ℹ La consultation initiale gratuite est obligatoire pour toute nouvelle cliente
          </div>
        </div>

        <div id="cal-booking" className="w-full min-h-[700px] rounded-2xl overflow-hidden border border-beige bg-bg" />
      </div>

      <Script
        src="https://app.cal.com/embed/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          const Cal = (window as any).Cal
          if (!Cal) return
          Cal('init', { origin: 'https://cal.com' })
          Cal('inline', {
            elementOrSelector: '#cal-booking',
            calLink: 'electrolyse.signature',
            config: { layout: 'month_view', theme: 'light' },
          })
          Cal('ui', { hideEventTypeDetails: false, layout: 'month_view' })
        }}
      />
    </section>
  )
}
