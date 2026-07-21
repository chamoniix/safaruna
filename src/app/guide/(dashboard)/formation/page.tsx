interface Step {
  n: number;
  title: string;
  nameAr: string;
  tagColor: string;
  body: string[];
  dua?: { ar: string; phon: string; trad: string };
  guideTip: string;
  imageCaption: string;
}

const STEPS: Step[] = [
  {
    n: 1,
    title: "Avant l'Ihram",
    nameAr: 'قبل الإحرام',
    tagColor: '#C9A84C',
    body: [
      "Avant d'entrer en état de sacralisation (l'Ihram), le pèlerin est invité à faire les grandes ablutions (Ghousl), à se couper les ongles et à se parfumer — ce parfum reste autorisé sur le corps même après le début de l'Ihram, tant qu'il n'en rajoute pas.",
      "L'homme revêt ensuite les deux pièces de tissu non cousu (Izar autour de la taille, Rida sur le buste), traditionnellement blanches, avec des sandales laissant les pieds à découvert. La femme garde ses vêtements habituels, dans le respect de la pudeur, sans gants ni voile collé au visage.",
      "Il est permis de revêtir l'Ihram depuis l'hôtel, avant même d'arriver au point d'entrée (Miqat) — c'est d'ailleurs ce que faisaient déjà les Compagnons.",
    ],
    guideTip: "Rappelle à ton groupe de se préparer AVANT le trajet vers le Miqat : ablutions et tenue faites à l'hôtel, pour ne pas être pris de court une fois sur place. Beaucoup de pèlerins découvrent l'Ihram pour la première fois — explique calmement chaque étape plutôt que de les presser.",
    imageCaption: 'Illustration : la tenue Ihram (Izar / Rida) — vue correcte vs erreur fréquente (épaule découverte hors Tawaf)',
  },
  {
    n: 2,
    title: 'Le Miqat et la Niyyah',
    nameAr: 'الميقات والنية',
    tagColor: '#1D5C3A',
    body: [
      "Le Miqat est la frontière sacrée au-delà de laquelle personne ne peut entrer sans être en état d'Ihram. Pour un pèlerin partant de Madinah, ce point est Dhul Hulayfah — plus connu localement sous le nom de Bir Ali, à environ 12 km de la ville.",
      "Une fois sur place, il est recommandé d'accomplir une prière avant de formuler l'intention, en se tournant vers la Qibla : « Labbayka Allahumma bi'Umrah » (Me voici, Ô Allah, pour accomplir une Omra). Celui qui craint un empêchement peut ajouter une clause de sortie : s'en remettre à Allah pour se désacraliser là où il serait bloqué.",
      "Dès la Niyyah formulée, le pèlerin entame la Talbiya à voix haute, qu'il répète tout le long du trajet vers Makkah.",
    ],
    dua: {
      ar: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ',
      phon: "Labbayka Allahumma labbayk, labbayka la charika laka labbayk",
      trad: "Me voici, Ô Allah, me voici. Me voici, Tu n'as point d'associé, me voici.",
    },
    guideTip: "C'est souvent le moment le plus émouvant du trajet — laisse un temps de silence après la Talbiya collective plutôt que d'enchaîner tout de suite sur les explications logistiques.",
    imageCaption: 'Carte : position du Miqat (Dhul Hulayfah / Bir Ali) par rapport à Madinah et Makkah',
  },
  {
    n: 3,
    title: "Les interdits de l'Ihram",
    nameAr: 'محظورات الإحرام',
    tagColor: '#8B2A1A',
    body: [
      "Une fois en Ihram, certains actes deviennent interdits : se raser ou se couper les cheveux, se tailler les ongles, porter un vêtement cousu à sa mesure, se couvrir la tête directement (un parapluie reste permis pour se protéger du soleil), se parfumer à nouveau, chasser, et bien sûr tout ce qui touche au mariage ou à l'acte conjugal.",
      "Ces interdits ne sont pas tous de même gravité : la plupart peuvent être rachetés par une compensation sans annuler la Omra ; la chasse impose un sacrifice équivalent ; les préliminaires conjugaux demandent une compensation ; seul le rapport charnel complet annule le rite sans possibilité de rachat.",
    ],
    guideTip: "C'est le point où les questions pratiques affluent (crème solaire, lunettes, ceinture porte-billets...). Prépare une réponse simple pour les cas les plus fréquents plutôt que de renvoyer vers un avis religieux à chaque fois.",
    imageCaption: 'Pictogrammes : les interdits de l\'Ihram (liste illustrée)',
  },
  {
    n: 4,
    title: 'Arrivée à Makkah',
    nameAr: 'الوصول إلى مكة',
    tagColor: '#C9A84C',
    body: [
      "En apercevant les premières habitations de Makkah, le pèlerin cesse la Talbiya. Il est recommandé de faire les grandes ablutions avant d'entrer dans la ville si cela est possible, puis de se rendre directement à la Mosquée Sacrée dès que les affaires sont déposées à l'hôtel.",
      "En entrant dans la mosquée, pied droit en premier, le pèlerin formule la du'a d'entrée habituelle à toute mosquée.",
    ],
    dua: {
      ar: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
      phon: 'Allahumma iftah li abwaba rahmatik',
      trad: "Ô Allah, ouvre-moi les portes de Ta miséricorde.",
    },
    guideTip: "Le premier regard sur la Kaaba est un choc émotionnel pour beaucoup de pèlerins — prévois une pause avant d'enchaîner sur les explications du Tawaf, certains ont besoin de quelques minutes.",
    imageCaption: "Photo : première vue de la Kaaba depuis l'intérieur du Masjid Al-Haram",
  },
  {
    n: 5,
    title: 'Le Tawaf',
    nameAr: 'الطواف',
    tagColor: '#1A4A8A',
    body: [
      "Le Tawaf consiste à effectuer sept tours autour de la Kaaba, en la gardant à sa gauche, en commençant et terminant chaque tour au niveau de la Pierre Noire (Al-Hajar Al-Aswad).",
      "Avant de commencer, l'homme découvre son épaule droite en passant le Rida sous son aisselle (Al-Idtiba') — un geste propre à ce premier Tawaf seulement, à ne pas reproduire dans les tours suivants ni dans les Tawaf ultérieurs.",
      "Au niveau de la Pierre Noire, le pèlerin dit « Bismillah, Allahou Akbar » puis la touche ou l'embrasse s'il le peut sans bousculer personne ; sinon, un simple geste de la main suffit. Les trois premiers tours se font d'un pas rapide (Ar-Raml) — spécificité du tout premier Tawaf — puis les quatre suivants d'un pas normal. Il est recommandé de toucher le coin yéménite (Ar-Roukn Al-Yamani) à chaque passage, sans l'embrasser.",
      "Entre le coin yéménite et la Pierre Noire, on récite : « Rabbana atina fi dounya hassanatan wa fil akhirati hassanatan wa qina 'adhaba an-nar ». En dehors de cette invocation, le Tawaf n'impose aucune formule fixe à chaque tour — le pèlerin peut invoquer librement ou réciter le Coran.",
      "Une fois les sept tours achevés, le pèlerin couvre à nouveau son épaule, se rend derrière la Station d'Ibrahim (Maqam Ibrahim) pour y accomplir deux rak'ah, puis va boire l'eau de Zamzam.",
    ],
    dua: {
      ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      phon: 'Rabbana atina fi dounya hassanatan wa fil akhirati hassanatan wa qina adhaba an-nar',
      trad: "Notre Seigneur, accorde-nous le bien ici-bas et dans l'au-delà, et préserve-nous du châtiment du Feu.",
    },
    guideTip: "Beaucoup de pèlerins pensent, à tort, qu'il existe une invocation précise pour chaque tour — corrige gentiment cette idée reçue avant de commencer, ça les libère de la pression de « bien réciter ». Rappelle aussi de ne jamais bousculer pour toucher la Pierre Noire : la sécurité du groupe passe avant le geste.",
    imageCaption: 'Schéma : plan du Tawaf avec Hajar Aswad, Hijr Ismaël, Rukn Yamani, Maqam Ibrahim et sens de circulation',
  },
  {
    n: 6,
    title: "As-Sa'i",
    nameAr: 'السعي',
    tagColor: '#5A2D82',
    body: [
      "Le Sa'i se déroule entre les monts Safa et Marwa, en mémoire de Hajar courant à la recherche d'eau pour son fils Ismaël. En approchant de Safa pour la première fois, le pèlerin récite le verset « Inna as-Safa wal-Marwata min cha'a'iri Llah » (Al-Baqarah, 2:158) — une seule fois, non à répéter à chaque passage.",
      "Sur Safa, face à la Kaaba, il proclame trois fois le Takbir accompagné d'une formule de proclamation de l'unicité d'Allah, en invoquant librement entre chaque répétition. Il descend ensuite vers Marwa en marchant, accélère le pas entre les deux repères verts, puis reprend une marche normale jusqu'à Marwa où il répète le même rituel.",
      "Ce trajet est parcouru sept fois au total (Safa→Marwa puis Marwa→Safa comptant chacun comme un trajet), le septième et dernier se terminant sur Marwa. Comme pour le Tawaf, aucune invocation particulière n'est requise entre les deux monts — chacun invoque selon son cœur.",
      "Le Sa'i s'achève par la Taqsir : l'homme raccourcit uniformément ses cheveux sur toute la tête (ou les rase s'il n'enchaîne pas sur un Hajj proche), la femme coupe l'équivalent d'une phalangette. La Omra est alors accomplie et le pèlerin se désacralise.",
    ],
    guideTip: "Le passage rapide entre les deux repères verts est physique — prévois de l'eau et des pauses pour les personnes âgées ou à mobilité réduite, et rappelle qu'il n'y a aucune obligation de courir si la santé ne le permet pas.",
    imageCaption: 'Schéma : trajet du Sa\'i entre Safa et Marwa avec les 7 trajets et les repères verts',
  },
];

