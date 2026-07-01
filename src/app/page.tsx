'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CookiePrefsButton from '@/components/CookiePrefsButton';

const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;

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
  { name: 'Ministère du Hajj', text: 'وزارة الحج والعمرة' },
  { name: 'Saudia', image: '/images/landing/partner-saudia.png' },
  { name: 'Flynas', image: '/images/landing/partner-flynas.png' },
  { name: 'Hilton', image: '/images/landing/partner-hilton.png' },
];

const whyCards: CarouselItem[] = [
  {
    id: 'langue',
    icon: '◆',
    title: 'Guide dans ta langue',
    text: 'Tu choisis ton guide selon sa langue maternelle. Français, Wolof, Darija, Turc — ton guide te parle comme un ami, pas comme un conférencier.',
    href: '/guides',
    cta: 'Trouver mon guide',
  },
  {
    id: 'guides-experts',
    icon: '۞',
    title: 'Guides experts',
    text: 'Guides certifiés, passionnés et habitués du terrain pour une Omra claire, authentique et apaisée.',
    href: '/guides-certifies',
    cta: 'En savoir plus',
  },
  {
    id: 'famille',
    icon: '1',
    title: 'En famille',
    text: "Je veux emmener mes proches mais j'ai peur de mal organiser.",
    href: '/guides',
    cta: 'Trouver un guide famille',
  },
  {
    id: 'parents',
    icon: '2',
    title: 'Pour mes parents',
    text: 'SVP prenez soin de mes parents. — Ces mots que vous direz à leur guide.',
    href: '/guides',
    cta: 'Trouver un guide rassurant',
  },
  {
    id: 'premiere-omra',
    icon: '3',
    title: 'Ma 1ère Omra',
    text: 'Je prie, je jeûne. Je veux enfin faire la Omra mais je ne sais pas par où commencer.',
    href: '/guide-omra',
    cta: 'Préparer ma Omra',
  },
  {
    id: 'pmr',
    icon: '♿',
    title: 'Service PMR & assistance',
    text: 'Fauteuil roulant, enfants, personnes âgées, rythme adapté et logistique pensée avant le départ.',
    href: '/omra-pmr',
    cta: 'En savoir plus',
  },
  {
    id: 'unique',
    icon: '✦',
    title: 'Expérience unique',
    text: 'Accédez à des lieux et moments que les grands groupes ne peuvent pas vivre sereinement.',
    href: '/omra-avec-guide-prive',
    cta: 'En savoir plus',
  },
  {
    id: 'personnalise',
    icon: '☾',
    title: 'Service personnalisé',
    text: 'Un parcours humain, intime et sur-mesure pour comprendre chaque geste au lieu de simplement suivre.',
    href: '/histoire-premiere-omra',
    cta: 'En savoir plus',
  },
  {
    id: 'assistance',
    icon: '◌',
    title: 'Assistance en temps réel',
    text: 'On répond à toutes vos questions. Nos guides et nos équipes restent disponibles pour que votre voyage soit le plus agréable possible.',
    href: '/contact',
    cta: 'Nous contacter',
  },
  {
    id: 'remplacement',
    icon: '✓',
    title: 'Garantie remplacement',
    text: 'Si ton guide ne peut pas venir pour une urgence, on te trouve un guide équivalent certifié en moins de 2 heures.',
    href: '/guides',
    cta: 'Trouver mon guide',
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
    text: 'Biographie complète, certifications vérifiées, avis authentiques, lieux couverts et taux de retour. Tu sais exactement qui tu vas rencontrer.',
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
    meta: 'Anglais + Arabe',
    cta: 'Voir les guides disponibles',
  },
  {
    id: 'ibrahim',
    title: 'Ibrahim',
    text: 'Profil turcophone et arabe, pensé pour les visiteurs qui veulent poser leurs questions sans barrière.',
    href: '/guides',
    meta: 'Turc + Arabe',
    cta: 'Voir les guides disponibles',
  },
  {
    id: 'muhammad',
    title: 'Muhammad',
    text: 'Guide indonésien et arabe pour une Omra calme, structurée et adaptée aux familles.',
    href: '/guides',
    meta: 'Indonésien + Arabe',
    cta: 'Voir les guides disponibles',
  },
  {
    id: 'rachid',
    title: 'Rachid',
    text: 'Accompagnement espagnol et arabe pour découvrir les rites et les lieux avec plus de profondeur.',
    href: '/guides',
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
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'rawdah',
    icon: 'روضة',
    title: 'Rawdah',
    text: 'Un moment très demandé à Médine. Le guide explique le contexte, l’organisation et les bonnes attentes.',
    href: '/lieux-saints',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'quba',
    icon: 'قباء',
    title: 'Masjid Quba',
    text: 'La première mosquée bâtie dans l’histoire de l’Islam, un lieu essentiel pour comprendre Médine.',
    href: '/lieux-saints',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'uhud',
    icon: 'أحد',
    title: 'Mont Uhud',
    text: 'Un lieu fort de l’histoire islamique, souvent visité à Médine pour comprendre les compagnons et leurs sacrifices.',
    href: '/lieux-saints',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'badr',
    icon: 'بدر',
    title: 'Badr',
    text: 'Plus éloigné, mais spirituellement majeur. Certains itinéraires peuvent l’inclure selon timing, autorisations et organisation.',
    href: '/lieux-saints',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'hira',
    icon: 'حراء',
    title: 'Grotte de Hira',
    text: 'Là où la première révélation coranique fut révélée. Ton guide replace le lieu dans son contexte spirituel.',
    href: '/lieux-saints',
    image: '/images/landing/experience-historique.jpg',
    cta: 'Explorer tous les lieux',
  },
  {
    id: 'arafat',
    icon: 'عرفات',
    title: 'Arafat & Jabal Rahmah',
    text: 'Un repère fondamental du Hajj, expliqué avec simplicité même pendant une Omra.',
    href: '/lieux-saints',
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
    cta: 'Voir plus',
  },
  {
    id: 'preparation',
    title: 'Préparation & conseils',
    text: 'Visa, hébergement, checklist, rythme de la famille, questions de rite et contraintes terrain.',
    href: '/guide-omra',
    meta: 'Étape 2',
    cta: 'Voir plus',
  },
  {
    id: 'arrivee',
    title: 'Accueil personnalisé à l’arrivée',
    text: 'Repères dès l’aéroport, installation, premiers conseils pratiques et prise en charge rassurante.',
    href: '/services/transfert',
    meta: 'Étape 3',
    cta: 'Voir plus',
  },
  {
    id: 'visites',
    title: 'Accompagnement visites guidées privées',
    text: 'Lieux saints, sites historiques et explications adaptées à ta langue, ton niveau et ton rythme.',
    href: '/lieux-saints',
    meta: 'Étape 4',
    cta: 'Voir plus',
  },
  {
    id: 'apres',
    title: 'Après l’Omra',
    text: 'Suivi, conseils, souvenirs et continuité spirituelle pour ne pas repartir avec seulement des photos.',
    href: '/espace/tableau-de-bord',
    meta: 'Étape 5',
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
    image: '/images/landing/experience-historique.jpg',
    cta: 'Voir les avis',
  },
  {
    id: 'safia-live',
    title: 'Safia M.',
    text: 'En tant que groupe de femmes, nous avions des appréhensions. Fatima a tout géré avec une douceur et une compétence incroyables.',
    href: '#avis',
    meta: '★★★★★',
    image: '/images/landing/experience-rencontres.jpg',
    cta: 'Voir les avis',
  },
  {
    id: 'ibrahima-live',
    title: 'Ibrahima D.',
    text: "Youssouf parle Wolof, connaît les histoires que nos anciens nous ont transmises, et les relie aux lieux saints. Toute la famille est repartie transformée.",
    href: '#avis',
    meta: '★★★★★',
    image: '/images/landing/experience-spirituel.jpg',
    cta: 'Voir les avis',
  },
  {
    id: 'meryem',
    title: 'Meryem B.',
    text: 'Une expérience incroyable. Notre guide a pris le temps d’expliquer chaque étape, de répondre aux questions de mes parents et de rendre la Omra plus profonde.',
    href: '#avis',
    meta: '★★★★★',
    image: '/images/landing/testi-bg.jpg',
    cta: 'Voir les avis',
  },
  {
    id: 'converti',
    title: 'Nadir C.',
    text: "Tout juste converti, j'ai découvert la Omra sans me sentir perdu. Le guide expliquait chaque étape avec patience et respect.",
    href: '#avis',
    meta: '★★★★★',
    image: '/images/landing/mosque-bg-beige.jpg',
    cta: 'Voir les avis',
  },
  {
    id: 'hesitation',
    title: 'Samira H.',
    text: "J'ai hésité longtemps, je pensais que ce n'était pas le bon moment. L'accompagnement m'a rassurée dès la préparation.",
    href: '#avis',
    meta: '★★★★★',
    image: '/images/landing/cta-bg.jpg',
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
  const items = React.Children.toArray(children);

  const scrollBy = (direction: number) => {
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
        className="sfr-carousel-arrow sfr-carousel-arrow--left"
        onClick={() => scrollBy(-1)}
        aria-label={`${label} précédent`}
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
        className="sfr-carousel-arrow sfr-carousel-arrow--right"
        onClick={() => scrollBy(1)}
        aria-label={`${label} suivant`}
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

function TrustIcon({ type }: { type: 'check' | 'shield' | 'accessibility' }) {
  if (type === 'shield') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    );
  }
  if (type === 'accessibility') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
        <path d="M7.5 10.5c.621 0 1.125.504 1.125 1.125V15l-1.6 3.2a1.125 1.125 0 0 0 2.01 1.005L10.5 16.5h3l1.465 2.71a1.125 1.125 0 1 0 2.01-1.005l-1.6-3.2V11.13A1.125 1.125 0 0 0 14.25 10h-3.75a1.125 1.125 0 0 0-1.125 1.125v-.375A1.125 1.125 0 0 0 8.25 9.75H7.5a1.125 1.125 0 0 0-1.125 1.125v.375C6.375 11.91 6.879 12 7.5 12" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function SocialIcon({ type }: { type: 'instagram' | 'tiktok' | 'youtube' | 'x' | 'snapchat' | 'pinterest' | 'linkedin' }) {
  if (type === 'instagram') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  if (type === 'tiktok') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.97a8.27 8.27 0 0 0 4.84 1.54V7.08a4.85 4.85 0 0 1-1.07-.39Z" />
      </svg>
    );
  }
  if (type === 'youtube') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
      </svg>
    );
  }
  if (type === 'x') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
      </svg>
    );
  }
  if (type === 'pinterest') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0Z" />
      </svg>
    );
  }
  if (type === 'snapchat') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C8.61 2 6 4.77 6 8.2v.8c-.56.07-1.08.33-1.44.73-.34.38-.5.86-.44 1.34.12.95.87 1.67 1.88 1.82-.5 1.03-1.35 1.87-2.4 2.29-.3.12-.47.43-.38.74.08.27.32.44.6.44.05 0 .1 0 .15-.02.17-.04.34-.09.51-.14.55-.16 1.12-.24 1.7-.24.32 0 .63.03.93.08-.2.66-.31 1.36-.31 2.08 0 .3.24.55.55.55H12h5.65c.3 0 .55-.25.55-.55 0-.72-.11-1.42-.31-2.08.3-.05.61-.08.93-.08.58 0 1.15.08 1.7.24.17.05.34.1.51.14.05.01.1.02.15.02.28 0 .52-.17.6-.44.09-.31-.08-.62-.38-.74-1.05-.42-1.9-1.26-2.4-2.29 1.01-.15 1.76-.87 1.88-1.82.06-.48-.1-.96-.44-1.34-.36-.4-.88-.66-1.44-.73v-.8C18 4.77 15.39 2 12 2Z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

