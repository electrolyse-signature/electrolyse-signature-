# Notes du projet

## Filtre de date admin (`ADMIN_FROM_DATE`)

**Fichier :** `lib/admin-config.ts`

La constante `ADMIN_FROM_DATE` définit la date de départ à partir de laquelle les données sont affichées dans l'admin. Tout ce qui est antérieur à cette date est complètement invisible (aucune trace, aucun badge).

**Valeur actuelle :** `2026-06-01` (1er juin 2026)

**Composants concernés :**
- `components/AllClientsSection.tsx` — liste des clientes
- `components/BookingsTable.tsx` — planning des réservations

**Pour changer la date**, modifier uniquement cette ligne dans `lib/admin-config.ts` :
```ts
export const ADMIN_FROM_DATE = '2026-06-01' // format YYYY-MM-DD
```

**Pourquoi cette date ?**
Toutes les réservations antérieures au 1er juin 2026 sont des données de test effectuées pendant le développement. Cette constante évite de les afficher sans avoir à les supprimer de Cal.com (qui ne permet pas l'annulation de réservations passées).
