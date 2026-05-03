export const metadata = {
  title: 'Mentions légales | Electrolyse Signature',
  robots: { index: false },
}

export default function MentionsLegales() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20 font-sans text-text-primary">
      <h1 className="font-serif italic text-4xl mb-10">Mentions légales</h1>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Éditeur du site</h2>
        <p className="text-text-secondary leading-relaxed">
          <strong>Electrolyse Signature</strong><br />
          Praticienne indépendante<br />
          47 Grande Allée du 12 Février 1934, 77186 Noisiel<br />
          Téléphone : +33 7 69 83 29 44<br />
          Email : electrolyse.signature@gmail.com<br />
          SIRET : <span className="text-blush">[À compléter]</span>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Hébergement</h2>
        <p className="text-text-secondary leading-relaxed">
          Ce site est hébergé par :<br />
          <strong>Vercel Inc.</strong><br />
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
          <a href="https://vercel.com" className="text-blush hover:underline">vercel.com</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Propriété intellectuelle</h2>
        <p className="text-text-secondary leading-relaxed">
          L'ensemble du contenu de ce site (textes, images, logo) est la propriété exclusive d'Electrolyse Signature. Toute reproduction, même partielle, est interdite sans autorisation préalable.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Responsabilité</h2>
        <p className="text-text-secondary leading-relaxed">
          Electrolyse Signature s'efforce d'assurer l'exactitude des informations diffusées sur ce site. Toutefois, elle ne saurait être tenue responsable des erreurs ou omissions.
        </p>
      </section>

      <div className="mt-10">
        <a href="/" className="text-blush hover:underline font-sans text-sm">← Retour au site</a>
      </div>
    </main>
  )
}
