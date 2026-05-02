'use client'

import { useState } from 'react'

const faqs = [
  {
    q: "Qu'est-ce que l'électrolyse permanente ?",
    a: "L'électrolyse est la seule méthode d'épilation définitivement reconnue par la FDA et les dermatologues. Elle détruit le follicule pileux par un courant électrique de très faible intensité, empêchant définitivement la repousse du poil."
  },
  {
    q: "Quelle est la différence avec le laser ?",
    a: "Contrairement au laser, l'électrolyse fonctionne sur tous les types de poils (blonds, roux, blancs) et tous les types de peaux, y compris les peaux foncées. C'est la seule méthode officiellement reconnue comme définitive."
  },
  {
    q: "Combien de séances sont nécessaires ?",
    a: "Le nombre de séances varie selon la zone traitée, la densité et la nature du poil. En moyenne, il faut entre 8 et 15 séances espacées pour obtenir un résultat définitif. Un bilan est réalisé lors de la consultation initiale gratuite."
  },
  {
    q: "La consultation initiale est-elle obligatoire ?",
    a: "Oui, la consultation initiale gratuite est obligatoire pour toute nouvelle cliente. Elle permet d'évaluer votre pilosité, de vous expliquer le protocole de traitement et de répondre à toutes vos questions avant de commencer."
  },
  {
    q: "Est-ce douloureux ?",
    a: "La sensation est comparable à un léger picotement. L'intensité est ajustée en permanence en fonction de votre confort. La plupart des clientes tolèrent très bien les séances."
  },
  {
    q: "Quelles zones peut-on traiter ?",
    a: "Toutes les zones du visage et du corps peuvent être traitées : lèvre supérieure, menton, sourcils, aisselles, maillot, jambes, bras, etc. Chaque zone fait l'objet d'un protocole adapté."
  },
  {
    q: "Combien coûte une séance ?",
    a: "Les séances sont facturées à la durée, à partir de 20 € pour 5 minutes. La durée est adaptée à la zone et à l'avancement du traitement. La consultation initiale est entièrement gratuite."
  },
  {
    q: "Le cabinet est-il réservé aux femmes ?",
    a: "Oui, le cabinet Electrolyse Signature est exclusivement réservé aux femmes, dans un cadre confidentiel et bienveillant à Noisiel, en Seine-et-Marne."
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="section-padding bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Questions fréquentes</p>
          <h2 className="section-title">Tout savoir sur l&apos;électrolyse</h2>
          <p className="section-subtitle">Les réponses aux questions les plus fréquentes sur l&apos;épilation définitive par électrolyse.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-beige rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-bg transition-colors"
              >
                <span className="font-sans font-medium text-text-primary pr-4">{faq.q}</span>
                <span className={`text-blush text-xl shrink-0 transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="font-sans text-text-secondary leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
