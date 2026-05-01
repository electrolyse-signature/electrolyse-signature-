# Guide du propriétaire — Electrolyse Signature

## Le site web

**Adresse du site :** https://electrolyse-signature.vercel.app

Le site est une vitrine en ligne présentant les services, les tarifs, les horaires, les avis clients et un formulaire de contact. Il est hébergé sur **Vercel** et mis à jour automatiquement dès qu'une modification est apportée au code.

---

## 1. Gérer les réservations — Cal.com

**Accès :** https://cal.com — connectez-vous avec vos identifiants.

### Ce que vous pouvez faire sur Cal.com

**Voir vos réservations**
- Menu gauche → **Bookings**
- Affiche toutes les réservations passées, à venir et annulées

**Gérer vos disponibilités**
- Menu gauche → **Availability**
- Modifiez vos jours et horaires de travail
- Bloquez des jours de congé ou des créneaux indisponibles

**Statistiques**
- Menu gauche → **Analytics**
- Nombre de réservations, taux de complétion, créneaux populaires

**Délai minimum avant réservation**
- Event Types → votre événement → **Limites**
- Paramètre "Délai minimum de préavis" pour éviter les réservations de dernière minute

**Application mobile**
- Disponible sur Android (Google Play Store) et iOS (App Store)
- Cherchez : **Cal.com**

---

## 2. Gérer les emails de contact — EmailJS

Quand une cliente remplit le formulaire de contact sur le site, le message est envoyé directement dans votre boîte mail via **EmailJS**.

**Aucune action requise** — les emails arrivent automatiquement.

Si vous ne recevez plus d'emails de contact, vérifiez :
1. Vos spams
2. Votre compte EmailJS sur https://www.emailjs.com

### Codes d'accès EmailJS

Les trois codes nécessaires au bon fonctionnement du formulaire sont :
- **Service ID** — visible dans EmailJS → Email Services
- **Template ID** — visible dans EmailJS → Email Templates
- **Public Key** — visible dans EmailJS → Account → General → Public Key

En cas de transfert du site à un nouveau développeur, ces trois codes sont également stockés dans les **variables d'environnement Vercel** (Vercel → votre projet → Settings → Environment Variables).

---

## 3. L'hébergement — Vercel

Le site est hébergé sur **Vercel** (https://vercel.com).

- Le site se met à jour automatiquement après chaque modification du code
- Vous pouvez consulter l'état des déploiements en vous connectant à votre compte Vercel
- En cas de problème, Vercel envoie un email d'alerte

---

## 4. Modifier le site

Toutes les modifications du site (textes, tarifs, horaires, photos, etc.) doivent être demandées au développeur ou effectuées via **Claude Code**.

### Exemples de modifications courantes

| Ce que vous voulez changer | Où c'est dans le code |
|---|---|
| Horaires d'ouverture | `components/Contact.tsx` |
| Tarifs des prestations | `components/Services.tsx` |
| Texte de présentation | `components/About.tsx` |
| Photos de la galerie | `components/Gallery.tsx` |
| Liens de navigation | `components/Navigation.tsx` |
| Informations de contact | `components/Contact.tsx` |

---

## 5. Informations importantes

- **Réservations :** gérées exclusivement via Cal.com
- **Paiement en ligne :** non activé sur le site (à configurer dans Cal.com si souhaité)
- **Avis clients :** affichés manuellement dans le code — contactez le développeur pour en ajouter
- **Instagram :** le lien pointe vers https://www.instagram.com/electrolyse.signature/

---

## 6. Contacts utiles

| Service | Lien |
|---|---|
| Site web | https://electrolyse-signature.vercel.app |
| Cal.com (réservations) | https://cal.com |
| EmailJS (formulaire) | https://www.emailjs.com |
| Vercel (hébergement) | https://vercel.com |
| Instagram | https://www.instagram.com/electrolyse.signature/ |
