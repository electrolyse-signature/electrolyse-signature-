import FAQAccordion from './FAQAccordion'

const faqs = [
  {
    q: "Qu'est-ce que l'électrolyse permanente ?",
    a: "Chez Electrolyse Signature, je pratique l'électrolyse thermique — la seule méthode reconnue définitivement par la FDA et les dermatologues. J'applique un courant électrique de très faible intensité directement dans le follicule pileux pour le détruire à la racine. Chaque poil traité correctement ne repousse plus jamais. C'est une certitude, pas une promesse marketing."
  },
  {
    q: "Quelle est la différence avec le laser ?",
    a: "Le laser cible la mélanine — il est donc inefficace sur les poils blonds, roux, blancs ou gris, et risqué sur les peaux foncées. J'accueille régulièrement des clientes qui ont justement été refusées au laser. Avec l'électrolyse, je traite tous les types de poils et toutes les carnations, sans exception. C'est aussi la seule méthode officiellement reconnue comme définitive."
  },
  {
    q: "Combien de séances sont nécessaires ?",
    a: "Je vous donne une estimation précise lors de la consultation gratuite, après avoir évalué votre pilosité. En règle générale, comptez entre 8 et 15 séances espacées de 4 à 8 semaines. Chaque poil suit son propre cycle de croissance — c'est pourquoi je travaille en régularité pour traiter toutes les phases et obtenir un résultat durable."
  },
  {
    q: "La consultation initiale est-elle obligatoire ?",
    a: "Oui, et je la rends obligatoire pour une bonne raison : je prends le temps de comprendre votre situation, de vous expliquer exactement comment je vais procéder, et de répondre à toutes vos questions. Ça vous évite toute mauvaise surprise et me permet de vous proposer un protocole vraiment adapté. Elle est entièrement gratuite."
  },
  {
    q: "Est-ce douloureux ?",
    a: "La sensation ressemble à un léger picotement ou une chaleur localisée — supportable pour la grande majorité de mes clientes. Chez Electrolyse Signature, je règle toujours l'intensité selon votre seuil de tolérance, et je peux l'ajuster à tout moment pendant la séance. Vous êtes toujours en contrôle."
  },
  {
    q: "Quelles zones peut-on traiter ?",
    a: "Je traite toutes les zones du visage et du corps : lèvre supérieure, menton, sourcils, aisselles, maillot intégral, jambes, bras, abdomen... Aucune zone n'est trop petite ou trop complexe. Chaque zone est travaillée avec le même soin et la même précision, quelle que soit sa superficie."
  },
  {
    q: "Combien coûte une séance ?",
    a: "Je facture à la durée, à partir de 20 € pour 5 minutes. Selon la zone et l'avancement de votre traitement, les séances durent entre 5 et 90 minutes. La consultation initiale est offerte — c'est ma façon de vous accueillir sans engagement, pour que vous puissiez décider en toute confiance."
  },
  {
    q: "Le cabinet est-il réservé aux femmes ?",
    a: "Oui, absolument. Electrolyse Signature est un espace exclusivement féminin, pensé pour que vous vous sentiez à l'aise et en confiance. La confidentialité et le respect sont au cœur de mon approche. Vous pouvez venir et repartir sereinement, en toute discrétion, à Noisiel en Seine-et-Marne."
  },
  {
    q: "Faites-vous l'électrolyse dans toute la Seine-et-Marne ?",
    a: "Mon cabinet est situé au cœur de Noisiel (77186), à 5 minutes à pied du RER A. Je reçois des clientes de toute la Seine-et-Marne — Torcy, Champs-sur-Marne, Lognes, Bussy-Saint-Georges, Lagny-sur-Marne, Marne-la-Vallée... Si vous cherchez l'électrolyse dans le 77, vous êtes au bon endroit."
  },
  {
    q: "Où trouver une électrolyse permanente près de Noisiel ?",
    a: "Electrolyse Signature est le cabinet d'électrolyse permanente de référence à Noisiel (77). Accessible en RER A station Noisiel, avec parking gratuit à proximité. Je suis spécialisée exclusivement en électrolyse — c'est mon unique activité, et toute mon attention est portée sur votre résultat."
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="section-padding bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-sans text-blush text-sm tracking-widest uppercase mb-4">Questions fréquentes</p>
          <h2 className="section-title">Tout savoir sur l&apos;électrolyse</h2>
          <p className="section-subtitle">Les réponses aux questions les plus fréquentes sur l&apos;épilation définitive par électrolyse.</p>
        </div>
        <FAQAccordion faqs={faqs} />
      </div>
    </section>
  )
}
