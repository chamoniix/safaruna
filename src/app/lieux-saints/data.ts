export type SectionBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; text: string; reference: string }
  | { type: 'stats'; items: { label: string; value: string }[] }
  | { type: 'rituals'; items: { icon: 'rotate-cw' | 'droplets' | 'heart' | 'sun' | 'moon' | 'scissors' | 'target'; title: string; description: string }[] }
  | { type: 'expert-tip'; title?: string; text: string };

export type LieuSection = {
  id: string;
  title: string;
  content: SectionBlock[];
  seeAlso?: { href: string; label: string }[];
};

export type LieuSaint = {
  slug: string;
  title: string;
  location: string;
  locationKicker: string;
  excerpt: string;
  readingTime: number;
  publishedAt: string;
  modifiedAt?: string;
  sections: LieuSection[];
  faq: { question: string; answer: string }[];
};

export const lieuxSaints: Record<string, LieuSaint> = {
  'masjid-al-haram': {
    slug: 'masjid-al-haram',
    title: 'Masjid Al-Haram et la Kaaba',
    location: 'La Mecque, Hijaz',
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "Le premier sanctuaire monothéiste de l'humanité — au cœur duquel la Kaaba est la Qibla vers laquelle se tournent 1,8 milliard de musulmans cinq fois par jour.",
    readingTime: 10,
    publishedAt: '2026-05-11T09:00:00+03:00',
    modifiedAt: '2026-05-11T09:00:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine et histoire',
        content: [
          {
            type: 'paragraph',
            content: "La Kaaba — du mot arabe «cube» — est le sanctuaire le plus sacré de l'Islam. Selon la tradition islamique, Allah ordonna à Ibrahim ﷺ et à son fils Ismaël ﷺ d'élever les fondations de cette Maison sur l'emplacement où Adam avait initialement bâti un premier lieu d'adoration.",
          },
          {
            type: 'callout',
            text: "Et lorsqu'Ibrahim éleva les fondations de la Maison avec Ismaël [ils supplièrent] : «Notre Seigneur ! Accepte cela de notre part. Tu es certes Celui qui entend et qui sait tout.»",
            reference: 'Sourate Al-Baqara, verset 127',
          },
          {
            type: 'paragraph',
            content: "La Kaaba a connu plusieurs reconstructions tout au long de son histoire. Avant l'Islam, elle abritait des idoles que le Prophète Muhammad ﷺ fit détruire lors de la conquête de La Mecque en l'an 8 de l'Hégire (630 de l'ère chrétienne), la ramenant à sa vocation monothéiste originelle. Au VIIe siècle, les Qurayshites l'avaient entièrement reconstruite en utilisant notamment du bois d'un navire grec naufragé sur les côtes du Hijaz.",
          },
          {
            type: 'paragraph',
            content: "Chaque souverain musulman considérait la garde de la Kaaba comme une responsabilité suprême. Le roi d'Arabie Saoudite porte d'ailleurs le titre officiel de «Serviteur des deux Lieux Saints» (Khadim al-Haramayn). Les travaux d'extension du Masjid Al-Haram, entrepris dès les années 1950 et poursuivis jusqu'à aujourd'hui, ont porté la capacité du sanctuaire à plus de deux millions de pèlerins simultanément.",
          },
        ],
      },
      {
        id: 'architecture',
        title: 'Description architecturale',
        content: [
          {
            type: 'stats',
            items: [
              { label: 'Hauteur Kaaba', value: '13 mètres' },
              { label: 'Capacité Haram', value: '2 millions' },
              { label: 'Superficie totale', value: '356 000 m²' },
              { label: 'Minarets', value: '9 minarets' },
            ],
          },
          {
            type: 'paragraph',
            content: "La Kaaba est une structure cubique en maçonnerie de pierre de granit local. Elle mesure environ 13 mètres de hauteur, 12 mètres de large et 10 mètres de profondeur, posée sur une base en marbre. Sa porte unique, en or massif, s'ouvre environ deux fois par an pour des occasions exceptionnelles.",
          },
          {
            type: 'paragraph',
            content: "La Kiswa est le voile noir en soie, brodé de versets coraniques en fil d'or et d'argent, qui recouvre entièrement la Kaaba. Elle est renouvelée chaque année le 9 Dhul Hijja. Des artisans de la Manufacture de la Kiswa à La Mecque travaillent toute l'année à sa confection — un travail de près de 200 artisans spécialisés.",
          },
          {
            type: 'paragraph',
            content: "La Hajar al-Aswad (Pierre noire), encastrée dans l'angle sud-est de la Kaaba, est l'élément le plus symbolique. D'après les textes islamiques, elle descend du Paradis et était d'une blancheur immaculée avant d'être ternie par les péchés des hommes. Les pèlerins tentent de la toucher ou de l'embrasser au début de chaque tour du Tawaf — si la foule ne le permet pas, un simple signe de la main suffit.",
          },
          {
            type: 'paragraph',
            content: "Le Maqam Ibrahim, situé à quelques mètres de la Kaaba, est la pierre sur laquelle Ibrahim ﷺ se tenait lors de la construction. Les empreintes de ses pieds y sont encore visibles. Après le Tawaf, les pèlerins accomplissent deux rak'ahs de prière derrière ce maqam. Le Hijr Ismaël est un espace semi-circulaire adjacent à la Kaaba, délimité par une murette basse (hatim). Effectuer le Tawaf à l'intérieur du Hijr invalide le tour, car cet espace fait partie de la Kaaba originelle.",
          },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          {
            type: 'callout',
            text: "Le premier temple qui ait été édifié pour les gens, c'est bien celui de Bakka (La Mecque), béni et constituant une guidance pour les mondes.",
            reference: 'Sourate Al-Imran, verset 96',
          },
          {
            type: 'paragraph',
            content: "La Kaaba est la Qibla de plus de 1,8 milliard de musulmans — la direction vers laquelle se tournent les croyants pour chacune de leurs cinq prières quotidiennes. En ce sens, elle est littéralement le centre spirituel de la Oumma islamique, un point d'unité unique au monde, indépendant de toute nationalité ou culture.",
          },
          {
            type: 'paragraph',
            content: "En effectuant le Tawaf, le pèlerin rejoint un mouvement de dévotion millénaire. Aux heures de pointe, jusqu'à 100 000 personnes circumambulent simultanément autour de la Kaaba. Cette image — des millions de croyants en vêtements blancs, tournant dans le même sens, invoquant le même Dieu — est l'une des plus puissantes de l'Islam. Une prière accomplie au Masjid Al-Haram vaut 100 000 prières dans toute autre mosquée.",
          },
        ],
      },
      {
        id: 'rituels',
        title: 'Rituels associés',
        content: [
          {
            type: 'paragraph',
            content: "La Kaaba est au cœur de trois rituels fondamentaux de l'Omra et du Hajj, chacun porteur d'une signification profonde.",
          },
          {
            type: 'rituals',
            items: [
              {
                icon: 'rotate-cw',
                title: 'Le Tawaf — 7 circumambulations',
                description: "Sept tours dans le sens anti-horaire, en commençant par la Hajar al-Aswad. Chaque passage marque un renouvellement de l'intention et une proximité avec Allah. Le premier tour peut être effectué à un rythme rapide (raml) pour les hommes.",
              },
              {
                icon: 'droplets',
                title: "Eau de Zamzam — l'eau bénie",
                description: "Le puits de Zamzam, situé à quelques mètres de la Kaaba, fournit une eau disponible gratuitement dans tout le Masjid Al-Haram. Le Prophète ﷺ a dit : «L'eau de Zamzam convient à la finalité pour laquelle on la boit.»",
              },
              {
                icon: 'heart',
                title: 'Salat al-Janazah',
                description: "La prière funéraire collective est célébrée quotidiennement après la prière du Fajr dans la cour principale du Masjid Al-Haram, en présence de la Kaaba. Une opportunité spirituelle rare à saisir lors de chaque séjour.",
              },
            ],
          },
        ],
        seeAlso: [{ href: '/blog/les-7-tours-du-tawaf', label: 'Les 7 tours du Tawaf — sens et spiritualité' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "Pour vivre le Tawaf dans les meilleures conditions, les heures après la prière de Fajr (environ 5h-7h) et après Isha (21h-23h) sont généralement les moins fréquentées. À l'inverse, les après-midi et les heures précédant la prière du Vendredi attirent le plus de monde.",
          },
          {
            type: 'paragraph',
            content: "La tenue : les hommes en état d'ihram portent deux pièces de tissu blanc non cousu et des sandales. Les femmes portent une tenue pudique couvrant tout le corps à l'exception du visage et des mains — le niqab et les gants sont proscrits pendant l'état d'ihram selon la majorité des savants.",
          },
          {
            type: 'paragraph',
            content: "L'hydratation est critique. La Mecque est une ville désertique avec des températures pouvant dépasser 45°C en été. L'eau de Zamzam est disponible partout dans le Masjid Al-Haram. Buvez fréquemment, avant de ressentir la soif. Restez proche des bords extérieurs du circuit si vous souhaitez un rythme plus calme.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Pour effectuer le Tawaf dans les meilleures conditions, privilégiez les heures juste après Fajr (entre 5h et 7h). La distance à parcourir reste identique quelle que soit votre position dans le circuit, mais l'expérience spirituelle gagne en sérénité. Votre guide SAFARUMA connaît les créneaux optimaux selon la saison et adapte le programme de votre journée en conséquence.",
          },
        ],
        seeAlso: [{ href: '/blog/comment-preparer-omra-10-etapes', label: 'Comment préparer son Omra en 10 étapes' }],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          {
            type: 'paragraph',
            content: "Plusieurs erreurs fréquentes peuvent invalider ou diminuer la valeur spirituelle du Tawaf. Les connaître en amont vous évitera stress et reprise inutile.",
          },
          {
            type: 'list',
            items: [
              "Effectuer le Tawaf dans le sens horaire : le Tawaf se fait exclusivement dans le sens anti-horaire. Tourner dans l'autre sens invalide le tour.",
              "Inclure le Hijr Ismaël dans sa trajectoire intérieure : passer à l'intérieur du demi-cercle invalide le Tawaf car le Hijr fait partie de la Kaaba originelle.",
              "Croire que toucher la Pierre noire est obligatoire : si la foule l'empêche, un simple signe de la main suffit. Se bousculer pour y accéder n'est pas recommandé.",
              "Effectuer le Tawaf sans ablutions (wudu) : le Tawaf nécessite d'être en état de pureté rituelle complète.",
              "Photographier à l'intérieur du Masjid Al-Haram : interdit par respect pour la sainteté du lieu et la vie privée des pèlerins.",
              "Négliger les invocations (du'a) : le Tawaf est un moment d'adoration intense. Parler à Allah dans sa propre langue, depuis le cœur, est pleinement valide.",
            ],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Peut-on toucher la Kaaba pendant le Tawaf ?',
        answer: "Oui, si l'on passe suffisamment près. Le Multazam — la partie de la Kaaba entre la porte et la Hajar al-Aswad — est particulièrement recommandé pour les invocations. Toucher la Kaaba n'est pas obligatoire. Si la foule l'empêche, continuez votre Tawaf normalement.",
      },
      {
        question: 'Quel est le sens des 7 tours du Tawaf ?',
        answer: "Les 7 tours symbolisent la complétude de la dévotion. La direction anti-horaire est la direction naturelle de nombreux phénomènes cosmiques. Chaque tour est une opportunité de se rapprocher d'Allah par l'invocation et la méditation. Les 7 premiers tours constituent le Tawaf d'arrivée (Tawaf al-Qudum) lors de l'Omra.",
      },
      {
        question: 'À quelles heures effectuer le Tawaf pour éviter la foule ?',
        answer: "Les meilleures heures sont après Fajr (5h-7h) et après Isha (21h-23h). Évitez les après-midi en été — la chaleur y est extrême — et les vendredis mid-journée qui attirent une grande affluence locale.",
      },
      {
        question: 'Que faire si je perds mon groupe pendant le Tawaf ?',
        answer: "Restez calme et continuez votre Tawaf normalement. Un point de rendez-vous convenu à l'avance avec votre guide est indispensable. Votre guide SAFARUMA établit toujours un plan de contingence avant le début du Tawaf. En dernier recours, rejoignez l'entrée principale du Masjid Al-Haram.",
      },
      {
        question: 'Le Tawaf doit-il être fait obligatoirement en état d\'ihram ?',
        answer: "Pas nécessairement. Le Tawaf effectué dans le cadre de l'Omra (Tawaf al-Qudum) ou du Hajj requiert l'état d'ihram. Le Tawaf de dévotion volontaire (Tawaf al-Nafl) peut être accompli en tout temps sans ihram, simplement en état de pureté rituelle (wudu).",
      },
      {
        question: 'Combien de fois recommencer si je me trompe dans le nombre de tours ?',
        answer: "En cas de doute sur le nombre exact de tours effectués, prenez le nombre le plus bas dont vous êtes certain et complétez en conséquence. Si vous êtes convaincu d'avoir raté un tour entier, recommencez depuis le début. En cas de doute mineur, les savants recommandent de prendre le nombre le plus bas.",
      },
      {
        question: 'Peut-on faire le Tawaf en chaise roulante ou à mobilité réduite ?',
        answer: "Oui, absolument. Le Masjid Al-Haram propose des services de chaises roulantes avec accompagnateurs dédiés, sur un circuit aménagé. Il est recommandé de réserver ce service à l'avance par l'intermédiaire de votre guide. Les personnes à mobilité réduite bénéficient de couloirs spécifiques moins encombrés.",
      },
      {
        question: 'Y a-t-il un dress code à respecter dans le Masjid Al-Haram ?',
        answer: "En état d'ihram : deux pièces de tissu blanc non cousu pour les hommes, tenue pudique couvrant tout le corps (sauf visage et mains) pour les femmes. Hors état d'ihram : la tenue doit rester modeste et respectueuse du lieu — épaules et jambes couvertes. Les femmes doivent couvrir leurs cheveux à l'intérieur du Masjid.",
      },
    ],
  },

  // ─── SAFA-MARWA ─────────────────────────────────────────────────────────────
  'safa-marwa': {
    slug: 'safa-marwa',
    title: "Safa et Marwa : la Sa'i, parcours de Hajar",
    location: 'La Mecque, Hijaz',
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "Les deux collines sacrées entre lesquelles Hajar courut sept fois pour trouver de l'eau pour son fils Ismaël — commémorées par le rituel de la Sa'i, pilier de l'Omra.",
    readingTime: 9,
    publishedAt: '2026-05-11T10:00:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine : la course de Hajar',
        content: [
          { type: 'callout', text: "Safa et Marwa font partie des signes d'Allah. Celui qui fait le Hajj ou la Omra ne commet pas de faute en faisant le tour des deux.", reference: 'Sourate Al-Baqara, verset 158' },
          { type: 'paragraph', content: "Il y a plus de quatre mille ans, Ibrahim ﷺ déposa son épouse Hajar et leur nourrisson Ismaël dans la vallée aride de La Mecque, sur l'ordre d'Allah. Sans végétation ni eau, les provisions s'épuisèrent rapidement. Hajar, voyant son fils mourir de soif, se précipita vers la colline de Safa pour chercher une caravane ou un signe de secours. N'en voyant aucun, elle redescendit et courut jusqu'à Marwa. Elle répéta ce trajet sept fois, courant entre les deux points surélevés d'où elle pouvait surveiller l'enfant dans la vallée." },
          { type: 'paragraph', content: "À l'issue de ce septième passage, l'ange Jibrîl frappa la terre de son talon et la source de Zamzam jaillit. Hajar se précipita pour retenir l'eau en disant «Zommi, Zommi» (retiens-toi, retiens-toi) — c'est l'étymologie traditionnelle du nom Zamzam. Cette course désespérée d'une mère pour son enfant, empreinte de foi absolue en Allah, est commémorée par tout pèlerin accomplissant l'Omra ou le Hajj jusqu'à la fin des temps." },
        ],
        seeAlso: [{ href: '/lieux-saints/zamzam', label: 'Le puits de Zamzam — eau bénie de l\'Islam' }],
      },
      {
        id: 'description',
        title: 'Description du lieu',
        content: [
          { type: 'stats', items: [
            { label: 'Distance Safa–Marwa', value: '~450 m' },
            { label: 'Allers-retours', value: '7 trajets' },
            { label: 'Distance totale', value: '~3,15 km' },
            { label: 'Niveaux du couloir', value: '3 niveaux' },
          ]},
          { type: 'paragraph', content: "Safa est une petite butte de granit côté sud de la Kaaba, à environ 100 mètres du sanctuaire. Marwa est sa colline homologue, située à environ 450 mètres. Toutes deux sont aujourd'hui intégrées dans l'immense enceinte du Masjid Al-Haram. Le corridor qui les relie, appelé Mas'a, mesure environ 450 mètres de long et 20 mètres de large. Il est climatisé, couvert, et dispose de trois niveaux — permettant de distribuer les flux de pèlerins." },
          { type: 'paragraph', content: "Deux colonnes vertes fluorescentes marquent une zone intermédiaire d'environ 50 mètres appelée le «raml». Les hommes sont encouragés à hâter le pas dans cette zone, en souvenir de Hajar qui courait pour voir son fils. Les femmes marchent à rythme normal tout au long du parcours. Des chaises roulantes motorisées et des accompagnateurs sont disponibles pour les personnes à mobilité réduite ou les personnes âgées." },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          { type: 'paragraph', content: "La Sa'i est l'un des piliers (arkan) de l'Omra et du Hajj — ce qui signifie que son omission invalide le pèlerinage, et qu'aucune expiation ne peut la compenser. Elle est régie par la Sunna du Prophète ﷺ qui l'accomplit lors de ses pèlerinages et la prescrivit avec précision à ses Compagnons." },
          { type: 'paragraph', content: "Sur le plan spirituel, la Sa'i est la commémoration d'une foi féminine exemplaire. Hajar ne fut pas une spectatrice passive de la volonté divine — elle agit avec tout ce qu'elle avait, dans une situation désespérée, sans jamais cesser de faire confiance à Allah. Les savants islamiques voient dans ce récit une leçon fondamentale : la tawakkul (confiance en Allah) ne dispense pas de l'effort humain, elle le précède et l'accompagne. En accomplissant la Sa'i, le pèlerin s'inscrit dans cette tradition de foi active." },
          { type: 'paragraph', content: "Le Coran souligne que Safa et Marwa sont «des signes d'Allah» (sha'air Allah) — une notion qui va au-delà de la simple référence géographique. C'est un rappel permanent que les lieux et les événements peuvent devenir des symboles éternels d'obéissance et de miséricorde divine." },
        ],
      },
      {
        id: 'rituel',
        title: "Le Sa'i — le rituel en détail",
        content: [
          { type: 'paragraph', content: "La Sa'i débute à Safa et se termine à Marwa. Chaque trajet (aller ou retour) compte pour un. Le septième trajet se termine donc à Marwa. Avant de commencer à Safa, il est Sunna de monter sur la butte, de se tourner vers la Kaaba, et de réciter : «Nabdaou bi-mabada'a Allahu bihi» (Nous commençons par ce par quoi Allah a commencé), puis de lever les mains pour l'invocation et de réciter le verset 2:158." },
          { type: 'paragraph', content: "Les hommes hâtent le pas entre les deux colonnes vertes lors de chaque passage dans la zone de raml. En dehors de cette zone, tous marchent à un rythme normal. Il n'existe pas de du'a imposée pour la Sa'i — le pèlerin est libre d'invoquer Allah dans sa langue ou avec les du'a qu'il connaît. Il est Sunna de lever les mains en direction de la Kaaba en montant sur Safa et sur Marwa à chaque passage." },
          { type: 'expert-tip', title: 'Conseil expert SAFARUMA', text: "Si la foule est dense au rez-de-chaussée, les niveaux supérieurs permettent un parcours beaucoup plus fluide avec une vue dégagée. Le deuxième niveau est particulièrement recommandé pour les familles avec jeunes enfants ou pour les pèlerins qui souhaitent éviter la cohue. Votre guide SAFARUMA vous orientera vers le niveau optimal selon la saison et l'heure de votre Sa'i." },
        ],
        seeAlso: [{ href: '/blog/comment-preparer-omra-10-etapes', label: 'Préparer son Omra en 10 étapes' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          { type: 'paragraph', content: "La Sa'i se fait généralement immédiatement après le Tawaf, sans interruption significative. Si vous avez besoin de vous reposer brièvement (boire de l'eau de Zamzam, assis), cela est permis sans invalidation. Les ablutions ne sont pas obligatoires pour la Sa'i (contrairement au Tawaf), bien que les recommander reste Sunna." },
          { type: 'paragraph', content: "Comptez vos allers-retours mentalement ou avec un compteur de tasbih. Si vous perdez le compte, recommencez depuis le nombre dont vous êtes certain. Pour les personnes âgées ou à mobilité réduite, des fauteuils roulants électriques avec accompagnateurs sont disponibles à l'entrée du Mas'a — réservez-les via votre guide bien avant le début du rituel." },
          { type: 'paragraph', content: "Les meilleures heures pour la Sa'i sont les mêmes que pour le Tawaf : après Fajr (5h-7h) et après Isha (21h-23h). La chaleur dans le couloir couvert reste gérable mais pensez à vous hydrater régulièrement — des fontaines d'eau de Zamzam jalonnent l'ensemble du parcours." },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          { type: 'list', items: [
            "Commencer à Marwa au lieu de Safa — le Sa'i doit impérativement commencer à Safa et se terminer à Marwa.",
            "Compter un aller-retour comme un seul trajet — chaque trajet (Safa→Marwa ou Marwa→Safa) est un tour distinct, soit 7 trajets au total.",
            "Oublier de hâter le pas entre les colonnes vertes pour les hommes — ce raml est Sunna mu'akkada (fortement recommandé).",
            "Ne pas monter sur Safa ou Marwa pour l'invocation — il faut monter sur chaque colline à chaque passage.",
            "Faire la Sa'i sans avoir fait le Tawaf — la Sa'i doit être précédée d'un Tawaf valide.",
            "Croire que les ablutions sont obligatoires — elles sont recommandées mais non requises pour valider la Sa'i.",
          ]},
        ],
      },
    ],
    faq: [
      { question: "Doit-on faire la Sa'i immédiatement après le Tawaf ?", answer: "Il est Sunna de la faire immédiatement après le Tawaf. Cependant, si vous devez vous reposer, prier une prière obligatoire ou prendre soin d'un proche, vous pouvez faire une pause puis reprendre. L'essentiel est que le Tawaf soit accompli avant la Sa'i." },
      { question: "Peut-on s'asseoir pendant la Sa'i pour se reposer ?", answer: "Oui, une pause assise est permise sans invalider la Sa'i. Les ablutions ne sont pas requises après s'être assis. Reprenez simplement là où vous vous êtes arrêté." },
      { question: "La Sa'i est-elle valide si on n'est pas en ihram ?", answer: "La Sa'i effectuée dans le cadre de l'Omra ou du Hajj requiert d'être en état d'ihram. En dehors de ces contextes rituels, la Sa'i n'est pas pratiquée." },
      { question: "Que faire si je perds le compte de mes trajets ?", answer: "Prenez le nombre le plus bas dont vous êtes certain et complétez jusqu'à 7. En cas de fort doute, recommencez depuis le début pour être certain de la validité du rituel." },
      { question: "Les femmes doivent-elles courir entre les colonnes vertes ?", answer: "Non. La course entre les colonnes vertes (raml) est spécifique aux hommes. Les femmes maintiennent une marche normale et continue tout au long des 7 trajets." },
      { question: "La Sa'i est-elle un pilier ou une condition de l'Omra ?", answer: "Selon la majorité des savants (Shafi'i, Hanbali, Maliki), la Sa'i est un pilier (rukn) dont l'omission invalide l'Omra. Selon les Hanafis, c'est une obligation (wajib) dont l'omission est réparable par une expiation (dam)." },
      { question: "Peut-on faire la Sa'i en fauteuil roulant ?", answer: "Oui, absolument. Des fauteuils roulants motorisés avec accompagnateurs dédiés sont disponibles à l'entrée du Mas'a. Le parcours adapté PMR est au rez-de-chaussée. Réservez ce service à l'avance via votre guide SAFARUMA." },
      { question: "Combien de temps dure la Sa'i en moyenne ?", answer: "En moyenne 45 à 90 minutes selon la saison et l'affluence. Hors saison, un pèlerin en bonne forme peut la compléter en 40 minutes. En haute saison du Hajj, comptez 1h30 à 2h." },
    ],
  },

  // ─── ZAMZAM ──────────────────────────────────────────────────────────────────
  'zamzam': {
    slug: 'zamzam',
    title: "Le puits de Zamzam : eau bénie de l'Islam",
    location: 'La Mecque, Hijaz',
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "Source miraculeuse jaillie sous le pied d'Ismaël, abreuvant sans interruption les pèlerins depuis plus de quatre mille ans — l'eau la plus sacrée de l'Islam.",
    readingTime: 8,
    publishedAt: '2026-05-11T10:30:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine miraculeuse',
        content: [
          { type: 'callout', text: "L'eau de Zamzam est pour ce pour quoi elle est bue.", reference: "Hadith rapporté par Ibn Mâjah (n° 3062) — validé par de nombreux savants" },
          { type: 'paragraph', content: "L'histoire de Zamzam est indissociable du récit de Hajar et Ismaël. Abandonnés dans la vallée aride de La Mecque sur l'ordre d'Allah, mère et fils épuisèrent rapidement leurs provisions. Hajar courut sept fois entre Safa et Marwa à la recherche d'eau. Au terme de cette course empreinte de foi, l'ange Jibrîl frappa la terre de son talon — et l'eau jaillit." },
          { type: 'paragraph', content: "Le Prophète Muhammad ﷺ rapporte le récit complet dans un long hadith (Bukhari n° 3364) : Hajar s'écria «Zammi, zammi» (retiens-toi, retiens-toi) pour contenir le flot. Certains linguistes relient ce nom au terme araméen «zam» signifiant «abondant» ou «retenu». Depuis ce jour il y a plus de quatre mille ans, la source n'a jamais tari — malgré des millions de pèlerins qui y puisent chaque année." },
        ],
        seeAlso: [
          { href: '/lieux-saints/safa-marwa', label: "Safa et Marwa — la Sa'i, parcours de Hajar" },
          { href: '/lieux-saints/masjid-al-haram', label: 'Masjid Al-Haram et la Kaaba' },
        ],
      },
      {
        id: 'description',
        title: 'Description physique et accès',
        content: [
          { type: 'stats', items: [
            { label: 'Profondeur', value: '~30 mètres' },
            { label: 'Débit', value: '18,5 L/s' },
            { label: 'Minéraux', value: 'Calcium, Mg, Cl' },
            { label: 'Âge estimé', value: '+4 000 ans' },
          ]},
          { type: 'paragraph', content: "Le puits de Zamzam est situé à environ 20 mètres à l'est de la Kaaba, sous le niveau du sol du Masjid Al-Haram. Sa profondeur totale est d'environ 30 mètres, dont les 14 premiers mètres sont creusés dans la roche alluviale et les 17 mètres suivants dans le granit. La nappe phréatique qui l'alimente est distincte des eaux superficielles normales — elle est rechargée par des infiltrations très profondes, ce qui explique son débit constant malgré une consommation de plusieurs millions de litres par jour." },
          { type: 'paragraph', content: "L'accès direct au puits est réservé aux hommes via un sous-sol spécial accessible depuis l'enceinte du Masjid Al-Haram. Pour l'ensemble des pèlerins, l'eau est disponible gratuitement dans des fontaines réfrigérées réparties dans tout le Haram, et en bouteilles scellées fournies par les autorités saoudiennes. La composition chimique de Zamzam a été étudiée par des chercheurs saoudiens et étrangers : elle contient du calcium, du magnésium, du chlorure de sodium et des bicarbonates en proportions particulières, sans bactéries détectables malgré l'absence de traitement chimique." },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Vertus et importance spirituelle',
        content: [
          { type: 'paragraph', content: "L'eau de Zamzam occupe une place unique dans la tradition islamique. Le Prophète ﷺ en buvait régulièrement, la versait sur sa tête et l'emportait avec lui. Il a dit : «La meilleure eau sur la surface de la Terre est l'eau de Zamzam. On y trouve ce qui peut rassasier et y trouver une guérison des maladies.» (Tabarani, considéré hassan par de nombreux savants)." },
          { type: 'paragraph', content: "L'imam Ahmad ibn Hanbal, fondateur du madhab hanbali, avait pour habitude de boire Zamzam en faisant des invocations précises pour sa santé et sa connaissance. Le hadith d'Ibn Mâjah — «l'eau de Zamzam est pour ce pour quoi elle est bue» — est compris par les savants comme une invitation à faire une niyyah (intention) précise avant de boire : guérison, connaissance, baraka, guidance." },
          { type: 'paragraph', content: "Contrairement aux idées reçues, l'eau de Zamzam ne «se périme» pas. Des études ont montré qu'elle conserve ses propriétés sans adjonction de produits chimiques, même après plusieurs mois de conservation dans des conditions normales." },
        ],
      },
      {
        id: 'rituel',
        title: "Comment boire l'eau de Zamzam",
        content: [
          { type: 'rituals', items: [
            { icon: 'target', title: 'Faire face à la Qibla', description: "Tournez-vous vers la Kaaba (Qibla) avant de boire. C'est la Sunna établie du Prophète ﷺ, qui se tournait vers la direction de la Kaaba pour boire l'eau de Zamzam." },
            { icon: 'droplets', title: 'Boire en 3 gorgées', description: "Récitez «Bismillah» avant chaque gorgée. Buvez en trois fois, en reprenant votre souffle entre chaque. Cette manière de boire est la Sunna du Prophète ﷺ pour l'eau de Zamzam spécifiquement." },
            { icon: 'heart', title: "Faire une du'a intentionnelle", description: "Avant de boire, formulez mentalement une intention précise — guérison, succès, connaissance, hafidh du Coran, satisfaction d'un besoin. Le hadith garantit que Zamzam répond à l'intention de celui qui boit." },
          ]},
          { type: 'expert-tip', title: 'Conseil expert SAFARUMA', text: "Ne pas «rationner» l'eau de Zamzam est un conseil souvent donné par les guides expérimentés. Allah l'a fait jaillir en abondance — buvez-en autant que vous le souhaitez. Versez-en également sur votre tête et votre visage comme le faisait le Prophète ﷺ. Prévoyez un jerrican de 5L à ramener en soute (généralement autorisé par les compagnies aériennes avec validation préalable)." },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          { type: 'paragraph', content: "L'eau est disponible partout dans le Haram — ne vous inquiétez pas de manquer. Les fontaines réfrigérées (eau fraîche et eau à température ambiante selon les robinets) sont placées tous les 30-40 mètres. Pour le Tawaf et la Sa'i, buvez avant de commencer et utilisez les fontaines aux pauses." },
          { type: 'paragraph', content: "Pour en ramener en France : les autorités saoudiennes ont imposé en 2023 une réglementation sur l'exportation non officielle. L'eau de Zamzam en soute est autorisée dans des contenants scellés non dépassant 5 litres par personne. En cabine, les contenants liquides sont soumis à la règle habituelle des 100ml. Méfiez-vous des vendeurs en dehors du Haram qui proposent de la «vraie Zamzam» — seule l'eau directement disponible dans l'enceinte du Masjid Al-Haram est authentique." },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          { type: 'list', items: [
            "Acheter de l'eau de Zamzam hors du Masjid Al-Haram — seule l'eau disponible directement dans l'enceinte du Haram est authentique.",
            "Croire qu'il faut «rationner» l'eau — l'eau est gratuite et abondante, buvez-en à satiété.",
            "Boire sans faire d'intention (niyyah) — c'est une opportunité spirituelle unique, ne la gâchez pas.",
            "Jeter ou gaspiller l'eau de Zamzam — c'est un acte irrespectueux vis-à-vis d'une eau bénie.",
            "Croire que l'eau de Zamzam peut remplacer un traitement médical — elle est un complément spirituel, consultez un médecin pour tout problème de santé.",
          ]},
        ],
      },
    ],
    faq: [
      { question: "L'eau de Zamzam est-elle scientifiquement analysée ?", answer: "Oui. Des études saoudiennes et étrangères ont analysé sa composition : calcium, magnésium, bicarbonates, fluorures et chlorures. Sa teneur en sels minéraux est supérieure à la moyenne des eaux de source. Aucune bactérie pathogène n'a été détectée, malgré l'absence de chloration." },
      { question: "Peut-on ramener de l'eau de Zamzam dans l'avion ?", answer: "En soute : oui, dans des contenants scellés de 5 litres maximum par personne (vérifiez les conditions de votre compagnie). En cabine : soumis à la règle habituelle des 100ml. Les compagnies saoudiennes autorisent généralement 5L supplémentaires." },
      { question: "L'eau de Zamzam a-t-elle des vertus curatives prouvées ?", answer: "Sur le plan islamique, les hadiths authentiques attestent de ses vertus selon l'intention du buveur. Sur le plan scientifique, sa composition minérale particulière est documentée. Elle n'est pas un substitut à un traitement médical, mais un complément spirituel pour de nombreux croyants." },
      { question: "Peut-on boire de l'eau de Zamzam réchauffée ou bouillie ?", answer: "Oui. Certains savants mentionnent qu'il est préférable de la boire à température ambiante ou fraîche, mais aucune interdiction n'existe sur la boire chaude. Des pèlerins la boivent parfois en infusion avec du miel." },
      { question: "Faut-il absolument se tourner vers la Qibla pour boire ?", answer: "C'est la Sunna du Prophète ﷺ — fortement recommandée. Si l'orientation est difficile à determiner dans la foule, l'intention sincère suffit." },
      { question: "Le puits est-il encore accessible directement ?", answer: "L'accès direct au puits est réservé aux hommes via un espace sous-terrain accessible depuis le Haram. Pour les femmes et les pèlerins en général, les fontaines distribuées dans tout le Haram permettent d'accéder à la même eau." },
      { question: "Peut-on prendre l'eau de Zamzam avant de faire l'Omra ?", answer: "Oui. L'eau de Zamzam peut être bue à tout moment lors de votre séjour à La Mecque, avant, pendant ou après les rituels. Il n'existe pas de restriction temporelle." },
    ],
  },

  // ─── MINA ────────────────────────────────────────────────────────────────────
  'mina': {
    slug: 'mina',
    title: 'Mina : la vallée du sacrifice et du Hajj',
    location: 'À 5 km de La Mecque, Hijaz',
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "La vallée où Ibrahim ﷺ se prépara à sacrifier Ismaël, et où des millions de pèlerins du Hajj résident trois nuits chaque année pour accomplir les rites de la lapidation.",
    readingTime: 9,
    publishedAt: '2026-05-11T11:00:00+03:00',
    sections: [
      {
        id: 'origine',
        title: "Origine : le sacrifice d'Ibrahim",
        content: [
          { type: 'callout', text: "Lorsqu'il [Ismaël] fut en âge de l'accompagner, il [Ibrahim] dit : «Ô mon fils, je me vois en songe en train de t'immoler. Que penses-tu ?» Il répondit : «Ô mon père, fais ce qui t'est ordonné. Tu me trouveras, si Allah le veut, du nombre des patients.»", reference: 'Sourate As-Saffat, verset 102' },
          { type: 'paragraph', content: "La vallée de Mina est indissociable du récit du grand sacrifice. Selon la tradition islamique, c'est dans cette vallée qu'Ibrahim ﷺ reçut le commandement divin d'immoler son fils Ismaël ﷺ — un test suprême de soumission absolue à Allah. Le Coran narre cet événement dans la Sourate As-Saffat (37:100-112) : quand Ibrahim et Ismaël se soumirent et qu'Ibrahim s'apprêtait à exécuter l'ordre, Allah intervint et lui dit d'arrêter, révélant qu'il avait réussi l'épreuve, et lui envoya un bélier du Paradis en remplacement." },
          { type: 'paragraph', content: "Lors de ce même événement, Satan tenta trois fois d'interrompre Ibrahim dans son chemin vers le sacrifice. Ibrahim le repoussa chaque fois en lui lançant des pierres — un geste symbolique que chaque pèlerin du Hajj commémore en lapidant les trois Jamarat (piliers) de Mina. C'est également l'origine théologique de l'Aïd al-Adha, fête du sacrifice célébrée par les musulmans du monde entier chaque 10 Dhul Hijjah." },
        ],
        seeAlso: [
          { href: '/lieux-saints/arafat', label: 'Mont Arafat — le pilier du Hajj' },
          { href: '/blog/difference-omra-hajj', label: 'Différence entre Omra et Hajj' },
        ],
      },
      {
        id: 'description',
        title: 'Description et infrastructure',
        content: [
          { type: 'stats', items: [
            { label: 'Distance La Mecque', value: '~5 km' },
            { label: 'Tentes climatisées', value: '160 000' },
            { label: 'Capacité', value: '2,5 millions' },
            { label: 'Jamarat', value: '3 piliers' },
          ]},
          { type: 'paragraph', content: "Mina est une vallée étroite encaissée entre des montagnes granitiques, à 5 km à l'est de La Mecque. La plupart de l'année, elle est déserte — quelques gardiens, des tentes pliées, un silence presque irréel. Pendant le Hajj, elle se transforme en la plus grande ville de tentes au monde : 160 000 tentes blanches climatisées, installées à demeure depuis 1997, couvrent la totalité de la plaine disponible." },
          { type: 'paragraph', content: "Les trois Jamarat sont les piliers les plus importants de Mina. Ils représentent les endroits où Satan tenta Ibrahim. Depuis la tragédie de 2006 (bousculade qui fit 346 victimes), l'Arabie Saoudite a reconstruit entièrement le complexe : c'est aujourd'hui un pont piéton de 950 mètres de long sur 5 niveaux, permettant à des centaines de milliers de pèlerins de lapider en simultané de façon sûre et fluide." },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          { type: 'paragraph', content: "Mina est un lieu d'une profondeur théologique immense. Les nuits passées sous les tentes blanches, en communauté avec des millions de pèlerins venus du monde entier, sont souvent décrites par les pèlerins comme des moments de grâce exceptionnelle. La lapidation — ce geste de rejeter des cailloux sur des piliers de pierre — transcende le symbolisme : c'est la visualisation concrète du rejet du mal, du shaytân, des tentations qui éloignent de la soumission à Allah." },
          { type: 'paragraph', content: "Pour les pèlerins de l'Omra, il est important de noter que Mina ne fait pas partie des rites de la Omra. Les Jamarat, le sacrifice, les nuits à Mina sont des rites propres au Hajj (pilier du Dhul Hijjah). Un pèlerin de l'Omra peut visiter Mina hors saison du Hajj comme site historique, mais la vallée n'a alors pas sa charge émotionnelle habituelle." },
        ],
      },
      {
        id: 'rituels',
        title: 'Les rites du Hajj à Mina',
        content: [
          { type: 'rituals', items: [
            { icon: 'target', title: 'Lapidation des Jamarat (Rami)', description: "Le 10 Dhul Hijjah, lapidation de Jamrat al-Aqaba (7 cailloux). Les 11, 12 et 13 : lapidation des trois Jamarat dans l'ordre (Sughra, Wusta, Aqaba). Chaque cailloux de la taille d'un pois chiche est lancé avec «Bismillah, Allahu Akbar»." },
            { icon: 'scissors', title: 'Sacrifice et coupe des cheveux', description: "Après la lapidation du 10 : sacrifice d'un animal (délégué à une organisation habilitée via Nusuk) et rasage ou coupe des cheveux — sortie partielle de l'état d'ihram. Ces actes s'accomplissent dans cet ordre précis." },
            { icon: 'moon', title: 'Trois nuits à Mina (Tachrik)', description: "Les nuits du 10 au 11, du 11 au 12, et du 12 au 13 Dhul Hijjah doivent être passées à Mina. Chaque nuit est accompagnée de nombreuses prières, de dhikr et de récitation coranique. Certains pèlerins choisissent de partir après la nuit du 12 (Nafr al-Awwal)." },
          ]},
          { type: 'expert-tip', title: 'Conseil expert SAFARUMA', text: "La lapidation des Jamarat est le moment le plus physiquement intense du Hajj. Votre guide SAFARUMA vous accompagnera aux heures les moins fréquentées (généralement après Maghrib ou très tôt le matin) et vous positionnera sur le niveau du pont le plus fluide. Préparez vos cailloux la veille à Muzdalifah et comptez-les par groupes de 7. Ne prenez que des pierres de la taille d'un pois chiche." },
        ],
        seeAlso: [{ href: '/lieux-saints/muzdalifah', label: 'Muzdalifah — la halte sacrée du Hajj' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          { type: 'paragraph', content: "Pour les pèlerins du Hajj, prenez le temps d'explorer vos environs immédiats dans le camp de tentes dès l'arrivée. Repérez les sorties, les points d'eau, les sanitaires et les tentes médicales. Notez le numéro de votre tente — toutes se ressemblent et il est facile de se perdre. Votre guide SAFARUMA vous donnera des points de repère spécifiques." },
          { type: 'paragraph', content: "La chaleur à Mina peut être intense même avec la climatisation des tentes — portez des vêtements légers, hydratez-vous constamment. Les appareils mobiles sont souvent saturés pendant le Hajj — mettez votre guide en favori et convenez d'un plan de contingence si les communications sont coupées." },
          { type: 'paragraph', content: "Pour les visiteurs hors saison Hajj : Mina est accessible et constitue un lieu de méditation paisible. La vallée vide des tentes blanches repliées offre une vision saisissante de ce que sera ce site à l'échelle humaine lors du Hajj. Votre guide SAFARUMA vous en racontera l'histoire et les enjeux logistiques." },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          { type: 'list', items: [
            "Quitter Mina avant les nuits obligatoires sans autorisation islamique (pour personnes valides).",
            "Lapider avant le lever du soleil le 11 Dhul Hijjah — interdit, sauf pour les personnes faibles ou âgées.",
            "Utiliser des pierres trop grandes, des chaussures ou des objets non conformes.",
            "Ne pas respecter l'ordre des trois Jamarat lors des jours de Tachrik (Sughra → Wusta → Aqaba).",
            "Croire que Mina fait partie des rites de l'Omra — Mina est exclusivement réservé aux rites du Hajj.",
            "Se laisser emporter par la foule sans plan de sécurité — convenez toujours d'un point de rendez-vous précis avec votre groupe.",
          ]},
        ],
      },
    ],
    faq: [
      { question: "Mina est-il inclus dans les rites de l'Omra ?", answer: "Non. Mina et les Jamarat sont des rites spécifiques au Hajj, accomplis les 10, 11, 12 et éventuellement 13 Dhul Hijjah. Un pèlerin venant pour l'Omra n'accomplit pas les rites de Mina." },
      { question: "Combien de nuits doit-on passer à Mina ?", answer: "Obligatoirement les nuits du 10 au 11 et du 11 au 12 Dhul Hijjah. La nuit du 12 au 13 (restant pour Nafr al-Ta'khir) est optionnelle selon les écoles juridiques. Partir après la nuit du 12 (Nafr al-Awwal) est permis par la majorité des savants." },
      { question: "Peut-on partir de Mina après la nuit du 12 (Nafr al-Awwal) ?", answer: "Oui. La majorité des savants autorise le Nafr al-Awwal — quitter Mina après la lapidation du 12 Dhul Hijjah avant le coucher du soleil. Ceux qui souhaitent la récompense maximale restent la nuit du 12 et lapident le 13." },
      { question: "Quelle est la taille des cailloux pour la lapidation ?", answer: "Environ la taille d'un pois chiche (7-8 mm). Ni trop petits (inefficaces), ni trop grands. Prenez 70 cailloux propres à Muzdalifah (7 × 10 jours de tachrik). Évitez les cailloux souillés." },
      { question: "Que faire si on ne peut pas effectuer la lapidation soi-même ?", answer: "Une personne faible, âgée ou malade peut déléguer la lapidation à quelqu'un de valide. Le délégué lance d'abord pour lui-même, puis pour la personne concernée, en formulant l'intention de chaque lancé." },
      { question: "Y a-t-il des commerces et restaurants à Mina ?", answer: "Pendant le Hajj, des points de restauration sont organisés dans les camps. Hors Hajj, la vallée est quasi-déserte avec très peu de commerces. Apportez vos provisions pour les nuits de Tachrik." },
      { question: "Peut-on visiter Mina hors de la saison du Hajj ?", answer: "Oui. Mina est librement accessible hors saison — un site de recueillement paisible où l'histoire du sacrifice d'Ibrahim prend toute sa dimension dans le silence de la vallée vide. Un guide expert amplifie considérablement la valeur spirituelle de cette visite." },
    ],
  },

  // ─── ARAFAT ──────────────────────────────────────────────────────────────────
  'arafat': {
    slug: 'arafat',
    title: 'Mont Arafat : le pilier du Hajj',
    location: 'À 20 km de La Mecque, Hijaz',
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "Le Wuquf à Arafat est le pilier central du Hajj — sans cette station, le pèlerinage est invalide. C'est ici que le Prophète ﷺ prononça son discours d'adieu en 632.",
    readingTime: 9,
    publishedAt: '2026-05-11T11:30:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine et signification du nom',
        content: [
          { type: 'callout', text: "Le Hajj, c'est Arafat.", reference: "Hadith authentique — Abu Dawud (n° 1949), Tirmidhi (n° 889), Ibn Mâjah (n° 3015)" },
          { type: 'paragraph', content: "Le nom «Arafat» est riche d'étymologies possibles. La racine arabe «arafa» signifie «connaître» ou «reconnaître» — une allusion au fait que c'est en ce lieu qu'Adam et Ève se seraient retrouvés après leur descente du Paradis, se reconnaissant mutuellement après leur séparation. Une autre interprétation associe le nom à la transmission de la connaissance : c'est en ce lieu qu'Ibrahim ﷺ apprit à Ismaël les rites du pèlerinage, et que le Prophète ﷺ transmit son ultime message à l'humanité." },
          { type: 'paragraph', content: "Arafat est mentionné implicitement dans le Coran à travers le Wuquf (Al-Baqara 2:198 : «Quand vous déferlz d'Arafat, souvenez-vous d'Allah»). Le Prophète ﷺ y accomplit son unique Hajj en l'an 10 de l'Hégire (632 de l'ère chrétienne), y prononçant le discours qui synthétisa toute l'éthique islamique — l'égalité des êtres humains, l'inviolabilité de la vie et du bien d'autrui, la fin du paganisme et des pratiques injustes." },
        ],
        seeAlso: [
          { href: '/lieux-saints/mina', label: 'Mina — la vallée du sacrifice et du Hajj' },
          { href: '/blog/difference-omra-hajj', label: 'Différence entre Omra et Hajj' },
        ],
      },
      {
        id: 'description',
        title: 'Description géographique',
        content: [
          { type: 'stats', items: [
            { label: 'Distance La Mecque', value: '~20 km' },
            { label: 'Superficie plaine', value: '~12 km²' },
            { label: 'Hauteur Jabal Rahma', value: '~70 m' },
            { label: 'Capacité', value: '2,5 millions' },
          ]},
          { type: 'paragraph', content: "Arafat est une plaine de forme ovale d'environ 12 kilomètres carrés, délimitée à l'est par des collines granitiques et ouverte vers La Mecque à l'ouest. Au centre se dresse le Jabal ar-Rahmah (Mont de la Miséricorde), un monticule rocheux de 70 mètres de hauteur, surmonté d'une colonne blanche. C'est sur ce mont que le Prophète ﷺ fit halte et prononça le Khutbah al-Wada' (Discours d'adieu)." },
          { type: 'paragraph', content: "Il est important de comprendre la distinction géographique : «Mont Arafat» désigne strictement le Jabal ar-Rahmah, tandis que «plaine d'Arafat» ou simplement «Arafat» désigne l'ensemble de la zone délimitée comprenant la plaine et ses environs immédiats. Pour la validité du Wuquf, il suffit d'être n'importe où dans la plaine d'Arafat — être sur le mont n'est ni obligatoire ni suffisant à lui seul." },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance théologique',
        content: [
          { type: 'paragraph', content: "Le hadith «Al-Hajj Arafat» est l'une des formules les plus concises et les plus puissantes de toute la jurisprudence islamique. Il signifie : si tu n'as pas accompli le Wuquf à Arafat, tu n'as pas accompli le Hajj, quelle que soit la perfection de tous les autres rites. C'est le pilier central (rukn) autour duquel gravitent tous les autres actes du pèlerinage." },
          { type: 'paragraph', content: "Le jour d'Arafat est considéré par les savants comme le jour où Allah pardonne le plus aux croyants. Un hadith rapporté par Aïsha (ra) indique que le Prophète ﷺ a dit : «Il n'est pas de jour où Allah libère davantage de Ses serviteurs du Feu que le jour d'Arafat.» Ce jour est également mentionné dans la Sourate Al-Ma'ida (verset 3) comme le jour où la religion fut perfectionnée — le Wuquf du Prophète était accompagné de la révélation de ce verset emblématique." },
          { type: 'paragraph', content: "Pour les pèlerins de l'Omra, il est fondamental de savoir qu'Arafat ne fait pas partie des rites de l'Omra. La Omra comprend l'Ihram, le Tawaf, la Sa'i et le rasage/coupe des cheveux — point. Arafat est spécifique au Hajj. Un pèlerin peut cependant visiter la plaine hors saison du Hajj pour la méditation et la mémoire historique." },
        ],
      },
      {
        id: 'rituel',
        title: 'Le Wuquf — la station debout',
        content: [
          { type: 'rituals', items: [
            { icon: 'sun', title: 'Timing du Wuquf (9 Dhul Hijjah)', description: "La station commence valablement dès le lever du soleil le 9 Dhul Hijjah. Elle s'étend jusqu'au coucher du soleil. Quitter Arafat avant le Maghrib est permis, mais la majorité des savants recommande d'attendre le coucher du soleil pour la récompense maximale." },
            { icon: 'heart', title: 'Prière combinée à la Mosquée Namirah', description: "Au Masjid Namirah, les pèlerins prient Dhuhr et Asr combinées et raccourcies en avance (Jam' Taqdim). Cette mosquée chevauchant la frontière d'Arafat — seule sa partie orientale est dans la plaine d'Arafat." },
            { icon: 'target', title: "Du'a et invocations", description: "Le Wuquf est essentiellement un moment de supplications, d'invocations et de connexion spirituelle. Élevez les mains, pleurez, demandez le pardon, priez pour vos proches. Répétez la Talbiyah, le dhikr, le Salat al-Nabi. C'est l'un des moments les plus acceptés de l'année pour les du'as." },
          ]},
          { type: 'expert-tip', title: 'Conseil expert SAFARUMA', text: "Préparez une liste écrite de vos invocations et de celles de vos proches avant de partir pour Arafat. La foule et l'émotion peuvent perturber la concentration. Votre guide SAFARUMA vous donnera une liste de du'a recommandées par le Prophète ﷺ spécifiquement pour le jour d'Arafat. Protégez-vous du soleil intensément — la chaleur à Arafat peut dépasser 45°C en été." },
        ],
        seeAlso: [{ href: '/lieux-saints/muzdalifah', label: 'Muzdalifah — la halte sacrée du Hajj' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          { type: 'paragraph', content: "Arrivez à Arafat tôt dans la matinée, idéalement après la prière de Fajr. Cela vous permet de trouver un bon emplacement, de vous installer, et d'accomplir la prière de Dhuhr/Asr à la mosquée ou dans votre espace. L'emplacement dans la plaine n'a pas d'importance pour la validité du Wuquf — n'importe quel point d'Arafat convient." },
          { type: 'paragraph', content: "Hydratation : c'est ici plus que partout ailleurs que la déshydratation peut être dangereuse. Emportez au moins 2 litres d'eau par personne, et des pastilles de réhydratation orale si vous êtes sujet aux coups de chaleur. Portez un chapeau ou utilisez un parasol. Le soleil d'Arafat est impitoyable en été." },
          { type: 'paragraph', content: "Pour les pèlerins souhaitant visiter hors Hajj : Arafat est accessible toute l'année. La plaine vide, le mont surplombant le désert, le silence — c'est une expérience de méditation profonde. Un guide SAFARUMA vous narrera le Khutbah al-Wada' sur place, point par point, depuis l'endroit exact où le Prophète ﷺ se tenait." },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          { type: 'list', items: [
            "Croire qu'il faut absolument monter sur le Jabal ar-Rahmah — n'importe quel point de la plaine suffit pour la validité du Wuquf.",
            "Quitter la plaine d'Arafat avant le coucher du soleil sans raison valable — cela peut compromettre la validité du Hajj.",
            "Confondre «Mont Arafat» et «plaine d'Arafat» — seul le séjour dans la plaine est obligatoire.",
            "Croire qu'Arafat est un rite de l'Omra — c'est exclusivement un rite du Hajj.",
            "Négliger les du'a pour passer le temps à photographier — c'est un moment spirituel irremplaçable, pas une visite touristique.",
          ]},
        ],
      },
    ],
    faq: [
      { question: "Quelle est la différence entre «Mont Arafat» et la «plaine d'Arafat» ?", answer: "Le Mont Arafat (Jabal ar-Rahmah) est le monticule rocheux de 70 mètres surmonté d'une colonne blanche. La plaine d'Arafat est l'ensemble de la zone délimitée, y compris la plaine environnante. Pour le Wuquf, il suffit d'être n'importe où dans la plaine — monter sur le mont est une Sunna mais non obligatoire." },
      { question: "Faut-il absolument monter sur le Jabal ar-Rahmah ?", answer: "Non. Monter sur le mont est une Sunna (le Prophète ﷺ l'a fait) mais pas une obligation. Le Wuquf dans n'importe quel point de la plaine délimitée d'Arafat est valide." },
      { question: "Que se passe-t-il si on quitte Arafat avant le coucher du soleil ?", answer: "Quitter avant le Maghrib est permis selon certains savants mais est fortement déconseillé — vous perdrez la récompense maximale. Si vous êtes parti avant le coucher et n'y êtes pas retourné, votre Hajj reste valide selon la majorité, mais vous devez expier (dam)." },
      { question: "L'Omra inclut-elle une station à Arafat ?", answer: "Non. L'Omra comprend l'Ihram, le Tawaf, la Sa'i et le rasage/coupe des cheveux. Arafat est un rite spécifique au Hajj (le 9 Dhul Hijjah)." },
      { question: "Peut-on visiter Arafat hors de la saison du Hajj ?", answer: "Oui, la plaine est accessible toute l'année. C'est un lieu de méditation et de mémoire historique paisible hors saison. Votre guide SAFARUMA peut vous y emmener lors d'une journée d'excursion depuis La Mecque." },
      { question: "Qu'est-ce que la Khutbah al-Wada' ?", answer: "Le «Discours d'adieu» du Prophète ﷺ, prononcé à Arafat le 9 Dhul Hijjah de l'an 10H (632). Il résume l'éthique islamique : égalité des hommes indépendamment de leur race, inviolabilité du sang et des biens, droits de la femme, abolition de l'usure. Considéré comme l'une des premières déclarations universelles des droits de l'homme." },
      { question: "Peut-on rester à Arafat la nuit du 9 au 10 Dhul Hijjah ?", answer: "Non. Rester à Arafat après Maghrib le 9 Dhul Hijjah n'est pas requis — au contraire, les pèlerins quittent Arafat à Maghrib pour se rendre à Muzdalifah où ils passent la nuit." },
    ],
  },

  // ─── MUZDALIFAH ──────────────────────────────────────────────────────────────
  'muzdalifah': {
    slug: 'muzdalifah',
    title: 'Muzdalifah : la halte sacrée du Hajj',
    location: 'Entre Arafat et Mina, Hijaz',
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "La plaine à ciel ouvert où les pèlerins passent la nuit entre Arafat et Mina, prient en combinant Maghrib et Isha, et collectent les cailloux de la lapidation.",
    readingTime: 8,
    publishedAt: '2026-05-11T12:00:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine et signification',
        content: [
          { type: 'callout', text: "Quand vous déferlez d'Arafat, souvenez-vous d'Allah près du Mash'ar al-Haram.", reference: 'Sourate Al-Baqara, verset 198' },
          { type: 'paragraph', content: "Muzdalifah est une plaine ouverte située entre Arafat (à l'est) et Mina (à l'ouest), à environ 5 kilomètres de chacune. Son nom viendrait du verbe arabe «izdilafa» signifiant «se rapprocher» — un lieu de rapprochement vers Allah après la station d'Arafat. Le Coran y fait référence sous le nom de «Mash'ar al-Haram», le «symbole sacré»." },
          { type: 'paragraph', content: "La tradition islamique associe Muzdalifah à Ibrahim ﷺ qui s'y arrêta lors de son pèlerinage original. Le Prophète Muhammad ﷺ y séjourna lors de son Hajj d'adieu et enseigna à ses Compagnons les rites spécifiques à ce lieu : la prière combinée, la collecte des cailloux et le départ vers Mina après la prière de Fajr." },
        ],
        seeAlso: [
          { href: '/lieux-saints/arafat', label: 'Mont Arafat — le pilier du Hajj' },
          { href: '/lieux-saints/mina', label: 'Mina — la vallée du sacrifice et du Hajj' },
        ],
      },
      {
        id: 'description',
        title: 'Description géographique',
        content: [
          { type: 'paragraph', content: "Muzdalifah s'étend sur une surface d'environ 12 km² entre les montagnes qui séparent Arafat et Mina. À la différence de Mina, il n'y a pas de tentes permanentes climatisées à Muzdalifah — les pèlerins dorment à la belle étoile ou sous de simples abris légers. Cette absence délibérée de confort est voulue par la tradition islamique : la nuit de Muzdalifah est une nuit d'humilité totale, où tous les pèlerins, riches ou pauvres, résident sous le même ciel étoilé." },
          { type: 'paragraph', content: "Au nord-ouest de la plaine se trouve le Mash'ar al-Haram — un monticule bas avec une petite mosquée du même nom. C'est en ce point précis que le Prophète ﷺ s'arrêta pour faire du dhikr et l'invocation jusqu'à l'aurore. Aujourd'hui, la mosquée est accessible mais la majorité des pèlerins restent dispersés dans la plaine environnante." },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          { type: 'paragraph', content: "La nuit de Muzdalifah est souvent comparée par les savants à une préfiguration du Jour du Jugement. Des millions d'êtres humains — de toutes nations, de toutes conditions sociales, vêtus du même tissu blanc — allongés à même la terre sous les étoiles, attendant l'aube. La frontière entre le riche et le pauvre, le roi et le mendiant, s'efface complètement. C'est l'une des manifestations les plus saisissantes de l'égalité islamique." },
          { type: 'paragraph', content: "Le dhikr et les invocations à Muzdalifah sont particulièrement recommandés. Le Prophète ﷺ y resta debout en invocations de l'arrivée jusqu'à l'aurore, en récitant la Talbiyah, le Tahlil et en faisant du Salat. Les savants recommandent de profiter de cette nuit rare — même si le sommeil est nécessaire — pour accomplir des prières surérogatoires, réciter le Coran et faire des du'a pour ses proches." },
        ],
      },
      {
        id: 'rituel',
        title: 'La nuit de Muzdalifah — le rituel',
        content: [
          { type: 'rituals', items: [
            { icon: 'moon', title: 'Prière Maghrib + Isha combinées', description: "En arrivant à Muzdalifah après le coucher du soleil, le pèlerin combine et raccourcit les prières de Maghrib et Isha (3+2 rak'ahs, prières Isha raccourcie et différée jusqu'à Muzdalifah). Pas de Sunnah entre les deux. C'est la Sunna du Prophète ﷺ à Muzdalifah." },
            { icon: 'target', title: 'Collecte des cailloux', description: "Collecter 49 ou 70 petits cailloux (taille d'un pois chiche, 7-8 mm) dans la plaine de Muzdalifah. 49 cailloux pour ceux qui font le Nafr al-Awwal (3 jours de lapidation), 70 pour ceux qui restent les 4 jours complets. Évitez les cailloux souillés ou trop grands." },
            { icon: 'sun', title: 'Fajr et départ vers Mina', description: "Prière de Fajr à Muzdalifah — à ne pas manquer. Après Fajr, dhikr et invocations jusqu'à l'éclaircissement de l'aurore (ishraq), puis départ vers Mina pour la lapidation de Jamrat al-Aqaba. Les personnes âgées ou faibles peuvent partir après minuit." },
          ]},
          { type: 'expert-tip', title: 'Conseil expert SAFARUMA', text: "Emportez une couverture légère et une bouteille d'eau — les nuits à Muzdalifah peuvent être fraîches même en été (altitude et air du désert). Mettez vos 49 ou 70 cailloux directement dans une petite pochette ou un sac zippé que vous accrocherez à votre ceinture. Votre guide SAFARUMA les aura comptés et disposés par groupes de 7 avant d'arriver à Muzdalifah." },
        ],
        seeAlso: [{ href: '/blog/difference-omra-hajj', label: 'Différence entre Omra et Hajj' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          { type: 'paragraph', content: "Préparez un sac ultra-léger pour Muzdalifah : documents d'identité, médicaments essentiels, eau, couverture légère et chaussures fermées. Évitez les gros bagages — vous marchez et vous dormez à même le sol. Chaussures fermées indispensables car le sol de Muzdalifah est recouvert de gravier et de cailloux." },
          { type: 'paragraph', content: "Le réseau téléphonique est généralement saturé à Muzdalifah pendant le Hajj — prévenez votre famille de l'absence de communication prévue. Convenez d'un point de rendez-vous précis avec votre guide en cas de séparation. Note sur la prière : certains pèlerins oublient de prier Isha séparément — à Muzdalifah, elle est combinée et raccourcie avec Maghrib, sans attendre l'heure habituelle d'Isha." },
          { type: 'paragraph', content: "Pour les pèlerins faibles, âgés ou malades : il est permis de quitter Muzdalifah après minuit pour éviter la foule de l'après-Fajr. Cette dispense est authentifiée par le Hadith — le Prophète ﷺ l'accordait aux femmes, aux enfants et aux personnes faibles de sa famille lors du Hajj d'adieu." },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          { type: 'list', items: [
            "Collecter les cailloux à Mina ou ailleurs — les cailloux doivent être pris à Muzdalifah ou dans tout endroit d'Arafat/Muzdalifah.",
            "Partir de Muzdalifah avant minuit sans dispense valide — les personnes valides doivent rester jusqu'après Fajr.",
            "Prendre des cailloux trop gros — la taille maximale recommandée est celle d'un pois chiche.",
            "Oublier de prier Fajr à Muzdalifah — c'est une prière obligatoire et elle a une valeur particulière en ce lieu.",
            "Croire qu'il faut monter sur le Mash'ar al-Haram — n'importe quel endroit de la plaine de Muzdalifah est valide pour le séjour.",
          ]},
        ],
      },
    ],
    faq: [
      { question: "Doit-on dormir à Muzdalifah ou peut-on rester debout ?", answer: "Le séjour à Muzdalifah (wuquf ou hayth) est la Sunna — le Prophète ﷺ y dormit. Il suffit d'être présent une partie de la nuit. Si vous dormez, c'est Sunna. Si vous priez et faites du dhikr toute la nuit, c'est encore mieux selon les savants." },
      { question: "Combien de cailloux faut-il collecter exactement ?", answer: "49 cailloux si vous faites le Nafr al-Awwal (lapidation sur 3 jours), 70 si vous restez pour 4 jours de lapidation. Beaucoup prennent 70 par précaution. Vérifiez avec votre guide selon votre programme." },
      { question: "Peut-on prendre les cailloux à Mina plutôt qu'à Muzdalifah ?", answer: "Oui, selon la majorité des savants, les cailloux peuvent être pris n'importe où dans les environs — y compris à Mina. Mais la Sunna est de les collecter à Muzdalifah. Prendre les cailloux déjà lancés (utilisés) n'est pas recommandé." },
      { question: "Qu'est-ce que le Nafr al-Awwal (départ anticipé) ?", answer: "C'est la permission de quitter Mina après la lapidation du 12 Dhul Hijjah avant le coucher du soleil, plutôt que d'attendre le 13. Le Coran le permet explicitement (2:203). Cela réduit les rites de Tachrik à 2 jours complets au lieu de 3." },
      { question: "Les personnes âgées et faibles doivent-elles passer la nuit à Muzdalifah ?", answer: "La dispense de partir après minuit est authentifiée par Hadith — le Prophète ﷺ l'accordait aux femmes, aux enfants et aux personnes faibles. Les médecins considèrent également que les personnes avec des conditions médicales peuvent partir tôt sur avis médical." },
      { question: "Que faire s'il n'y a pas de tente à Muzdalifah ?", answer: "Il n'y a pas de tentes permanentes à Muzdalifah — c'est voulu. Les pèlerins dorment à la belle étoile ou sous des bâches légères. Prévoyez une couverture légère, un imperméable fin (rosée possible) et votre provision d'eau." },
      { question: "Comment combiner les prières Maghrib et Isha à Muzdalifah ?", answer: "On prie d'abord le Maghrib (3 rak'ahs) puis immédiatement l'Isha raccourcie (2 rak'ahs) avec un seul adhan et deux iqama, sans prière sunna entre les deux. Cette combinaison avec différé (Jam' Ta'khir) est la Sunna du Prophète ﷺ à Muzdalifah." },
    ],
  },
};
