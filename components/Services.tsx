import { Service } from '@/lib/types'

const NS = 'seance-electrolyse-20'

const services: Service[] = [
  { name: 'Séance électrolyse', duration: '5 min',  price: '20 €',  calLink: 'electrolyse.signature/seance-electrolyse-20',  calNamespace: NS },
  { name: 'Séance électrolyse', duration: '10 min', price: '30 €',  calLink: 'electrolyse.signature/seance-electrolyse-30',  calNamespace: NS },
  { name: 'Séance électrolyse', duration: '15 min', price: '40 €',  calLink: 'electrolyse.signature/seance-electrolyse-40',  calNamespace: NS },
  { name: 'Séance électrolyse', duration: '20 min', price: '55 €',  calLink: 'electrolyse.signature/seance-electrolyse-55',  calNamespace: NS },
  { name: 'Séance électrolyse', duration: '25 min', price: '65 €',  calLink: 'electrolyse.signature/seance-electrolyse-65',  calNamespace: NS },
  { name: 'Séance électrolyse', duration: '30 min', price: '75 €',  calLink: 'electrolyse.signature/seance-electrolyse-75',  calNamespace: NS },
  { name: 'Séance électrolyse', duration: '35 min', price: '85 €',  calLink: 'electrolyse.signature/seance-electrolyse-85',  calNamespace: NS },
  { name: 'Séance électrolyse', duration: '40 min', price: '90 €',  calLink: 'electrolyse.signature/seance-electrolyse-90',  calNamespace: NS },
  { name: 'Séance électrolyse', duration: '45 min', price: '100 €', calLink: 'electrolyse.signature/seance-electrolyse-100', calNamespace: NS },
  { name: 'Séance électrolyse', duration: '50 min', price: '110 €', calLink: 'electrolyse.signature/seance-electrolyse-110', calNamespace: NS },
  { name: 'Séance électrolyse', duration: '55 min', price: '120 €', calLink: 'electrolyse.signature/seance-electrolyse-120', calNamespace: NS },
  { name: 'Séance électrolyse', duration: '1h',     price: '130 €', calLink: 'electrolyse.signature/seance-electrolyse-130', calNamespace: NS },
  { name: 'Séance électrolyse', duration: '1h30',   price: '175 €', calLink: 'electrolyse.signature/seance-electrolyse-175', calNamespace: NS },
]

export default function Services() {
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
              { icon: '💬', text: 'Présentation de l\'électrolyse et optimisation des résultats' },
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
            data-cal-link="electrolyse.signature/secret"
            data-cal-namespace="secret"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
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
              <p className="font-sans text-text-secondary text-sm mt-1">Sur présentation d&apos;une carte étudiante valide</p>
            </div>
          </div>
          <div className="text-center">
            <span className="font-serif text-3xl text-amber-500 font-semibold">-15%</span>
            <p className="font-sans text-xs text-text-secondary mt-1">Sur toutes les prestations</p>
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
                <span className="font-serif text-2xl text-blush">{service.price}</span>
              </div>
              {service.note && (
                <p className="font-sans text-xs text-blush bg-blush/10 px-3 py-2 rounded-lg mb-4">
                  ℹ {service.note}
                </p>
              )}
              <button
                data-cal-link={service.calLink}
                data-cal-namespace={service.calNamespace}
                data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
                className="mt-auto pt-4 text-center w-full font-sans text-sm text-blush border border-blush rounded-xl py-2 hover:bg-blush hover:text-white transition-all cursor-pointer"
              >
                Réserver →
              </button>
            </div>
          ))}
        </div>

        <p className="text-center font-sans text-text-secondary text-sm mt-10">
          * Tarifs indicatifs. Contactez-nous pour toute question.
        </p>
      </div>
    </section>
  )
}
