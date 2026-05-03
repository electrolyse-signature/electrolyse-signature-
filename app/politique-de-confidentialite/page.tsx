export const metadata = {
  title: 'Politique de confidentialité | Electrolyse Signature',
  robots: { index: false },
}

export default function PolitiqueConfidentialite() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20 font-sans text-text-primary">
      <h1 className="font-serif italic text-4xl mb-10">Politique de confidentialité</h1>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Responsable du traitement</h2>
        <p className="text-text-secondary leading-relaxed">
          Electrolyse Signature — electrolyse.signature@gmail.com<br />
          47 Grande Allée du 12 Février 1934, 77186 Noisiel
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Données collectées</h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          Dans le cadre de la prise de rendez-vous en ligne et du formulaire de contact, nous collectons :
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-1">
          <li>Prénom et nom</li>
          <li>Adresse email</li>
          <li>Numéro de téléphone (facultatif)</li>
          <li>Le contenu de votre message</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Finalités</h2>
        <p className="text-text-secondary leading-relaxed">
          Ces données sont utilisées uniquement pour la gestion des rendez-vous et répondre à vos demandes de contact. Elles ne sont jamais vendues ni transmises à des tiers à des fins commerciales.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Durée de conservation</h2>
        <p className="text-text-secondary leading-relaxed">
          Les données sont conservées pendant une durée maximale de 3 ans à compter du dernier contact.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Services tiers</h2>
        <p className="text-text-secondary leading-relaxed">
          Ce site utilise les services suivants, susceptibles de déposer des cookies :
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-1 mt-2">
          <li><strong>Cal.com</strong> — système de réservation en ligne (politique : cal.com/privacy)</li>
          <li><strong>EmailJS</strong> — envoi des formulaires de contact</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Vos droits</h2>
        <p className="text-text-secondary leading-relaxed">
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition sur vos données personnelles. Pour exercer ces droits, contactez-nous à : <a href="mailto:electrolyse.signature@gmail.com" className="text-blush hover:underline">electrolyse.signature@gmail.com</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Cookies</h2>
        <p className="text-text-secondary leading-relaxed">
          Ce site n'utilise pas de cookies de tracking ou publicitaires. Des cookies fonctionnels peuvent être déposés par les services tiers (Cal.com) nécessaires au bon fonctionnement de la réservation en ligne.
        </p>
      </section>

      <div className="mt-10">
        <a href="/" className="text-blush hover:underline font-sans text-sm">← Retour au site</a>
      </div>
    </main>
  )
}