function ImagePlaceholder({ caption }: { caption: string }) {
  return (
    <div style={{ border: '1.5px dashed #D8CDB0', borderRadius: 10, background: '#FAF8F3', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' }}>
      <span style={{ fontSize: '1.3rem', opacity: 0.35 }}>🖼</span>
      <span style={{ fontSize: '0.72rem', color: '#9C8F72', fontStyle: 'italic', maxWidth: 420 }}>{caption}</span>
    </div>
  );
}

export default function FormationPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Header */}
      <div style={{ background: '#1A1209', color: '#FDFBF7', borderRadius: 12, padding: '1.75rem 2rem' }}>
        <span style={{ display: 'inline-block', background: '#C9A84C', color: '#1A1209', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: '2rem', marginBottom: '0.85rem' }}>
          Formation guide SAFARUMA
        </span>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 700, marginBottom: '0.6rem' }}>
          Les rites de la Omra, étape par étape
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#D4C8B0', lineHeight: 1.7, maxWidth: 640 }}>
          Ce module te permet de revoir en détail le déroulement des rites que tu accompagnes au quotidien,
          avec les invocations authentiques et des conseils pratiques pour guider sereinement tes pèlerins à chaque étape.
        </p>
      </div>

      {/* Rappel intention & sunna */}
      <div style={{ background: '#FEF9EC', border: '1px solid #FCD34D', borderRadius: 12, padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#92400E', lineHeight: 1.75 }}>
        <strong>Avant toute chose :</strong> une Omra n&apos;est acceptée que si elle réunit deux conditions — la sincérité de l&apos;intention envers Allah, et la conformité aux gestes accomplis par le Prophète ﷺ. En tant que guide, rappelle ces deux piliers à ton groupe avant de commencer : ce sont eux qui donnent son sens à chaque étape qui suit.
      </div>

      {/* Steps */}
      {STEPS.map(step => (
        <div key={step.n} style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Step header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: step.tagColor, color: 'white', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {step.n}
            </span>
            <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>
              {step.title}
            </h2>
            <span dir="rtl" lang="ar" style={{ fontFamily: 'serif', fontSize: '1.05rem', color: step.tagColor }}>{step.nameAr}</span>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {step.body.map((p, i) => (
              <p key={i} style={{ fontSize: '0.92rem', lineHeight: 1.75, color: '#3D2B1A', margin: 0 }}>{p}</p>
            ))}
          </div>

          {/* Dua */}
          {step.dua && (
            <div style={{ background: '#F5F2EC', borderLeft: `3px solid ${step.tagColor}`, borderRadius: 8, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p dir="rtl" lang="ar" style={{ fontFamily: 'serif', fontSize: '1.15rem', color: '#1A1209', textAlign: 'right', margin: 0, lineHeight: 1.9 }}>{step.dua.ar}</p>
              <p style={{ fontSize: '0.8rem', color: '#7A6D5A', fontStyle: 'italic', margin: 0 }}>{step.dua.phon}</p>
              <p style={{ fontSize: '0.85rem', color: '#3D2B1A', margin: 0 }}>{step.dua.trad}</p>
            </div>
          )}

          {/* Image placeholder */}
          <ImagePlaceholder caption={step.imageCaption} />

          {/* Guide tip */}
          <div style={{ background: '#F0F9F4', border: '1px solid #C7E4D3', borderRadius: 8, padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>🎓</span>
            <p style={{ fontSize: '0.85rem', color: '#1D5C3A', lineHeight: 1.65, margin: 0 }}>
              <strong>Conseil guide — </strong>{step.guideTip}
            </p>
          </div>
        </div>
      ))}

      {/* Récapitulatif visuel */}
      <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>
          Récapitulatif visuel des 4 grandes étapes
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#6B5A3A', margin: 0 }}>
          Miqat (Ihram) → Tawaf (7 tours) → Sa&apos;i (7 trajets) → Taqsir (raccourcir les cheveux)
        </p>
        <ImagePlaceholder caption="Infographie récapitulative : les 4 étapes de la Omra, du Miqat à la Taqsir" />
      </div>
    </div>
  );
}
