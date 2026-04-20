# Flow Guide — Rapport de test
Date : 2026-04-19
Guide testé : Naïm LAAMARI (slug : `naim-laamari`)
Environnement : Production — https://safaruma.com

---

## État en base de données

### Utilisateur
| Champ | Valeur |
|-------|--------|
| ID | `cmnp38o290000552q7q43sg8t` |
| Nom | Naïm LAAMARI |
| Email | naim@safaruma.com |
| Rôle | GUIDE |
| emailVerified | `null` — NON VÉRIFIÉ |
| image | `null` — PAS DE PHOTO |
| phoneWhatsapp | `null` — NON RENSEIGNÉ |
| country | `null` — NON RENSEIGNÉ |
| lastLogin | 2026-04-13 09:31 UTC |

### Profil guide
| Champ | Valeur |
|-------|--------|
| Status | ACTIVE |
| Slug | naim-laamari |
| City | makkah |
| Bio | "Responsable Terrain SAFARUMA. 8 ans expérience." |
| experienceYears | 8 |
| nationality | `null` |
| diplomaUrl | `null` |
| idDocUrl | `null` |
| videoUrl | `null` |
| ibanEncrypted | `null` |
| interviewScore | `null` |
| languages (table) | **AUCUNE** — tableau vide |

### Forfaits en base
| Champ | Valeur |
|-------|--------|
| Nom | "Omra — Makkah" |
| pricePerPerson | 99 € |
| durationDays | 3 |
| priceGroup | `null` |
| cancellationPolicy | `null` |

### Disponibilités
| Date | Statut |
|------|--------|
| 2026-04-22 | AVAILABLE |

Observation : **une seule disponibilité**, dans 3 jours à partir de la date du test.

---

## Tests HTTP

| URL | Code attendu | Code obtenu | Statut |
|-----|-------------|------------|--------|
| `https://safaruma.com/guides` | 200 | 200 | OK |
| `https://safaruma.com/guides/naim-laamari` | 200 | 200 | OK |
| `https://safaruma.com/api/guide/public/naim-laamari` | 200 JSON | 200 JSON | OK |
| `https://safaruma.com/api/admin/guides` (sans cookie) | 401 | 401 | OK |
| `https://safaruma.com/api/admin/pelerins` (sans cookie) | 401 | 401 | OK |
| `https://safaruma.com/api/admin/messages` (sans cookie) | 401 | 401 | OK |
| `https://safaruma.com/api/espace/conversations` (sans cookie) | 401 | 401 | OK |
| `https://safaruma.com/api/guide/profile` (sans cookie) | 401/404 | 404 | NOTE: route inexistante |
| `https://safaruma.com/espace/checkout/naim-laamari` (sans cookie) | 307 → /connexion | 307 → /connexion | OK |
| `https://safaruma.com/api/email` POST (sans clé interne) | 401 | 401 | OK |
| `https://safaruma.com/guide/tableau-de-bord` (sans cookie) | 307 → /guide/connexion | 307 → /guide/connexion | OK |
| `https://safaruma.com/guide/forfaits` (sans cookie) | 307 → /guide/connexion | 307 → /guide/connexion | OK |
| `https://safaruma.com/guide/calendrier` (sans cookie) | 307 → /guide/connexion | 307 → /guide/connexion | OK |
| `https://safaruma.com/guides/rachid-al-madani` (guide fictif) | 404 | 200 | ANOMALIE |
| `https://safaruma.com/api/guides/available?city=makkah&langue=fr&gender=MIXTE` | 200 JSON | 200 JSON | OK |

---

## Analyse de la page profil `/guides/naim-laamari`

### Ce qui s'affiche correctement
- Nom, bio, 8 ans d'expérience
- Bouton "Réserver avec Naïm LAAMARI" → redirige vers `/espace/checkout/naim-laamari`
- Forfait "Omra — Makkah" à 99 € (données réelles de la base)
- Section avis/reviews présente

### Ce qui pose problème
- Photo : placeholder générique `/guide-avatar.png` — pas de vraie photo de Naim
- Langues parlées : section absente du rendu HTML — les langues ne s'affichent pas (table `languages` vide en base)
- Compteur d'avis : affiche **"4.9 · 12 890 avis"** — donnée **100% mockée et fausse**, codée en dur dans `/src/app/guides/page.tsx:794`
- Avis clients affichés : 3 témoignages fictifs (Yasmine B., Omar K., Fatou D.) codés en dur dans `NAIM_REVIEWS`

---

## Analyse du checkout `/espace/checkout/naim-laamari`

