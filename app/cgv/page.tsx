export const metadata = {
  title: 'Conditions générales de vente | Electrolyse Signature',
  robots: { index: false },
}

export default function CGV() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20 font-sans text-text-primary">
      <h1 className="font-serif italic text-4xl mb-2">Conditions générales de vente</h1>
      <p className="text-text-secondary text-sm mb-10">En vigueur au 1er juin 2026</p>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Article 1 — Identification du prestataire</h2>
        <p className="text-text-secondary leading-relaxed">
          <strong>Electrolyse Signature</strong><br />
          Praticienne en électrolyse permanente — Auto-entrepreneur<br />
          47 Grande Allée du 12 Février 1934, 77186 Noisiel<br />
          Téléphone : +33 7 69 83 29 44<br />
          Email : electrolyse.signature@gmail.com<br />
          SIRET : XXX XXX XXX XXXXX<br />
          TVA non applicable — article 293 B du CGI
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Article 2 — Objet</h2>
        <p className="text-text-secondary leading-relaxed">
          Les présentes conditions générales de vente régissent les prestations de soins d'électrolyse permanente proposées par Electrolyse Signature à destination d'une clientèle exclusivement féminine, dans son cabinet situé à Noisiel (77186).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Article 3 — Consultation initiale obligatoire</h2>
        <p className="text-text-secondary leading-relaxed">
          Toute nouvelle cliente doit obligatoirement effectuer une consultation initiale gratuite avant toute séance de traitement. Cette consultation permet d'évaluer la pilosité, d'expliquer le protocole et de s'assurer de l'absence de contre-indications.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Article 4 — Réservation</h2>
        <p className="text-text-secondary leading-relaxed">
          Les rendez-vous sont pris en ligne via le système de réservation du site. Aucun paiement n'est requis lors de la réservation. Le règlement s'effectue intégralement au cabinet, à l'issue de chaque séance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Article 5 — Tarifs</h2>
        <p className="text-text-secondary leading-relaxed">
          Les tarifs sont affichés en euros, toutes charges comprises. La TVA n'est pas applicable (article 293 B du CGI). Les prix en vigueur sont ceux indiqués sur le site au moment de la réservation. Electrolyse Signature se réserve le droit de modifier ses tarifs à tout moment.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Article 6 — Annulation et report</h2>
        <p className="text-text-secondary leading-relaxed">
          Toute annulation ou demande de report doit être effectuée <strong>au minimum 48 heures avant l'heure du rendez-vous</strong>, par email ou via le lien présent dans le mail de confirmation.<br /><br />
          En cas d'annulation répétée (3 annulations ou plus), Electrolyse Signature se réserve le droit de ne plus accepter les réservations en ligne de la cliente concernée.<br /><br />
          Aucune facturation n'est appliquée en cas d'annulation, le paiement s'effectuant uniquement en cabinet.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Article 7 — Droit de rétractation</h2>
        <p className="text-text-secondary leading-relaxed">
          Conformément à l'article L. 221-28 2° du Code de la consommation, le droit de rétractation ne s'applique pas aux prestations de services réalisées en cabinet. Les séances d'électrolyse étant des prestations exécutées physiquement sur place, aucun droit de rétractation ne peut être invoqué une fois la séance réalisée.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Article 8 — Responsabilité</h2>
        <p className="text-text-secondary leading-relaxed">
          Electrolyse Signature s'engage à réaliser les prestations avec soin et professionnalisme. Sa responsabilité ne saurait être engagée en cas de contre-indication non déclarée par la cliente lors de la consultation initiale ou de non-respect des recommandations post-séance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Article 9 — Données personnelles</h2>
        <p className="text-text-secondary leading-relaxed">
          Les données collectées lors de la réservation sont traitées conformément à notre{' '}
          <a href="/politique-de-confidentialite" className="text-blush hover:underline">politique de confidentialité</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Article 10 — Litiges</h2>
        <p className="text-text-secondary leading-relaxed">
          En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents du ressort de Noisiel (Seine-et-Marne) seront saisis. Le droit français est applicable.
        </p>
      </section>

      <div className="mt-10">
        <a href="/" className="text-blush hover:underline font-sans text-sm">← Retour au site</a>
      </div>
    </main>
  )
}
