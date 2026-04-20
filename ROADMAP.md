# SAFARUMA — Roadmap Stratégique et Technique
# Horizon : 12 semaines | Démarrage : 20 avril 2026

---

## Contexte de départ (état réel au 19 avril 2026)

Ce qui existe et fonctionne en production :
- Architecture complète (auth, paiement Stripe, emails Brevo, messaging, dashboards)
- Sprint sécurité terminé (18 vulnérabilités corrigées)
- Admin dashboard opérationnel
- Sitemap + robots.txt en place mais jamais soumis à Google
- Blog structuré avec articles rédigés mais sans trafic
- 6 fiches guides en dur dans le sitemap (données fictives)
- Notifications en base de données (modèle Prisma) mais sans canal externe (Telegram/WhatsApp absent)
- Sentry installé, aucun outil analytics côté usage

Ce qui bloque le revenu aujourd'hui :
- Zéro guide réel inscrit et activé
- Zéro pèlerin converti (flow jamais testé bout en bout)
- Zéro visibilité Google

---

## PHASE 1 — Validation Opérationnelle
### Durée : 2 semaines (20 avril — 3 mai 2026)

**Objectif business** : Avoir au moins 1 guide réel actif sur la plateforme et avoir prouvé qu'un pèlerin peut réserver et payer sans friction, sans intervention manuelle de l'admin.

Cette phase est le prérequis bloquant de tout le reste. Aucune acquisition n'a de sens si le flow casse en production.

---

### Tâche 1.1 — Test complet du flow guide : inscription → activation → tableau de bord
**Agent** : `engineering-senior-developer`
**Durée** : 2 jours

Exécuter le parcours complet avec un compte test :
- Inscription via `/rejoindre` avec données réelles (IBAN, documents)
- Vérification que l'admin reçoit la notification de dossier soumis
- Activation du compte depuis `/admin/guides` (route `POST /api/admin/create-guide-access`)
- Connexion au dashboard `/guide` et vérification de chaque section (disponibilités, réservations, messages, profil, virements)
- Documenter chaque point de friction ou erreur dans un fichier `BUGS_FLOW_GUIDE.md`

**Critère de succès** : Parcours complet sans erreur 500, sans donnée manquante, sans écran blanc.

---

### Tâche 1.2 — Test complet du flow pèlerin : recherche → réservation → paiement → confirmation
**Agent** : `engineering-senior-developer`
**Durée** : 2 jours (parallèle à 1.1)

Exécuter le parcours complet avec un compte pèlerin test et un guide fictif activé :
- Navigation depuis `/guides`, sélection d'un guide, choix d'un forfait
- Flow `/espace/checkout/[id]` jusqu'au paiement Stripe (mode test)
- Vérification de la confirmation email Brevo (template réservation)
- Vérification de l'apparition de la réservation dans `/espace` (dashboard pèlerin)
- Vérification que le guide voit la réservation dans `/guide`
- Test du messaging pèlerin ↔ guide via `/api/espace/conversations`
- Documenter dans `BUGS_FLOW_PELERIN.md`

**Critère de succès** : Paiement Stripe test capturé, email reçu, réservation visible des deux côtés.

---

### Tâche 1.3 — Correction des bugs critiques découverts
**Agent** : `engineering-backend-architect` pour les routes API, `engineering-frontend-developer` pour les UI
**Durée** : 3 jours (après 1.1 et 1.2)

Prioriser par impact : d'abord tout ce qui empêche la conversion (paiement, confirmation), ensuite ce qui dégrade l'expérience (affichage, messages).

Ne pas corriger les bugs cosmétiques à ce stade.

**Critère de succès** : Les deux flows se terminent sans erreur sur l'environnement de production Vercel.

---

### Tâche 1.4 — Lighthouse audit et corrections bloquantes performance
**Agent** : `engineering-frontend-developer`
**Durée** : 2 jours

Lancer Lighthouse en mode mobile sur : `/`, `/guides`, `/guide-omra`, une fiche guide `/guides/[id]`.