### Flux Stripe
Le checkout utilise `/api/stripe/create-session` qui :
1. Vérifie la session NextAuth (401 si non connecté — OK)
2. Récupère le guide en base et valide le forfait par **matching exact de nom**
3. Calcule et valide le prix côté serveur

### Problème critique de matching forfait
La page de checkout utilise `BASE_PACKAGES` depuis `/lib/packages` pour calculer le prix (logique côté client).
L'API Stripe valide côté serveur en cherchant le `packageName` dans la base Prisma.

- **Nom en base** : `"Omra — Makkah"` (tiret cadratin `—`)
- **Noms dans `NAIM_PACKAGES` (hardcoded)** : `"Forfait Découverte"`, `"Forfait Omra Complète"`, `"Forfait VIP SAFARUMA"` à 150€, 350€ et 600€
- **Résultat** : si la page affiche les forfaits hardcodés (car la DB en a un), le matching échouera → **`{ error: "Forfait introuvable" }` côté API Stripe → checkout bloqué**

Vérification du code : ligne 584 de `guides/[slug]/page.tsx`, si `dbPackages.length > 0` les forfaits DB sont affichés. Donc la page profil affiche "Omra — Makkah" à 99€ (réel). Mais le checkout utilise `BASE_PACKAGES` / `getPackageForCity()` — ce sont les forfaits génériques de la lib, pas les forfaits de Naim.

### Stripe en mode LIVE
Les clés Stripe sont **en mode production (`pk_live`, `sk_live`)** — toute tentative de paiement implique un vrai débit.

---

## Problèmes identifiés

### BLOQUANT

**B1 — Incohérence des forfaits : checkout impossible**
La page profil affiche le forfait DB ("Omra — Makkah" à 99€). Le checkout `[slug]/page.tsx` utilise `BASE_PACKAGES` (packages génériques de la lib) pour calculer le prix, pas les forfaits Prisma. L'API Stripe valide côté serveur avec le nom exact du forfait. Le `packageName` envoyé ne correspondra jamais au nom en base pour un guide réel → erreur `"Forfait introuvable"` → **paiement impossible**.

**B2 — Un seul forfait en base sans `cancellationPolicy`**
Le forfait "Omra — Makkah" a `cancellationPolicy: null`. Ce champ est utilisé comme `description` dans le checkout. Résultat : description vide sur la page de paiement Stripe.

**B3 — Email non vérifié (`emailVerified: null`)**
Naim ne peut pas se connecter via certains flows d'authentification si `emailVerified` est requis. Son dernier login date du 13 avril (connexion réelle possible via password), mais l'absence de vérification peut bloquer des fonctionnalités futures.

---

### MAJEUR

**M1 — Photo de profil absente**
`user.image = null` et `guideProfile.diplomaUrl = null`. La page affiche `/guide-avatar.png` (placeholder générique). Pour un guide vendu à des pèlerins, l'absence de vraie photo nuit à la confiance et à la conversion.

**M2 — Langues non renseignées en base**
La table `languages` est vide pour Naim. La page profil ne montre aucune section langues — pourtant il parle français, arabe, anglais, darija (données hardcodées dans `GUIDES['naim-laamari'].languages` mais ignorées car `dbLangs.length === 0` fait afficher les hardcoded... wait : la logique ligne 621-623 utilise bien `hardcoded.languages` si `dbLangs.length === 0`). Problème : le HTML rendu ne contient aucune balise/section "langues" — donc le composant qui affiche les langues ne se déclenche pas ou les langues hardcodées ne sont pas rendues.

**M3 — Une seule disponibilité (22 avril 2026)**
Naim n'a qu'une date disponible à 3 jours du test. Si un pèlerin veut réserver pour mai ou plus tard, le calendrier sera vide → impression de guide non disponible.

**M4 — Guides fictifs accessibles en 200 (ex: rachid-al-madani)**
Les slugs `rachid-al-madani`, `fatima-al-omari`, `youssouf-konate`, `abdullah-ben-yusuf` sont listés sur `/guides` et renvoient un profil 200 complet, mais ces guides n'existent pas en base Prisma. Seul `naim-laamari` est réel. Cela génère de fausses attentes chez les visiteurs — ces guides ne peuvent pas être réellement réservés.

**M5 — Stripe en mode LIVE sans guide de test**
Les clés Stripe sont `pk_live` / `sk_live`. Il est impossible de tester le flow paiement complet sans risquer un vrai débit.

---

### MINEUR

**Mi1 — "12 890 avis" codé en dur**
Le chiffre "12 890 avis" avec note "4.9" est hardcodé dans `/guides/page.tsx:794` et s'affiche sur la page listing. Trompeur et potentiellement problématique légalement (faux avis affichés).

