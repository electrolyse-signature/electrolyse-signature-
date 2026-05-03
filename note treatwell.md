# Note — Synchronisation Treatwell ↔ Cal.com via email

## Contexte

Treatwell n'a pas d'API publique. Il est impossible de lire les réservations Treatwell directement.
En revanche, **Treatwell envoie un email de confirmation** à chaque nouvelle réservation sur ton adresse `electrolyse.signature@gmail.com`.

L'idée : intercepter cet email, en extraire la date et l'heure, et bloquer automatiquement ce créneau sur Cal.com.

---

## Ce que ça résout

- Une cliente réserve sur **Treatwell** → le créneau se bloque automatiquement sur **Cal.com**
- Une cliente réserve sur **Cal.com** → Treatwell n'est pas mis à jour (impossible sans API), mais Cal.com étant prioritaire sur ton site, c'est acceptable
- Résultat : pas de double réservation dans le sens Treatwell → Cal.com

---

## Solution 1 — Sans code (Zapier ou Make.com)

### Outils
- **Zapier** (zapier.com) ou **Make.com** (make.com)
- Les deux ont des intégrations natives Gmail + Cal.com

### Étapes Zapier

1. Créer un compte Zapier
2. Nouveau "Zap" :
   - **Trigger** : Gmail → "New email matching search"
     - Filtre : `from:noreply@treatwell.fr` ou `subject:réservation`
   - **Action** : Cal.com → "Create Booking"
     - Mapper : date extraite de l'email → champ `start`
     - Durée selon le service détecté
3. Tester avec un email de confirmation Treatwell réel
4. Activer le Zap

### Coût
- Zapier Free : 100 tâches/mois (suffisant si peu de réservations)
- Zapier Starter : ~20 €/mois pour 750 tâches

### Limite
- Zapier ne peut pas parser automatiquement du texte complexe. Si le format de l'email Treatwell change, il faut reconfigurer.
- Un délai de 1 à 15 min est possible entre la réservation Treatwell et le blocage Cal.com.

---

## Solution 2 — Avec code (Vercel Cron + Gmail API + Cal.com API)

### Architecture

```
Vercel Cron (toutes les 5 min)
  → Gmail API : récupère les nouveaux emails Treatwell
  → Parse l'email : extrait date, heure, durée
  → Cal.com API : crée un "blocker" sur le créneau
  → Log dans Supabase (table treatwell_sync_log)
```

### Fichiers à créer

```
lib/gmail.ts          → client Gmail API (OAuth2)
lib/calcom.ts         → appel API Cal.com (create booking)
lib/parse-treatwell.ts → regex pour extraire date/heure de l'email
app/api/cron/treatwell-sync/route.ts → route appellée par Vercel Cron
```

### Configuration nécessaire

**Variables d'environnement**
```
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=     ← obtenu via OAuth2 Playground
CALCOM_API_KEY=          ← dans Cal.com Settings > API Keys
CALCOM_EVENT_TYPE_ID=    ← ID du type de rdv "Consultation" sur Cal.com
```

**Vercel Cron** (dans `vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/cron/treatwell-sync",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Exemple de logique de parsing

Format email Treatwell typique :
> "Nouvelle réservation — Épilation électrolyse 30 min  
> Le mardi 13 mai 2026 à 10h30  
> Cliente : Marie Dupont"

Regex à adapter selon le vrai format :
```ts
const dateMatch = body.match(/Le\s+\w+\s+(\d+)\s+(\w+)\s+(\d{4})\s+à\s+(\d+)h(\d+)/)
// → jour, mois, année, heure, minutes
```

**Important** : analyser 3-4 vrais emails Treatwell avant de coder le parser.

### Cal.com API — Créer un blocker

```ts
await fetch('https://api.cal.com/v1/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
  },
  body: JSON.stringify({
    eventTypeId: Number(process.env.CALCOM_EVENT_TYPE_ID),
    start: '2026-05-13T10:30:00+02:00',  // ISO 8601
    end:   '2026-05-13T11:00:00+02:00',
    responses: {
      name:  'Treatwell (bloqué)',
      email: 'noreply@treatwell.fr',
    },
    metadata: { source: 'treatwell-sync' },
    language: 'fr',
    timeZone: 'Europe/Paris',
  }),
})
```

### Table Supabase suggérée — `treatwell_sync_log`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | clé primaire |
| gmail_message_id | text | pour éviter les doublons |
| treatwell_date | timestamptz | créneau détecté |
| calcom_booking_id | text | id retourné par Cal.com |
| status | text | 'synced' ou 'error' |
| created_at | timestamptz | date du traitement |

---

## Comparatif

| Critère | Zapier (sans code) | Code custom |
|---------|-------------------|-------------|
| Délai de sync | 1–15 min | ~5 min |
| Coût | 0–20€/mois | 0€ (Vercel gratuit) |
| Fiabilité | Bonne | Très bonne |
| Maintenance | Faible | Moyenne |
| Flexibilité | Limitée | Totale |

---

## Recommandation

**Commencer par Zapier** pour tester le concept gratuitement.  
Si ça fonctionne bien et que le volume de réservations augmente, migrer vers la solution code pour supprimer le coût mensuel.

---

## Prérequis avant de commencer

1. Récupérer 2-3 vrais emails de confirmation Treatwell pour analyser leur format exact
2. Activer l'API Cal.com (Settings > Developer > API Keys)
3. Noter l'`eventTypeId` du type de rdv utilisé
4. Choisir : Zapier ou code

---

## Limitations connues

- Si une cliente annule sur Treatwell, le blocage Cal.com n'est PAS supprimé automatiquement (Treatwell n'envoie pas forcément d'email d'annulation dans un format parsable)
- Le créneau apparaîtra comme "Treatwell (bloqué)" dans Cal.com — pas le vrai nom de la cliente
- Délai entre réservation et blocage (1 à 15 min selon la solution) : risque minime de double réservation