Corriger uniquement ce qui bloque le score SEO (CLS > 0.1, LCP > 2.5s, images sans dimensions, fonts bloquants). Ne pas viser 100/100, viser un score Performance > 70 et SEO > 90 sur mobile.

Outils : `next/image` pour toutes les images hero, `font-display: swap`, lazy loading composants non critiques.

**Critère de succès** : Score Lighthouse SEO >= 90 et Performance >= 70 sur mobile pour la homepage.

---

### Tâche 1.5 — Recrutement du premier guide réel (action fondateur)
**Agent** : `specialized-cultural-intelligence-strategist` pour le message d'approche, fondateur pour l'exécution
**Durée** : Toute la phase (en parallèle)

Identifier 3 à 5 guides francophones actifs (réseaux islamiques, associations Hajj/Omra, bouche à oreille). Le `specialized-cultural-intelligence-strategist` produit le script d'approche en français adapté au contexte religieux et culturel (ton, formulations appropriées, arguments clés : visibilité, simplicité, paiement sécurisé).

Le fondateur contacte directement. Objectif : 1 guide inscrit et activé avant fin de phase.

**Critère de succès** : 1 profil guide réel visible sur `/guides` avec données authentiques.

---

**Dépendances de phase 1** : Aucune. C'est le point de départ.

**Risque principal** : Bugs bloquants sur le flow paiement. Mitigation : utiliser Stripe CLI en local pour rejouer les webhooks, vérifier les logs Sentry.

---

## PHASE 2 — SEO et Acquisition Organique
### Durée : 3 semaines (4 mai — 24 mai 2026)

**Objectif business** : Apparaître sur Google pour les requêtes "guide omra francophone", "guide privé omra", "accompagnateur omra" et générer les 100 premiers visiteurs organiques.

**Dépendance** : Phase 1 terminée. Le site doit fonctionner avant d'envoyer du trafic dessus.

---

### Tâche 2.1 — Soumission Google Search Console et indexation forcée
**Agent** : `engineering-technical-writer` (documentation du processus), fondateur (exécution)
**Durée** : 1 jour

Actions concrètes :
- Vérifier la propriété `safaruma.com` dans Google Search Console (balise meta ou DNS)
- Soumettre `https://safaruma.com/sitemap.xml` (déjà codé dans `sitemap.ts`)
- Demander l'indexation manuelle des 5 URLs prioritaires : homepage, `/guides`, `/guide-omra`, `/lieux-saints`, `/blog`
- Vérifier dans 48h que Google Inspect URL ne retourne pas d'erreur

**Critère de succès** : Sitemap accepté par GSC, 0 erreur de crawl sur les pages prioritaires.

---

### Tâche 2.2 — Audit et optimisation SEO on-page des pages prioritaires
**Agent** : `marketing-content-creator` pour les textes, `engineering-frontend-developer` pour l'implémentation
**Durée** : 5 jours

Pages à traiter par priorité :

Page `/guide-omra` (priorité 1) :
- Title : "Guide Omra Francophone — Accompagnement Privé à La Mecque | SAFARUMA"
- H1 unique, balises H2/H3 structurées sur les questions réelles (comment choisir un guide, guide certifié, prix)
- Contenu minimal 800 mots avec les termes : "guide omra français", "accompagnateur omra", "guide privé La Mecque", "guide Médine francophone"
- Schema.org `Service` + `FAQPage`

Page `/guides` (priorité 2) :
- Title dynamique mentionnant le nombre de guides disponibles
- Description enrichie
- Schema.org `ItemList` sur les guides

Fiches guides `/guides/[id]` (priorité 3) :
- Schema.org `Person` + `Service` sur chaque fiche
- Canonical tag sur chaque fiche
- Title unique par guide : "[Prénom Nom] — Guide Omra Francophone | SAFARUMA"

Homepage (priorité 4) :
- Vérifier que le title et description sont différenciés de `/guide-omra`
- Schema.org `Organization`

**Critère de succès** : 0 duplicate title, 0 duplicate meta description, Schema.org validé via Rich Results Test Google.

