'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;
// Deux tours : noms français d'abord, puis écritures natives.
// `color` : couleur dominante du drapeau, appliquée au mot (déclinée claire
// pour rester lisible sur le fond sombre du hero).
// Uniquement les langues réellement parlées par les guides actifs — chaque
// langue non francophone suivie de son écriture arabe.
const heroLanguages = [
  { word: 'français', flag: 'fr', color: '#8fa8f5' },
  { word: 'arabe', flag: 'sa', color: '#5fc98e' },
  { word: 'العربية', flag: 'sa', color: '#5fc98e' },
  { word: 'algérien', flag: 'dz', color: '#5fc98e' },
  { word: 'الجزائر', flag: 'dz', color: '#5fc98e' },
  { word: 'marocain', flag: 'ma', color: '#f08a8a' },
  { word: 'الدارجة', flag: 'ma', color: '#f08a8a' },
];

const isRtlWord = (word: string) => /[؀-ۿ]/.test(word);

type ModalContent = {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  meta?: string;
  image?: string;
  badges?: string[];
  highlights?: string[];
  price?: string;
};

type CarouselItem = {
  id: string;
  title: string;
  text: string;
  href: string;
  icon?: string;
  image?: string;
  meta?: string;
  cta?: string;
  badges?: string[];
  highlights?: string[];
  price?: string;
  kind?: 'guide' | 'feature';
};

const partners = [
  { name: 'Makkah', image: '/images/landing/partner-makkah.png' },
  { name: 'Saudia', image: '/images/landing/partner-saudia.png' },
  { name: 'Flynas', image: '/images/landing/partner-flynas.png' },
  { name: 'Hilton', image: '/images/landing/partner-hilton.png' },
];

const whyCards: CarouselItem[] = [
  {
    id: 'langue',
    icon: '◆',
    title: 'Guide dans ta langue',
    text: 'Tu choisis ton guide selon ta langue. Ton guide te parle comme un ami, pas comme un conférencier.',
    href: '/guides',
    cta: 'Trouver mon guide',
    image: '/images/landing/experience-rencontres.jpg',
  },
  {
    id: 'guides-experts',
    icon: '۞',
    title: 'Guides experts',
    text: 'Guides certifiés, passionnés et habitués du terrain pour une Omra claire, authentique et apaisée.',
    href: '/guides-certifies',
    cta: 'En savoir plus',
    image: '/images/landing/guide-naim-laamari.jpg',
  },
  {
    id: 'famille',
    icon: '1',
    title: 'En famille',
    text: "Je veux emmener mes proches mais j'ai peur de mal organiser.",
    href: '/guides',
    cta: 'Trouver un guide famille',
    image: '/why-safaruma/en-famille.jpg',
  },
  {
    id: 'parents',
    icon: '2',
    title: 'Pour mes parents',
    text: 'SVP prenez soin de mes parents. — Ces mots que vous direz à leur guide.',
    href: '/guides',
    cta: 'Trouver un guide rassurant',
    image: '/why-safaruma/mes-parents.jpg',
  },
  {
    id: 'premiere-omra',
    icon: '3',
    title: 'Ma 1ère Omra',
    text: 'Je veux enfin faire la Omra mais je ne sais pas par où commencer.',
    href: '/guide-omra',
    cta: 'Préparer ma Omra',
    image: '/why-safaruma/premiere-omra.jpg',
  },
  {
    id: 'pmr',
    icon: '♿',
    title: 'Service PMR & assistance',
    text: 'Fauteuil roulant, enfants, personnes âgées, rythme adapté et logistique pensée avant le départ.',
    href: '/omra-pmr',
    cta: 'En savoir plus',
    image: '/why-safaruma/assistance-pmr.jpg',
  },
  {
    id: 'unique',
    icon: '✦',
    title: 'Expérience unique',
    text: 'Certains lieux sont inaccessibles aux agences à cause du nombre de personnes. Avec un guide privé, toi si.',
    href: '/omra-avec-guide-prive',
    cta: 'En savoir plus',
    image: '/why-safaruma/experience-lieux-saints.jpg',
  },
  {
    id: 'personnalise',
    icon: '☾',
    title: 'Service personnalisé',
    text: 'Un parcours humain, intime et sur-mesure pour comprendre chaque geste au lieu de simplement suivre.',
    href: '/histoire-premiere-omra',
    cta: 'En savoir plus',
    image: '/why-safaruma/accompagnement-personnalise.jpg',
  },
  {
    id: 'assistance',
    icon: '◌',
    title: 'Assistance en temps réel',
    text: 'On répond à toutes vos questions. Nos guides et nos équipes restent disponibles pour que votre voyage soit le plus agréable possible.',
    href: '/contact',
    cta: 'Nous contacter',
    image: '/why-safaruma/temp-reel.jpg',
  },
  {
    id: 'remplacement',
    icon: '✓',
    title: 'Garantie remplacement',
    text: 'Si ton guide ne peut pas venir pour une urgence, on te trouve un guide équivalent certifié en moins de 2 heures.',
    href: '/guides',
    cta: 'Trouver mon guide',
    image: '/images/landing/mosque-bg-beige.jpg',
  },
];

