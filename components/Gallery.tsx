import Image from 'next/image'

const images = [
  { src: '/boutique-1.jpg', alt: 'Espace accueil' },
  { src: '/boutique-2.jpg', alt: 'Salle de soin' },
  { src: '/boutique-3.jpg', alt: 'Salle de soin' },
  { src: '/boutique-4.jpg', alt: 'Espace détente' },
  { src: '/boutique-5.jpg', alt: 'Espace réception' },
]

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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 md:col-span-2 relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image src={images[0].src} alt={images[0].alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image src={images[1].src} alt={images[1].alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image src={images[2].src} alt={images[2].alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image src={images[3].src} alt={images[3].alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image src={images[4].src} alt={images[4].alt} fill className="object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </section>
  )
}
