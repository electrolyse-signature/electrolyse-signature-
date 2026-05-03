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
        <h2 className="font-sans font-semibold text-lg mb-3">Base légale du traitement</h2>
        <p className="text-text-secondary leading-relaxed">
          Les traitements de données sont fondés sur l'article 6 du RGPD :<br />
          — <strong>Exécution d'un contrat</strong> (art. 6.1.b) pour la gestion des rendez-vous<br />
          — <strong>Intérêt légitime</strong> (art. 6.1.f) pour répondre aux demandes de contact<br />
          Les données relatives à votre santé (contre-indications éventuelles) sont traitées sur la base de votre <strong>consentement explicite</strong> (art. 9.2.a du RGPD), recueilli lors de la consultation initiale.
        </p>
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
        <h2 className="font-sans font-semibold text-lg mb-3">Services tiers (sous-traitants)</h2>
        <p className="text-text-secondary leading-relaxed mb-2">
          Ce site utilise les services suivants pour son fonctionnement. Vos données peuvent être transmises à ces prestataires dans le cadre strict des finalités décrites :
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-2 mt-2">
          <li><strong>Cal.com</strong> (Suisse) — système de réservation en ligne. Données transmises : nom, email, téléphone. Politique : <a href="https://cal.com/privacy" className="text-blush hover:underline">cal.com/privacy</a></li>
          <li><strong>EmailJS</strong> (États-Unis) — envoi des formulaires de contact. Données transmises : nom, email, message. Les transferts vers les États-Unis sont encadrés par des clauses contractuelles types (Standard Contractual Clauses).</li>
          <li><strong>Supabase</strong> — base de données hébergeant les informations de réservation. Données stockées : historique des séances, notes de suivi. Politique : <a href="https://supabase.com/privacy" className="text-blush hover:underline">supabase.com/privacy</a></li>
          <li><strong>Vercel</strong> (États-Unis) — hébergement du site web. Les transferts sont encadrés par des clauses contractuelles types.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-sans font-semibold text-lg mb-3">Vos droits</h2>
        <p className="text-text-secondary leading-relaxed mb-3">
          Conformément au RGPD (articles 15 à 22), vous disposez des droits suivants sur vos données personnelles :
        </p>
        <ul className="list-disc list-inside text-text-secondary space-y-1 mb-3">
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement (« droit à l'oubli »)</li>
          <li>Droit d'opposition au traitement</li>
          <li>Droit à la portabilité</li>
          <li>Droit de retirer votre consentement à tout moment</li>
        </ul>
        <p className="text-text-secondary leading-relaxed">
          Pour exercer ces droits, adressez votre demande à : <a href="mailto:electrolyse.signature@gmail.com" className="text-blush hover:underline">electrolyse.signature@gmail.com</a>. Nous nous engageons à vous répondre dans un délai de <strong>30 jours calendaires</strong>.<br /><br />
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la <a href="https://www.cnil.fr" className="text-blush hover:underline">CNIL</a>.
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
