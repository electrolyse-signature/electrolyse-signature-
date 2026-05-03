'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function reject() {
    localStorage.setItem('cookie-consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-text-primary text-white px-6 py-5 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="font-sans text-sm text-white/80 leading-relaxed">
          Ce site utilise des cookies fonctionnels nécessaires à la réservation en ligne (Cal.com).
          Aucun cookie publicitaire ou de tracking n&apos;est utilisé.{' '}
          <Link href="/politique-de-confidentialite" className="text-blush hover:underline">
            En savoir plus
          </Link>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={reject}
            className="border border-white/50 text-white font-sans text-sm px-5 py-2 rounded-full hover:border-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="bg-blush text-white font-sans text-sm px-5 py-2 rounded-full hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
