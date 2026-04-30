export default function Booking() {
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
            ℹ La consultation initiale gratuite est obligatoire pour toute nouvelle cliente
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-beige shadow-sm">
          <iframe
            src="https://cal.com/electrolyse.signature?embed=true&theme=light&layout=month_view"
            width="100%"
            height="700"
            frameBorder="0"
            title="Réservation en ligne — Electrolyse Signature"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