---

### Tâche 2.3 — Production de contenu blog stratégique (3 articles cibles)
**Agent** : `marketing-content-creator`
**Durée** : 6 jours (2 jours par article)

Le blog existe (`/blog`) avec une structure d'articles. Il faut des articles qui rankent sur des requêtes à intention transactionnelle ou informationnelle forte.

Article 1 — Requête cible : "guide omra francophone 2026"
Titre : "Trouver un Guide Omra Francophone en 2026 : Notre Guide Complet"
Structure : pourquoi un guide privé, critères de choix, prix indicatifs, comment réserver via SAFARUMA. 1200 mots minimum. CTA vers `/guides`.

Article 2 — Requête cible : "prix guide omra privé"
Titre : "Combien Coûte un Guide Privé pour la Omra ? Tarifs 2026"
Structure : fourchettes de prix, ce qui est inclus, comparaison accompagnement groupé vs privé. 1000 mots. CTA vers `/forfaits`.

Article 3 — Requête cible : "préparer omra checklist"
Titre : "Checklist Omra 2026 : Tout Ce Qu'il Faut Préparer (avec modèle PDF)"
Structure : checklist complète en 3 parties (spirituel, administratif, matériel). 1500 mots. CTA vers inscription newsletter et guide.

Chaque article doit avoir : un slug propre, une meta description < 160 caractères, une image hero avec alt text descriptif, un lien interne vers au moins 2 autres pages du site, une date de publication réelle (pas `new Date()` dynamique).

**Note technique** : Le sitemap actuel utilise `lastModified: new Date()` pour le blog. Mettre à jour `sitemap.ts` pour utiliser des dates de publication statiques réelles. Agent : `engineering-senior-developer`.

**Critère de succès** : 3 articles publiés, indexés dans Google Search Console, sans erreur technique.

---

### Tâche 2.4 — Backlinking initial : annuaires et communautés islamiques
**Agent** : `marketing-growth-hacker`
**Durée** : 3 jours

Identifier et soumettre le site aux ressources suivantes (sans achat de liens) :
- Annuaires Hajj/Omra reconnus (associations UOIF, AMF, etc.)
- Forums francophones islamiques (Islamiates, Oumma.com)
- Groupes Facebook "Omra 2026" (dépôt de lien vers article blog pertinent, pas de spam)
- Répertoire Google Business Profile : créer la fiche "SAFARUMA" catégorie "Agence de voyages"

Le `marketing-growth-hacker` produit une liste de 20 cibles avec URL, type de soumission, et message type.

**Critère de succès** : 5 backlinks obtenus depuis des domaines avec DA > 20, Google Business Profile créé et vérifié.

---

### Tâche 2.5 — Analytics : installation Plausible ou Posthog
**Agent** : `engineering-frontend-developer`
**Durée** : 1 jour

Installer Plausible Analytics (solution RGPD-compliant, sans cookie banner obligatoire, légère). Alternative : Posthog (plus complet mais plus lourd).

Recommandation : Plausible pour cette phase (budget limité, simplicité, conformité RGPD sans effort).

Implémentation dans `/src/app/layout.tsx` via Script next.js. Configurer les événements custom : `reservation_started`, `reservation_completed`, `guide_page_viewed`, `contact_clicked`.

**Critère de succès** : Dashboard Plausible affiche le trafic en temps réel, 4 événements custom trackés.

---

**Dépendances de phase 2** : Phase 1 terminée (site fonctionnel, au moins 1 guide réel).

**Risque principal** : Articles de blog sans trafic rapide (SEO prend 4-12 semaines). Mitigation : partage immédiat dans les communautés dès publication, Tâche 2.4 en parallèle.

---

## PHASE 3 — Automation Notifications et Réseaux Sociaux
### Durée : 4 semaines (25 mai — 21 juin 2026)

**Objectif business** : Réduire à zéro le temps fondateur passé sur les notifications manuelles, et lancer une présence sociale qui génère des inscriptions guide et des demandes pèlerin.