function PaymentMark({ type }: { type: 'visa' | 'mastercard' | 'apple' | 'paypal' | 'amex' | 'bancontact' }) {
  if (type === 'mastercard') {
    return (
      <svg viewBox="0 0 42 20" aria-label="Mastercard" role="img">
        <circle cx="17" cy="10" r="7" />
        <circle cx="25" cy="10" r="7" />
      </svg>
    );
  }
  if (type === 'apple') {
    return (
      <svg viewBox="0 0 56 20" aria-label="Apple Pay" role="img">
        <path d="M11.4 5.2c.7-.9 1.2-2 1.1-3.2-1 .1-2.1.7-2.8 1.5-.6.7-1.2 1.9-1 3 .9.1 2-.5 2.7-1.3Z" />
        <path d="M12.5 6.7c-1.5-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.6 0-3 1-3.8 2.5-1.6 2.8-.4 7 1.1 9.2.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.8-1.2c.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.8 0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.8-3.5-1.8Z" />
        <text x="25" y="14">Pay</text>
      </svg>
    );
  }
  if (type === 'bancontact') {
    return (
      <svg viewBox="0 0 68 20" aria-label="Bancontact" role="img">
        <path d="M4 12h22l7-7h31" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M4 16h22l7-7h31" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      </svg>
    );
  }
  const label = type === 'visa' ? 'VISA' : type === 'paypal' ? 'PayPal' : 'AMEX';
  return (
    <svg viewBox="0 0 58 20" aria-label={label} role="img">
      <text x="29" y="13" textAnchor="middle">{label}</text>
    </svg>
  );
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
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_LUXURY }}
        >
          <p className="sfr-pill">Guides privés certifiés · 17 langues</p>
          <h1>
            Une Omra,
            <br />
            un guide privé
            <br />
            <em>dans ta langue.</em>
          </h1>
          <p className="sfr-hero-lead">
            Guide certifié à La Mecque et Médine. Visite des lieux saints, sites historiques et endroits que les
            agences Omra ne montrent pas.
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
            <p>
              <strong>147</strong> pèlerins ont réservé cette semaine
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
            {'image' in partner && partner.image ? (
              <Image src={partner.image} alt={partner.name} width={190} height={62} className="sfr-partner-logo" />
            ) : (
              <div className="sfr-partner-text">
                <strong>{partner.name}</strong>
                <span>{partner.text}</span>
              </div>
            )}
          </motion.div>
        ))}
      </Carousel>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="sfr-problem">
      <div className="sfr-problem-grid">
        <Reveal className="sfr-problem-image">
          <Image src="/images/landing/testi-bg.jpg" alt="Groupe de pèlerins dans un bus" fill sizes="(max-width: 768px) 100vw, 45vw" />
        </Reveal>
        <Reveal className="sfr-problem-copy" delay={0.08}>
          <p className="sfr-eyebrow">Le Problème</p>
          <h2>
            35 personnes dans un bus.
            <br />
            <em>Tu imites les gestes de ceux devant toi…</em>
          </h2>
          <p>
            Pas de réponses à tes questions. Pas de compréhension profonde. Tu rentres avec des photos, mais sans
            transformation. L’Omra mérite mieux que ça.
          </p>
        </Reveal>
        <Reveal className="sfr-problem-symbol" delay={0.16}>
          <div>♡</div>
          <p>Une expérience unique mérite un accompagnement unique.</p>
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
              <span className="sfr-card-icon">{card.icon}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <small>En savoir plus →</small>
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
                    <SmartImage src={guide.image} alt={`Guide ${guide.title}`} />
                    {!guide.image && <span className="sfr-guide-initial">{guide.title.slice(0, 1)}</span>}
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
        <Carousel label="Ton parcours Omra">
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
              <span className="sfr-step-num">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
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
                  <span className="sfr-review-avatar">{review.title.slice(0, 1)}</span>
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
            <strong>147</strong> pèlerins ont réservé cette semaine
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

