'use client'

import { useState } from 'react'

const steps = [
  {
    number: '01',
    title: 'Consultation initiale gratuite',
    duration: '15 min · Offerte',
    description: "On fait connaissance. J'évalue votre pilosité, je vous explique la technique en détail et je réponds à toutes vos questions. On établit ensemble un protocole adapté à votre situation. Aucun engagement — vous repartez avec toutes les informations pour décider sereinement.",
    details: [
      'Analyse de votre pilosité et de votre peau',
      'Estimation réaliste du nombre de séances',
      'Vérification des contre-indications',
      'Réponse à toutes vos questions',
    ],
    icon: '💬',
    cta: null,
  },
  {
    number: '02',
    title: 'Première séance',
    duration: 'Durée au choix · À partir de 20 €',
    description: "La zone est nettoyée et préparée. Je traite chaque poil individuellement avec une fine sonde stérile à usage unique. J'ajuste l'intensité en temps réel selon votre confort — vous restez toujours en contrôle. Après la séance, quelques rougeurs passagères peuvent apparaître : c'est normal, elles disparaissent en quelques heures.",
    details: [
      'Sonde stérile à usage unique pour chaque séance',
      'Intensité ajustée selon votre seuil de tolérance',
      'Protocole hygiène complet entre chaque cliente',
      'Conseils post-séance personnalisés',
    ],
    icon: '✨',
    cta: null,
  },
  {
    number: '03',
    title: 'Suivi et résultats durables',
    duration: 'Séances espacées de 4 à 8 semaines',
    description: "Les résultats s'installent progressivement. Chaque cycle de repousse est traité, et la densité diminue séance après séance. En moyenne, entre 8 et 15 séances suffisent pour un résultat définitif sur la zone traitée. Je suis votre évolution à chaque rendez-vous et adapte le protocole si nécessaire.",
    details: [
      'Résultats visibles dès les premières séances',
      'Suivi personnalisé à chaque rendez-vous',
      'Protocole ajusté selon l\'évolution',
      'Résultat définitif garanti sur les poils traités',
    ],
    icon: '🎯',
    cta: null,
  },
]

function openCal() {
  const Cal = (window as any).Cal
  if (Cal?.ns?.secret) Cal.ns.secret('modal', { calLink: 'electrolyse.signature/secret' })
}

export default function Process() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <section className="section-padding bg-bg">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Déroulement</p>
          <h2 className="section-title">Comment ça se passe ?</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            De la première prise de contact aux résultats définitifs — voici les étapes avec Amal.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`rounded-2xl border transition-all overflow-hidden ${
                active === i ? 'border-blush bg-white shadow-md' : 'border-beige bg-white hover:border-blush/50'
              }`}
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center gap-5 cursor-pointer"
                onClick={() => setActive(active === i ? null : i)}
              >
                <span className="font-serif text-3xl text-blush/30 shrink-0 w-10">{step.number}</span>
                <span className="text-2xl shrink-0">{step.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl text-text-primary">{step.title}</h3>
                  <p className="font-sans text-xs text-text-secondary mt-0.5">{step.duration}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-blush shrink-0 transition-transform ${active === i ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {active === i && (
                <div className="px-6 pb-6 border-t border-beige pt-5">
                  <p className="font-sans text-text-secondary leading-relaxed mb-5">{step.description}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {step.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 font-sans text-sm text-text-secondary">
                        <span className="text-blush mt-0.5 shrink-0">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={openCal}
            className="inline-block bg-blush text-white font-sans text-base px-8 py-4 rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            Réserver ma consultation gratuite
          </button>
          <p className="font-sans text-text-secondary text-sm mt-3">Gratuite · Sans engagement · 15 minutes</p>
        </div>
      </div>
    </section>
  )
}
