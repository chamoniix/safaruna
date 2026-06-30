# Handoff Conductor - SAFARUMA landing

Date: 2026-06-30
Repo local: `/Users/chamoonix/chamoonix/projets/SAFARUMA_v1`
Branche de travail: `feat/homepage-scroll-reduction`
Preview locale: `http://localhost:3005`

## A lire en premier

1. Lire `landingv2.1.md`.
2. Lire ce fichier.
3. Lancer `git status --short`.
4. Lire les fichiers landing:
   - `src/app/page.tsx`
   - `src/app/globals.css`
   - `src/components/Navbar.tsx`
   - `src/components/Footer.tsx`
   - `src/app/layout.tsx`

## Objectif

Continuer la finition visuelle/responsive de la landing SAFARUMA v2.1.

Priorite:
- mobile first
- hero
- bloc partenaires
- bloc "35 personnes dans un bus"
- carrousels horizontaux
- footer compact
- coherence premium noir/gold/beige

Ne pas travailler sur paiement, auth, admin, DB, Brevo ou Stripe sauf demande explicite.

## Git / live / production

Le live ne doit pas etre touche.

Regles:
- Ne pas merge vers `main`.
- Ne pas deployer en production.
- Ne pas faire de "promote to production".
- Ne pas push sur une branche de prod.
- Travailler uniquement sur la branche `feat/homepage-scroll-reduction`.

Le workflow souhaite:

```text
commit/push branche de travail
-> Conductor continue la landing
-> tests/review
-> plus tard seulement: decision de mise en production
```

Un push de la branche `feat/homepage-scroll-reduction` peut creer une preview Vercel, mais ce n'est pas le live production si Vercel est configure normalement sur `main`.

## Variables d'environnement et services

Important: les vraies cles ne doivent pas etre poussees dans Git.

Les fichiers `.env*` sont ignores par `.gitignore`.

Conductor verra dans le code:
- Prisma/Postgres via `prisma/schema.prisma`
- auth NextAuth dans `src/lib/auth.ts`
- emails Brevo dans `src/lib/email.ts` et routes API email/newsletter
- Stripe dans les routes API Stripe
- references a variables `process.env.*`

Conductor ne verra pas automatiquement:
- vraies cles Stripe
- vraies cles Brevo
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_JWT_SECRET`
- autres secrets Vercel

Cas d'acces:

1. Conductor depuis GitHub uniquement:
   - voit le code
   - ne voit pas les secrets Vercel
   - peut finir la landing sans secrets

2. Conductor dans le meme dossier local:
   - peut utiliser `.env.local` local si le workspace y a acces
   - ne pas afficher ni commiter les valeurs

3. Conductor connecte a Vercel:
   - l'app peut utiliser les env vars en preview/deploy
   - les valeurs peuvent rester masquees dans Vercel
   - ne pas supposer qu'il peut lire les secrets

Conclusion:
- Pour finir la landing, aucun secret n'est necessaire.
- Si Conductor bloque sur une info manquante, demander au proprietaire.
- On peut faire un commit complementaire de docs/contexte si necessaire.
- On peut aussi lui donner acces au workspace local si vraiment il doit utiliser `.env.local`, mais ne jamais mettre ces valeurs dans Git.

## Etat local / commit recommande

Le repo contenait deja des changements non lies avant la passe landing.

Commit propre recommande pour Conductor:
- landing code
- assets landing
- pages SEO liees
- `landingv2.1.md`
- `SESSION_CONDUCTOR_HANDOFF.md`
- corrections globales necessaires au logo/viewport/build

Laisser hors commit au debut:
- gros rapports/audits HTML/MD
- scripts ponctuels de QA
- documents non necessaires a la landing

Si Conductor manque de contexte:
- faire un deuxieme commit docs
- ou partager les fichiers localement

## Commandes de verification

```bash
npx tsc --noEmit
curl -I http://localhost:3005
npm run build
```

Note:
- `npm run build` peut echouer en sandbox a cause des Google Fonts Next.
- Si l'erreur mentionne `fonts.gstatic.com`, relancer hors sandbox/avec acces reseau.

## Interdictions

- Ne pas commit `.env`, `.env.local`, `.env.production`.
- Ne pas afficher les valeurs de secrets.
- Ne pas faire `git reset --hard`.
- Ne pas supprimer/revert des changements sans comprendre leur origine.
- Ne pas toucher au live tant que la landing n'est pas validee.
