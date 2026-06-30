'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;

type ModalContent = {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  meta?: string;
  image?: string;
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
    id: 'guides-experts',
    icon: '۞',
    title: 'Guides experts',
    text: 'Guides certifiés, passionnés et habitués du terrain pour une Omra claire, authentique et apaisée.',
    href: '/guides-certifies',
    cta: 'En savoir plus',
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
];

const guides: CarouselItem[] = [
  {
    id: 'naim-laamari',
    title: 'Naïm',
    text: 'Guide terrain SAFARUMA à Makkah, idéal pour une première Omra en français et arabe.',
    href: '/guides/naim-laamari',
    image: '/images/landing/guide-naim-laamari.jpg',
    meta: 'Français + Arabe',
    cta: 'Voir le profil complet',
  },
  {
    id: 'youssef',
    title: 'Youssef',
    text: 'Accompagnement anglophone et arabe pour pèlerins internationaux, familles et petits groupes.',
    href: '/guides/youssef',
    meta: 'Anglais + Arabe',
    cta: 'Voir le profil complet',
  },
  {
    id: 'ibrahim',
    title: 'Ibrahim',
    text: 'Profil turcophone et arabe, pensé pour les visiteurs qui veulent poser leurs questions sans barrière.',
    href: '/guides/ibrahim',
    meta: 'Turc + Arabe',
    cta: 'Voir le profil complet',
  },
  {
    id: 'muhammad',
    title: 'Muhammad',
    text: 'Guide indonésien et arabe pour une Omra calme, structurée et adaptée aux familles.',
    href: '/guides/muhammad',
    meta: 'Indonésien + Arabe',
    cta: 'Voir le profil complet',
  },
  {
    id: 'rachid',
    title: 'Rachid',
    text: 'Accompagnement espagnol et arabe pour découvrir les rites et les lieux avec plus de profondeur.',
    href: '/guides/rachid',
    meta: 'Espagnol + Arabe',
    cta: 'Voir le profil complet',
  },
];

const experiences: CarouselItem[] = [
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
    id: 'meryem',
    title: 'Meryem B.',
    text: 'Une expérience incroyable. Notre guide a pris le temps d’expliquer chaque étape, de répondre aux questions de mes parents et de rendre la Omra plus profonde.',
    href: '/avis',
    meta: '★★★★★',
    cta: 'Voir tous les avis',
  },
  {
    id: 'karim',
    title: 'Karim L.',
    text: 'Grâce à SAFARUMA, j’ai découvert des lieux magnifiques que les agences classiques ne montrent pas. On sent que le parcours a été pensé pour nous.',
    href: '/avis',
    meta: '★★★★★',
    cta: 'Voir tous les avis',
  },
  {
    id: 'amina',
    title: 'Amina S.',
    text: 'Service impeccable du début à la fin. On se sent accompagné comme en famille, même à l’autre bout du monde.',
    href: '/avis',
    meta: '★★★★★',
    cta: 'Voir tous les avis',
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
  const [paused, setPaused] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

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
    if (!auto || paused || reduce || coarsePointer) return;
    const id = window.setInterval(() => {
      const el = ref.current;
      if (!el) return;
      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 24;
      el.scrollTo({ left: nearEnd ? 0 : el.scrollLeft + Math.min(320, el.clientWidth * 0.72), behavior: 'smooth' });
    }, 3600);
    return () => window.clearInterval(id);
  }, [auto, paused, reduce, coarsePointer]);

  return (
    <div
      className={`sfr-carousel-shell ${className ?? ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => window.setTimeout(() => setPaused(false), 1200)}
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
        {children}
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
            <Link href="/reservation" className="sfr-btn sfr-btn-gold">
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
        <div className="sfr-partner-label">En partenariat avec</div>
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
          <Link href="/guides" className="sfr-btn sfr-btn-outline">
            Voir tous les guides
          </Link>
        </Reveal>
        <Carousel label="Guides privés SAFARUMA">
          {guides.map((guide, index) => (
            <motion.button
              type="button"
              key={guide.id}
              className="sfr-guide-card"
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
                })
              }
            >
              <div className="sfr-guide-photo">
                <SmartImage src={guide.image} alt={`Guide ${guide.title}`} />
                {!guide.image && <span className="sfr-guide-initial">{guide.title.slice(0, 1)}</span>}
              </div>
              <h3>{guide.title}</h3>
              <p>
                {guide.meta}{' '}
                <span className="sfr-flags">
                  {['🇫🇷 🇸🇦', '🇬🇧 🇸🇦', '🇹🇷 🇸🇦', '🇮🇩 🇸🇦', '🇪🇸 🇸🇦'][index]}
                </span>
              </p>
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
              <SmartImage src={experience.image} alt={experience.title} />
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
    <section className="sfr-section sfr-section-beige">
      <div className="sfr-section-layout">
        <Reveal className="sfr-section-title">
          <p className="sfr-eyebrow">Ils nous font confiance</p>
          <h2>
            Leur expérience,
            <br />
            notre plus belle récompense.
          </h2>
          <p className="sfr-rating-line">★★★★★ 4,96 sur 709 avis vérifiés</p>
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
                  cta: review.cta ?? 'Voir tous les avis',
                  meta: review.meta,
                })
              }
            >
              <div className="sfr-review-head">
                <span className="sfr-review-avatar">{review.title.slice(0, 1)}</span>
                <div>
                  <h3>{review.title}</h3>
                  <p>{review.meta}</p>
                </div>
              </div>
              <p>{review.text}</p>
            </motion.button>
          ))}
        </Carousel>
        <Link href="/avis" className="sfr-btn sfr-btn-outline sfr-review-link">
          Voir tous les avis →
        </Link>
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
          <Link href="/reservation" className="sfr-btn sfr-btn-gold">
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
