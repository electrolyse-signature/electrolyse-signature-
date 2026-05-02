'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'

interface Props {
  namespace: string
  calLink: string
  children: ReactNode
}

function openCal(namespace: string, calLink: string) {
  const Cal = (window as any).Cal
  if (Cal?.ns?.[namespace]) {
    Cal.ns[namespace]('modal', { calLink })
  }
}

export default function BookingGate({ namespace, calLink, children }: Props) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setEmail('')
      setBlocked(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setBlocked(false)
    try {
      const res = await fetch('/api/check-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.blocked) {
        setBlocked(true)
      } else {
        setOpen(false)
        openCal(namespace, calLink)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ display: 'contents' }}>
        {children}
      </span>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
              aria-label="Fermer"
            >
              ×
            </button>

            <h2 className="font-serif text-2xl text-text-primary mb-1">Votre adresse email</h2>
            <p className="font-sans text-sm text-text-secondary mb-6">
              Nous vérifions votre accès avant d'ouvrir le calendrier.
            </p>

            {blocked ? (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-sans">
                Nous ne pouvons pas accepter votre réservation en ligne pour le moment.
                Veuillez nous contacter directement pour en discuter.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans outline-none focus:border-blush transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blush text-white font-sans text-sm py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
                >
                  {loading ? 'Vérification…' : 'Continuer →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
