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
              href="https://maps.google.com/?q=47+Grande+All%C3%A9e+du+12+F%C3%A9vrier+1934,+77186+Noisiel"
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
                className="w-full bg-blush text-white font-sans py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
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