const guides: CarouselItem[] = [
  {
    id: 'naim-laamari',
    title: 'Naïm LAAMARI',
    text: 'Makkah · 8 ans · Responsable Terrain. Guide Officiel SAFARUMA, formateur certifié et guide vérifié pour les familles francophones.',
    href: '/guides/naim-laamari',
    image: '/images/landing/guide-naim-laamari.jpg',
    meta: 'Français · Arabe · English · Darija',
    cta: 'Voir le profil complet',
    badges: ['OFFICIEL SAFARUMA', 'GUIDE VÉRIFIÉ', 'RESPONSABLE TERRAIN', 'FORMATEUR CERTIFIÉ'],
    highlights: ['5.0 · avis vérifiés', 'Makkah', '8 ans d’expérience terrain', 'Français, Arabe, English, Darija'],
    price: 'À partir de 150€ / pers.',
  },
  {
    id: 'profil-transparent',
    kind: 'feature',
    icon: '◎',
    title: 'Profil guide transparent',
    text: 'Bio, certifications et avis vérifiés : tu sais exactement qui va t\'accompagner.',
    href: '/guides',
    meta: 'Confiance',
    cta: 'Voir les guides',
    badges: ['Certifications', 'Avis', 'Lieux couverts'],
  },
  {
    id: 'youssef',
    title: 'Youssef',
    text: 'Accompagnement anglophone et arabe pour pèlerins internationaux, familles et petits groupes.',
    href: '/guides',
    image: '/why-safaruma/accompagnement-personnalise.jpg',
    meta: 'Anglais + Arabe',
    cta: 'Voir les guides disponibles',
  },
  {
    id: 'ibrahim',
    title: 'Ibrahim',
    text: 'Profil turcophone et arabe, pensé pour les visiteurs qui veulent poser leurs questions sans barrière.',
    href: '/guides',
    image: '/images/landing/experience-historique.jpg',
    meta: 'Turc + Arabe',
    cta: 'Voir les guides disponibles',
  },
  {
    id: 'muhammad',
    title: 'Muhammad',
    text: 'Guide indonésien et arabe pour une Omra calme, structurée et adaptée aux familles.',
    href: '/guides',
    image: '/why-safaruma/en-famille.jpg',
    meta: 'Indonésien + Arabe',
    cta: 'Voir les guides disponibles',
  },
  {
    id: 'rachid',
    title: 'Rachid',
    text: 'Accompagnement espagnol et arabe pour découvrir les rites et les lieux avec plus de profondeur.',
    href: '/guides',
    image: '/images/landing/place-nabawi.jpg',
    meta: 'Espagnol + Arabe',
    cta: 'Voir les guides disponibles',
  },
];

