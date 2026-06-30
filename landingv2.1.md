# SAFARUMA landing v2.1 - memo de reprise

Date de creation: 2026-06-30
Branche locale: `feat/homepage-scroll-reduction`
Preview locale cible: `http://localhost:3005`

## Objectif de cette phase

Refonte progressive de la homepage SAFARUMA en restant local, sans push, sans merge, sans commit.

Direction design demandee:
- homepage premium 2026, noir profond, gold subtil, beige premium
- ADN SAFARUMA conserve, pas landing generique
- conversion vers reservation de guide prive Omra
- mobile prioritaire, responsive propre
- carrousels horizontaux utilisables au doigt
- motion Framer Motion sans casser l'ergonomie

## Regles importantes a respecter

- Ne pas modifier `.env.local`, `package.json`, `package-lock.json`, `next.config.ts`, `prisma/`, `auth/`, `config/` sans autorisation explicite.
- Le repo est sale depuis avant cette phase: ne jamais faire `git reset --hard`, ne jamais revert globalement.
- Plusieurs fichiers modifies/supprimes existaient deja avant la refonte. Toujours lire `git status --short` avant d'agir.
- Next.js est une version recente avec changements de conventions. Lire les docs locales dans `node_modules/next/dist/docs/` si une API Next est touchee.
- Ne pas afficher de secrets si des fichiers sensibles sont lus.
- Ne pas push, ne pas merge, ne pas commit tant que l'utilisateur ne l'a pas demande.

## Fichiers principaux modifies pour la landing

Fichiers de la refonte:
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/app/layout.tsx`

Pages SEO creees pendant la refonte:
- `src/app/guides-certifies/page.tsx`
- `src/app/omra-pmr/page.tsx`
- `src/app/histoire-premiere-omra/page.tsx`
- `src/app/experiences/lieux-historiques-preserves/page.tsx`
- `src/app/experiences/rencontres-locales/page.tsx`
- `src/app/experiences/moments-spirituels-inoubliables/page.tsx`
- `src/app/experiences/acces-privilegies-secrets/page.tsx`
- `src/app/avis/page.tsx`
- `src/app/reservation/page.tsx`

Assets landing disponibles:
- `public/images/landing/hero-kaaba-main.jpg`
- `public/images/landing/testi-bg.jpg`
- `public/images/landing/cta-bg.jpg`
- `public/images/landing/guide-naim-laamari.jpg`
- `public/images/landing/experience-historique.jpg`
- `public/images/landing/experience-rencontres.jpg`
- `public/images/landing/experience-spirituel.jpg`
- `public/images/landing/experience-acces.jpg`
- `public/images/landing/partner-makkah.png`
- `public/images/landing/partner-saudia.png`
- `public/images/landing/partner-flynas.png`
- `public/images/landing/partner-hilton.png`
- `public/images/landing/mosque-bg-beige.jpg`

## Etat fonctionnel actuel

`src/app/page.tsx` est une homepage client component avec:
- Hero SAFARUMA avec image Kaaba, CTA reservation, bouton video, proof 147 pelerins.
- Carousel partenaires.
- Bloc probleme "35 personnes dans un bus..." avec image et texte overlay.
- Bloc "Pourquoi choisir SAFARUMA".
- Guides prives en carousel avec modales.
- Experiences exclusives en carousel avec modales.
- Parcours Omra en carousel avec modales.
- Avis en carousel avec modales.
- CTA final.
- Footer SAFARUMA.

Carrousels:
- composant interne `Carousel` dans `src/app/page.tsx`.
- boutons `<` et `>` visibles.
- auto-scroll desactive sur pointeur tactile pour ne pas bloquer le swipe mobile.
- pause au pointer down / reprise differee au pointer up.
- CSS mobile avec `touch-action: pan-x`, `overflow-x: auto`, pas de snap dur.

Modales:
- `AnimatePresence` + `motion.article`.
- fermeture croix, backdrop, Escape.

Navbar:
- `src/components/Navbar.tsx` contient encore un gros `<style dangerouslySetInnerHTML>`.
- `suppressHydrationWarning` est ajoute sur ce style.
- La topbar PDF n'est plus rendue sur mobile (`showBanner = !hideBanner && !isMobileViewport`).
- Le seuil mobile de fond solide est tres court: `solidThreshold = mobile ? 4 : scrollThreshold`.

Layout:
- `src/app/layout.tsx` a ete touche pour deplacer le `Script` consent mode hors du `<head>` vers le `<body>`, car Next affichait une erreur console quand `next/script` etait rendu dans `<head>`.

Footer:
- `src/components/Footer.tsx` est volontairement revenu a des `<p>` pour telephone/mail afin d'eviter un mismatch hot-reload vu en console.
- L'annee est statique: `© 2026 Safaruma...` pour eviter `new Date()` dans le rendu.
- CSS mobile: navigation et ressources cote a cote, contact dessous en grille compacte.

## Dernieres demandes traitees

1. Bloc "35 personnes dans un bus"
- Le texte doit chevaucher l'image.
- Implementation actuelle: `.sfr-problem-grid` est `position: relative`, l'image couvre le bloc, `.sfr-problem-copy` est overlay avec fond sombre translucide, blur, shadow et gros arrondi type demi-cercle.
- Mobile: overlay compact avec marge gauche, arrondi et shadow.

2. Fleches de carousel
- Les boutons affichent maintenant `<` et `>`.
- Mobile: les fleches ne sont plus cachees, elles sont petites, en overlay, avec fond sombre blur.

3. Footer
- Mobile: brand/socials en haut, navigation + ressources cote a cote, contact dessous.
- Taille reduite pour limiter le scroll.

4. Memo de reprise
- Ce fichier `landingv2.1.md` a ete cree pour transmettre le contexte a une autre session.

## Commandes utiles

Serveur local:
```bash
npm run dev
```

Preview:
```bash
open http://localhost:3005
```

Verifier que le serveur repond:
```bash
curl -I http://localhost:3005
```

TypeScript:
```bash
npx tsc --noEmit
```

Build:
```bash
npm run build
```

Note build:
- En sandbox, `npm run build` peut echouer car Next telecharge des Google Fonts.
- Si l'erreur mentionne `fonts.gstatic.com` ou `@vercel/turbopack-next/internal/font/google/font`, relancer hors sandbox avec autorisation.
- Hors sandbox, le build a passe plusieurs fois.
- Le build peut etre long a cause de `runAfterProductionCompile`, Sentry/source maps et generation statique.

## Tests / verification deja faits

Derniers checks connus avant creation de ce memo:
- `npx tsc --noEmit`: OK
- `curl -I http://localhost:3005`: OK
- `npm run build` hors sandbox: OK apres les corrections precedentes

