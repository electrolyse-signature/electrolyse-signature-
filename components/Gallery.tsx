import Image from 'next/image'

export default function Gallery() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Le cabinet</p>
          <h2 className="section-title">Un espace pensé pour vous</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Un cadre moderne, chaleureux et exclusivement réservé aux femmes.
          </p>
        </div>

        {/* Salle de soin */}
        <div className="mb-6">
          <p className="font-sans text-xs tracking-widest uppercase text-text-secondary mb-4">Salle de soin</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image src="/soin-1.jpeg" alt="Cabine d'électrolyse permanente à Noisiel – Electrolyse Signature" fill className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image src="/soin-3.jpeg" alt="Équipement d'électrolyse permanente professionnel – cabinet Noisiel" fill className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* Salle d'attente */}
        <div>
          <p className="font-sans text-xs tracking-widest uppercase text-text-secondary mb-4">Salle d&apos;attente</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image src="/attente-1.jpeg" alt="Salle d'attente du cabinet Electrolyse Signature à Noisiel" fill className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image src="/attente-2.jpeg" alt="Espace d'accueil cabinet d'épilation définitive Noisiel Seine-et-Marne" fill className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
