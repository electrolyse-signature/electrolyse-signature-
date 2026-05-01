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

        {/* Solution 1 — Popup */}
        <div className="text-center mb-6">
          <p className="font-sans text-text-secondary text-sm mb-4">Réserver en un clic</p>
          <button
            data-cal-link="electrolyse.signature/secret"
            data-cal-namespace="secret"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
            className="bg-blush text-white font-sans text-base px-10 py-4 rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            Choisir mon créneau →
          </button>
        </div>

        {/* Séparateur */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-beige" />
          <span className="font-sans text-text-secondary text-sm">ou directement dans le calendrier</span>
          <div className="flex-1 h-px bg-beige" />
        </div>

        {/* Solution 2 — Calendrier intégré */}
        <div className="rounded-2xl overflow-hidden border border-beige shadow-sm">
          <iframe
            src="https://cal.com/electrolyse.signature?embed=true&theme=light&layout=month_view"
            width="100%"
            height="700"
            frameBorder="0"
            title="Calendrier de réservation — Electrolyse Signature"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
