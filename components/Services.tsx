import { Service } from '@/lib/types'

const services: Service[] = [
  { name: 'Consultation initiale', duration: '15 min', price: '1 €', note: 'Obligatoire avant toute première séance' },
  { name: 'Séance électrolyse', duration: '5 min', price: '17 €' },
  { name: 'Séance électrolyse', duration: '15 min', price: '45 €' },
  { name: 'Séance électrolyse', duration: '30 min', price: '75 €' },
  { name: 'Séance électrolyse', duration: '45 min', price: '100 €' },
  { name: 'Séance électrolyse', duration: '1h', price: '120 €' },
  { name: 'Séance électrolyse', duration: '1h30', price: '148,50 €' },
  { name: 'Soin visage', duration: 'Variable', price: 'Sur devis' },
]

export default function Services() {
  return (
    <section id="services" className="section-padding bg-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Prestations</p>
          <h2 className="section-title">Nos services</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Chaque séance est adaptée à vos besoins. Une consultation préalable est incluse pour les nouvelles clientes.
          </p>
        </div>

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
