# Notes du projet

---

## Filtre de date admin (`ADMIN_FROM_DATE`)

**Fichier :** `lib/admin-config.ts`

La constante `ADMIN_FROM_DATE` définit la date de départ à partir de laquelle les données sont affichées dans l'admin. Tout ce qui est antérieur à cette date est complètement invisible (aucune trace, aucun badge).

**Valeur actuelle :** `2026-05-01` (1er mai 2026)

**Composants concernés :**
- `components/AllClientsSection.tsx` — liste des clientes
- `components/BookingsTable.tsx` — planning des réservations

**Pour changer la date**, modifier uniquement cette ligne dans `lib/admin-config.ts` :
```ts
export const ADMIN_FROM_DATE = '2026-05-01' // format YYYY-MM-DD
```

**Pourquoi cette date ?**
Toutes les réservations antérieures au 1er mai 2026 sont des données de test effectuées pendant le développement.

---

## SEO — Passer devant Treatwell sur Google (à faire après les tests)

Le code SEO est déjà en place (schema LocalBusiness, sitemap, robots.txt, mots-clés). Il reste deux actions manuelles à faire :

### Étape 1 — Google Search Console
1. Aller sur **search.google.com/search-console**
2. Ajouter la propriété : `https://electrolyse-signature.vercel.app`
3. Choisir la vérification **"Balise HTML"**
4. Copier le code `google-site-verification=XXXXXXX`
5. L'envoyer à Claude pour qu'il l'intègre dans le site (30 secondes)
6. Une fois vérifié → aller dans **Sitemaps** → soumettre :
   `https://electrolyse-signature.vercel.app/sitemap.xml`

### Étape 2 — Google Business Profile
- Vérifier que la description contient : "électrolyse", "Noisiel", "épilation définitive"
- Ajouter le lien du site : `https://electrolyse-signature.vercel.app`
- Ajouter un maximum de photos
- Encourager les clientes à laisser des avis Google

### Délai estimé
4 à 8 semaines après soumission pour voir les effets sur Google.