**Dépendance** : Phase 1 terminée. Phase 2 en cours (les articles servent de contenu social).

---

### Tâche 3.1 — Telegram Bot : notifications admin et guide
**Agent** : `engineering-backend-architect`
**Durée** : 4 jours

Le Telegram bot est "partiellement configuré". Compléter l'intégration.

Architecture cible :
- Un channel Telegram privé "SAFARUMA Admin" reçoit les alertes critiques
- Un bot privé envoie des messages directs au guide concerné quand une réservation est créée

Événements à notifier via Telegram :
- Nouveau guide inscrit en attente d'activation → channel admin
- Nouveau paiement Stripe confirmé → channel admin + DM guide
- Message pèlerin non répondu après 24h → DM guide
- Réservation annulée → channel admin
- Erreur Sentry critique → channel admin

Implémentation technique :
- Créer `/src/lib/telegram.ts` avec fonction `sendTelegramMessage(chatId, message)`
- Utiliser l'API Telegram Bot (`https://api.telegram.org/bot{TOKEN}/sendMessage`)
- Injecter les appels dans les routes API existantes : `/api/stripe/webhook` (paiement confirmé), `/api/admin/guides` (activation), `/api/espace/conversations` (nouveau message)
- Variable d'environnement : `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`

Ne pas utiliser de bibliothèque externe : appel fetch natif suffit.

**Critère de succès** : Admin reçoit un message Telegram dans les 30 secondes après un paiement Stripe test.

---

### Tâche 3.2 — WhatsApp Business API : notifications pèlerin
**Agent** : `engineering-backend-architect`
**Durée** : 5 jours

WhatsApp est plus impactant que l'email pour les pèlerins (taux d'ouverture > 90%).

