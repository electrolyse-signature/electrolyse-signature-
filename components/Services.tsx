import { Service } from '@/lib/types'

const services: Service[] = [
  { name: 'Séance électrolyse', duration: '5 min', price: '20 €' },
  { name: 'Séance électrolyse', duration: '10 min', price: '30 €' },
  { name: 'Séance électrolyse', duration: '15 min', price: '40 €' },
  { name: 'Séance électrolyse', duration: '20 min', price: '55 €' },
  { name: 'Séance électrolyse', duration: '25 min', price: '65 €' },
  { name: 'Séance électrolyse', duration: '30 min', price: '75 €' },
  { name: 'Séance électrolyse', duration: '35 min', price: '85 €' },
  { name: 'Séance électrolyse', duration: '40 min', price: '90 €' },
  { name: 'Séance électrolyse', duration: '45 min', price: '100 €' },
  { name: 'Séance électrolyse', duration: '50 min', price: '110 €' },
  { name: 'Séance électrolyse', duration: '55 min', price: '120 €' },
  { name: 'Séance électrolyse', duration: '1h', price: '130 €' },
  { name: 'Séance électrolyse', duration: '1h30', price: '175 €' },
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
        <div className="mb-8 bg-blush/10 border-2 border-blush rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blush rounded-full flex items-center justify-center text-white text-xl shrink-0">✓</div>
            <div>
              <h3 className="font-serif text-2xl text-text-primary">Consultation initiale</h3>
              <p className="font-sans text-text-secondary text-sm mt-1">15 min · Obligatoire avant toute première séance</p>
            </div>
          </div>
          <div className="text-center">
            <span className="font-serif text-3xl text-blush font-semibold">Gratuite</span>
            <p className="font-sans text-xs text-text-secondary mt-1">Offerte pour chaque nouvelle cliente</p>
          </div>
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
            <div key={i} className="bg-white rounded-2xl p-6 border border-beige hover:border-blush hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-serif text-xl text-text-primary">{service.name}</h3>
                  <p className="font-sans text-text-secondary text-sm mt-1">{service.duration}</p>
                </div>
                <span className="font-serif text-2xl text-blush">{service.price}</span>
              </div>
              {service.note && (
                <p className="font-sans text-xs text-blush bg-blush/10 px-3 py-2 rounded-lg">
                  ℹ {service.note}
                </p>
              )}
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