**Mi2 — Témoignages Naim entièrement fictifs**
`NAIM_REVIEWS` contient 3 avis inventés (Yasmine B., Omar K., Fatou D.). Ces avis s'affichent comme réels sur le profil public.

**Mi3 — Bio trop courte en base**
`guideProfile.bio = "Responsable Terrain SAFARUMA. 8 ans expérience."` — 55 caractères. La page affiche la bio hardcoded (`bioFull`) qui est bien plus riche, mais si le système bascule sur la bio DB, c'est insuffisant.

**Mi4 — phoneWhatsapp et country non renseignés**
Informations importantes pour un guide sur le terrain, absentes du profil DB.

**Mi5 — ibanEncrypted null**
Naim ne peut pas être payé via virement automatique — le paiement guide doit être géré manuellement.

**Mi6 — diplomaUrl et idDocUrl null**
Pas de documents uploadés. Si le dashboard admin vérifie ces documents, Naim apparaît comme non vérifié.

---

## Données manquantes en base

| Donnée | Statut | Impact |
|--------|--------|--------|
| Photo de profil (`user.image`) | ABSENT | Placeholder générique affiché |
| Langues parlées (table `languages`) | ABSENT | Section langues vide sur profil |
| Téléphone WhatsApp | ABSENT | Pas de contact direct possible |
| Pays | ABSENT | Non affiché |
| IBAN | ABSENT | Paiement guide impossible automatiquement |
| Documents (diplôme, pièce d'identité) | ABSENT | Vérification admin impossible |
| Video de présentation | ABSENT | Pas de contenu vidéo |
| Disponibilités futures | 1 seule date | Calendrier quasi vide |
| Forfaits supplémentaires | 1 seul forfait | Offre limitée vs 3 forfaits hardcodés affichés |
| cancellationPolicy du forfait | ABSENT | Description vide sur Stripe |
| emailVerified | ABSENT | Email non vérifié |
| nationality | ABSENT | Non affiché |
| interviewScore / interviewDate | ABSENT | Processus de vetting non documenté |

---

## API `/api/guide/public/naim-laamari` — Données retournées

```json
{
  "guide": { "id": "...", "slug": "naim-laamari", "name": "Naïm LAAMARI", "city": "makkah",
             "bio": "Responsable Terrain SAFARUMA. 8 ans expérience.", "image": null, "status": "ACTIVE" },
  "activePlaces": ["kaaba", "masjid-al-haram", "jabal-nour", ...],
  "placePrices": { "masjid-al-haram": 50, "kaaba": 50, ... "badr": 55 },
  "packages": [{ "id": "...", "name": "Omra — Makkah", "pricePerPerson": 99, "durationDays": 3 }]
}
```

Note : `image: null` retourné dans l'API — le checkout utilisera le placeholder.

---

## Recommandations prioritaires

1. **Corriger le matching forfait dans le checkout** — Le `packageName` envoyé par le client doit correspondre exactement au nom stocké en base (`"Omra — Makkah"`). Vérifier que `BASE_PACKAGES` / `getPackageForCity()` utilise ce nom exact, ou que le checkout sélectionne le bon forfait depuis les données retournées par l'API publique.

2. **Uploader une vraie photo de Naim** — Renseigner `user.image` avec une URL de photo réelle (Cloudinary, S3, ou autre). C'est le premier élément de confiance pour un pèlerin.

3. **Renseigner les langues en base** — Insérer les entrées dans la table `languages` pour Naim (FR, AR, EN, Darija) pour que la section langues s'affiche depuis les données réelles.

4. **Ajouter des disponibilités** — Créer des entrées `availability` pour mai, juin 2026 au minimum. Avec une seule date à 3 jours, le guide semble indisponible.

5. **Masquer ou désactiver les guides fictifs** — Les profils `rachid-al-madani`, `fatima-al-omari`, etc. ne sont pas réels et ne peuvent pas être réservés. Les marquer clairement "Bientôt disponible" ou les retirer de la liste.

6. **Supprimer ou étiqueter les avis fictifs** — Les `NAIM_REVIEWS` hardcodés sont de faux témoignages présentés comme réels. Risque légal (pratique commerciale trompeuse). Les supprimer jusqu'à avoir de vrais avis.

7. **Ajouter une clé Stripe test** pour l'environnement de développement — empêcher tout test accidentel en LIVE.

8. **Renseigner `cancellationPolicy`** sur le forfait DB — requis pour afficher une description non vide sur la page de paiement Stripe.

9. **Vérifier l'email de Naim** — Renseigner `emailVerified` pour éviter des blocages futurs à la connexion.

10. **Renseigner IBAN, documents, téléphone** — Compléter le profil guide pour permettre les paiements automatisés et la vérification admin.
