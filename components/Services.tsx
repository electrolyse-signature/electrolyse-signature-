'use client'

import { useState } from 'react'
import { Service } from '@/lib/types'

const NS = 'seance-electrolyse-20'

const SERVICE_META: { duration: number; label: string; calLink: string; calNamespace: string }[] = [
  { duration: 5,  label: '5 min',  calLink: 'electrolyse.signature/seance-electrolyse-20',  calNamespace: NS },
  { duration: 10, label: '10 min', calLink: 'electrolyse.signature/seance-electrolyse-30',  calNamespace: NS },
  { duration: 15, label: '15 min', calLink: 'electrolyse.signature/seance-electrolyse-40',  calNamespace: NS },
  { duration: 20, label: '20 min', calLink: 'electrolyse.signature/seance-electrolyse-55',  calNamespace: NS },
  { duration: 25, label: '25 min', calLink: 'electrolyse.signature/seance-electrolyse-65',  calNamespace: NS },
  { duration: 30, label: '30 min', calLink: 'electrolyse.signature/seance-electrolyse-75',  calNamespace: NS },
  { duration: 35, label: '35 min', calLink: 'electrolyse.signature/seance-electrolyse-85',  calNamespace: NS },
  { duration: 40, label: '40 min', calLink: 'electrolyse.signature/seance-electrolyse-90',  calNamespace: NS },
  { duration: 45, label: '45 min', calLink: 'electrolyse.signature/seance-electrolyse-100', calNamespace: NS },
  { duration: 50, label: '50 min', calLink: 'electrolyse.signature/seance-electrolyse-110', calNamespace: NS },
  { duration: 55, label: '55 min', calLink: 'electrolyse.signature/seance-electrolyse-120', calNamespace: NS },
  { duration: 60, label: '1h',     calLink: 'electrolyse.signature/seance-electrolyse-130', calNamespace: NS },
  { duration: 90, label: '1h30',   calLink: 'electrolyse.signature/seance-electrolyse-175', calNamespace: NS },
]

function buildServices(prices: Record<number, number>): Service[] {
  return SERVICE_META
    .filter(m => prices[m.duration] !== undefined)
    .map(m => ({
      name: 'Séance électrolyse',
      duration: m.label,
      price: `${prices[m.duration]} €`,
      calLink: m.calLink,
      calNamespace: m.calNamespace,
    }))
}

function studentPrice(price: string): string {
  const num = parseFloat(price.replace(' €', '').replace(',', '.'))
  const discounted = Math.round(num * 0.85 * 100) / 100
  return discounted % 1 === 0 ? `${discounted} €` : `${discounted.toFixed(2).replace('.', ',')} €`
}

function openCal(namespace: string, calLink: string) {
  const Cal = (window as any).Cal
  if (Cal?.ns?.[namespace]) {
    Cal.ns[namespace]('modal', { calLink })
  }
}

export default function Services({ prices }: { prices: Record<number, number> }) {
  const [studentMode, setStudentMode] = useState(false)
  const services = buildServices(prices)

  return (
    <section id="services" className="section-padding bg-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Prestations</p>
          <h2 className="section-title">Nos services</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Chaque séance est adaptée à vos besoins.
          </p>
        </div>

        {/* Consultation gratuite */}
        <div className="mb-8 bg-blush/10 border-2 border-blush rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blush rounded-full flex items-center justify-center text-white text-xl shrink-0">✓</div>
              <div>
                <h3 className="font-serif text-2xl text-text-primary">Consultation initiale</h3>
                <p className="font-sans text-text-secondary text-sm mt-1">15 min · Obligatoire avant toute première séance</p>
              </div>
            </div>
            <div className="text-center shrink-0">
              <span className="font-serif text-3xl text-blush font-semibold">Gratuite</span>
              <p className="font-sans text-xs text-text-secondary mt-1">Offerte pour chaque nouvelle cliente</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 mb-4">
            {[
              { icon: '💬', text: "Présentation de l'électrolyse et optimisation des résultats" },
              { icon: '🎯', text: 'Compréhension de vos besoins et réponse à vos questions' },
              { icon: '✅', text: 'Vérification des éventuelles contre-indications' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-2 bg-white/60 rounded-xl px-4 py-3">
                <span className="text-lg shrink-0">{icon}</span>
                <p className="font-sans text-text-secondary text-sm">{text}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => openCal('secret', 'electrolyse.signature/secret')}
            className="w-full text-center font-sans text-sm text-blush border border-blush rounded-xl py-3 hover:bg-blush hover:text-white transition-all cursor-pointer"
          >
            Réserver ma consultation gratuite →
          </button>
        </div>

        {/* Offre étudiante */}
        <div className="mb-12 bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center text-white text-xl shrink-0">🎓</div>
            <div>
              <h3 className="font-serif text-2xl text-text-primary">Offre étudiante</h3>
              <p className="font-sans text-text-secondary text-sm mt-1">Sur présentation d&apos;une carte étudiante en cours de validité</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="font-serif text-3xl text-amber-500 font-semibold">-15%</span>
              <p className="font-sans text-xs text-text-secondary mt-1">Sur toutes les prestations</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={studentMode}
                  onChange={(e) => setStudentMode(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${studentMode ? 'bg-amber-400' : 'bg-gray-200'}`} />
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${studentMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
              <span className="font-sans text-sm text-text-secondary">Activer</span>
            </label>
          </div>
        </div>

        {/* Grille des séances */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-beige hover:border-blush hover:shadow-md transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-serif text-xl text-text-primary">{service.name}</h3>
                  <p className="font-sans text-text-secondary text-sm mt-1">{service.duration}</p>
                </div>
                <div className="text-right">
                  <span className={`font-serif text-3xl font-semibold text-blush block ${studentMode ? 'line-through opacity-40 text-xl' : ''}`}>
                    {service.price}
                  </span>
                  {studentMode && (
                    <span className="font-serif text-3xl font-semibold text-amber-500">
                      {studentPrice(service.price)}
                    </span>
                  )}
                </div>
              </div>
              {service.note && (
                <p className="font-sans text-xs text-blush bg-blush/10 px-3 py-2 rounded-lg mb-4">
                  ℹ {service.note}
                </p>
              )}
              <button
                onClick={() => openCal(service.calNamespace!, service.calLink!)}
                className="mt-auto pt-4 text-center w-full font-sans text-sm text-blush border border-blush rounded-xl py-2 hover:bg-blush hover:text-white transition-all cursor-pointer"
              >
                Réserver →
              </button>
            </div>
          ))}
        </div>

        <p className="text-center font-sans text-text-secondary text-sm mt-10">
          * Tarifs à titre indicatifs. Contactez-nous pour toute question.
        </p>
      </div>
    </section>
  )
}
