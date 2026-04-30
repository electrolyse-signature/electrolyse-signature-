# Electrolyse Signature — Design Spec

**Date:** 2026-04-30
**Statut:** Approuvé

---

## Vue d'ensemble

Site one-page pour **Electrolyse Signature**, institut spécialisé en électrolyse permanente à Noisiel (77). Praticienne : **Amal**. Cabinet réservé exclusivement aux femmes.

Objectif principal : permettre aux clientes de réserver en ligne avec disponibilités en temps réel synchronisées avec Google Agenda d'Amal.

---

## Stack technique

| Élément | Choix | Justification |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + API routes intégrées |
| Hébergement | Vercel (plan gratuit) | Déploiement automatique, edge network |
| Réservation | Cal.com (plan gratuit) | Sync native Google Agenda, iframe personnalisable |
| Avis Google | Google Places API | Avis en temps réel |
| Avis Treatwell | Données statiques | 86 avis 5/5, récupérés manuellement |
| Formulaire contact | EmailJS | Pas de backend requis |
| Polices | Cormorant Garamond + Lato | Google Fonts, gratuites |

---

## Design system

### Palette
```
--color-bg:         #FDFAF7   /* blanc cassé chaud */
--color-beige:      #E8D5C4   /* beige rosé */
--color-blush:      #C9A99A   /* vieux rose poudré */
--color-text:       #3D3535   /* brun doux */
--color-text-light: #8C7B7B   /* texte secondaire */
--color-white:      #FFFFFF
```

### Typographie
- **Titres** : Cormorant Garamond — italic, léger, élégant
- **Corps** : Lato — regular 400 et light 300
- **Taille base** : 16px, line-height 1.7

### Espacement & style
- Sections full-width avec padding vertical généreux (80px–120px)
- Coins arrondis sur les cartes : 12px
- Ombres très douces (box-shadow: 0 4px 24px rgba(0,0,0,0.06))
- Aucun élément agressif — tout est doux, aéré, luxueux

---

## Structure de la page (ordre des sections)

### 1. Navigation fixe
- Logo Electrolyse Signature (récupéré depuis @electrolyse.signature sur Instagram)
- Liens ancres : Accueil · Services · Réservation · Avis · Contact
- Icône Instagram → lien vers @electrolyse.signature
- Bouton CTA "Réserver" (vieux rose poudré)
- Transparente au scroll haut, fond blanc cassé au scroll bas

### 2. Hero
- Accroche principale : *"L'électrolyse permanente. Une expertise, une signature."*
- Sous-titre : *"Cabinet réservé aux femmes · Noisiel, Seine-et-Marne"*
- Bouton principal "Prendre rendez-vous" → scroll vers #réservation
- Fond : dégradé subtil #FDFAF7 → #F0E6DC avec motif décoratif léger (vague ou trait fin)
- Badge discret : ⭐ 5/5 · 86 avis vérifiés

### 3. À propos
- Photo d'Amal (placeholder si non fournie) à gauche
- Texte à droite :
  - Présentation d'Amal, experte en électrolyse permanente
  - Cabinet moderne, atmosphère bienveillante, réservé aux femmes
  - Méthode : électrolyse = seule technique définitive reconnue
  - Praticienne certifiée
- 3 icônes-chiffres : 86 avis · 5/5 · Cabinet PMR accessible

### 4. Services & Tarifs
- Titre : *"Nos prestations"*
- Cartes en grille (2 colonnes desktop, 1 colonne mobile) :

| Prestation | Durée | Prix |
|---|---|---|
| Consultation initiale *(obligatoire)* | 15 min | 1 € |
| Séance électrolyse | 5 min | 17 € |
| Séance électrolyse | 15 min | À préciser |
| Séance électrolyse | 30 min | À préciser |
| Séance électrolyse | 45 min | À préciser |
| Séance électrolyse | 1h | À préciser |
| Séance électrolyse | 1h30 | 148,50 € |
| Soins visage | Variable | Variable |

- Note en bas : *"Une consultation de 15 minutes (1€) est obligatoire avant toute première séance."*

### 5. Réservation
- Titre : *"Réservez votre séance"*
- Note rappel : consultation obligatoire pour les nouvelles clientes
- Iframe Cal.com pleine largeur, stylisée en beige/blanc
- Cal.com synchronisé avec Google Agenda d'Amal → créneaux en temps réel

### 6. Avis clients
- En-tête : note globale 5/5 avec étoiles, "86+ avis vérifiés"
- Carrousel automatique (défilement toutes les 4s, pausé au hover)
- Alternance avis Google + avis Treatwell
- Chaque carte : prénom, source (badge "Google" ou "Treatwell"), étoiles, texte
- Badge de confiance en bas : logos Google et Treatwell

### 7. Contact & Accès
- 2 colonnes : infos à gauche, formulaire à droite

**Infos :**
- 📍 47 Grande Allée du 12 Février 1934, 77186 Noisiel
- 🕐 Mar-Mer : 11h–18h | Jeu-Ven : 12h–19h | Sam : 9h–13h
- 🚇 RER A Noisiel (5 min à pied)
- 🚗 Parking devant et derrière le bâtiment
- ♿ Accessible PMR
- Carte Google Maps intégrée

**Formulaire :**
- Champs : Prénom, Email, Message
- Bouton envoi → EmailJS → email reçu par Amal
- Message de succès après envoi

### 8. Footer
- Logo + tagline
- Icône Instagram → @electrolyse.signature
- Mentions légales (page modale ou section simple)
- © 2026 Electrolyse Signature

---

## Intégration Cal.com — étapes de configuration

1. Créer un compte Cal.com gratuit avec l'email professionnel d'Amal
2. Connecter Google Agenda dans les paramètres Cal.com
3. Définir les disponibilités : Mar-Mer 11h-18h, Jeu-Ven 12h-19h, Sam 9h-13h
4. Créer les types d'événements (une entrée par durée de séance)
5. Personnaliser les couleurs Cal.com : fond #FDFAF7, accent #C9A99A
6. Récupérer le lien d'embed et l'intégrer dans le composant Booking.tsx

---

## Intégration Google Places API — étapes

1. Créer un projet sur Google Cloud Console
2. Activer "Places API"
3. Créer une clé API (restreinte au domaine du site)
4. Appel API côté serveur (Next.js route handler) pour les avis → mis en cache 24h
5. Combiner avec les avis Treatwell statiques dans le carrousel

---

## Responsive

- Mobile-first : tout le site conçu pour 375px en premier
- Breakpoints : 768px (tablette), 1280px (desktop)
- Navigation mobile : menu hamburger → drawer latéral

---

## SEO & Performance

- Metadata OpenGraph : titre, description, image (logo)
- `next/image` pour toutes les images (optimisation automatique)
- Polices chargées via `next/font` (pas de layout shift)
- Score Lighthouse cible : 90+ sur tous les critères

---

## Ce qui sera précisé lors du développement

- Prix complets des séances intermédiaires (à demander à Amal ou récupérer sur Treatwell)
- Photo professionnelle d'Amal (ou photo de l'espace si non disponible)
- Nom de domaine exact à configurer sur Vercel
- Place ID Google Maps d'Electrolyse Signature (pour l'API Places)
- Clé API Google Places (à créer par Amal sur Google Cloud Console)
