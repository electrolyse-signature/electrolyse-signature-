import Image from 'next/image'

const stats = [
  { value: '86', label: 'Avis vérifiés' },
  { value: '5/5', label: 'Note moyenne' },
  { value: '♿', label: 'Accessible PMR' },
]

export default function About() {
  return (
    <section id="a-propos" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src="/soin-1.jpeg"
              alt="Salle de soin du cabinet d'électrolyse permanente Electrolyse Signature à Noisiel"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-beige rounded-2xl -z-10" />
        </div>

        <div>
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">À propos</p>
          <h2 className="section-title">Votre experte<br />en électrolyse</h2>
          <div className="w-12 h-0.5 bg-blush mb-8" />

          <div className="font-sans text-text-secondary leading-relaxed space-y-4 mb-10">
            <p>
              Bienvenue chez <strong className="text-text-primary font-normal">Electrolyse Signature</strong>,
              le cabinet d&apos;Amal, spécialiste de l&apos;électrolyse permanente à Noisiel.
            </p>
            <p>
              L&apos;électrolyse est la <strong className="text-text-primary font-normal">seule méthode d&apos;épilation définitivement reconnue</strong> comme permanente.
              Chaque poil est traité individuellement à la source, pour un résultat durable et sans compromis.
            </p>
            <p>
              Dans un cabinet moderne, chaleureux et réservé exclusivement aux femmes,
              Amal vous accompagne avec douceur, précision et bienveillance.
            </p>
            <p>
              Votre confort et votre sécurité sont notre priorité absolue. Entre chaque intervention,
              un <strong className="text-text-primary font-normal">protocole complet de nettoyage et de désinfection de 20 minutes</strong> est
              systématiquement appliqué afin de garantir une hygiène irréprochable pour chaque cliente.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-4 bg-bg rounded-xl border border-beige">
                <div className="font-serif text-2xl text-blush mb-1">{stat.value}</div>
                <div className="font-sans text-xs text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