Architecture cible :
- WhatsApp Business API via Meta Cloud API (gratuit jusqu'à 1000 conversations/mois)
- Templates de messages pré-approuvés par Meta (délai 24-48h d'approbation)

Templates à créer et soumettre à Meta :

Template 1 — Confirmation réservation :
"Assalamu alaykum {{1}}, votre réservation avec le guide {{2}} est confirmée pour le {{3}}. Retrouvez tous les détails sur safaruma.com/espace. Baraka Allahu fikoum."

Template 2 — Rappel J-7 :
"Assalamu alaykum {{1}}, votre Omra avec {{2}} commence dans 7 jours. Vérifiez vos documents et retrouvez votre guide sur safaruma.com/espace."

Template 3 — Message du guide reçu :
"Assalamu alaykum {{1}}, vous avez un nouveau message de votre guide {{2}} sur SAFARUMA. Répondez sur safaruma.com/espace/conversations."

Implémentation technique :
- Créer `/src/lib/whatsapp.ts` avec fonction `sendWhatsAppTemplate(phone, templateName, params)`
- Endpoint Meta : `https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages`
- Variables d'environnement : `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
- Collecter le numéro de téléphone du pèlerin à l'inscription (champ optionnel avec explication de l'usage)
- Injecter dans `/api/stripe/webhook` après paiement confirmé

**Prérequis** : Compte Meta Business vérifié, numéro WhatsApp Business dédié. Le fondateur gère la vérification Meta (identité légale requise).

**Critère de succès** : Pèlerin reçoit un WhatsApp de confirmation dans les 2 minutes après paiement.

---

### Tâche 3.3 — Automatisation cron : rappels et relances
**Agent** : `engineering-devops-automator`
**Durée** : 2 jours

Utiliser les routes `/api/cron` déjà présentes dans la structure. Vérifier et compléter les jobs suivants :

Job 1 — Rappel guide non-réponse (quotidien, 9h) :
Requête : guides avec réservations confirmées et aucun message depuis 48h. Action : DM Telegram au guide.

Job 2 — Rappel pèlerin J-7 (quotidien, 10h) :
Requête : réservations avec `startDate` dans 7 jours et statut `CONFIRMED`. Action : WhatsApp template 2.

Job 3 — Cleanup réservations draft (hebdomadaire) :
Supprimer les `ReservationDraft` de plus de 24h sans paiement.

Configuration Vercel Cron dans `vercel.json` :
```json
{
  "crons": [
    { "path": "/api/cron/reminders", "schedule": "0 9 * * *" },
    { "path": "/api/cron/cleanup", "schedule": "0 3 * * 0" }
  ]
}
```

Sécuriser les routes cron avec `CRON_SECRET` en header.

**Critère de succès** : Logs Vercel confirment l'exécution des 2 jobs sans erreur pendant 7 jours consécutifs.

---

### Tâche 3.4 — Instagram : stratégie de contenu et premiers 30 posts
**Agent** : `marketing-instagram-curator` (stratégie et visuels), `marketing-content-creator` (textes)
**Durée** : 8 jours

Stratégie de compte Instagram `@safaruma` :
- Audience : musulmans francophones 25-55 ans planifiant une Omra
- Ton : spirituel et pratique, jamais commercial agressif
- Langue : français principalement, quelques mots arabes contextuels

Plan de contenu sur 30 posts (6 semaines, 5 posts/semaine) :

Pilier 1 — Éducatif (40%) : rituels de la Omra étape par étape, signification des lieux saints, questions fréquentes sur le Ihram, la Tawaf, le Sa'y. Format : carrousel informatif.

Pilier 2 — Inspiration (30%) : photos des lieux saints (Masjid al-Haram, Masjid an-Nabawi, Mont Arafat), citations coraniques contextualisées. Format : post image avec légende courte.

Pilier 3 — Social proof (20%) : témoignages de pèlerins (anonymisés), présentation des guides, "coulisses" de la plateforme. Format : Reels courts (30-60s) ou carrousels.

Pilier 4 — Conversion (10%) : présentation des forfaits, CTA vers inscription, promotion des guides disponibles. Format : post simple.

Le `marketing-instagram-curator` produit :
- Guide de charte graphique Instagram (palette, polices, templates Canva)
- Calendrier éditorial des 30 premiers posts avec visuels, textes, hashtags

Hashtags stratégiques à utiliser systématiquement : #omra2026 #guideprivéomra #omrafrancophone #pelerinageislam #lamecque #medine #umrah #hajj2026

**Critère de succès** : 30 posts planifiés et prêts à publier, compte Instagram créé et optimisé (bio, lien en bio vers safaruma.com, photo de profil logo).

---

### Tâche 3.5 — TikTok : stratégie Reels courts pour acquisition guide et pèlerin
**Agent** : `marketing-tiktok-strategist`
**Durée** : 5 jours

TikTok est pertinent pour toucher les 18-35 ans qui planifient leur première Omra. Format court, pédagogique, authentique.

Compte `@safaruma` sur TikTok :
- 10 vidéos pilotes (format 30-60s, portrait)
- Sujets : "3 erreurs à éviter à la Kaaba", "La différence entre Omra et Hajj en 60s", "Comment choisir un guide pour la Omra", "Prix d'un guide privé Omra 2026", "Le rituel Tawaf expliqué simplement"
- Hook dans les 3 premières secondes obligatoire
- CTA verbal en fin de vidéo : "Trouve ton guide sur safaruma.com"

Le `marketing-tiktok-strategist` produit :
- Script de 10 vidéos avec hook, contenu, CTA
- Recommandations de tournage (pas de setup professionnel nécessaire : smartphone + bonne lumière)
- Stratégie de hashtags TikTok (#omra #umrah #islam #pelerinage)

**Critère de succès** : 10 scripts livrés, 5 premières vidéos publiées, au moins 1 vidéo > 1000 vues.

---

### Note sur Xiaohongshu (小红书)
Le `marketing-xiaohongshu-specialist` est disponible dans les agents. Pertinence pour SAFARUMA : faible à ce stade. La diaspora musulmane chinoise francophone est un segment ultra-niche. Reporter en Phase 4 si des signaux de demande apparaissent dans les analytics.

---

**Risque principal phase 3** : Approbation des templates WhatsApp Meta prend 24-72h et peut être refusée. Mitigation : soumettre les templates dès le début de la phase, préparer un fallback email Brevo avec le même contenu.

---

## PHASE 4 — Analytics, Itération et Scale
### Durée : 3 semaines (22 juin — 12 juillet 2026)

**Objectif business** : Atteindre les 10 premières réservations réelles payantes et identifier le levier d'acquisition principal pour concentrer les investissements.

**Dépendance** : Phases 1, 2 et 3 terminées.

---

### Tâche 4.1 — Dashboard analytics business (pas technique)
**Agent** : `specialized-data-analytics-reporter` (si disponible) ou `engineering-data-engineer`
**Durée** : 3 jours

Construire un tableau de bord simple qui agrège :
- Trafic Plausible : visiteurs uniques, pages vues, sources d'acquisition, top pages
- Conversions Stripe : nombre de réservations payées par semaine, revenu total, ticket moyen
- Funnel : visiteurs → vues fiche guide → checkout démarré → paiement complété (taux de conversion à chaque étape)
- Réseaux sociaux : abonnés Instagram/TikTok, portée, taux d'engagement

Format recommandé : Google Looker Studio gratuit connecté à une Google Sheet mise à jour manuellement chaque lundi matin (15 minutes de travail fondateur). Ne pas over-engineer avec une solution automatisée en Phase 4.

**Critère de succès** : Fondateur dispose d'un tableau de bord lisible en < 5 minutes chaque lundi.

---

### Tâche 4.2 — Analyse du funnel et optimisation conversion
**Agent** : `product-behavioral-nudge-engine`, `engineering-frontend-developer`
**Durée** : 5 jours

Le `product-behavioral-nudge-engine` analyse les données des 4 premières semaines (Plausible events + Stripe) et identifie le point de friction principal dans le funnel.

Optimisations probables à appliquer selon les données :
- Si drop sur la fiche guide : améliorer la présentation des forfaits, ajouter des avis (même 2-3)
- Si drop au checkout : simplifier le formulaire, ajouter des garanties ("Paiement 100% sécurisé", "Annulation sous 48h")
- Si drop post-inscription pèlerin : améliorer l'email de bienvenue Brevo, ajouter un guide PDF "Comment ça marche"

L'`engineering-frontend-developer` implémente les 3 modifications à plus fort impact.

**Critère de succès** : Taux de conversion checkout → paiement augmente de 10% ou plus après les modifications.

---

### Tâche 4.3 — Onboarding guide : amélioration post-réalité terrain
**Agent** : `product-sprint-prioritizer`, `engineering-frontend-developer`
**Durée** : 3 jours

Sur la base du retour du premier guide réel (Phase 1), identifier et corriger les frictions dans l'onboarding guide.

Points probables à améliorer :
- Clarté des instructions pour ajouter des disponibilités
- Compréhension de la commission SAFARUMA
- Processus de virement (Transfer model)
- Notification quand un pèlerin envoie un message

Le `product-sprint-prioritizer` classe les retours terrain par impact/effort et sélectionne les 5 améliorations à implémenter dans ce sprint.

**Critère de succès** : Le guide déclare comprendre son tableau de bord sans aide externe après onboarding.

---

### Tâche 4.4 — SEO : mesurer et doubler ce qui fonctionne
**Agent** : `marketing-growth-hacker`, `marketing-content-creator`
**Durée** : 4 jours

Analyser Google Search Console après 6 semaines d'indexation :
- Quelles requêtes génèrent des impressions ? (même 0 clics, c'est un signal)
- Quels articles de blog ont le plus de clics ?
- Quelles fiches guides apparaissent pour quels mots-clés ?

Le `marketing-growth-hacker` identifie les 3 requêtes avec le meilleur potentiel (position 4-20, volume > 100 recherches/mois).

Le `marketing-content-creator` produit 2 nouveaux articles ciblant ces requêtes, et améliore les articles existants avec des sections manquantes.

**Critère de succès** : Au moins 1 article en position 1-10 sur Google pour une requête cible.

---

### Tâche 4.5 — Décision stratégique : quel canal doubler ?
**Agent** : Studio Producer (cette roadmap)
**Durée** : 1 journée de revue avec le fondateur

Sur la base des données collectées sur 12 semaines, répondre à ces questions :
- D'où vient la majorité des visites ? (SEO, Instagram, TikTok, bouche à oreille, directe)
- D'où vient la majorité des conversions ?
- Quel canal a le meilleur ROI (coût en temps / revenus générés) ?

Décision à prendre : concentrer 70% des efforts du trimestre suivant sur le canal #1, allouer 30% à l'expérimentation.

**Critère de succès** : Document d'1 page décision stratégique T3 2026 validé par le fondateur.

---

## Synthèse Exécutive

| Phase | Durée | Priorité | Revenu attendu | Risque |
|-------|-------|----------|----------------|--------|
| Phase 1 — Opérationnel | 2 semaines | Critique | 0 (prérequis) | Bugs flow paiement |
| Phase 2 — SEO | 3 semaines | Haute | Indirect (trafic) | Délai indexation Google |
| Phase 3 — Automation | 4 semaines | Haute | Rétention + conversion | Approbation Meta WhatsApp |
| Phase 4 — Analytics | 3 semaines | Moyenne | 10 premières réservations | Données insuffisantes si trafic faible |

---

## Tableau des Agents par Tâche

| Tâche | Agent principal | Agent support |
|-------|----------------|---------------|
| 1.1 Flow guide | `engineering-senior-developer` | — |
| 1.2 Flow pèlerin | `engineering-senior-developer` | — |
| 1.3 Corrections bugs | `engineering-backend-architect` | `engineering-frontend-developer` |
| 1.4 Lighthouse | `engineering-frontend-developer` | — |
| 1.5 Recrutement guide | `specialized-cultural-intelligence-strategist` | Fondateur |
| 2.1 Google Search Console | Fondateur | `engineering-technical-writer` |
| 2.2 SEO on-page | `marketing-content-creator` | `engineering-frontend-developer` |
| 2.3 Articles blog | `marketing-content-creator` | `engineering-senior-developer` (sitemap) |
| 2.4 Backlinking | `marketing-growth-hacker` | — |
| 2.5 Analytics Plausible | `engineering-frontend-developer` | — |
| 3.1 Telegram Bot | `engineering-backend-architect` | — |
| 3.2 WhatsApp Business | `engineering-backend-architect` | Fondateur (vérif Meta) |
| 3.3 Cron jobs | `engineering-devops-automator` | — |
| 3.4 Instagram | `marketing-instagram-curator` | `marketing-content-creator` |
| 3.5 TikTok | `marketing-tiktok-strategist` | — |
| 4.1 Dashboard analytics | `engineering-data-engineer` | Fondateur |
| 4.2 Optimisation funnel | `product-behavioral-nudge-engine` | `engineering-frontend-developer` |
| 4.3 Onboarding guide | `product-sprint-prioritizer` | `engineering-frontend-developer` |
| 4.4 SEO itération | `marketing-growth-hacker` | `marketing-content-creator` |
| 4.5 Décision stratégique | Studio Producer | Fondateur |

---

## Première action demain matin (20 avril 2026, 9h00)

**Fondateur** : Prendre 30 minutes pour identifier 3 guides potentiels à contacter (réseaux personnels, associations, LinkedIn islamique). Préparer leur contact pour la semaine.

**Claude Code avec `engineering-senior-developer`** : Démarrer la Tâche 1.1 — lancer le flow guide complet sur l'environnement de production avec un compte test. Documenter chaque friction dans `BUGS_FLOW_GUIDE.md`.

Ces deux actions sont parallèles et non-bloquantes entre elles. La journée du 20 avril doit se terminer avec un premier rapport de bugs du flow guide et au moins 1 guide potentiel identifié.

---

*Roadmap produite le 19 avril 2026*
*Révisée en fin de Phase 2 sur la base des données analytics réelles*
