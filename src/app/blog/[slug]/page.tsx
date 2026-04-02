import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { ARTICLES } from '../page';

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

// ─── Article content ──────────────────────────────────────────────────────────

const CONTENT: Record<string, { sections: { heading?: string; body: string }[] }> = {
  'comment-choisir-guide-omra': {
    sections: [
      { body: "Le choix du guide est sans doute la décision la plus impactante de toute votre Omra. Un bon guide peut transformer un voyage ordinaire en expérience spirituelle inoubliable. Un mauvais choix peut vous laisser déçu, perdu dans la foule, sans avoir rien compris à ce que vous accomplissiez. Voici les 7 critères que chaque pèlerin devrait vérifier." },
      { heading: '1. La certification officielle Mutawwif', body: "Tout guide exerçant en Arabie Saoudite doit être titulaire d'une licence officielle délivrée par le Ministère du Hajj et de l'Omra. Cette certification garantit que le guide a suivi une formation agréée, connaît les réglementations et est autorisé à accompagner des pèlerins dans les lieux saints. N'engagez jamais un guide non certifié — c'est illégal et dangereux." },
      { heading: '2. La maîtrise de votre langue', body: "Votre guide doit parler votre langue maternelle — pas juste un français de survie, mais un français fluide et précis. La nuance d'une explication islamique se perd dans la traduction approximative. Vérifiez toujours en échangeant par message ou appel vidéo avant de réserver." },
      { heading: '3. La connaissance de la Sîra', body: "Un guide qui ne connaît que les noms des lieux ne suffit pas. Il doit pouvoir vous raconter l'histoire de chaque endroit — qui y était, ce qui s'y est passé, ce que le Coran ou les hadiths authentiques en disent. Demandez-lui de vous parler de Jabal Nour avant de réserver : sa réponse vous dira tout." },
      { heading: '4. Les avis vérifiés', body: "Méfiez-vous des guides sans avis ou avec seulement quelques avis génériques. Un guide expérimenté a des dizaines d'avis détaillés de pèlerins réels. Lisez les commentaires négatifs avec attention — un guide qui répond aux critiques avec humilité et professionnalisme est un excellent signe." },
      { heading: "5. L'adaptation à votre groupe", body: "Voyagez-vous seul, en couple, en famille avec enfants, en groupe senior ou avec une personne PMR ? Votre guide doit avoir de l'expérience avec votre type de groupe. Un guide habitué aux groupes d'adultes actifs sera peut-être épuisant pour vos parents de 70 ans." },
      { heading: '6. La transparence sur le tarif', body: "Un guide de qualité a un tarif clair, une liste précise de ce qui est inclus et ce qui ne l'est pas. Fuyez les devis vagues, les \"ça dépend\" et les suppléments cachés. Chez SAFARUNA, tous les prix sont affichés par forfait, sans surprise." },
      { heading: '7. La disponibilité réelle', body: "Votre guide sera-t-il disponible dès votre atterrissage jusqu'à votre départ ? Pourra-t-il vous répondre la nuit si un membre de votre groupe se sent mal ? Combien de groupes accompagne-t-il simultanément ? Un guide qui jongle avec 5 groupes en même temps ne peut pas vous offrir l'attention que vous méritez." },
      { body: "Chez SAFARUNA, nous vérifions chacun de ces critères avant d'intégrer un guide à notre plateforme. Chaque profil affiche sa certification, ses avis détaillés, ses langues, ses années d'expérience et son taux de retour. Choisir un guide SAFARUNA, c'est choisir la tranquillité d'esprit." },
    ],
  },

  '10-lieux-incontournables-makkah': {
    sections: [
      { body: "La plupart des pèlerins qui font l'Omra restent entre le Masjid Al-Haram, leur hôtel et parfois le centre commercial Abraj Al-Bait. C'est une erreur. Makkah et ses environs regorgent de lieux extraordinaires qui donnent à votre voyage une profondeur spirituelle et historique incomparable. En voici 10 que votre guide privé peut vous faire découvrir." },
      { heading: '1. La Grotte de Hira (Jabal Al-Nour)', body: "Perchée à 215 mètres d'altitude au sommet de la montagne de la Lumière, la grotte de Hira est le lieu où le Prophète ﷺ recevait la Révélation, et où la première sourate — Al-Alaq — lui fut révélée. La montée prend environ 30 à 45 minutes selon la condition physique. Au sommet, on voit la Kaaba au loin. Un moment qui fait souvent pleurer ceux qui le vivent." },
      { heading: '2. La Grotte de Thawr (Jabal Thawr)', body: "Plus difficile d'accès et moins connue, Jabal Thawr est la montagne où le Prophète ﷺ et Abu Bakr se cachèrent pendant 3 jours lors de l'Hégire. L'histoire de l'araignée qui tissa sa toile à l'entrée de la grotte pour la dissimuler aux Qurayshites est ici vécue dans toute sa profondeur." },
      { heading: '3. Le Meeqat de Tan\'im', body: "Pour ceux qui veulent accomplir une Omra supplémentaire pendant leur séjour, le Meeqat de Tan'im est le plus proche de Makkah. Aïsha (ra) y accomplit son Omra sur l'ordre du Prophète ﷺ — d'où son autre nom, Masjid Aïsha." },
      { heading: '4. Le site de la bataille de Badr', body: "À 155 km de Makkah, le puits de Badr est le lieu de la première grande bataille de l'Islam, où 313 croyants affrontèrent 1000 Qurayshites. Votre guide peut vous y emmener avec une voiture privée en moins de 2 heures. Un lieu de recueillement intense." },
      { heading: '5. Masjid Al-Jinn', body: "C'est ici que, selon la tradition, un groupe de djinns entendit le Prophète ﷺ réciter le Coran et se convertirent à l'Islam. La sourate Al-Jinn y fait directement référence (72:1). Un lieu méconnu mais profondément chargé de sens." },
      { heading: '6. Mina et ses tentes blanches', body: "Même hors période de Hajj, visiter la vallée de Mina avec ses milliers de tentes blanches aligne est une expérience saisissante. Votre guide peut vous expliquer le rituel du jet de pierres et ce qu'il symbolise." },
      { heading: '7. Arafat et Jabal Al-Rahma', body: "La plaine d'Arafat, où s'accomplit le \"wuquf\" du Hajj — le pilier central du pèlerinage — est accessible toute l'année. Jabal Al-Rahma (la montagne de la Miséricorde) en est le point central. Même lors d'une Omra, y passer une heure en récitation est une expérience spirituelle rare." },
      { heading: '8. Muzdalifah', body: "La halte sacrée entre Arafat et Mina. Dans l'obscurité de la nuit du Hajj, des millions de pèlerins y dorment à la belle étoile. Hors saison, la traverser avec un guide qui vous en raconte la signification donne une toute autre dimension à votre Omra." },
      { heading: '9. Le Meeqat de Dhul Hulayfah (Abyar Ali)', body: "Le plus important des 5 Meeqats de l'Islam. Situé près de Madinah, c'est de là que les pèlerins venant d'Arabie Saoudite et des pays voisins entrent en état d'Ihram. Y prier deux rak'ahs avant de prononcer le talbiyah pour la première fois est un moment inoubliable." },
      { heading: '10. La Bibliothèque du Roi Fahd et le Musée du Coran', body: "Pour les amateurs de manuscrits coraniques, la bibliothèque royale de Makkah abrite des copies rares du Coran et des artefacts islamiques du premier siècle de l'Hégire. Un arrêt méconnu mais d'une richesse inestimable pour qui veut comprendre l'histoire du Livre." },
      { body: "Ces lieux ne s'improvisent pas. Ils nécessitent un guide qui sait y aller, comment vous préparer spirituellement avant d'y entrer, et ce qu'il faut réciter ou méditer sur place. C'est exactement ce que proposent nos guides SAFARUNA." },
    ],
  },

  'checklist-preparation-omra': {
    sections: [
      { body: "Une Omra se prépare au minimum 3 mois à l'avance. Beaucoup de pèlerins arrivent sans préparation spirituelle, sans connaître les rituels, sans mémoriser une seule du'a. Résultat : ils accomplissent les gestes sans les comprendre. Voici la checklist complète — du spirituel à l'administratif." },
      { heading: '3 mois avant', body: "📋 Vérifiez la validité de votre passeport (6 mois minimum après la date de retour)\n📋 Débutez votre préparation spirituelle : récitez chaque jour les du'a de voyage\n📋 Contactez un médecin pour le vaccin méningite ACYW (obligatoire)\n📋 Commencez à mémoriser Sourate Al-Fatiha, Al-Ikhlas, Al-Falaq, An-Nas\n📋 Choisissez et réservez votre guide SAFARUNA" },
      { heading: '2 mois avant', body: "📋 Constituez votre dossier de visa Nusuk avec l'aide de votre guide\n📋 Réservez votre vol aller-retour\n📋 Réservez votre hébergement (demandez à votre guide de vous orienter)\n📋 Commencez à apprendre le sens des rituels : qu'est-ce que le tawaf ? le sa'i ? l'ihram ?\n📋 Préparez vos vêtements d'ihram (2 pièces blanches non cousues pour les hommes)" },
      { heading: '1 mois avant', body: "📋 Mémorisez les du'a du tawaf et du sa'i\n📋 Apprenez les points de meeqat selon votre lieu de départ\n📋 Préparez votre trousse médicale : anti-douleurs, sérum physiologique, bandages\n📋 Achetez vos sandales (règle : sandales sans couture cachant les os du pied pour les hommes en ihram)\n📋 Téléchargez l'application Nusuk et Athan" },
      { heading: 'La semaine du départ', body: "📋 Imprimez votre visa Nusuk et gardez une copie numérique\n📋 Notez le numéro WhatsApp de votre guide SAFARUNA\n📋 Emportez une photo d'identité supplémentaire\n📋 Emportez suffisamment de riyals saoudiens (SAR)\n📋 Faites vos dernières prières de deux rak'ahs avant de quitter votre domicile" },
      { heading: 'Ce qu\'il ne faut surtout pas oublier', body: "🔑 Passeport original + photocopie séparée\n💊 Médicaments personnels pour toute la durée du séjour\n📱 Batterie externe pour votre téléphone (les files d'attente peuvent être longues)\n🕌 Livret de du'a : votre guide SAFARUNA vous remet le nôtre à l'arrivée\n👟 Chaussures confortables pour les longues marches (le sa'i seul fait 3,6 km)" },
      { body: "Cette checklist n'est pas exhaustive — votre guide SAFARUNA complétera votre préparation avec une session de briefing en ligne avant votre départ, incluse dans tous nos forfaits." },
    ],
  },

  'grotte-hira-guide-spirituel': {
    sections: [
      { body: "Il y a des lieux qui changent un être humain. Pas par leur majesté architecturale, ni par leur beauté naturelle — mais par ce qui s'y est passé. La Grotte de Hira est l'un de ces lieux. C'est ici que l'histoire de l'humanité a basculé." },
      { heading: 'Ce que dit le Coran', body: "La première révélation couvrit la sourate Al-Alaq (96:1-5) : « Lis au nom de ton Seigneur qui a créé… ». C'est dans cette grotte, à quelques mètres carrés à peine, que le Prophète Muhammad ﷺ reçut les premiers mots du Coran des mains de l'ange Jibrîl. Une nuit, vers l'an 610 de l'ère chrétienne, le monde ne fut plus jamais le même." },
      { heading: 'La montée — pratiquement', body: "La Grotte de Hira se situe au sommet de Jabal Al-Nour, à environ 6 km du Masjid Al-Haram. Le chemin est balisé mais la montée est soutenue : 1652 marches taillées dans la roche. Comptez 30 à 45 minutes pour un adulte en bonne santé. Partez tôt le matin pour éviter la chaleur et la foule. Votre guide vous accompagne à votre rythme." },
      { heading: 'Comment se préparer spirituellement', body: "Avant de monter, faites vos ablutions. Récitez les du'a de voyage. Mémorisez les premiers versets de Al-Alaq — les entendre au sommet de la montagne où ils furent révélés est une expérience sans équivalent. Ne parlez pas trop pendant la montée : c'est un chemin de recueillement, pas une randonnée touristique." },
      { heading: 'Ce qu\'on ressent là-haut', body: "La grotte elle-même est minuscule : à peine 3 mètres sur 1,5 mètre, ouverte à l'Est pour recevoir le soleil du matin. Les guides qui y ont emmené des centaines de pèlerins vous diront la même chose : beaucoup pleurent. Pas de tristesse — d'une émotion qui n'a pas de nom. Le vertige de comprendre que là, dans ce cube de pierre sèche, tout a commencé." },
      { heading: 'Ce qu\'il faut éviter', body: "Évitez de vous y rendre seul si c'est votre première fois — vous risquez de ne pas savoir quoi faire de ce moment. Un guide qui connaît l'histoire, qui récite les premiers versets au sommet et vous explique ce qui s'est passé précisément là transforme la visite en expérience initiatique. Évitez également les heures de pointe (après 10h et avant le coucher du soleil)." },
      { body: "Cheikh Rachid Al-Madani, l'un de nos guides les plus expérimentés, décrit la montée de Jabal Nour comme \"le moment où la plupart de mes pèlerins comprennent vraiment pourquoi ils sont venus\". Réservez votre guide et vivez-le vous-même." },
    ],
  },

  'omra-famille-conseils-guide': {
    sections: [
      { body: "Partir en Omra avec ses enfants est l'un des cadeaux les plus précieux qu'un parent puisse offrir. Pas pour leur faire accomplir un rituel qu'ils ne comprennent pas encore — mais pour leur montrer que ces lieux existent, que cette histoire est réelle, et que leur religion a des racines concrètes dans la pierre et dans le temps. Voici comment le vivre vraiment." },
      { heading: 'L\'âge idéal', body: "Il n'y a pas d'âge parfait, mais l'expérience de terrain montre que les enfants de 7 à 14 ans vivent les voyages les plus intenses. Avant 7 ans, la fatigue physique peut dominer l'expérience. À partir de 10-11 ans, les enfants commencent à vraiment saisir le poids historique de ce qu'ils voient. Les adolescents, eux, peuvent vivre une transformation profonde." },
      { heading: 'Adapter le rythme', body: "Oubliez les journées de 12 heures. Avec des enfants, comptez 4 à 5 heures d'activité maximum par jour, avec une sieste obligatoire entre 13h et 16h (la chaleur est insupportable pour les petits). Votre guide SAFARUNA connaît les heures creuses du Haram — tôt le matin après Fajr est souvent le moment le plus reposant et le plus spirituel." },
      { heading: 'Les lieux faits pour les enfants', body: "Certains lieux sont particulièrement adaptés aux familles avec enfants. Jabal Al-Nour est une aventure physique qu'ils n'oublieront pas. Le puits de Zamzam fascine les petits. La visite de Masjid Quba, la première mosquée de l'Islam, est facilement accessible en voiture et chargée d'une histoire que les enfants comprennent intuitivement. Évitez les lieux bondés comme la Rawdah avec des enfants en bas âge." },
      { heading: 'Préparer les enfants avant le départ', body: "Racontez-leur l'histoire d'Ibrahim ﷺ et Hajar avant de quitter la maison. Montrez-leur des images de la Kaaba. Regardez ensemble des documentaires sur Makkah. Quand ils arriveront et verront la Kaaba pour la première fois, ils sauront déjà ce qu'ils regardent — et cette reconnaissance est bouleversante." },
      { heading: 'Les du\'a en famille', body: "Prévoyez des moments de du'a en famille — pas imposés, mais invités. Le guide SAFARUNA peut suggérer des du'a adaptées aux enfants, simples et mémorables. Un enfant qui récite une du'a pour ses parents devant la Kaaba, c'est un souvenir pour toute une vie." },
      { heading: 'Ce que les guides SAFARUNA font différemment', body: "Nos guides qui accompagnent des familles ont développé une approche pédagogique spécifique : ils racontent les histoires comme des récits vivants, adaptent leur vocabulaire à l'âge des enfants, font participer les plus grands comme \"experts\" qui expliquent aux plus petits, et ménagent des pauses ludiques entre les visites sérieuses." },
      { body: "Rachid Al-Madani, qui accompagne des familles depuis 14 ans, dit souvent : \"Les enfants qui ont fait l'Omra avec un vrai guide reviennent transformés. Pas par la religion — par la réalité. Ils ont vu que ça existe vraiment. Que ce n'est pas un conte.\" C'est peut-être la plus belle raison de partir en famille." },
    ],
  },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  const content = CONTENT[slug];

  if (!article || !content) notFound();

  const relatedArticles = ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <Navbar />
      <ScrollReveal />

      {/* HERO */}
      <section style={{
        background: 'var(--deep)', paddingTop: '8rem', paddingBottom: '5rem',
        paddingLeft: '4rem', paddingRight: '4rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(201,168,76,0.11) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', animation: 'fadeInUp 0.7s ease both' }}>
            <span style={{ background: article.categoryBg, color: article.categoryColor, border: `1px solid ${article.categoryColor}30`, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.25rem 0.7rem', borderRadius: 50, textTransform: 'uppercase' }}>
              {article.category}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{article.date}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>· {article.readTime} de lecture</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 300, color: 'white', lineHeight: 1.15, marginBottom: '2rem', animation: 'fadeInUp 0.8s 0.15s ease both', opacity: 0 }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', animation: 'fadeInUp 0.8s 0.3s ease both', opacity: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: 'var(--deep)', fontSize: '1rem', flexShrink: 0 }}>
              {article.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>{article.author}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>{article.authorRole}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ padding: '5rem 4rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {content.sections.map((section, i) => (
            <div key={i} style={{ marginBottom: '2rem' }}>
              {section.heading && (
                <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 600, color: 'var(--deep)', marginBottom: '0.75rem', marginTop: i > 0 ? '1rem' : 0 }}>
                  {section.heading}
                </h2>
              )}
              <div style={{ color: 'var(--muted)', lineHeight: 1.9, fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                {section.body}
              </div>
            </div>
          ))}

          {/* Author card */}
          <div style={{
            background: 'white', borderRadius: 16, padding: '1.75rem',
            border: '1px solid var(--sand)', display: 'flex', gap: '1.25rem',
            alignItems: 'flex-start', marginTop: '3rem',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, color: 'var(--deep)', fontSize: '1.2rem', flexShrink: 0 }}>
              {article.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.15rem' }}>Écrit par {article.author}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-dark)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{article.authorRole}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                Guide certifié SAFARUNA avec des années d&apos;expérience à Makkah et Madinah. Ses articles sont écrits directement depuis les Lieux Saints, avec la précision de quelqu&apos;un qui y vit chaque jour.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section style={{ padding: '4rem', background: 'white', borderTop: '1px solid var(--sand)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="section-label reveal">Continuez la lecture</div>
          <h2 className="reveal reveal-d1" style={{ marginBottom: '2rem' }}>
            Articles <em>connexes</em>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {relatedArticles.map((a, i) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                <div className={`reveal reveal-d${i + 1}`} style={{
                  background: 'var(--cream)', borderRadius: 16, overflow: 'hidden',
                  border: '1px solid var(--sand)',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{ background: 'linear-gradient(135deg, var(--deep), #2D1F08)', padding: '1.5rem', minHeight: 90, position: 'relative' }}>
                    <span style={{ background: a.categoryBg, color: a.categoryColor, border: `1px solid ${a.categoryColor}30`, fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.18rem 0.55rem', borderRadius: 50, textTransform: 'uppercase' }}>
                      {a.category}
                    </span>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--deep)', lineHeight: 1.4, marginBottom: '0.5rem' }}>{a.title}</h3>
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{a.date} · {a.readTime}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="reveal" style={{ color: 'white' }}>
          Prêt à vivre votre <em style={{ color: 'var(--gold)' }}>Omra différemment ?</em>
        </h2>
        <p className="reveal reveal-d1" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 440, margin: '1rem auto 2.5rem', lineHeight: 1.8 }}>
          Trouvez le guide certifié qui correspond à votre langue, votre groupe et vos dates.
        </p>
        <div className="reveal reveal-d2">
          <Link href="/guides" className="btn-primary" style={{ background: 'var(--gold)', color: 'var(--deep)', fontWeight: 700 }}>
            Trouver mon guide →
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
