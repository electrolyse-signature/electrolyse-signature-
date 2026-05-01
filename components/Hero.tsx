export default function Hero() {
  return (
    <section id="accueil" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #FDFAF7 0%, #F0E6DC 50%, #E8D5C4 100%)' }}>

      <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #C9A99A, transparent)' }} />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #E8D5C4, transparent)' }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-sans text-text-secondary mb-8 border border-beige">
          <span className="text-amber-400">★★★★★</span>
          <span>5/5 · 86 avis vérifiés</span>
        </div>

        <h1 className="font-serif italic text-5xl md:text-7xl text-text-primary leading-tight mb-6">
          L&apos;électrolyse permanente.<br />
          <span className="text-blush">Une expertise,</span><br />
          une signature.
        </h1>

        <p className="font-sans text-text-secondary text-lg md:text-xl font-light mb-4">
          Cabinet réservé aux femmes · Noisiel, Seine-et-Marne
        </p>
        <p className="font-sans text-text-secondary text-base font-light mb-10">
          La seule méthode d&apos;épilation définitivement reconnue, entre des mains expertes.
        </p>

        <button
          data-cal-link="electrolyse.signature/secret"
          data-cal-namespace="secret"
          data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
          className="inline-block bg-blush text-white font-sans text-base px-8 py-4 rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
        >
          Prendre rendez-vous
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-secondary opacity-60">
        <span className="font-sans text-xs tracking-widest uppercase">Découvrir</span>
        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
