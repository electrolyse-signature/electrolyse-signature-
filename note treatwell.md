# Note — Synchronisation Treatwell → Cal.com (solution gratuite)

## Comment ça marche

```
Treatwell reçoit une réservation
  → envoie un email de confirmation à electrolyse.signature@gmail.com
    → cron-job.org appelle /api/cron/treatwell-sync toutes les 5 min
      → Gmail API lit l'email
        → parse la date + heure
          → Cal.com API crée un "blocker" sur ce créneau
            → le slot est bloqué sur ton site aussi
```

**Résultat** : une cliente qui réserve sur Treatwell ne peut plus réserver le même créneau sur Cal.com.

---

## Fichiers créés

| Fichier | Rôle |
|---------|------|
| `lib/gmail.ts` | Lit les emails Treatwell via Gmail API |
| `lib/parse-treatwell.ts` | Extrait date + heure + durée de l'email |
| `lib/calcom.ts` | Crée un blocker via Cal.com API |
| `app/api/cron/treatwell-sync/route.ts` | Route appelée toutes les 5 min |
| `supabase/treatwell_sync_log.sql` | Table pour éviter les doublons |

---

## Variables d'environnement à ajouter (Vercel → Settings → Environment Variables)

```
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
CALCOM_API_KEY=
CALCOM_EVENT_TYPE_ID=
CRON_SECRET=          ← mot de passe au choix, ex: un UUID aléatoire
```

---

## Étape 1 — Créer la table Supabase

Dans le dashboard Supabase → SQL Editor, coller et exécuter le contenu de :
`supabase/treatwell_sync_log.sql`

---

## Étape 2 — Obtenir le Gmail Refresh Token (une seule fois)

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet (ou utiliser un existant)
3. Activer l'API **Gmail API** (APIs & Services → Library → Gmail API)
4. Créer des identifiants OAuth 2.0 :
   - Type : **Application Web**
   - URI de redirection autorisée : `https://developers.google.com/oauthplayground`
5. Copier le **Client ID** et le **Client Secret**
6. Aller sur [OAuth2 Playground](https://developers.google.com/oauthplayground)
   - Cliquer ⚙️ → cocher "Use your own OAuth credentials"
   - Entrer ton Client ID et Client Secret
7. Dans "Step 1" — chercher **Gmail API v1**, sélectionner :
   - `https://www.googleapis.com/auth/gmail.readonly`
8. Cliquer "Authorize APIs" → connecter avec electrolyse.signature@gmail.com
9. Dans "Step 2" → cliquer "Exchange authorization code for tokens"
10. Copier le **Refresh Token**

→ Ajouter `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` dans Vercel.

---

## Étape 3 — Obtenir la clé API Cal.com et l'Event Type ID

1. Se connecter sur [Cal.com](https://cal.com)
2. **API Key** : Settings → Developer → API Keys → + New API Key → copier
3. **Event Type ID** :
   - Aller sur Event Types
   - Cliquer sur le type de rdv utilisé (ex: "Électrolyse 30 min")
   - L'URL contient l'ID : `cal.com/event-types/XXXXX` → noter ce numéro
4. Ajouter `CALCOM_API_KEY` et `CALCOM_EVENT_TYPE_ID` dans Vercel

**Important** : si tu as plusieurs durées (30 min, 45 min, 60 min), noter l'ID du type le plus courant.
La durée exacte sera extraite de l'email Treatwell et envoyée à Cal.com.

---

## Étape 4 — Configurer le cron gratuit (cron-job.org)

Vercel gratuit ne supporte pas les crons fréquents.
→ Utiliser [cron-job.org](https://cron-job.org) (gratuit, sans limite).

1. Créer un compte sur cron-job.org
2. Créer un nouveau cron job :
   - **URL** : `https://electrolyse-signature.vercel.app/api/cron/treatwell-sync?secret=TON_CRON_SECRET`
   - **Schedule** : toutes les 5 minutes
   - **Method** : GET
3. Activer le job

Remplacer `TON_CRON_SECRET` par la valeur de la variable `CRON_SECRET` dans Vercel.

---

## Étape 5 — Tester

1. Faire une réservation de test sur Treatwell
2. Attendre l'email de confirmation dans Gmail
3. Attendre max 5 min
4. Vérifier dans Cal.com que le créneau est bloqué
5. Vérifier dans Supabase → table `treatwell_sync_log` → une ligne avec `status: synced`

En cas de problème, regarder la colonne `error_message` dans la table.

---

## En cas de parse_error

Si le statut est `parse_error`, c'est que le parser n'a pas reconnu le format de l'email Treatwell.
→ Copier le contenu de `raw_subject` et du corps de l'email dans une note
→ Me l'envoyer pour adapter le parser à ton format exact Treatwell

---

## Limitations

- Délai max de 5 min entre réservation Treatwell et blocage Cal.com
- Si une cliente annule sur Treatwell, le blocage Cal.com **n'est pas supprimé** automatiquement
  → Option : supprimer manuellement dans Cal.com les réservations avec `source: treatwell-sync`
- Un seul type de rdv est bloqué. Si tu as 30 min, 45 min, 60 min comme event types séparés,
  il faut adapter pour choisir le bon `eventTypeId` selon la durée parsée