Apres toute nouvelle modification, refaire au minimum:
1. `npx tsc --noEmit`
2. `curl -I http://localhost:3005`
3. `npm run build` si `layout.tsx`, routing, imports ou composants Next sont touches
4. Verification mobile reelle dans Safari/Chrome, car le probleme principal est visuel mobile

## Problemes connus / points de vigilance

- Le repo contient beaucoup de changements non lies. Ne pas nettoyer sans ordre explicite.
- `npm run lint` n'est pas un gate fiable actuellement: il echoue deja avec beaucoup d'erreurs preexistantes.
- Des erreurs console peuvent rester en hot reload si Safari garde un ancien HTML client/serveur. En cas de mismatch apres correction, fermer l'onglet mobile et rouvrir.
- Les images guides sont incompletes: seul `guide-naim-laamari.jpg` existe. Les autres cartes utilisent des placeholders propres.
- Certains liens de modales pointent vers des routes qui peuvent etre dynamiques ou non peuplees (`/guides/youssef`, etc.). Verifier avant production.
- `src/components/Navbar.tsx` garde beaucoup de CSS inline. Une future passe propre devrait extraire ce CSS dans `globals.css` ou un module, mais seulement si le diff est controle.

## Etat git observe

Branche:
```text
feat/homepage-scroll-reduction
```

Le `git status --short` contient notamment:
- modifications: `ROADMAP.md`, `next.config.ts`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`, etc.
- suppressions locales dans `public/*.svg/png` historiques.
- nouveaux dossiers/pages: `src/app/avis/`, `src/app/experiences/`, `src/app/guides-certifies/`, `src/app/histoire-premiere-omra/`, `src/app/omra-pmr/`, `src/app/reservation/`.
- plusieurs rapports/audits HTML/MD non suivis.

Conclusion: avant tout push/commit, il faut faire un audit de diff par fichier et separer les changements landing des changements preexistants.

## Procedure recommandee pour une future IA

1. Lire ce fichier en entier.
2. Lire `AGENTS.md` si present.
3. Lancer `git status --short`.
4. Lire `src/app/page.tsx`, `src/app/globals.css`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`.
5. Ne pas modifier les fichiers hors scope sans demander.
6. Tester mobile visuellement apres chaque passe CSS.
7. Eviter les refactors larges tant que le rendu mobile n'est pas valide.
8. Si un commit est demande, d'abord proposer un decoupage propre des fichiers a inclure.
9. Ne jamais inclure `.env.local`, secrets, dumps, rapports temporaires ou fichiers d'audit non demandes dans un commit.

## Priorites restantes

Urgent:
- Valider visuellement le gap hero/partenaires et le bloc probleme overlay sur mobile reel.
- Tester le swipe horizontal de tous les carrousels avec le doigt.
- Verifier que les flèches `<` et `>` ne bloquent pas le swipe et restent tapables.

Important:
- Remplacer les placeholders guides par de vraies images.
- Verifier toutes les routes CTA avant production.
- Nettoyer le CSS ancien une fois la landing validee.

Plus tard:
- Extraire les donnees de `page.tsx` dans un fichier dedie.
- Extraire les gros blocs CSS landing dans un module ou une section mieux isolee.
- Faire une passe accessibilite focus/labels sur modales et carrousels.
