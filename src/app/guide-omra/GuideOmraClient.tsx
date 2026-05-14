'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'omra-hajj',    label: 'Omra vs Hajj' },
  { id: 'preparation',  label: 'Préparation' },
  { id: 'rituels',      label: 'Rituels' },
  { id: 'faq',          label: 'FAQ Pratique' },
  { id: 'apres',        label: 'Après la Omra' },
];

export default function GuideOmraClient() {
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState('introduction');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const toggleFaq = (id: string) => setOpenFaq(prev => prev === id ? null : id);
  const isGated = status === 'unauthenticated';

  useEffect(() => {
    const onScroll = () => {
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sec = document.getElementById(SECTIONS[i].id);
        if (sec && sec.getBoundingClientRect().top <= 150) {
          setActiveSection(SECTIONS[i].id);
          return;
        }
      }
      setActiveSection('introduction');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="guide-hero">
        <span className="arabic-bg" aria-hidden="true">عمرة</span>
        <div className="guide-hero-inner">
          <h1>
            La Omra étape par étape
            <span className="hero-subtitle">Rituels, Du&apos;as &amp; Conseils 2026</span>
          </h1>
          <p className="hero-lead">
            De l&apos;Ihram au Tahallul, chaque rituel expliqué simplement, avec ses du&apos;as
            et ses conseils pratiques pour vivre pleinement ce voyage sacré.
          </p>
          <div className="guide-tags">
            <span className="tag-chip">Ihram</span>
            <span className="tag-chip">Tawaf</span>
            <span className="tag-chip">Sa&apos;i</span>
            <span className="tag-chip">Safa-Marwa</span>
          </div>
        </div>
      </section>

      {/* Stepper */}
      <div style={{ background: '#FAF7F0' }}>
        <div className="guide-stepper">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`step-btn ${activeSection === s.id ? 'step-active' : 'step-inactive'}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <article className="guide-content">

        {/* ── INTRODUCTION ── */}
        <section id="introduction">
          <h2>Comprendre la Omra</h2>
          <p>
            La Omra est un <strong>voyage de l&apos;âme</strong> bien plus qu&apos;un simple pèlerinage.
            C&apos;est l&apos;effacement des péchés d&apos;une vie entière, un retour vers Allah ﷻ
            dans les lieux les plus sacrés de l&apos;Islam.
          </p>
          <div className="quote-block">
            <span className="quote-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 5h2v4H3V5zm6 0h2v4H9V5z" fill="#C9A84C"/>
              </svg>
              Hadith
            </span>
            <p>
              Le Prophète a dit : <em>« La Omra jusqu&apos;à la Omra suivante est une expiation
              pour ce qui s&apos;est passé entre elles. »</em> (Bukhari &amp; Muslim).
            </p>
          </div>
          <p>
            Contrairement au Hajj, la Omra peut être accomplie à n&apos;importe quel moment de
            l&apos;année. Elle est considérée comme une sunna mu&apos;akkadah — une pratique fortement
            recommandée par le Prophète ﷺ. Elle comprend quatre rituels fondamentaux : l&apos;entrée
            en état d&apos;Ihram, le Tawaf, le Sa&apos;i, et le Tahallul. Ce guide vous accompagne
            à travers chacun d&apos;eux, avec les du&apos;as correspondants et les conseils pratiques
            des guides certifiés SAFARUMA.
          </p>
        </section>

        {/* ── OMRA VS HAJJ ── */}
        <section id="omra-hajj">
          <span className="label-overline">DIFFÉRENCES ESSENTIELLES</span>
          <h2>Omra vs Hajj</h2>
          <p>
            La Omra et le Hajj sont deux pèlerinages distincts en Islam. Comprendre leurs différences
            est essentiel pour préparer son voyage en toute connaissance de cause et choisir la formule
            adaptée à sa situation.
          </p>

          <div className="cards-grid-2">
          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1l1.5 3.5L12 5l-2.5 2.5.6 3.5L7 9.5 3.9 11l.6-3.5L2 5l3.5-.5L7 1z" stroke="#C9A84C" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>La Omra — Pèlerinage mineur</h3>
              <p>
                La Omra peut être accomplie à n&apos;importe quel moment de l&apos;année. Elle n&apos;est
                pas obligatoire (fard) mais fortement recommandée (sunna mu&apos;akkadah). Elle
                comprend quatre rituels : Ihram, Tawaf (7 tours), Sa&apos;i (7 allers-retours),
                Tahallul. Durée minimale des rituels seuls : 3 à 4 heures. Le séjour complet
                pour visiter les lieux saints dure généralement plusieurs jours.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2L2 5v4l5 3 5-3V5L7 2z" stroke="#C9A84C" strokeWidth="1" strokeLinejoin="round"/>
                <path d="M7 5v5M4.5 6.5L7 5l2.5 1.5" stroke="#C9A84C" strokeWidth="0.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Le Hajj — Pèlerinage majeur</h3>
              <p>
                Le Hajj est le 5e pilier de l&apos;Islam, obligatoire une fois dans la vie pour
                tout musulman adulte, sain et financièrement capable. Il s&apos;effectue
                uniquement en Dhul Hijja (du 8 au 13). Ses rituels supplémentaires incluent
                le séjour à Arafat (pilier central du Hajj), la nuit à Muzdalifah, le séjour
                à Mina et la lapidation des Djamarat. Durée : 5 à 6 jours minimum.
              </p>
            </div>
          </div>
          </div>{/* end cards-grid-2 info */}

          <div className="cards-grid-2">
          <div className="faq-card" onClick={() => toggleFaq('h1')}>
            <div className="faq-header">
              <div className="faq-num">?</div>
              <div className="faq-content"><h3>Quelle est la meilleure période pour la Omra en 2026 ?</h3></div>
              <span className="faq-toggle">{openFaq === 'h1' ? '×' : '+'}</span>
            </div>
            {openFaq === 'h1' && <div className="faq-answer"><p>
                La Omra peut s&apos;accomplir toute l&apos;année. Les mois les moins chargés sont
                Muharram, Safar et Rabi&apos;al-Awwal. Le Ramadan 2026 se déroulera fin
                février–mars, la foule y sera importante mais la récompense spirituelle
                incomparable (le Prophète ﷺ a dit qu&apos;une Omra en Ramadan équivaut en
                récompense à un Hajj, Bukhari). Pour un premier voyage serein, mars–avril ou
                octobre offrent un bon équilibre entre affluence modérée et température agréable.
            </p></div>}
          </div>

          <div className="faq-card" onClick={() => toggleFaq('h2')}>
            <div className="faq-header">
              <div className="faq-num">?</div>
              <div className="faq-content"><h3>Peut-on effectuer plusieurs Omra dans sa vie ?</h3></div>
              <span className="faq-toggle">{openFaq === 'h2' ? '×' : '+'}</span>
            </div>
            {openFaq === 'h2' && <div className="faq-answer"><p>
                Oui, absolument. Le Prophète ﷺ a encouragé à répéter la Omra aussi souvent
                que possible. Chaque Omra acceptée est une expiation des péchés commis depuis
                la précédente. Certains pèlerins effectuent plusieurs Omra par an, chaque
                retour aux Lieux Saints est une opportunité de rapprochement spirituel unique.
            </p></div>}
          </div>
          </div>{/* end cards-grid-2 faq */}
        </section>

        {/* ── CONTENT GATE ── */}
        <div style={{ position: 'relative' }}>
          <div className={isGated ? 'guide-gate-blur' : ''}>

        {/* ── PRÉPARATION ── */}
        <section id="preparation">
          <span className="label-overline">AVANT LE DÉPART</span>
          <h2>La Préparation</h2>
          <p>
            La Omra commence bien avant d&apos;embarquer. Une préparation sérieuse, à la fois
            spirituelle, physique et logistique, fait toute la différence entre un voyage accompli
            mécaniquement et une expérience qui transforme.
          </p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 5l5-3 5 3v6l-5 3-5-3V5z" stroke="#C9A84C" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Il existe 5 Miqats terrestres</h3>
              <p>
                Le Miqat est la frontière sacrée à partir de laquelle l&apos;état d&apos;Ihram devient
                obligatoire. Selon votre itinéraire et votre point de départ, vous franchirez l&apos;un
                de ces 5 Miqats.
              </p>
            </div>
          </div>

          <div className="faq-card" onClick={() => toggleFaq('p1')}>
            <div className="faq-header">
              <div className="faq-num">1</div>
              <div className="faq-content"><h3>Quand dois-je enfiler l&apos;Ihram ?</h3></div>
              <span className="faq-toggle">{openFaq === 'p1' ? '×' : '+'}</span>
            </div>
            {openFaq === 'p1' && <div className="faq-answer"><p>
                Selon votre itinéraire. En général <strong>environ 1h avant le passage du Miqat
                dans l&apos;avion</strong>. L&apos;équipage annoncera le moment précis pour que vous
                ne le franchissiez pas sans être en état de sacralisation.
            </p></div>}
          </div>

          <div className="faq-card" onClick={() => toggleFaq('p2')}>
            <div className="faq-header">
              <div className="faq-num">2</div>
              <div className="faq-content"><h3>Puis-je enlever l&apos;Ihram à l&apos;arrivée pour me reposer ?</h3></div>
              <span className="faq-toggle">{openFaq === 'p2' ? '×' : '+'}</span>
            </div>
            {openFaq === 'p2' && <div className="faq-answer"><p>
                <strong>Non.</strong> Une fois l&apos;Ihram enfilé et la Niyyah prononcée au Miqat,
                vous êtes en état de sacralisation. Vous ne pouvez plus l&apos;enlever avant
                d&apos;avoir accompli la Omra complète. Vous pouvez vous reposer en Ihram, mais
                l&apos;enlever avant la Omra entraîne une pénalité (<em>Fidya</em>).
            </p></div>}
          </div>

          <div className="faq-card" onClick={() => toggleFaq('p3')}>
            <div className="faq-header">
              <div className="faq-num">3</div>
              <div className="faq-content"><h3>Comment prononcer la Niyyah ?</h3></div>
              <span className="faq-toggle">{openFaq === 'p3' ? '×' : '+'}</span>
            </div>
            {openFaq === 'p3' && <div className="faq-answer">
              <p>La Niyyah se prononce au moment du passage du Miqat.</p>
              <div className="arabic-dua">
                <div className="dua-ar">لَبَّيْكَ اللَّهُمَّ عُمْرَةً</div>
                <div className="dua-tr">Labbayka Allahumma &apos;Umratan</div>
                <div className="dua-fr">« Me voici, ô Allah, pour la Omra. »</div>
              </div>
              <p>Suivi du Talbiyah que vous répéterez jusqu&apos;au début du Tawaf.</p>
            </div>}
          </div>

          <div className="faq-card" onClick={() => toggleFaq('p4')}>
            <div className="faq-header">
              <div className="faq-num">4</div>
              <div className="faq-content"><h3>La valise de la Omra — Que prendre ?</h3></div>
              <span className="faq-toggle">{openFaq === 'p4' ? '×' : '+'}</span>
            </div>
            {openFaq === 'p4' && <div className="faq-answer"><p>
                <strong>Pour les hommes :</strong> 2 pièces d&apos;Ihram blanches (une de rechange),
                sandales ouvertes pour l&apos;Ihram, chaussures fermées pour les visites.
                <strong> Pour les femmes :</strong> abaya ample sans coutures ni ornements
                excessifs + hijab, vêtements couvrants pour les sorties.
                <strong> Pour tous :</strong> livret de du&apos;as, médicaments habituels,
                crème solaire halal, gourde pour l&apos;eau de Zamzam, copies du passeport et visa,
                argent liquide en SAR, chargeur universel, couverture légère pour les nuits
                climatisées, masque et lingettes pour les moments de forte affluence.
            </p></div>}
          </div>
        </section>

        {/* ── RITUELS ── */}
        <section id="rituels">
          <span className="label-overline">LE TAWAF</span>
          <h2>Tourner autour de la Kaaba</h2>
          <p>
            Le Tawaf est le premier rituel après l&apos;arrivée à Makkah. Il consiste à effectuer
            7 tours autour de la Kaaba dans le sens antihoraire, en commençant par la Pierre Noire
            (Hajar al-Aswad). C&apos;est un acte d&apos;adoration où le pèlerin se rapproche
            physiquement et spirituellement du centre du monde musulman.
          </p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4" stroke="#C9A84C" strokeWidth="1"/>
                <circle cx="7" cy="7" r="1.5" fill="#C9A84C"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>7 tours dans le sens antihoraire</h3>
              <p>
                Pour les hommes, les 3 premiers tours s&apos;effectuent en <strong>Raml</strong>
                (marche rapide aux épaules redressées) lorsque c&apos;est possible. Les 4 derniers
                tours s&apos;effectuent en marche normale.
              </p>
            </div>
          </div>

          <div className="quote-block">
            <span className="quote-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 5h2v4H3V5zm6 0h2v4H9V5z" fill="#C9A84C"/>
              </svg>
              Du&apos;a du Tawaf
            </span>
            <p>
              Entre la Pierre Noire (Yéménite) et le Coin Yéménite, récitez :<br/>
              <strong>رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ</strong><br/>
              <em>Rabbana atina fi&apos;d-dunya hasanatan wa fi&apos;l-akhirati hasanatan wa qina
              &apos;adhaba&apos;n-nar</em><br/>
              « Notre Seigneur, accorde-nous le meilleur en ce monde et le meilleur dans
              l&apos;au-delà, et protège-nous du châtiment du feu. » (Bukhari)
            </p>
          </div>

          <p>
            Au début de chaque tour, en face de la Pierre Noire, levez la main droite et
            dites : <em>« Bismillah, Allahu Akbar »</em>. Si vous ne pouvez pas la toucher ou
            l&apos;embrasser en raison de la foule, pointer vers elle suffit — ne mettez jamais
            en danger votre sécurité ou celle des autres pèlerins pour la toucher.
          </p>

          <span className="label-overline">LE SA&apos;I</span>
          <h2>Entre Safa et Marwa</h2>
          <p>
            Après le Tawaf, vous accomplissez le Sa&apos;i : 7 allers-retours entre les deux
            collines de Safa et Marwa. Ce rituel commémore le geste de Hajar, la mère d&apos;Ismaïl
            ﷺ, cherchant de l&apos;eau dans la vallée désertique de Bakka.
          </p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 11V3h2v8M9 11V3h2v8" stroke="#C9A84C" strokeWidth="1"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>7 trajets de Safa à Marwa</h3>
              <p>
                Safa → Marwa = 1 trajet. Marwa → Safa = 2e trajet. Au total, 7 trajets se
                terminant à Marwa. Le Mas&apos;a (couloir) mesure environ 394 mètres — le pèlerin
                parcourt au total environ 2 758 mètres (3,5 km). Une légère course est
                recommandée entre les deux marqueurs verts pour les hommes.
              </p>
            </div>
          </div>

          <div className="quote-block">
            <span className="quote-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 5h2v4H3V5zm6 0h2v4H9V5z" fill="#C9A84C"/>
              </svg>
              Histoire de Hajar
            </span>
            <p>
              Ibrahim ﷺ avait laissé Hajar et son nourrisson Ismaïl ﷺ dans la vallée
              désertique de Bakka, future Makkah, sur ordre d&apos;Allah ﷻ. Manquant d&apos;eau,
              Hajar courut sept fois entre les collines de Safa et Marwa, cherchant de l&apos;aide
              du regard. C&apos;est alors que la source de Zamzam jaillit sous les pieds d&apos;Ismaïl.
              En accomplissant le Sa&apos;i, chaque pèlerin rejoue ce geste de foi absolue, de
              persévérance et de confiance totale en la Providence d&apos;Allah ﷻ.
            </p>
          </div>

          <span className="label-overline">LE TAHALLUL</span>
          <h2>Sortir de l&apos;état de sacralisation</h2>
          <p>
            Le Tahallul marque la fin de la Omra. C&apos;est le moment où le pèlerin sort de
            l&apos;état d&apos;Ihram. Il s&apos;effectue après le Sa&apos;i.
          </p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7h10M9 4l3 3-3 3" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Halq ou Taqsir</h3>
              <p>
                Les hommes choisissent entre se raser entièrement la tête (<strong>Halq</strong>,
                recommandé) ou raccourcir leurs cheveux (<strong>Taqsir</strong>). Les femmes
                coupent une mèche d&apos;environ la longueur d&apos;une phalange. Une fois le
                Tahallul accompli, les interdits de l&apos;Ihram sont levés.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ PRATIQUE ── */}
        <section id="faq">
          <span className="label-overline">QUESTIONS FRÉQUENTES</span>
          <h2>FAQ Pratique de la Omra</h2>
          <p>
            Les questions les plus posées par les pèlerins avant et pendant leur Omra,
            avec des réponses claires et précises.
          </p>

          <div className="cards-grid-2">
          <div className="faq-card" onClick={() => toggleFaq('f5')}>
            <div className="faq-header">
              <div className="faq-num">5</div>
              <div className="faq-content"><h3>Puis-je effectuer la Omra si je suis en état de menstruation ?</h3></div>
              <span className="faq-toggle">{openFaq === 'f5' ? '×' : '+'}</span>
            </div>
            {openFaq === 'f5' && <div className="faq-answer"><p>
                Non. Les femmes en état de menstruation (haid) ou de lochies (nifas) ne peuvent
                pas accomplir la Omra, car le Tawaf nécessite d&apos;être en état de pureté rituelle
                (tahara). Si cela survient pendant le voyage, il faut patienter, accomplir le ghusl,
                puis entrer en Ihram pour effectuer la Omra.
            </p></div>}
          </div>

          <div className="faq-card" onClick={() => toggleFaq('f6')}>
            <div className="faq-header">
              <div className="faq-num">6</div>
              <div className="faq-content"><h3>Puis-je porter des sandales pendant le Tawaf ?</h3></div>
              <span className="faq-toggle">{openFaq === 'f6' ? '×' : '+'}</span>
            </div>
            {openFaq === 'f6' && <div className="faq-answer"><p>
                Oui. Des sandales propres sont autorisées et recommandées. Le sol du Masjid Al-Haram
                peut être très chaud en été (50°C) ou froid en hiver. Privilégiez des sandales légères
                à semelle épaisse et antidérapante.
            </p></div>}
          </div>

          <div className="faq-card" onClick={() => toggleFaq('f7')}>
            <div className="faq-header">
              <div className="faq-num">7</div>
              <div className="faq-content"><h3>Doit-on jeûner pendant la Omra ?</h3></div>
              <span className="faq-toggle">{openFaq === 'f7' ? '×' : '+'}</span>
            </div>
            {openFaq === 'f7' && <div className="faq-answer"><p>
                Non, il n&apos;y a pas de jeûne obligatoire lié à la Omra. Si votre Omra tombe
                pendant le Ramadan, vous continuez à jeûner selon les règles habituelles, sauf si
                vous avez droit à l&apos;exemption du voyageur (consulter votre imam).
            </p></div>}
          </div>

          <div className="faq-card" onClick={() => toggleFaq('f8')}>
            <div className="faq-header">
              <div className="faq-num">8</div>
              <div className="faq-content"><h3>Puis-je faire du Tawaf volontaire après la Omra ?</h3></div>
              <span className="faq-toggle">{openFaq === 'f8' ? '×' : '+'}</span>
            </div>
            {openFaq === 'f8' && <div className="faq-answer"><p>
                Oui, et c&apos;est fortement recommandé. Chaque tour autour de la Kaaba est une
                ibadah à part entière. Profitez de votre présence à Makkah pour accomplir autant
                de Tawaf volontaires que possible, particulièrement la nuit où la foule est moins dense.
            </p></div>}
          </div>

          <div className="faq-card" onClick={() => toggleFaq('f9')}>
            <div className="faq-header">
              <div className="faq-num">9</div>
              <div className="faq-content"><h3>Le Tawaf est-il accessible aux personnes à mobilité réduite ?</h3></div>
              <span className="faq-toggle">{openFaq === 'f9' ? '×' : '+'}</span>
            </div>
            {openFaq === 'f9' && <div className="faq-answer"><p>
                Oui. Le Masjid Al-Haram dispose de fauteuils roulants gratuits et d&apos;un étage
                dédié avec vue directe sur la Kaaba. Le Sa&apos;i est entièrement climatisé et
                accessible en fauteuil roulant. Un guide SAFARUMA formé à l&apos;accompagnement PMR
                connaît tous les itinéraires et accès prioritaires.
            </p></div>}
          </div>

          <div className="faq-card" onClick={() => toggleFaq('f10')}>
            <div className="faq-header">
              <div className="faq-num">10</div>
              <div className="faq-content"><h3>Faut-il un guide pour accomplir la Omra ?</h3></div>
              <span className="faq-toggle">{openFaq === 'f10' ? '×' : '+'}</span>
            </div>
            {openFaq === 'f10' && <div className="faq-answer"><p>
                La Omra est techniquement réalisable seul. Mais un guide certifié change
                profondément l&apos;expérience : il sécurise les rituels, explique la signification
                spirituelle de chaque lieu et gère la logistique. C&apos;est particulièrement précieux
                pour les premiers voyages, les familles et les personnes âgées.
            </p></div>}
          </div>

          <div className="faq-card" onClick={() => toggleFaq('f11')}>
            <div className="faq-header">
              <div className="faq-num">11</div>
              <div className="faq-content"><h3>Combien coûte la Omra avec un guide privé SAFARUMA ?</h3></div>
              <span className="faq-toggle">{openFaq === 'f11' ? '×' : '+'}</span>
            </div>
            {openFaq === 'f11' && <div className="faq-answer"><p>
                Les tarifs débutent à <strong>150 € pour une visite guidée</strong> de 4h,
                à <strong>350 € pour l&apos;accompagnement complet de la Omra</strong> (rituels
                + lieux saints), et jusqu&apos;à <strong>600–780 € pour les forfaits VIP</strong>
                incluant transport, hôtel et accès prioritaires. Chaque guide fixe librement ses
                tarifs. SAFARUMA prélève une commission de 12% seulement en cas de mission réalisée.
            </p></div>}
          </div>
          </div>{/* end cards-grid-2 faq */}
        </section>

        {/* ── APRÈS LA OMRA ── */}
        <section id="apres">
          <span className="label-overline">LE RETOUR</span>
          <h2>Après la Omra — Préserver la baraka</h2>
          <p>
            La Omra ne s&apos;arrête pas au Tahallul. Le véritable pèlerin revient transformé —
            et cette transformation doit se maintenir dans la durée. Voici ce que la Sunnah
            enseigne sur les jours qui suivent l&apos;accomplissement de ce voyage béni.
          </p>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2v5l3 2" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round"/>
                <circle cx="7" cy="7" r="5" stroke="#C9A84C" strokeWidth="1"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Ce que la Sunnah recommande après la Omra</h3>
              <p>
                Après l&apos;accomplissement de la Omra, il est recommandé de prier 2 rak&apos;ats
                de shukr (remerciement) à Allah ﷻ. Profitez de votre présence à Makkah pour
                accomplir des Tawaf volontaires supplémentaires — chaque tour compte.
                Buvez de l&apos;eau de Zamzam en abondance en faisant du du&apos;a. Avant de
                quitter Makkah, accomplissez le <strong>Tawaf de Wada&apos;</strong> (Tawaf
                d&apos;adieu), obligatoire selon la majorité des savants.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7l3 3 5-5" stroke="#C9A84C" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="info-content">
              <h3>Maintenir la baraka à votre retour</h3>
              <p>
                La Omra acceptée laisse une empreinte durable. Revenez avec la résolution
                ferme de changer : renforcer votre prière, réparer vos relations, réduire
                ce qui éloigne d&apos;Allah ﷻ. Partagez votre expérience pour inspirer d&apos;autres
                à faire le voyage. Le Prophète ﷺ a dit : <em>« Pour le pèlerin accepté,
                il n&apos;y a pas de récompense autre que le Paradis. »</em> (Bukhari &amp; Muslim)
              </p>
            </div>
          </div>

          <div className="quote-block">
            <span className="quote-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 5h2v4H3V5zm6 0h2v4H9V5z" fill="#C9A84C"/>
              </svg>
              Un conseil de guide
            </span>
            <p>
              Nos guides SAFARUMA vous préparent non seulement aux rituels, mais aussi à la
              dimension spirituelle du retour. Une Omra bien accompagnée se ressent encore
              des années après le voyage.
            </p>
          </div>
        </section>

        {/* ── Bandeau fin de guide ── */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #EDE8DC', borderRadius: 12,
          padding: '16px 18px', marginTop: '28px',
          display: 'flex', alignItems: 'center', gap: '14px',
          borderLeft: '3px solid #C9A84C',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M9 7h6M9 11h4" stroke="#C9A84C" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1209', marginBottom: '3px' }}>
              La suite du guide dans votre espace pèlerin
            </div>
            <div style={{ fontSize: '12px', color: '#5A4E3A', lineHeight: 1.55 }}>
              Version complète avec checklist cochable, audio des du&apos;as, marque-pages et suivi — gratuit.
            </div>
          </div>
          <Link href="/inscription" style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0,
            padding: '8px 14px', borderRadius: 999, background: '#1A1209',
            color: '#F0D897', fontSize: '12px', fontWeight: 600, textDecoration: 'none',
            letterSpacing: '0.02em',
          }}>
            Accéder
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="#F0D897" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>

          </div>{/* end guide-gate-blur */}
          {isGated && <GateOverlay />}
        </div>{/* end gate wrapper */}

      </article>

      <Footer />
    </>
  );
}

function GateOverlay() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '200px',
      background: 'linear-gradient(to bottom, transparent 0%, rgba(250,247,240,0.6) 40%, rgba(250,247,240,1) 65%)',
      zIndex: 10,
    }}>
      <div style={{
        background: '#FAF7F0',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: 16,
        padding: '28px 28px 24px',
        maxWidth: 380, width: '90%', textAlign: 'center',
        boxShadow: '0 24px 64px rgba(26,18,9,0.45), 0 4px 16px rgba(26,18,9,0.2)',
        animation: 'gateCardIn 0.4s ease-out both',
      }}>
        {/* Ligne or — signal premium */}
        <div style={{ width: 32, height: 1, background: '#C9A84C', margin: '0 auto 16px' }} />
        <h3 style={{
          fontFamily: 'var(--font-cormorant, Georgia, serif)',
          fontSize: '1.4rem', fontWeight: 700, color: '#1A1209',
          margin: '0 0 6px', lineHeight: 1.25,
        }}>
          Créez votre compte gratuit<br />en 5 secondes
        </h3>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', margin: '12px 0 20px' }}>
          {['Rituels complets', 'Checklist', 'FAQ', 'Préparation'].map(f => (
            <span key={f} style={{ fontSize: '0.72rem', color: '#7A6D5A', background: 'rgba(201,168,76,0.1)', padding: '3px 8px', borderRadius: 4 }}>{f}</span>
          ))}
        </div>
        <Link href="/inscription" style={{
          display: 'block', background: '#1A1209', color: '#F0D897',
          padding: '13px 24px', borderRadius: 50,
          fontWeight: 700, fontSize: '0.88rem',
          textDecoration: 'none', letterSpacing: '0.04em',
          marginBottom: 10,
        }}>
          Créer mon compte
        </Link>
        <Link href="/connexion" style={{ fontSize: '0.8rem', color: '#9A8D7A', textDecoration: 'none' }}>
          J&apos;ai déjà un compte →
        </Link>
      </div>
    </div>
  );
}
