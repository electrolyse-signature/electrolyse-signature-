'use client'

import { useEffect } from 'react'

const CAL_LINK = 'electrolyse.signature'

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