const experiences: CarouselItem[] = [
  {
    id: 'masjid-haram',
    icon: 'الكعبة',
    title: 'Masjid Al-Haram & Kaaba',
    text: 'Le cœur du pèlerinage. Ton guide t’aide à comprendre le Tawaf, les repères, les accès et le sens de chaque geste.',
    href: '/lieux-saints',
    image: '/images/landing/hero-kaaba-main.jpg',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'masjid-nabawi',
    icon: 'ﷺ',
    title: 'Masjid An-Nabawi',
    text: 'La mosquée du Prophète ﷺ à Médine, avec ses repères, son histoire et l’adab à respecter.',
    href: '/lieux-saints',
    image: '/images/landing/place-nabawi.jpg',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'rawdah',
    icon: 'روضة',
    title: 'Rawdah',
    text: 'Un moment très demandé à Médine. Le guide explique le contexte, l’organisation et les bonnes attentes.',
    href: '/lieux-saints',
    image: '/images/landing/place-rawdah.jpg',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'quba',
    icon: 'قباء',
    title: 'Masjid Quba',
    text: 'La première mosquée bâtie dans l’histoire de l’Islam, un lieu essentiel pour comprendre Médine.',
    href: '/lieux-saints',
    image: '/images/landing/place-quba.jpg',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'uhud',
    icon: 'أحد',
    title: 'Mont Uhud',
    text: 'Un lieu fort de l’histoire islamique, souvent visité à Médine pour comprendre les compagnons et leurs sacrifices.',
    href: '/lieux-saints',
    image: '/images/landing/place-uhud.jpg',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'badr',
    icon: 'بدر',
    title: 'Badr',
    text: 'Plus éloigné, mais spirituellement majeur. Certains itinéraires peuvent l’inclure selon timing, autorisations et organisation.',
    href: '/lieux-saints',
    image: '/images/landing/place-badr.jpg',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'hira',
    icon: 'حراء',
    title: 'Grotte de Hira',
    text: 'Là où la première révélation coranique fut révélée. Ton guide replace le lieu dans son contexte spirituel.',
    href: '/lieux-saints',
    image: '/images/landing/place-hira.jpg',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'arafat',
    icon: 'عرفات',
    title: 'Arafat & Jabal Rahmah',
    text: 'Un repère fondamental du Hajj, expliqué avec simplicité même pendant une Omra.',
    href: '/lieux-saints',
    image: '/images/landing/place-arafat.jpg',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'lieux-historiques',
    title: 'Lieux historiques préservés',
    text: 'Des sites chargés d’histoire, expliqués avec contexte, silence et respect du rythme spirituel.',
    href: '/experiences/lieux-historiques-preserves',
    image: '/images/landing/experience-historique.jpg',
    cta: 'Voir plus',
  },
  {
    id: 'rencontres-locales',
    title: 'Rencontres locales',
    text: 'Des moments simples, humains, loin des circuits pressés, pour sentir la ville autrement.',
    href: '/experiences/rencontres-locales',
    image: '/images/landing/experience-rencontres.jpg',
    cta: 'Voir plus',
  },
  {
    id: 'moments-spirituels',
    title: 'Moments spirituels inoubliables',
    text: 'Des pauses guidées pour relier le rite, l’histoire et l’intention personnelle.',
    href: '/experiences/moments-spirituels-inoubliables',
    image: '/images/landing/experience-spirituel.jpg',
    cta: 'Voir plus',
  },
  {
    id: 'acces-privilegies',
    title: 'Accès privilégiés et secrets',
    text: 'Des itinéraires plus flexibles, impossibles à tenir avec un bus de plusieurs dizaines de personnes.',
    href: '/experiences/acces-privilegies-secrets',
    image: '/images/landing/experience-acces.jpg',
    cta: 'Voir plus',
  },
];

const steps: CarouselItem[] = [
  {
    id: 'compte',
    title: 'Crée ton compte gratuit',
    text: 'Un accès immédiat en 10 secondes pour préparer ton voyage, sauvegarder tes choix et contacter ton guide.',
    href: '/inscription',
    meta: 'Étape 1',
    image: '/parcours/creer-compte.jpg',
    cta: 'Voir plus',
  },
  {
    id: 'preparation',
    title: 'Préparation & conseils',
    text: 'Visa, hébergement, checklist, rythme de la famille, questions de rite et contraintes terrain.',
    href: '/guide-omra',
    meta: 'Étape 2',
    image: '/parcours/preparation-conseils.jpg',
    cta: 'Voir plus',
  },
  {
    id: 'arrivee',
    title: 'Accueil personnalisé à l’arrivée',
    text: 'Repères dès l’aéroport, installation, premiers conseils pratiques et prise en charge rassurante.',
    href: '/services/transfert',
    meta: 'Étape 3',
    image: '/parcours/accueil-personnalise.jpg',
    cta: 'Voir plus',
  },
  {
    id: 'visites',
    title: 'Accompagnement visites guidées privées',
    text: 'Lieux saints, sites historiques et explications adaptées à ta langue, ton niveau et ton rythme.',
    href: '/lieux-saints',
    meta: 'Étape 4',
    image: '/parcours/accompagnement-visites.jpg',
    cta: 'Voir plus',
  },
  {
    id: 'apres',
    title: 'Après l’Omra',
    text: 'Suivi, conseils, souvenirs et continuité spirituelle pour ne pas repartir avec seulement des photos.',
    href: '/espace/tableau-de-bord',
    meta: 'Étape 5',
    image: '/parcours/apres-omra.jpg',
    cta: 'Voir plus',
  },
];