function HomeFooter() {
  return (
    <footer className="sfr-footer">
      <div className="sfr-footer-trust" aria-label="Garanties SAFARUMA">
        <div>
          <TrustIcon type="check" />
          Guides certifiés SAFARUMA
        </div>
        <div>
          <TrustIcon type="shield" />
          Paiement sécurisé
        </div>
        <div>
          <TrustIcon type="accessibility" />
          Accessibilité PMR
        </div>
      </div>
      <div className="sfr-footer-payment-logos" aria-label="Moyens de paiement acceptés">
        <PaymentMark type="visa" />
        <PaymentMark type="mastercard" />
        <PaymentMark type="apple" />
        <PaymentMark type="paypal" />
        <PaymentMark type="amex" />
        <PaymentMark type="bancontact" />
      </div>
      <div className="sfr-footer-inner">
        <div className="sfr-footer-brand">
          <Link href="/" className="sfr-footer-logo">
            SAFAR<span>U</span>MA
          </Link>
          <p>
            Guides privés certifiés à La Mecque et Médine. Visite des lieux saints et sites historiques en plusieurs
            langues.
          </p>
        </div>

        <div className="sfr-footer-col">
          <h4>Navigation</h4>
          <Link href="/guides">Guides privés</Link>
          <Link href="/lieux-saints">Destinations</Link>
          <Link href="/a-propos">À propos</Link>
          <Link href="/blog">Ressources</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div className="sfr-footer-col">
          <h4>Ressources</h4>
          <Link href="/guide-omra">Guide PDF gratuit</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/cgu">Conditions générales</Link>
          <Link href="/confidentialite">Politique de confidentialité</Link>
          <CookiePrefsButton />
        </div>

        <div className="sfr-footer-col">
          <h4>Légal</h4>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/conditions-clients">Conditions Clients</Link>
          <Link href="/charte-islamique">Charte Islamique</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <div className="sfr-footer-social-section">
        <div>Suivez-nous</div>
        <div className="sfr-footer-socials" aria-label="Réseaux sociaux">
          <a href="https://www.instagram.com/safaruma_" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <SocialIcon type="instagram" />
          </a>
          <a href="https://www.tiktok.com/@safaruma" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <SocialIcon type="tiktok" />
          </a>
          <a href="https://x.com/safaruma" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
            <SocialIcon type="x" />
          </a>
          <a href="https://www.snapchat.com/add/safaruma" target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
            <SocialIcon type="snapchat" />
          </a>
          <a href="https://youtube.com/@safaruma" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <SocialIcon type="youtube" />
          </a>
          <a href="https://pin.it/2AfX27PBM" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
            <SocialIcon type="pinterest" />
          </a>
          <a href="https://www.linkedin.com/company/safaruma" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <SocialIcon type="linkedin" />
          </a>
        </div>
      </div>
      <div className="sfr-footer-bottom">
        © 2026 HOLDINGAI LTD · SAFARUMA est une marque de HOLDINGAI LTD · Co. No. 16382871 · England &amp; Wales
      </div>
    </footer>
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
      <HomeFooter />
      <Modal content={modalContent} onClose={() => setModalContent(null)} />
    </div>
  );
}