const reviews: CarouselItem[] = [
  {
    id: 'karim-live',
    title: 'Karim L.',
    text: "Rachid nous a fait vivre l'histoire à chaque pas. La montée de Jabal Nour avec ses explications était le moment le plus fort de notre vie.",
    href: '#avis',
    meta: '★★★★★',
    image: '/images/reviews/review-kaaba-regard.jpg',
    cta: 'Voir les avis',
  },
  {
    id: 'safia-live',
    title: 'Safia M.',
    text: 'En tant que groupe de femmes, nous avions des appréhensions. Fatima a tout géré avec une douceur et une compétence incroyables.',
    href: '#avis',
    meta: '★★★★★',
    image: '/images/reviews/review-nabawi-esplanade.jpg',
    cta: 'Voir les avis',
  },
  {
    id: 'ibrahima-live',
    title: 'Ibrahima D.',
    text: "Youssouf parle Wolof, connaît les histoires que nos anciens nous ont transmises, et les relie aux lieux saints. Toute la famille est repartie transformée.",
    href: '#avis',
    meta: '★★★★★',
    image: '/images/reviews/review-tawaf-foule.jpg',
    cta: 'Voir les avis',
  },
  {
    id: 'meryem',
    title: 'Meryem B.',
    text: 'Une expérience incroyable. Notre guide a pris le temps d’expliquer chaque étape, de répondre aux questions de mes parents et de rendre la Omra plus profonde.',
    href: '#avis',
    meta: '★★★★★',
    image: '/images/reviews/review-nabawi-parasols.jpg',
    cta: 'Voir les avis',
  },
  {
    id: 'converti',
    title: 'Nadir C.',
    text: "Tout juste converti, j'ai découvert la Omra sans me sentir perdu. Le guide expliquait chaque étape avec patience et respect.",
    href: '#avis',
    meta: '★★★★★',
    image: '/images/reviews/review-kaaba-nuit.jpg',
    cta: 'Voir les avis',
  },
  {
    id: 'hesitation',
    title: 'Samira H.',
    text: "J'ai hésité longtemps, je pensais que ce n'était pas le bon moment. L'accompagnement m'a rassurée dès la préparation.",
    href: '#avis',
    meta: '★★★★★',
    image: '/images/reviews/review-mecque-vue.jpg',
    cta: 'Voir les avis',
  },
];

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.8, delay, ease: EASE_LUXURY }}
    >
      {children}
    </motion.div>
  );
}

function Carousel({
  label,
  className,
  auto = true,
  children,
}: {
  label: string;
  className?: string;
  auto?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const items = React.Children.toArray(children);
  const itemCount = React.Children.count(children);
  const bounded = !auto;

  const updateScrollBounds = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollPrev(el.scrollLeft > 2);
    setCanScrollNext(el.scrollLeft < maxScrollLeft - 2);
  }, []);

  const scrollBy = (direction: number) => {
    if (bounded && direction < 0 && !canScrollPrev) return;
    if (bounded && direction > 0 && !canScrollNext) return;

    ref.current?.scrollBy({ left: direction * 340, behavior: 'smooth' });
  };

  useEffect(() => {
    const query = window.matchMedia('(pointer: coarse)');
    const update = () => setCoarsePointer(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    updateScrollBounds();
    const raf = window.requestAnimationFrame(updateScrollBounds);
    el.addEventListener('scroll', updateScrollBounds, { passive: true });
    window.addEventListener('resize', updateScrollBounds);

    return () => {
      window.cancelAnimationFrame(raf);
      el.removeEventListener('scroll', updateScrollBounds);
      window.removeEventListener('resize', updateScrollBounds);
    };
  }, [auto, coarsePointer, itemCount, updateScrollBounds]);

  useEffect(() => {
    if (!auto || reduce || coarsePointer) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const el = ref.current;
      if (el) {
        const delta = now - last;
        const loopWidth = el.scrollWidth / 2;
        el.scrollLeft += delta * 0.026;
        if (loopWidth > 0 && el.scrollLeft >= loopWidth) {
          el.scrollLeft -= loopWidth;
        }
      }
      last = now;
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [auto, reduce, coarsePointer]);

  return (
    <div
      className={`sfr-carousel-shell ${className ?? ''}`}
    >
      <motion.button
        className={`sfr-carousel-arrow sfr-carousel-arrow--left${bounded && !canScrollPrev ? ' sfr-carousel-arrow-disabled' : ''}`}
        onClick={() => scrollBy(-1)}
        aria-label={`${label} précédent`}
        aria-disabled={bounded && !canScrollPrev}
        disabled={bounded && !canScrollPrev}
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.94 }}
      >
        &lt;
      </motion.button>
      <div ref={ref} className="sfr-carousel-track" aria-label={label}>
        {items}
        {auto && !coarsePointer && items.map((child, index) => (
          <React.Fragment key={`loop-${index}`}>{child}</React.Fragment>
        ))}
      </div>
      <motion.button
        className={`sfr-carousel-arrow sfr-carousel-arrow--right${bounded && !canScrollNext ? ' sfr-carousel-arrow-disabled' : ''}`}
        onClick={() => scrollBy(1)}
        aria-label={`${label} suivant`}
        aria-disabled={bounded && !canScrollNext}
        disabled={bounded && !canScrollNext}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.94 }}
      >
        &gt;
      </motion.button>
      <div className="sfr-carousel-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function SmartImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`sfr-image-placeholder ${className ?? ''}`} aria-label={alt}>
        <span>SAFARUMA</span>
      </div>
    );
  }

  return <Image src={src} alt={alt} fill sizes="(max-width: 768px) 78vw, 280px" className={className} />;
}

function Modal({ content, onClose }: { content: ModalContent | null; onClose: () => void }) {
  useEffect(() => {
    if (!content) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [content, onClose]);

  return (
    <AnimatePresence>
      {content && (
        <motion.div className="sfr-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="sfr-modal-backdrop" aria-label="Fermer" onClick={onClose} />
          <motion.article
            className="sfr-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sfr-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE_LUXURY }}
          >
            <button className="sfr-modal-close" onClick={onClose} aria-label="Fermer la fenêtre">
              ×
            </button>
            {content.image && (
              <div className="sfr-modal-image">
                <Image src={content.image} alt="" fill sizes="560px" />
              </div>
            )}
            <p className="sfr-eyebrow">{content.eyebrow}</p>
            <h2 id="sfr-modal-title">{content.title}</h2>
            {content.meta && <p className="sfr-modal-meta">{content.meta}</p>}
            <p>{content.text}</p>
            {content.badges && (
              <div className="sfr-modal-badges">
                {content.badges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
            )}
            {content.highlights && (
              <ul className="sfr-modal-highlights">
                {content.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            )}
            {content.price && <p className="sfr-modal-price">{content.price}</p>}
            <Link href={content.href} className="sfr-btn sfr-btn-gold" onClick={onClose}>
              {content.cta} →
            </Link>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Drapeaux officiels : banque flag-icons (lipis, MIT) dans public/flags/.
function FlagIcon({ code }: { code: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="sfr-flag-svg" src={`/flags/${code}.svg`} alt="" aria-hidden="true" />;
}

function LanguageFlipBoard() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % heroLanguages.length);
    }, 2200);
    return () => clearInterval(id);
  }, [reduce]);

  const current = heroLanguages[index];
  // Les écritures arabes sont cursives : on anime le mot entier pour ne pas
  // casser les ligatures en isolant les lettres.
  const chunks = isRtlWord(current.word) ? [current.word] : current.word.split('');

  return (
    <span
      className="sfr-flip-board"
      role="img"
      aria-label={`langue : ${heroLanguages.map((l) => l.word).join(', ')}`}
    >
      <span className="sfr-flip-letters" aria-hidden="true">
        {reduce ? (
          <span className="sfr-flip-word" style={{ color: current.color }}>{current.word}</span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${current.word}-${index}`}
              className="sfr-flip-word"
              layout="position"
              dir={isRtlWord(current.word) ? 'rtl' : undefined}
              style={{ color: current.color }}
            >
              {chunks.map((char, charIndex) => (
                <motion.span
                  key={charIndex}
                  className="sfr-flip-letter"
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-110%', opacity: 0 }}
                  transition={{ duration: 0.45, delay: charIndex * 0.025, ease: [0.22, 1, 0.36, 1] }}
                >
                  {char === ' ' ? ' ' : char}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
      <span className="sfr-flip-flag" aria-hidden="true">
        <FlagIcon code={current.flag} />
      </span>
    </span>
  );
}

function HeroSection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '10%']);

  return (
    <section ref={ref} className="sfr-hero" aria-label="Accueil SAFARUMA">
      <motion.div className="sfr-hero-media" style={{ y }}>
        <Image
          src="/images/landing/hero-kaaba-main.jpg"
          alt="Kaaba à La Mecque au coucher du soleil"
          fill
          priority
          sizes="100vw"
          className="sfr-hero-img"
        />
      </motion.div>
      <div className="sfr-hero-shade" aria-hidden="true" />

      <div className="sfr-hero-content">
        <motion.div
          className="sfr-hero-copy"
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_LUXURY }}
        >
          <h1>
            Une Omra,
            <br />
            un guide privé
            <br />
            <span className="sfr-hero-language-line">
              qui parle{' '}
              <LanguageFlipBoard />
            </span>
          </h1>
          <p className="sfr-pill">
            Guides privés certifiés
          </p>
          <p className="sfr-hero-lead">
            <span>Guide certifié à La Mecque et Médine.</span>{' '}
            <span>Visite des lieux saints et sites historiques.</span>
          </p>
          <div className="sfr-hero-actions">
            <Link href="/guides" className="sfr-btn sfr-btn-gold">
              Trouver mon guide →
            </Link>
            <button className="sfr-btn sfr-btn-glass" type="button">
              <span className="sfr-play">▶</span> Voir la vidéo <small>2 min</small>
            </button>
          </div>
          <div className="sfr-mini-proof">
            <div className="sfr-avatar-stack" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <button className="sfr-video-mobile" type="button">
              <span className="sfr-play">▶</span>
              Vidéo
            </button>
            <p>
              <span><strong>147+</strong> sont partis en Omra</span>{' '}
              <span>cette semaine</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PartnersSection() {
  return (
    <section className="sfr-partners" aria-label="Partenaires">
      <Carousel label="Partenaires SAFARUMA" className="sfr-partners-carousel">
        {partners.map((partner) => (
          <motion.div key={partner.name} className="sfr-partner-card" whileHover={{ y: -3 }}>
            <Image src={partner.image} alt={partner.name} width={190} height={62} className="sfr-partner-logo" />
          </motion.div>
        ))}
      </Carousel>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="sfr-problem">
      <div className="sfr-problem-stage">
        <Image
          src="/images/landing/problem-bus.jpg"
          alt=""
          fill
          sizes="100vw"
          className="sfr-problem-bg"
          aria-hidden="true"
        />
        <div className="sfr-problem-image" aria-hidden="true" />
        <Reveal className="sfr-problem-copy" delay={0.08}>
          <div className="sfr-problem-kicker">
            <span aria-hidden="true">!</span>
            <p>Le problème</p>
          </div>
          <h2>
            <span>Le poids</span>
            <em>du groupe.</em>
          </h2>
          <div className="sfr-problem-rule" aria-hidden="true" />
          <div className="sfr-problem-points">
            <div>
              <span aria-hidden="true">?</span>
              <p>Un guide moins<br />disponible pour toi.</p>
            </div>
            <div>
              <span aria-hidden="true">∅</span>
              <p>Toujours lié au<br />rythme du groupe.</p>
            </div>
            <div>
              <span aria-hidden="true">▧</span>
              <p>Un programme<br />figé, imposé.</p>
            </div>
          </div>
          <div className="sfr-problem-promise">
            <span aria-hidden="true">⌂</span>
            <p>
              Construis ton programme avec ton guide,
              <em> à ton rythme, en toute liberté.</em>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WhySection({ openModal }: { openModal: (item: ModalContent) => void }) {
  return (
    <section className="sfr-section sfr-section-beige">
      <div className="sfr-section-layout">
        <Reveal className="sfr-section-title">
          <p className="sfr-eyebrow">Pourquoi choisir SAFARUMA</p>
          <h2>
            Bien plus qu’un guide,
            <br />
            <em>une expérience unique.</em>
          </h2>
          <Link href="/guides" className="sfr-btn sfr-btn-outline sfr-title-action">
            Trouver mon guide →
          </Link>
        </Reveal>
        <Carousel label="Pourquoi choisir SAFARUMA">
          {whyCards.map((card) => (
            <motion.button
              type="button"
              key={card.id}
              className="sfr-info-card"
              whileHover={{ y: -5 }}
              onClick={() =>
                openModal({
                  eyebrow: 'Pourquoi choisir SAFARUMA',
                  title: card.title,
                  text: card.text,
                  href: card.href,
                  cta: card.cta ?? 'En savoir plus',
                })
              }
            >
              <div className="sfr-photo-card-media">
                <SmartImage src={card.image} alt={card.title} />
              </div>
              <div className="sfr-photo-card-overlay">
                <span className="sfr-card-icon">{card.icon}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <small>En savoir plus →</small>
              </div>
            </motion.button>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

function GuidesSection({ openModal }: { openModal: (item: ModalContent) => void }) {
  return (
    <section className="sfr-section sfr-section-dark">
      <div className="sfr-section-layout">
        <Reveal className="sfr-section-title">
          <p className="sfr-eyebrow">Nos guides privés</p>
          <h2>
            Des guides certifiés
            <br />
            <em>dans ta langue.</em>
          </h2>
          <Link href="/guides" className="sfr-btn sfr-btn-outline sfr-title-action sfr-title-action-light">
            Voir tous les guides
          </Link>
        </Reveal>
        <Carousel label="Guides privés SAFARUMA">
          {guides.map((guide, index) => (
            <motion.button
              type="button"
              key={guide.id}
              className={`sfr-guide-card${guide.kind === 'feature' ? ' sfr-guide-card-feature' : ''}`}
              whileHover={{ y: -6 }}
              onClick={() =>
                openModal({
                  eyebrow: 'Guide privé',
                  title: guide.title,
                  text: guide.text,
                  href: guide.href,
                  cta: guide.cta ?? 'Voir le profil complet',
                  meta: guide.meta,
                  image: guide.image,
                  badges: guide.badges,
                  highlights: guide.highlights,
                  price: guide.price,
                })
              }
            >
              {guide.kind === 'feature' ? (
                <div className="sfr-guide-feature">
                  <span className="sfr-card-icon">{guide.icon}</span>
                  <h3>{guide.title}</h3>
                  <p>{guide.text}</p>
                  <small>{guide.cta} →</small>
                </div>
              ) : (
                <>
                  <div className="sfr-guide-photo">
                    {guide.id === 'naim-laamari' ? (
                      <SmartImage src={guide.image} alt={`Guide ${guide.title}`} />
                    ) : (
                      <Image
                        src="/guide-badge.jpg"
                        alt=""
                        fill
                        sizes="245px"
                        className="sfr-guide-badge-image"
                      />
                    )}
                  </div>
                  {guide.id === 'naim-laamari' ? (
                    <>
                      <div className="sfr-guide-trust sfr-guide-trust-compact">
                        ★ OFFICIEL SAFARUMA <span className="sfr-guide-status-ring">VÉRIFIÉ ✓</span>
                      </div>
                      <div className="sfr-guide-meta-row">{guide.title} · Madinah · 8 ans</div>
                      <div className="sfr-guide-rating sfr-guide-rating-compact">★★★★★ <strong>5.0</strong> · Français 🇫🇷 · Arabe 🇸🇦 · Algérien 🇩🇿</div>
                    </>
                  ) : (
                    <>
                      <div className="sfr-guide-trust">
                        <span>VÉRIFIÉ ✓</span>
                      </div>
                      <h3>{guide.title}</h3>
                      <p>
                        {guide.meta}{' '}
                        <span className="sfr-flags">
                          {['🇫🇷 🇸🇦', '', '🇬🇧 🇸🇦', '🇹🇷 🇸🇦', '🇮🇩 🇸🇦', '🇪🇸 🇸🇦'][index]}
                        </span>
                      </p>
                    </>
                  )}
                  <span className="sfr-guide-profile-btn">Voir le profil →</span>
                </>
              )}
            </motion.button>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

function ExperiencesSection({ openModal }: { openModal: (item: ModalContent) => void }) {
  return (
    <section className="sfr-section sfr-section-beige">
      <div className="sfr-section-layout">
        <Reveal className="sfr-section-title">
          <p className="sfr-eyebrow">Expériences exclusives</p>
          <h2>
            Découvrez des lieux
            <br />
            que les agences
            <br />
            ne montrent pas.
          </h2>
          <Link href="/lieux-saints" className="sfr-btn sfr-btn-outline sfr-title-action">
            Explorer tous les lieux →
          </Link>
        </Reveal>
        <Carousel label="Expériences exclusives">
          {experiences.map((experience) => (
            <motion.button
              type="button"
              key={experience.id}
              className="sfr-experience-card"
              whileHover={{ y: -5 }}
              onClick={() =>
                openModal({
                  eyebrow: 'Expérience exclusive',
                  title: experience.title,
                  text: experience.text,
                  href: experience.href,
                  cta: experience.cta ?? 'Voir plus',
                  image: experience.image,
                })
              }
            >
              {experience.image ? (
                <SmartImage src={experience.image} alt={experience.title} />
              ) : (
                <div className="sfr-place-art" aria-hidden="true">
                  <span>{experience.icon ?? '۞'}</span>
                </div>
              )}
              <span>{experience.title}</span>
            </motion.button>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

function StepsSection({ openModal }: { openModal: (item: ModalContent) => void }) {
  return (
    <section className="sfr-section sfr-section-dark">
      <div className="sfr-section-layout">
        <Reveal className="sfr-section-title">
          <p className="sfr-eyebrow">Ton parcours Omra</p>
          <h2>
            On t’accompagne
            <br />
            <em>à chaque étape.</em>
          </h2>
          <Link href="/inscription" className="sfr-btn sfr-btn-outline sfr-title-action sfr-title-action-light">
            Créer ton espace gratuitement →
          </Link>
        </Reveal>
        <Carousel label="Ton parcours Omra" auto={false}>
          {steps.map((step, index) => (
            <motion.button
              type="button"
              key={step.id}
              className="sfr-step-card"
              whileHover={{ y: -5 }}
              onClick={() =>
                openModal({
                  eyebrow: step.meta ?? 'Parcours Omra',
                  title: step.title,
                  text: step.text,
                  href: step.href,
                  cta: step.cta ?? 'Voir plus',
                })
              }
            >
              <div className="sfr-photo-card-media">
                <SmartImage src={step.image} alt={step.title} />
              </div>
              <div className="sfr-photo-card-overlay">
                <span className="sfr-step-num">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </motion.button>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

function ReviewsSection({ openModal }: { openModal: (item: ModalContent) => void }) {
  return (
    <section id="avis" className="sfr-section sfr-section-beige">
      <div className="sfr-section-layout">
        <Reveal className="sfr-section-title">
          <p className="sfr-eyebrow">Ils nous font confiance</p>
          <h2>
            Leur expérience,
            <br />
            notre plus belle récompense.
          </h2>
          <p className="sfr-rating-line">★★★★★ 4.9 · 709 avis vérifiés</p>
          <Link href="#avis" className="sfr-btn sfr-btn-outline sfr-title-action sfr-review-link">
            Voir tous les avis →
          </Link>
        </Reveal>
        <Carousel label="Avis clients">
          {reviews.map((review) => (
            <motion.button
              type="button"
              key={review.id}
              className="sfr-review-card"
              whileHover={{ y: -5 }}
              onClick={() =>
                openModal({
                  eyebrow: 'Avis client',
                  title: review.title,
                  text: review.text,
                  href: review.href,
                  cta: review.cta ?? 'Voir les avis',
                  meta: review.meta,
                  image: review.image,
                })
              }
            >
              <div className="sfr-review-photo">
                <SmartImage src={review.image} alt={`Avis de ${review.title}`} />
              </div>
              <div className="sfr-review-overlay">
                <p>{review.text}</p>
                <div className="sfr-review-head">
                  <div>
                    <h3>{review.title}</h3>
                    <p>{review.meta}</p>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="sfr-final-cta">
      <Image src="/images/landing/cta-bg.jpg" alt="" fill sizes="100vw" className="sfr-final-cta-img" />
      <div className="sfr-final-cta-shade" />
      <Reveal className="sfr-final-cta-content">
        <h2>
          Prêt à vivre une Omra
          <br />
          qui changera ta vie ?
        </h2>
        <p>Réserve ton guide privé dès maintenant et profite d’une expérience unique, humaine et spirituelle.</p>
        <div className="sfr-mini-proof sfr-final-proof">
          <div className="sfr-avatar-stack" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p>
            <strong>147+</strong> sont partis en Omra cette semaine
          </p>
        </div>
        <div className="sfr-final-actions">
          <Link href="/guides" className="sfr-btn sfr-btn-gold">
            Trouver mon guide →
          </Link>
          <Link href="/guides" className="sfr-btn sfr-btn-glass">
            Voir tous les guides →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  return (
    <div className="sfr-page">
      <Navbar darkHeroMode scrollThreshold={60} />
      <HeroSection />
      <PartnersSection />
      <ProblemSection />
      <WhySection openModal={setModalContent} />
      <GuidesSection openModal={setModalContent} />
      <ExperiencesSection openModal={setModalContent} />
      <StepsSection openModal={setModalContent} />
      <ReviewsSection openModal={setModalContent} />
      <FinalCtaSection />
      <Footer />
      <Modal content={modalContent} onClose={() => setModalContent(null)} />
    </div>
  );
}
