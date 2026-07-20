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
    excerpt: "Le premier sanctuaire monothéiste de l'humanité, au cœur duquel la Kaaba est la Qibla vers laquelle se tournent 1,8 milliard de musulmans cinq fois par jour.",
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
            content: "La Kaaba (du mot arabe «cube») est le sanctuaire le plus sacré de l'Islam. Selon la tradition islamique, Allah ordonna à Ibrahim ﷺ et à son fils Ismaël ﷺ d'élever les fondations de cette Maison sur l'emplacement où Adam avait initialement bâti un premier lieu d'adoration.",
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
            content: "La Kiswa est le voile noir en soie, brodé de versets coraniques en fil d'or et d'argent, qui recouvre entièrement la Kaaba. Elle est renouvelée chaque année le 9 Dhul Hijja. Des artisans de la Manufacture de la Kiswa à La Mecque travaillent toute l'année à sa confection, un travail de près de 200 artisans spécialisés.",
          },
          {
            type: 'paragraph',
            content: "La Hajar al-Aswad (Pierre noire), encastrée dans l'angle sud-est de la Kaaba, est l'élément le plus symbolique. D'après les textes islamiques, elle descend du Paradis et était d'une blancheur immaculée avant d'être ternie par les péchés des hommes. Les pèlerins tentent de la toucher ou de l'embrasser au début de chaque tour du Tawaf ; si la foule ne le permet pas, un simple signe de la main suffit.",
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
            content: "La Kaaba est la Qibla de plus de 1,8 milliard de musulmans, soit la direction vers laquelle se tournent les croyants pour chacune de leurs cinq prières quotidiennes. En ce sens, elle est littéralement le centre spirituel de la Oumma islamique, un point d'unité unique au monde, indépendant de toute nationalité ou culture.",
          },
          {
            type: 'paragraph',
            content: "En effectuant le Tawaf, le pèlerin rejoint un mouvement de dévotion millénaire. Aux heures de pointe, jusqu'à 100 000 personnes circumambulent simultanément autour de la Kaaba. Cette image, des millions de croyants en vêtements blancs tournant dans le même sens et invoquant le même Dieu, est l'une des plus puissantes de l'Islam. Une prière accomplie au Masjid Al-Haram vaut 100 000 prières dans toute autre mosquée.",
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
                title: 'Le Tawaf : 7 circumambulations',
                description: "Sept tours dans le sens anti-horaire, en commençant par la Hajar al-Aswad. Chaque passage marque un renouvellement de l'intention et une proximité avec Allah. Le premier tour peut être effectué à un rythme rapide (raml) pour les hommes.",
              },
              {
                icon: 'droplets',
                title: "Eau de Zamzam : l'eau bénie",
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
        seeAlso: [{ href: '/blog/les-7-tours-du-tawaf', label: 'Les 7 tours du Tawaf : sens et spiritualité' }],
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
        answer: "Oui, si l'on passe suffisamment près. Le Multazam (la partie de la Kaaba entre la porte et la Hajar al-Aswad) est particulièrement recommandé pour les invocations. Toucher la Kaaba n'est pas obligatoire. Si la foule l'empêche, continuez votre Tawaf normalement.",
      },
      {
        question: 'Quel est le sens des 7 tours du Tawaf ?',
        answer: "Les 7 tours symbolisent la complétude de la dévotion. La direction anti-horaire est la direction naturelle de nombreux phénomènes cosmiques. Chaque tour est une opportunité de se rapprocher d'Allah par l'invocation et la méditation. Les 7 premiers tours constituent le Tawaf d'arrivée (Tawaf al-Qudum) lors de l'Omra.",
      },
      {
        question: 'À quelles heures effectuer le Tawaf pour éviter la foule ?',
        answer: "Les meilleures heures sont après Fajr (5h-7h) et après Isha (21h-23h). Évitez les après-midi en été (la chaleur y est extrême) et les vendredis mid-journée qui attirent une grande affluence locale.",
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
    excerpt: "Les deux collines sacrées entre lesquelles Hajar courut sept fois pour trouver de l'eau pour son fils Ismaël, commémorées par le rituel de la Sa'i, pilier de l'Omra.",
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
        seeAlso: [{ href: '/lieux-saints/zamzam', label: 'Le puits de Zamzam, eau bénie de l\'Islam' }],
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
          { type: 'paragraph', content: "Safa est une petite butte de granit côté sud de la Kaaba, à environ 100 mètres du sanctuaire. Marwa est sa colline homologue, située à environ 450 mètres. Toutes deux sont aujourd'hui intégrées dans l'immense enceinte du Masjid Al-Haram. Le corridor qui les relie, appelé Mas'a, mesure environ 450 mètres de long et 20 mètres de large. Il est climatisé, couvert, et dispose de trois niveaux, permettant de distribuer les flux de pèlerins." },
          { type: 'paragraph', content: "Deux colonnes vertes fluorescentes marquent une zone intermédiaire d'environ 50 mètres appelée le «raml». Les hommes sont encouragés à hâter le pas dans cette zone, en souvenir de Hajar qui courait pour voir son fils. Les femmes marchent à rythme normal tout au long du parcours. Des chaises roulantes motorisées et des accompagnateurs sont disponibles pour les personnes à mobilité réduite ou les personnes âgées." },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          { type: 'paragraph', content: "La Sa'i est l'un des piliers (arkan) de l'Omra et du Hajj, ce qui signifie que son omission invalide le pèlerinage, et qu'aucune expiation ne peut la compenser. Elle est régie par la Sunna du Prophète ﷺ qui l'accomplit lors de ses pèlerinages et la prescrivit avec précision à ses Compagnons." },
          { type: 'paragraph', content: "Sur le plan spirituel, la Sa'i est la commémoration d'une foi féminine exemplaire. Hajar ne fut pas une spectatrice passive de la volonté divine. Elle agit avec tout ce qu'elle avait, dans une situation désespérée, sans jamais cesser de faire confiance à Allah. Les savants islamiques voient dans ce récit une leçon fondamentale : la tawakkul (confiance en Allah) ne dispense pas de l'effort humain, elle le précède et l'accompagne. En accomplissant la Sa'i, le pèlerin s'inscrit dans cette tradition de foi active." },
          { type: 'paragraph', content: "Le Coran souligne que Safa et Marwa sont «des signes d'Allah» (sha'air Allah), une notion qui va au-delà de la simple référence géographique. C'est un rappel permanent que les lieux et les événements peuvent devenir des symboles éternels d'obéissance et de miséricorde divine." },
        ],
      },
      {
        id: 'rituel',
        title: "Le Sa'i : le rituel en détail",
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
            "Commencer à Marwa au lieu de Safa : le Sa'i doit impérativement commencer à Safa et se terminer à Marwa.",
            "Compter un aller-retour comme un seul trajet : chaque trajet (Safa→Marwa ou Marwa→Safa) est un tour distinct, soit 7 trajets au total.",
            "Oublier de hâter le pas entre les colonnes vertes pour les hommes : ce raml est Sunna mu'akkada (fortement recommandé).",
            "Ne pas monter sur Safa ou Marwa pour l'invocation : il faut monter sur chaque colline à chaque passage.",
            "Faire la Sa'i sans avoir fait le Tawaf : la Sa'i doit être précédée d'un Tawaf valide.",
            "Croire que les ablutions sont obligatoires : elles sont recommandées mais non requises pour valider la Sa'i.",
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
    excerpt: "Source miraculeuse jaillie sous le pied d'Ismaël, abreuvant sans interruption les pèlerins depuis plus de quatre mille ans : l'eau la plus sacrée de l'Islam.",
    readingTime: 8,
    publishedAt: '2026-05-11T10:30:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine miraculeuse',
        content: [
          { type: 'callout', text: "L'eau de Zamzam est pour ce pour quoi elle est bue.", reference: "Hadith rapporté par Ibn Mâjah (n° 3062), validé par de nombreux savants" },
          { type: 'paragraph', content: "L'histoire de Zamzam est indissociable du récit de Hajar et Ismaël. Abandonnés dans la vallée aride de La Mecque sur l'ordre d'Allah, mère et fils épuisèrent rapidement leurs provisions. Hajar courut sept fois entre Safa et Marwa à la recherche d'eau. Au terme de cette course empreinte de foi, l'ange Jibrîl frappa la terre de son talon — et l'eau jaillit." },
          { type: 'paragraph', content: "Le Prophète Muhammad ﷺ rapporte le récit complet dans un long hadith (Bukhari n° 3364) : Hajar s'écria «Zammi, zammi» (retiens-toi, retiens-toi) pour contenir le flot. Certains linguistes relient ce nom au terme araméen «zam» signifiant «abondant» ou «retenu». Depuis ce jour il y a plus de quatre mille ans, la source n'a jamais tari — malgré des millions de pèlerins qui y puisent chaque année." },
        ],
        seeAlso: [
          { href: '/lieux-saints/safa-marwa', label: "Safa et Marwa : la Sa'i, parcours de Hajar" },
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
            { icon: 'heart', title: "Faire une du'a intentionnelle", description: "Avant de boire, formulez mentalement une intention précise : guérison, succès, connaissance, hafidh du Coran, satisfaction d'un besoin. Le hadith garantit que Zamzam répond à l'intention de celui qui boit." },
          ]},
          { type: 'expert-tip', title: 'Conseil expert SAFARUMA', text: "Ne pas «rationner» l'eau de Zamzam est un conseil souvent donné par les guides expérimentés. Allah l'a fait jaillir en abondance, buvez-en autant que vous le souhaitez. Versez-en également sur votre tête et votre visage comme le faisait le Prophète ﷺ. Prévoyez un jerrican de 5L à ramener en soute (généralement autorisé par les compagnies aériennes avec validation préalable)." },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          { type: 'paragraph', content: "L'eau est disponible partout dans le Haram. Ne vous inquiétez pas de manquer. Les fontaines réfrigérées (eau fraîche et eau à température ambiante selon les robinets) sont placées tous les 30-40 mètres. Pour le Tawaf et la Sa'i, buvez avant de commencer et utilisez les fontaines aux pauses." },
          { type: 'paragraph', content: "Pour en ramener en France : les autorités saoudiennes ont imposé en 2023 une réglementation sur l'exportation non officielle. L'eau de Zamzam en soute est autorisée dans des contenants scellés non dépassant 5 litres par personne. En cabine, les contenants liquides sont soumis à la règle habituelle des 100ml. Méfiez-vous des vendeurs en dehors du Haram qui proposent de la «vraie Zamzam» — seule l'eau directement disponible dans l'enceinte du Masjid Al-Haram est authentique." },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          { type: 'list', items: [
            "Acheter de l'eau de Zamzam hors du Masjid Al-Haram : seule l'eau disponible directement dans l'enceinte du Haram est authentique.",
            "Croire qu'il faut «rationner» l'eau : l'eau est gratuite et abondante, buvez-en à satiété.",
            "Boire sans faire d'intention (niyyah) : c'est une opportunité spirituelle unique, ne la gâchez pas.",
            "Jeter ou gaspiller l'eau de Zamzam : c'est un acte irrespectueux vis-à-vis d'une eau bénie.",
            "Croire que l'eau de Zamzam peut remplacer un traitement médical : elle est un complément spirituel, consultez un médecin pour tout problème de santé.",
          ]},
        ],
      },
    ],
    faq: [
      { question: "L'eau de Zamzam est-elle scientifiquement analysée ?", answer: "Oui. Des études saoudiennes et étrangères ont analysé sa composition : calcium, magnésium, bicarbonates, fluorures et chlorures. Sa teneur en sels minéraux est supérieure à la moyenne des eaux de source. Aucune bactérie pathogène n'a été détectée, malgré l'absence de chloration." },
      { question: "Peut-on ramener de l'eau de Zamzam dans l'avion ?", answer: "En soute : oui, dans des contenants scellés de 5 litres maximum par personne (vérifiez les conditions de votre compagnie). En cabine : soumis à la règle habituelle des 100ml. Les compagnies saoudiennes autorisent généralement 5L supplémentaires." },
      { question: "L'eau de Zamzam a-t-elle des vertus curatives prouvées ?", answer: "Sur le plan islamique, les hadiths authentiques attestent de ses vertus selon l'intention du buveur. Sur le plan scientifique, sa composition minérale particulière est documentée. Elle n'est pas un substitut à un traitement médical, mais un complément spirituel pour de nombreux croyants." },
      { question: "Peut-on boire de l'eau de Zamzam réchauffée ou bouillie ?", answer: "Oui. Certains savants mentionnent qu'il est préférable de la boire à température ambiante ou fraîche, mais aucune interdiction n'existe sur la boire chaude. Des pèlerins la boivent parfois en infusion avec du miel." },
      { question: "Faut-il absolument se tourner vers la Qibla pour boire ?", answer: "C'est la Sunna du Prophète ﷺ, fortement recommandée. Si l'orientation est difficile à determiner dans la foule, l'intention sincère suffit." },
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
          { type: 'paragraph', content: "Lors de ce même événement, Satan tenta trois fois d'interrompre Ibrahim dans son chemin vers le sacrifice. Ibrahim le repoussa chaque fois en lui lançant des pierres, un geste symbolique que chaque pèlerin du Hajj commémore en lapidant les trois Jamarat (piliers) de Mina. C'est également l'origine théologique de l'Aïd al-Adha, fête du sacrifice célébrée par les musulmans du monde entier chaque 10 Dhul Hijjah." },
        ],
        seeAlso: [
          { href: '/lieux-saints/arafat', label: 'Mont Arafat : le pilier du Hajj' },
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
          { type: 'paragraph', content: "Mina est une vallée étroite encaissée entre des montagnes granitiques, à 5 km à l'est de La Mecque. La plupart de l'année, elle est déserte, avec quelques gardiens, des tentes pliées, un silence presque irréel. Pendant le Hajj, elle se transforme en la plus grande ville de tentes au monde : 160 000 tentes blanches climatisées, installées à demeure depuis 1997, couvrent la totalité de la plaine disponible." },
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
        seeAlso: [{ href: '/lieux-saints/muzdalifah', label: 'Muzdalifah : la halte sacrée du Hajj' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          { type: 'paragraph', content: "Pour les pèlerins du Hajj, prenez le temps d'explorer vos environs immédiats dans le camp de tentes dès l'arrivée. Repérez les sorties, les points d'eau, les sanitaires et les tentes médicales. Notez le numéro de votre tente — toutes se ressemblent et il est facile de se perdre. Votre guide SAFARUMA vous donnera des points de repère spécifiques." },
          { type: 'paragraph', content: "La chaleur à Mina peut être intense même avec la climatisation des tentes, portez des vêtements légers, hydratez-vous constamment. Les appareils mobiles sont souvent saturés pendant le Hajj — mettez votre guide en favori et convenez d'un plan de contingence si les communications sont coupées." },
          { type: 'paragraph', content: "Pour les visiteurs hors saison Hajj : Mina est accessible et constitue un lieu de méditation paisible. La vallée vide des tentes blanches repliées offre une vision saisissante de ce que sera ce site à l'échelle humaine lors du Hajj. Votre guide SAFARUMA vous en racontera l'histoire et les enjeux logistiques." },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          { type: 'list', items: [
            "Quitter Mina avant les nuits obligatoires sans autorisation islamique (pour personnes valides).",
            "Lapider avant le lever du soleil le 11 Dhul Hijjah : interdit, sauf pour les personnes faibles ou âgées.",
            "Utiliser des pierres trop grandes, des chaussures ou des objets non conformes.",
            "Ne pas respecter l'ordre des trois Jamarat lors des jours de Tachrik (Sughra → Wusta → Aqaba).",
            "Croire que Mina fait partie des rites de l'Omra : Mina est exclusivement réservé aux rites du Hajj.",
            "Se laisser emporter par la foule sans plan de sécurité : convenez toujours d'un point de rendez-vous précis avec votre groupe.",
          ]},
        ],
      },
    ],
    faq: [
      { question: "Mina est-il inclus dans les rites de l'Omra ?", answer: "Non. Mina et les Jamarat sont des rites spécifiques au Hajj, accomplis les 10, 11, 12 et éventuellement 13 Dhul Hijjah. Un pèlerin venant pour l'Omra n'accomplit pas les rites de Mina." },
      { question: "Combien de nuits doit-on passer à Mina ?", answer: "Obligatoirement les nuits du 10 au 11 et du 11 au 12 Dhul Hijjah. La nuit du 12 au 13 (restant pour Nafr al-Ta'khir) est optionnelle selon les écoles juridiques. Partir après la nuit du 12 (Nafr al-Awwal) est permis par la majorité des savants." },
      { question: "Peut-on partir de Mina après la nuit du 12 (Nafr al-Awwal) ?", answer: "Oui. La majorité des savants autorise le Nafr al-Awwal, à savoir quitter Mina après la lapidation du 12 Dhul Hijjah avant le coucher du soleil. Ceux qui souhaitent la récompense maximale restent la nuit du 12 et lapident le 13." },
      { question: "Quelle est la taille des cailloux pour la lapidation ?", answer: "Environ la taille d'un pois chiche (7-8 mm). Ni trop petits (inefficaces), ni trop grands. Prenez 70 cailloux propres à Muzdalifah (7 × 10 jours de tachrik). Évitez les cailloux souillés." },
      { question: "Que faire si on ne peut pas effectuer la lapidation soi-même ?", answer: "Une personne faible, âgée ou malade peut déléguer la lapidation à quelqu'un de valide. Le délégué lance d'abord pour lui-même, puis pour la personne concernée, en formulant l'intention de chaque lancé." },
      { question: "Y a-t-il des commerces et restaurants à Mina ?", answer: "Pendant le Hajj, des points de restauration sont organisés dans les camps. Hors Hajj, la vallée est quasi-déserte avec très peu de commerces. Apportez vos provisions pour les nuits de Tachrik." },
      { question: "Peut-on visiter Mina hors de la saison du Hajj ?", answer: "Oui. Mina est librement accessible hors saison : un site de recueillement paisible où l'histoire du sacrifice d'Ibrahim prend toute sa dimension dans le silence de la vallée vide. Un guide expert amplifie considérablement la valeur spirituelle de cette visite." },
    ],
  },

  // ─── ARAFAT ──────────────────────────────────────────────────────────────────
  'arafat': {
    slug: 'arafat',
    title: 'Mont Arafat : le pilier du Hajj',
    location: 'À 20 km de La Mecque, Hijaz',
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "Le Wuquf à Arafat est le pilier central du Hajj. Sans cette station, le pèlerinage est invalide. C'est ici que le Prophète ﷺ prononça son discours d'adieu en 632.",
    readingTime: 9,
    publishedAt: '2026-05-11T11:30:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine et signification du nom',
        content: [
          { type: 'callout', text: "Le Hajj, c'est Arafat.", reference: "Hadith authentique : Abu Dawud (n° 1949), Tirmidhi (n° 889), Ibn Mâjah (n° 3015)" },
          { type: 'paragraph', content: "Le nom «Arafat» est riche d'étymologies possibles. La racine arabe «arafa» signifie «connaître» ou «reconnaître», une allusion au fait que c'est en ce lieu qu'Adam et Ève se seraient retrouvés après leur descente du Paradis, se reconnaissant mutuellement après leur séparation. Une autre interprétation associe le nom à la transmission de la connaissance : c'est en ce lieu qu'Ibrahim ﷺ apprit à Ismaël les rites du pèlerinage, et que le Prophète ﷺ transmit son ultime message à l'humanité." },
          { type: 'paragraph', content: "Arafat est mentionné implicitement dans le Coran à travers le Wuquf (Al-Baqara 2:198 : «Quand vous déferlz d'Arafat, souvenez-vous d'Allah»). Le Prophète ﷺ y accomplit son unique Hajj en l'an 10 de l'Hégire (632 de l'ère chrétienne), y prononçant le discours qui synthétisa toute l'éthique islamique — l'égalité des êtres humains, l'inviolabilité de la vie et du bien d'autrui, la fin du paganisme et des pratiques injustes." },
        ],
        seeAlso: [
          { href: '/lieux-saints/mina', label: 'Mina : la vallée du sacrifice et du Hajj' },
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
        title: 'Le Wuquf : la station debout',
        content: [
          { type: 'rituals', items: [
            { icon: 'sun', title: 'Timing du Wuquf (9 Dhul Hijjah)', description: "La station commence valablement dès le lever du soleil le 9 Dhul Hijjah. Elle s'étend jusqu'au coucher du soleil. Quitter Arafat avant le Maghrib est permis, mais la majorité des savants recommande d'attendre le coucher du soleil pour la récompense maximale." },
            { icon: 'heart', title: 'Prière combinée à la Mosquée Namirah', description: "Au Masjid Namirah, les pèlerins prient Dhuhr et Asr combinées et raccourcies en avance (Jam' Taqdim). Cette mosquée chevauchant la frontière d'Arafat — seule sa partie orientale est dans la plaine d'Arafat." },
            { icon: 'target', title: "Du'a et invocations", description: "Le Wuquf est essentiellement un moment de supplications, d'invocations et de connexion spirituelle. Élevez les mains, pleurez, demandez le pardon, priez pour vos proches. Répétez la Talbiyah, le dhikr, le Salat al-Nabi. C'est l'un des moments les plus acceptés de l'année pour les du'as." },
          ]},
          { type: 'expert-tip', title: 'Conseil expert SAFARUMA', text: "Préparez une liste écrite de vos invocations et de celles de vos proches avant de partir pour Arafat. La foule et l'émotion peuvent perturber la concentration. Votre guide SAFARUMA vous donnera une liste de du'a recommandées par le Prophète ﷺ spécifiquement pour le jour d'Arafat. Protégez-vous du soleil intensément — la chaleur à Arafat peut dépasser 45°C en été." },
        ],
        seeAlso: [{ href: '/lieux-saints/muzdalifah', label: 'Muzdalifah : la halte sacrée du Hajj' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          { type: 'paragraph', content: "Arrivez à Arafat tôt dans la matinée, idéalement après la prière de Fajr. Cela vous permet de trouver un bon emplacement, de vous installer, et d'accomplir la prière de Dhuhr/Asr à la mosquée ou dans votre espace. L'emplacement dans la plaine n'a pas d'importance pour la validité du Wuquf — n'importe quel point d'Arafat convient." },
          { type: 'paragraph', content: "Hydratation : c'est ici plus que partout ailleurs que la déshydratation peut être dangereuse. Emportez au moins 2 litres d'eau par personne, et des pastilles de réhydratation orale si vous êtes sujet aux coups de chaleur. Portez un chapeau ou utilisez un parasol. Le soleil d'Arafat est impitoyable en été." },
          { type: 'paragraph', content: "Pour les pèlerins souhaitant visiter hors Hajj : Arafat est accessible toute l'année. La plaine vide, le mont surplombant le désert, le silence : c'est une expérience de méditation profonde. Un guide SAFARUMA vous narrera le Khutbah al-Wada' sur place, point par point, depuis l'endroit exact où le Prophète ﷺ se tenait." },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          { type: 'list', items: [
            "Croire qu'il faut absolument monter sur le Jabal ar-Rahmah : n'importe quel point de la plaine suffit pour la validité du Wuquf.",
            "Quitter la plaine d'Arafat avant le coucher du soleil sans raison valable : cela peut compromettre la validité du Hajj.",
            "Confondre «Mont Arafat» et «plaine d'Arafat» : seul le séjour dans la plaine est obligatoire.",
            "Croire qu'Arafat est un rite de l'Omra : c'est exclusivement un rite du Hajj.",
            "Négliger les du'a pour passer le temps à photographier : c'est un moment spirituel irremplaçable, pas une visite touristique.",
          ]},
        ],
      },
    ],
    faq: [
      { question: "Quelle est la différence entre «Mont Arafat» et la «plaine d'Arafat» ?", answer: "Le Mont Arafat (Jabal ar-Rahmah) est le monticule rocheux de 70 mètres surmonté d'une colonne blanche. La plaine d'Arafat est l'ensemble de la zone délimitée, y compris la plaine environnante. Pour le Wuquf, il suffit d'être n'importe où dans la plaine — monter sur le mont est une Sunna mais non obligatoire." },
      { question: "Faut-il absolument monter sur le Jabal ar-Rahmah ?", answer: "Non. Monter sur le mont est une Sunna (le Prophète ﷺ l'a fait) mais pas une obligation. Le Wuquf dans n'importe quel point de la plaine délimitée d'Arafat est valide." },
      { question: "Que se passe-t-il si on quitte Arafat avant le coucher du soleil ?", answer: "Quitter avant le Maghrib est permis selon certains savants mais est fortement déconseillé, car vous perdrez la récompense maximale. Si vous êtes parti avant le coucher et n'y êtes pas retourné, votre Hajj reste valide selon la majorité, mais vous devez expier (dam)." },
      { question: "L'Omra inclut-elle une station à Arafat ?", answer: "Non. L'Omra comprend l'Ihram, le Tawaf, la Sa'i et le rasage/coupe des cheveux. Arafat est un rite spécifique au Hajj (le 9 Dhul Hijjah)." },
      { question: "Peut-on visiter Arafat hors de la saison du Hajj ?", answer: "Oui, la plaine est accessible toute l'année. C'est un lieu de méditation et de mémoire historique paisible hors saison. Votre guide SAFARUMA peut vous y emmener lors d'une journée d'excursion depuis La Mecque." },
      { question: "Qu'est-ce que la Khutbah al-Wada' ?", answer: "Le «Discours d'adieu» du Prophète ﷺ, prononcé à Arafat le 9 Dhul Hijjah de l'an 10H (632). Il résume l'éthique islamique : égalité des hommes indépendamment de leur race, inviolabilité du sang et des biens, droits de la femme, abolition de l'usure. Considéré comme l'une des premières déclarations universelles des droits de l'homme." },
      { question: "Peut-on rester à Arafat la nuit du 9 au 10 Dhul Hijjah ?", answer: "Non. Rester à Arafat après Maghrib le 9 Dhul Hijjah n'est pas requis. Les pèlerins quittent Arafat à Maghrib pour se rendre à Muzdalifah où ils passent la nuit." },
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
          { href: '/lieux-saints/arafat', label: 'Mont Arafat : le pilier du Hajj' },
          { href: '/lieux-saints/mina', label: 'Mina : la vallée du sacrifice et du Hajj' },
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
          { type: 'paragraph', content: "La nuit de Muzdalifah est souvent comparée par les savants à une préfiguration du Jour du Jugement. Des millions d'êtres humains, de toutes nations, de toutes conditions sociales, vêtus du même tissu blanc, allongés à même la terre sous les étoiles, attendant l'aube. La frontière entre le riche et le pauvre, le roi et le mendiant, s'efface complètement. C'est l'une des manifestations les plus saisissantes de l'égalité islamique." },
          { type: 'paragraph', content: "Le dhikr et les invocations à Muzdalifah sont particulièrement recommandés. Le Prophète ﷺ y resta debout en invocations de l'arrivée jusqu'à l'aurore, en récitant la Talbiyah, le Tahlil et en faisant du Salat. Les savants recommandent de profiter de cette nuit rare — même si le sommeil est nécessaire — pour accomplir des prières surérogatoires, réciter le Coran et faire des du'a pour ses proches." },
        ],
      },
      {
        id: 'rituel',
        title: 'La nuit de Muzdalifah : le rituel',
        content: [
          { type: 'rituals', items: [
            { icon: 'moon', title: 'Prière Maghrib + Isha combinées', description: "En arrivant à Muzdalifah après le coucher du soleil, le pèlerin combine et raccourcit les prières de Maghrib et Isha (3+2 rak'ahs, prières Isha raccourcie et différée jusqu'à Muzdalifah). Pas de Sunnah entre les deux. C'est la Sunna du Prophète ﷺ à Muzdalifah." },
            { icon: 'target', title: 'Collecte des cailloux', description: "Collecter 49 ou 70 petits cailloux (taille d'un pois chiche, 7-8 mm) dans la plaine de Muzdalifah. 49 cailloux pour ceux qui font le Nafr al-Awwal (3 jours de lapidation), 70 pour ceux qui restent les 4 jours complets. Évitez les cailloux souillés ou trop grands." },
            { icon: 'sun', title: 'Fajr et départ vers Mina', description: "Prière de Fajr à Muzdalifah, à ne pas manquer. Après Fajr, dhikr et invocations jusqu'à l'éclaircissement de l'aurore (ishraq), puis départ vers Mina pour la lapidation de Jamrat al-Aqaba. Les personnes âgées ou faibles peuvent partir après minuit." },
          ]},
          { type: 'expert-tip', title: 'Conseil expert SAFARUMA', text: "Emportez une couverture légère et une bouteille d'eau, car les nuits à Muzdalifah peuvent être fraîches même en été (altitude et air du désert). Mettez vos 49 ou 70 cailloux directement dans une petite pochette ou un sac zippé que vous accrocherez à votre ceinture. Votre guide SAFARUMA les aura comptés et disposés par groupes de 7 avant d'arriver à Muzdalifah." },
        ],
        seeAlso: [{ href: '/blog/difference-omra-hajj', label: 'Différence entre Omra et Hajj' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          { type: 'paragraph', content: "Préparez un sac ultra-léger pour Muzdalifah : documents d'identité, médicaments essentiels, eau, couverture légère et chaussures fermées. Évitez les gros bagages — vous marchez et vous dormez à même le sol. Chaussures fermées indispensables car le sol de Muzdalifah est recouvert de gravier et de cailloux." },
          { type: 'paragraph', content: "Le réseau téléphonique est généralement saturé à Muzdalifah pendant le Hajj, prévenez votre famille de l'absence de communication prévue. Convenez d'un point de rendez-vous précis avec votre guide en cas de séparation. Note sur la prière : certains pèlerins oublient de prier Isha séparément — à Muzdalifah, elle est combinée et raccourcie avec Maghrib, sans attendre l'heure habituelle d'Isha." },
          { type: 'paragraph', content: "Pour les pèlerins faibles, âgés ou malades : il est permis de quitter Muzdalifah après minuit pour éviter la foule de l'après-Fajr. Cette dispense est authentifiée par le Hadith — le Prophète ﷺ l'accordait aux femmes, aux enfants et aux personnes faibles de sa famille lors du Hajj d'adieu." },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          { type: 'list', items: [
            "Collecter les cailloux à Mina ou ailleurs : les cailloux doivent être pris à Muzdalifah ou dans tout endroit d'Arafat/Muzdalifah.",
            "Partir de Muzdalifah avant minuit sans dispense valide : les personnes valides doivent rester jusqu'après Fajr.",
            "Prendre des cailloux trop gros : la taille maximale recommandée est celle d'un pois chiche.",
            "Oublier de prier Fajr à Muzdalifah : c'est une prière obligatoire et elle a une valeur particulière en ce lieu.",
            "Croire qu'il faut monter sur le Mash'ar al-Haram : n'importe quel endroit de la plaine de Muzdalifah est valide pour le séjour.",
          ]},
        ],
      },
    ],
    faq: [
      { question: "Doit-on dormir à Muzdalifah ou peut-on rester debout ?", answer: "Le séjour à Muzdalifah (wuquf ou hayth) est la Sunna : le Prophète ﷺ y dormit. Il suffit d'être présent une partie de la nuit. Si vous dormez, c'est Sunna. Si vous priez et faites du dhikr toute la nuit, c'est encore mieux selon les savants." },
      { question: "Combien de cailloux faut-il collecter exactement ?", answer: "49 cailloux si vous faites le Nafr al-Awwal (lapidation sur 3 jours), 70 si vous restez pour 4 jours de lapidation. Beaucoup prennent 70 par précaution. Vérifiez avec votre guide selon votre programme." },
      { question: "Peut-on prendre les cailloux à Mina plutôt qu'à Muzdalifah ?", answer: "Oui, selon la majorité des savants, les cailloux peuvent être pris n'importe où dans les environs — y compris à Mina. Mais la Sunna est de les collecter à Muzdalifah. Prendre les cailloux déjà lancés (utilisés) n'est pas recommandé." },
      { question: "Qu'est-ce que le Nafr al-Awwal (départ anticipé) ?", answer: "C'est la permission de quitter Mina après la lapidation du 12 Dhul Hijjah avant le coucher du soleil, plutôt que d'attendre le 13. Le Coran le permet explicitement (2:203). Cela réduit les rites de Tachrik à 2 jours complets au lieu de 3." },
      { question: "Les personnes âgées et faibles doivent-elles passer la nuit à Muzdalifah ?", answer: "La dispense de partir après minuit est authentifiée par Hadith : le Prophète ﷺ l'accordait aux femmes, aux enfants et aux personnes faibles. Les médecins considèrent également que les personnes avec des conditions médicales peuvent partir tôt sur avis médical." },
      { question: "Que faire s'il n'y a pas de tente à Muzdalifah ?", answer: "Il n'y a pas de tentes permanentes à Muzdalifah, c'est voulu. Les pèlerins dorment à la belle étoile ou sous des bâches légères. Prévoyez une couverture légère, un imperméable fin (rosée possible) et votre provision d'eau." },
      { question: "Comment combiner les prières Maghrib et Isha à Muzdalifah ?", answer: "On prie d'abord le Maghrib (3 rak'ahs) puis immédiatement l'Isha raccourcie (2 rak'ahs) avec un seul adhan et deux iqama, sans prière sunna entre les deux. Cette combinaison avec différé (Jam' Ta'khir) est la Sunna du Prophète ﷺ à Muzdalifah." },
    ],
  },

  'jabal-al-nour': {
    slug: 'jabal-al-nour',
    title: "Jabal al-Nour : la montagne de la première révélation",
    location: 'La Mecque, Hijaz',
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "La montagne sacrée qui abrite la grotte de Hira, lieu de la toute première révélation coranique au Prophète Muhammad ﷺ, en l'an 610 de l'ère chrétienne.",
    readingTime: 7,
    publishedAt: '2026-05-11T10:00:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine et histoire',
        content: [
          {
            type: 'paragraph',
            content: "Jabal al-Nour, littéralement «le mont de la Lumière», s'élève à environ 640 mètres d'altitude, à quatre kilomètres au nord-est du Masjid Al-Haram. Son nom évoque directement la lumière de la Révélation divine qui descendit pour la première fois entre ses rochers en l'an 610 de l'ère chrétienne, soit treize ans avant l'Hégire.",
          },
          {
            type: 'paragraph',
            content: "Bien avant la prophétie, Muhammad ibn Abdallah ﷺ avait l'habitude de se retirer dans la grotte de Hira, au sommet de cette montagne, pour une pratique appelée «tahannuth» : l'isolement contemplatif, la méditation et la recherche de la vérité divine. Ces retraites, parfois de plusieurs jours consécutifs, reflétaient sa quête spirituelle sincère dans une société mecquoise dominée par le polythéisme.",
          },
          {
            type: 'callout',
            text: "Lis, au nom de ton Seigneur qui a créé. Il a créé l'homme d'un caillot. Lis ! Ton Seigneur est le Très Noble. Lui qui a enseigné par le calame. Il a enseigné à l'homme ce qu'il ne savait pas.",
            reference: 'Sourate Al-Alaq, versets 1 à 5, premiers versets révélés à Muhammad ﷺ dans la grotte de Hira',
          },
          {
            type: 'paragraph',
            content: "C'est lors d'une nuit du Ramadan de l'an 610, traditionnellement identifiée comme la Nuit du Destin (Laylat al-Qadr), que l'ange Jibril apparut au Prophète ﷺ dans la grotte. Aïcha (ra) rapporte dans le Sahih al-Bukhari (hadith n° 3) que le Prophète revint chez elle tremblant, disant : «Couvrez-moi, couvrez-moi.» Il raconta sa rencontre avec l'ange, et Khadija (ra) fut la première à le rassurer et à croire en lui.",
          },
        ],
      },
      {
        id: 'description',
        title: 'Description physique et ascension',
        content: [
          {
            type: 'stats',
            items: [
              { label: 'Altitude', value: '640 m' },
              { label: 'Distance Haram', value: '4 km' },
              { label: 'Marches env.', value: '600' },
              { label: 'Durée ascension', value: '1h30' },
            ],
          },
          {
            type: 'paragraph',
            content: "La montagne présente une forme conique caractéristique avec un sommet rocheux abrupt. Le sentier d'ascension compte environ 600 marches irrégulières taillées dans la roche ou aménagées en béton, jalonnées de quelques vendeurs proposant de l'eau et des dattes. La montée est considérée de difficulté modérée à élevée selon la condition physique du pèlerin et la chaleur ambiante.",
          },
          {
            type: 'paragraph',
            content: "Depuis le sommet, la vue panoramique sur La Mecque est saisissante : le Masjid Al-Haram et la Kaaba apparaissent en contrebas, entourés par les tours modernes. Ce contraste entre la roche millénaire de la montagne et la métropole contemporaine illustre à lui seul la profondeur historique du lieu. La grotte de Hira est accessible en quelques mètres depuis le sommet.",
          },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          {
            type: 'paragraph',
            content: "Jabal al-Nour occupe une place unique dans la conscience islamique : c'est le lieu où le silence de la prophétie fut brisé, où l'humanité reçut son dernier message divin. Chaque rocher de cette montagne a été témoin du commencement d'une ère nouvelle pour l'humanité. Le premier mot révélé, «Iqra» (Lis), résonne encore aujourd'hui comme une injonction universelle à la connaissance et à la réflexion.",
          },
          {
            type: 'paragraph',
            content: "La visite de Jabal al-Nour est recommandée à titre de connaissance historique et de méditation spirituelle, mais elle ne constitue ni un rite de l'Omra ni une obligation du Hajj. Les savants islamiques rappellent qu'elle relève de la dévotion personnelle et de la connaissance de la Sîra prophétique, non d'un acte d'adoration prescrit.",
          },
          {
            type: 'callout',
            text: "Ce mont nous aime et nous l'aimons.",
            reference: "Hadith rapporté par al-Bukhari (n° 2889) et Muslim, le Prophète ﷺ évoquant Jabal Uhud, mais les savants citent cette attitude d'amour envers les monts témoins de la prophétie",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Rituels et visite respectueuse',
        content: [
          {
            type: 'paragraph',
            content: "Aucun rituel spécifique n'est prescrit à Jabal al-Nour. La visite est une démarche de mémoire et de méditation. Monter avec une intention sincère de commémorer la Révélation, réciter des invocations (du'a) et méditer sur la Sourate Al-Alaq constituent les formes les plus appropriées de recueillement en ce lieu.",
          },
          {
            type: 'list',
            items: [
              "Formuler une intention (niyyah) claire avant l'ascension : visite historique et spirituelle, connaissance de la Sîra",
              "Réciter Bismillah et commencer l'ascension avec sérénité",
              "Au sommet ou dans la grotte, réciter les premiers versets de la Sourate Al-Alaq (96:1-5)",
              "Faire des invocations personnelles, en arabe ou dans sa propre langue",
              "Observer un moment de silence et de méditation face à la Kaaba visible en contrebas",
              "Redescendre avec prudence, surtout si la roche est humide après la pluie",
            ],
          },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "L'ascension est physiquement exigeante. Les meilleures tranches horaires sont le petit matin (entre 5h et 7h), juste après Fajr, et en fin d'après-midi (entre 16h et 18h) lorsque la chaleur commence à décroître. Évitez impérativement les heures de la mi-journée en été, où les températures peuvent dépasser 45°C sur le sentier exposé au soleil.",
          },
          {
            type: 'paragraph',
            content: "Emportez au minimum un litre d'eau par personne. Portez des chaussures fermées à semelles adhérentes (les sandales de pèlerin sont déconseillées sur les marches irrégulières). Des vêtements légers et respirants, mais couvrant les épaules et les genoux, sont requis pour le respect du lieu.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "L'ascension de Jabal al-Nour est une expérience physique exigeante. Pour les pèlerins moins endurants ou âgés, observer la montagne depuis sa base à l'aube offre déjà un moment d'une grande intensité spirituelle. Votre guide SAFARUMA adapte le programme selon votre condition et peut organiser la visite aux heures optimales pour limiter la foule et la chaleur.",
          },
        ],
        seeAlso: [{ href: '/blog/comment-preparer-omra-10-etapes', label: 'Comment préparer son Omra en 10 étapes' }],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          {
            type: 'list',
            items: [
              "Croire que la visite est un rite obligatoire de l'Omra ou du Hajj : elle n'en fait pas partie. C'est une démarche culturelle et spirituelle volontaire.",
              "S'y aventurer seul sans eau ni téléphone chargé : le sentier est fréquenté mais des accidents de chaleur surviennent chaque saison.",
              "Tenter l'ascension en sandales ouvertes : les marches irrégulières et la roche glissante rendent les chutes fréquentes.",
              "Photographier à l'intérieur de la grotte de Hira dans une atmosphère de bousculade : respectez le caractère sacré du lieu.",
              "Partir sans vérifier la météo : les orages peuvent rendre le sentier dangereux et glissant en quelques minutes.",
              "Surestimer sa condition physique : une personne souffrant de problèmes cardiaques ou articulaires doit consulter son médecin avant d'entreprendre cette ascension.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Faut-il monter Jabal al-Nour pendant la Omra ?", answer: "Non, c'est une visite historique et spirituelle facultative, pas un rite de l'Omra. Les rites de l'Omra sont l'ihram, le Tawaf, le Sa'i et le rasage ou coupe des cheveux. Jabal al-Nour est une démarche de connaissance de la Sîra prophétique." },
      { question: "Combien de temps faut-il prévoir pour l'ascension ?", answer: "Comptez en moyenne 1h30 à 2h pour l'aller-retour, auxquelles s'ajoute le temps passé au sommet et dans la grotte. Prévoyez 3h au total pour une visite sereine sans précipitation." },
      { question: "L'ascension est-elle dangereuse ?", answer: "Elle est exigeante mais praticable pour un adulte en bonne santé. Les risques principaux sont la chaleur, la déshydratation et les chutes sur les marches irrégulières. Chaussures adaptées et hydratation suffisante réduisent considérablement ces risques." },
      { question: "Peut-on y aller avec des enfants ?", answer: "C'est déconseillé pour les enfants de moins de 8-10 ans ou en période de forte chaleur. L'ascension requiert une bonne endurance et des chaussures fermées. Les enfants plus grands, bien équipés et accompagnés, peuvent effectuer la montée." },
      { question: "Y a-t-il des installations sanitaires sur le chemin ?", answer: "Non, il n'y a pas de sanitaires sur le sentier d'ascension. Des vendeurs proposent de l'eau et quelques snacks à mi-chemin. Prévoyez votre eau et organisez vos besoins avant de commencer la montée." },
      { question: "Que faire si on est trop fatigué pour monter ?", answer: "Rester au pied de la montagne est tout aussi valable spirituellement. Récitez la Sourate Al-Alaq, méditez sur l'histoire de la première révélation et faites vos invocations. La sincérité du cœur prime sur l'effort physique." },
      { question: "Y a-t-il des règles vestimentaires spécifiques ?", answer: "Pas de règles particulières au-delà de la tenue modeste habituelle en territoire sacré. Épaules et genoux couverts, cheveux couverts pour les femmes. Les chaussures fermées sont une nécessité pratique, pas une exigence religieuse." },
      { question: "Peut-on visiter la grotte de Hira au sommet ?", answer: "Oui, la grotte est accessible au sommet de Jabal al-Nour. Elle est petite et ne tient que 2 à 3 personnes simultanément. En haute saison, l'attente peut durer 20 à 30 minutes. La visite à l'intérieur n'est pas un rite prescrit mais constitue une expérience historique très forte." },
    ],
  },

  'jabal-thawr': {
    slug: 'jabal-thawr',
    title: "Jabal Thawr : la montagne du refuge prophétique",
    location: 'Au sud de La Mecque, Hijaz',
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "La montagne abrupte où le Prophète Muhammad ﷺ et Abu Bakr as-Siddiq (ra) se réfugièrent trois jours lors de l'Hégire, protégés par un miracle divin.",
    readingTime: 7,
    publishedAt: '2026-05-11T10:30:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Le refuge de l\'Hégire',
        content: [
          {
            type: 'paragraph',
            content: "En l'an 622 de l'ère chrétienne, correspondant à l'an 13 de la prophétie, les notables de La Mecque décidèrent d'assassiner Muhammad ﷺ. L'ange Jibril prévint le Prophète ﷺ du complot. Dans la nuit du 27 Safar (selon la chronologie traditionnelle), Muhammad ﷺ et son fidèle compagnon Abu Bakr as-Siddiq (ra) quittèrent secrètement La Mecque et se réfugièrent dans la grotte de Jabal Thawr, au sud de la ville.",
          },
          {
            type: 'paragraph',
            content: "Ils y séjournèrent trois jours et trois nuits, attendant que les recherches des Qurayshites s'apaisent avant de reprendre la route vers Madinah. Abu Bakr (ra) avait pris soin d'organiser les ravitaillements : sa fille Asma (ra) leur apportait de la nourriture chaque nuit, son fils Abdallah collectait les informations sur les recherches des Qurayshites, et l'affranchi Amir ibn Fuhayra effaçait les traces.",
          },
          {
            type: 'callout',
            text: "Si vous ne lui portez pas secours, Allah l'a déjà secouru quand les incrédules l'ont chassé, et il était le second des deux, quand ils étaient dans la grotte, quand il dit à son compagnon : Ne t'afflige pas, car Allah est avec nous.",
            reference: 'Sourate At-Tawba, verset 40, Sahih al-Bukhari hadith n° 3653',
          },
          {
            type: 'paragraph',
            content: "Les poursuivants qurayshites arrivèrent jusqu'à l'entrée de la grotte. C'est alors que se produisit ce que la tradition islamique décrit comme un miracle : une araignée avait tissé sa toile à l'entrée, et des palombes avaient niché devant l'ouverture. Voyant ces signes d'une présence ancienne et ininterrompue, les Qurayshites conclurent que personne ne pouvait être entré récemment dans la grotte et rebroussèrent chemin.",
          },
        ],
      },
      {
        id: 'description',
        title: 'Description physique et ascension',
        content: [
          {
            type: 'stats',
            items: [
              { label: 'Altitude', value: '759 m' },
              { label: 'Distance Haram', value: '4 km sud' },
              { label: 'Marches env.', value: '1 800' },
              { label: 'Durée ascension', value: '2h30' },
            ],
          },
          {
            type: 'paragraph',
            content: "Jabal Thawr est plus haute et plus abrupte que Jabal al-Nour : elle culmine à 759 mètres, avec un sentier d'ascension comptant environ 1 800 marches sur un terrain rocailleux et parfois escarpé. L'ascension est considérée comme difficile, réservée aux personnes en bonne condition physique. La durée moyenne est de 2h à 2h30 pour l'aller-retour.",
          },
          {
            type: 'paragraph',
            content: "La grotte de Thawr, au sommet, est plus spacieuse que celle de Hira : elle peut accueillir une dizaine de personnes. Elle est composée de deux espaces naturels dans le granit, avec une entrée étroite donnant accès à un couloir débouchant sur une cavité plus large. La roche intérieure est noire, caractéristique du basalte volcanique de la région.",
          },
        ],
        seeAlso: [{ href: '/lieux-saints/jabal-al-nour', label: 'Jabal al-Nour : la montagne de la première révélation' }],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle et historique',
        content: [
          {
            type: 'paragraph',
            content: "Jabal Thawr symbolise le tawakkul, la confiance absolue en Allah face au danger. Lorsqu'Abu Bakr (ra) exprima sa crainte devant les poursuivants, le Prophète ﷺ lui répondit par ces mots gravés à jamais dans l'histoire islamique : «Ne t'afflige pas, Allah est avec nous.» Cette certitude tranquille face à une menace mortelle est l'une des plus hautes expressions de la foi dans toute la Sîra.",
          },
          {
            type: 'paragraph',
            content: "L'Hégire elle-même, dont Jabal Thawr est un moment clé, est un événement fondateur : elle marqua le début du calendrier islamique (l'an 1 de l'Hégire), le passage de la communauté musulmane d'une période de persécution à une période de construction de la cité islamique à Madinah. Sans ce refuge de trois jours à Jabal Thawr, l'histoire aurait pu prendre un cours bien différent.",
          },
          {
            type: 'callout',
            text: "Le Prophète ﷺ était le plus courageux des hommes, le plus généreux des hommes et le plus juste des hommes.",
            reference: "Anas ibn Malik (ra), Sahih al-Bukhari n° 2820, une qualité rendue manifeste notamment lors des jours de Thawr",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Visite et recueillement',
        content: [
          {
            type: 'paragraph',
            content: "Comme pour Jabal al-Nour, la visite de Jabal Thawr n'est pas un rite de l'Omra ou du Hajj. Elle relève de la mémoire historique et de la connexion à la Sîra prophétique. Aucun rituel spécifique n'est prescrit. La démarche la plus appropriée consiste à méditer sur le tawakkul, la foi et la patience du Prophète ﷺ et d'Abu Bakr (ra) dans l'épreuve.",
          },
          {
            type: 'paragraph',
            content: "Réciter le verset 40 de la Sourate At-Tawba, faire ses invocations personnelles et accomplir deux rak'ahs de prière nafl si l'espace le permet constituent les formes de recueillement les plus courantes au sommet. L'absence d'affluence par rapport à Jabal al-Nour permet souvent un moment de solitude et de paix plus facile à trouver.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "L'ascension de Jabal Thawr est plus éprouvante que celle de Jabal al-Nour et réservée aux pèlerins en bonne condition physique. Si vous n'êtes pas en capacité d'effectuer la montée, observer la montagne depuis sa base et méditer sur le miracle de l'araignée et la sérénité du Prophète ﷺ dans la grotte est déjà un acte de mémoire profondément enrichissant. Votre guide SAFARUMA évalue avec vous la faisabilité de l'ascension selon votre état et la météo.",
          },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "La visite de Jabal Thawr est moins fréquentée que celle de Jabal al-Nour, ce qui en fait souvent une expérience plus intime. Le sentier est cependant plus exigeant : comptez 1h30 à 2h pour la montée seule. Chaussures de randonnée fermées, minimum 1,5 litre d'eau par personne, lampe torche pour les visites matinales avant l'aube.",
          },
          {
            type: 'list',
            items: [
              "Horaire recommandé : entre 5h et 7h du matin, ou entre 16h et 18h en été",
              "Chaussures de randonnée ou à semelles épaisses obligatoires",
              "1,5 litre d'eau minimum par personne pour l'aller-retour",
              "Lampe torche ou smartphone chargé pour les visites à l'aube",
              "Éviter l'ascension par temps de pluie ou par grand vent",
              "Ne pas s'aventurer seul sans avoir informé quelqu'un de son itinéraire",
            ],
          },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          {
            type: 'list',
            items: [
              "Surestimer sa condition physique : Jabal Thawr est plus haute et plus difficile que Jabal al-Nour. Renoncez si vous avez des problèmes cardiaques ou articulaires.",
              "Croire que la grotte de Thawr exauce des vœux ou que toucher ses murs apporte une bénédiction particulière : aucune tradition authentique ne soutient ces pratiques.",
              "Confondre Jabal Thawr (au sud de La Mecque) et Jabal al-Nour (au nord-est) : deux montagnes distinctes, deux histoires différentes.",
              "Tenter l'ascension de nuit sans équipement adapté : le sentier est non éclairé et le terrain accidenté.",
              "Oublier de prévenir votre guide ou votre groupe de votre destination avant de partir.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Peut-on visiter la grotte de Thawr aujourd'hui ?", answer: "Oui, la grotte est accessible au sommet de Jabal Thawr. Elle est moins fréquentée que la grotte de Hira et offre souvent un moment de recueillement plus calme. L'ascension est cependant plus longue et plus difficile." },
      { question: "L'ascension est-elle plus difficile que Jabal al-Nour ?", answer: "Oui, sensiblement. Jabal Thawr culmine à 759 mètres (contre 640 pour Jabal al-Nour) et compte environ 1 800 marches sur un terrain plus abrupt. Prévoyez 2h à 2h30 pour l'aller-retour contre 1h30 pour Jabal al-Nour." },
      { question: "Combien de temps prévoir pour l'ascension complète ?", answer: "Comptez 1h30 à 2h pour la montée, 20 à 30 minutes au sommet et dans la grotte, puis 1h pour la descente. Au total : 3h à 3h30 pour une visite confortable. Partez tôt le matin pour éviter la chaleur de la mi-journée." },
      { question: "Quelle est l'histoire de l'araignée ?", answer: "Selon la tradition islamique, lorsque les Qurayshites arrivèrent à l'entrée de la grotte, une araignée avait tissé sa toile et des palombes nichaient devant l'ouverture. Ces signes d'une présence ancienne et ininterrompue convainquirent les poursuivants que personne n'y était entré récemment. Ce miracle est relaté dans les commentaires du verset 40 d'At-Tawba." },
      { question: "Que symbolise cette retraite de 3 jours ?", answer: "Elle symbolise le tawakkul, la confiance totale en Allah face au danger. La phrase du Prophète ﷺ à Abu Bakr, «Ne t'afflige pas, Allah est avec nous», est l'une des expressions les plus puissantes de la foi dans la Sîra. L'Hégire qui en découla fonda le calendrier islamique et la première cité musulmane à Madinah." },
      { question: "Faut-il monter Jabal Thawr pendant la Omra ?", answer: "Non, c'est une visite historique et spirituelle facultative. Les rites de la Omra se limitent à l'ihram, le Tawaf, le Sa'i et la coupe des cheveux. Jabal Thawr est une étape de connaissance de la Sîra, pas un acte d'adoration prescrit." },
      { question: "Y a-t-il des risques pour la santé ?", answer: "Les risques principaux sont la chaleur, la déshydratation et les chutes sur le sentier accidenté. Les personnes souffrant de problèmes cardiaques, articulaires ou respiratoires doivent consulter leur médecin avant d'envisager l'ascension. La descente est parfois plus dangereuse que la montée." },
      { question: "Peut-on faire l'ascension de nuit ?", answer: "C'est possible mais fortement déconseillé sans équipement approprié. Le sentier est non éclairé, le terrain accidenté et les risques de chute élevés dans l'obscurité. Si vous souhaitez être au sommet à l'aube, partez 2h avant le lever du soleil avec des lampes frontales." },
    ],
  },

  'masjid-al-jumua': {
    slug: 'masjid-al-jumua',
    title: "Masjid al-Jumua : la première prière du vendredi",
    location: 'Quartier Banu Salim, sud-ouest de Médine',
    locationKicker: 'LIEU SAINT · MÉDINE',
    excerpt: "Mosquée où le Prophète Muhammad ﷺ accomplit la toute première Salat al-Jumua (prière du vendredi) de l'histoire de l'Islam, lors de son Hégire vers Médine en l'an 1 H.",
    readingTime: 6,
    publishedAt: '2026-05-11T12:15:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'La première prière du vendredi de l\'Islam',
        content: [
          {
            type: 'paragraph',
            content: "En l'an 1 de l'Hégire (622 de l'ère chrétienne), lors du voyage du Prophète Muhammad ﷺ de La Mecque vers Médine, il fit halte dans le quartier des Banu Salim ibn Awf, un vendredi matin, après avoir séjourné quatorze jours à Quba pour y fonder la première mosquée de l'Islam.",
          },
          {
            type: 'paragraph',
            content: "C'est à cet endroit précis, dans le quartier de Banu Salim, que le Prophète ﷺ accomplit la toute première Salat al-Jumua de l'histoire islamique. Il prononça également le premier khotba (sermon du vendredi) de l'Islam. Cet événement fonda l'institution de la prière hebdomadaire du vendredi, pilier de la vie communautaire musulmane.",
          },
          {
            type: 'callout',
            text: "Ô vous qui avez cru, quand on appelle à la prière du jour du vendredi, accourez à l'invocation d'Allah et laissez tout négoce. C'est mieux pour vous, si vous saviez.",
            reference: 'Sourate Al-Jumua, verset 9, révélée à Médine, instituant l\'obligation de la prière du vendredi',
          },
          {
            type: 'paragraph',
            content: "La mosquée actuelle fut construite ultérieurement à l'emplacement exact de cette première prière. Elle a été rénovée à plusieurs reprises par les autorités saoudiennes. Ibn Kathir et d'autres historiens de la Sîra confirment cet emplacement dans leurs ouvrages, en s'appuyant sur les récits de Ibn Ishaq et Ibn Hisham.",
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-quba', label: 'Masjid Quba : la première mosquée de l\'Islam' }],
      },
      {
        id: 'architecture',
        title: 'Description architecturale',
        content: [
          {
            type: 'stats',
            items: [
              { label: 'Capacité', value: '650 fidèles' },
              { label: 'Distance Nabawi', value: '4 km' },
              { label: 'Année événement', value: '622 H.' },
              { label: 'Dômes', value: '4 dômes' },
            ],
          },
          {
            type: 'paragraph',
            content: "La mosquée actuelle est une structure relativement modeste comparée aux grands sanctuaires de Médine. Sa capacité est d'environ 650 fidèles. Elle présente une architecture simple et fonctionnelle : quatre dômes blancs surmontent la salle de prière, un minaret unique domine la cour extérieure. L'intérieur est sobre, orné uniquement de calligraphies coraniques.",
          },
          {
            type: 'paragraph',
            content: "Quatre mihrabs rappellent les différentes orientations de prière utilisées au fil de l'histoire de la mosquée. La cour est ouverte et ombragée par quelques palmiers. La mosquée est entourée d'un quartier résidentiel calme, à l'écart de l'agitation des grands axes touristiques de Médine.",
          },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          {
            type: 'paragraph',
            content: "Masjid al-Jumua est le berceau d'un des rites communautaires les plus pratiqués dans l'Islam : la prière du vendredi. Cette prière, qui rassemble chaque semaine plus d'un milliard de musulmans dans le monde entier, trouve son origine dans cette petite cour de Médine où le Prophète ﷺ se retrouva un vendredi matin avec ses compagnons.",
          },
          {
            type: 'paragraph',
            content: "Accomplir la Salat al-Jumua dans cette mosquée, là où la première fut accomplie, est une expérience que de nombreux pèlerins décrivent comme particulièrement émouvante. La continuité du rite à travers quatorze siècles, depuis ce premier vendredi de 622 jusqu'à aujourd'hui, devient palpable en ce lieu discret.",
          },
          {
            type: 'paragraph',
            content: "La mosquée n'est pas un lieu de rituel prescrit dans le cadre de l'Omra ou du Hajj. La visite est une démarche spirituelle et historique volontaire. Prier la Jumua ici ne remplace pas l'obligation hebdomadaire, mais la confirme dans un contexte unique.",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Visite et recueillement',
        content: [
          {
            type: 'paragraph',
            content: "La visite se prête à un recueillement calme dans un cadre intimiste. La coutume islamique recommande d'accomplir deux rak'ahs de prière dite «tahiyat al-masjid» (salutation de la mosquée) à l'arrivée dans tout lieu de prière. Une méditation sur le premier sermon du Prophète ﷺ et sur l'institution de la Jumua enrichit la visite.",
          },
          {
            type: 'paragraph',
            content: "Si votre séjour à Médine inclut un vendredi, assister à la Salat al-Jumua à cette mosquée est une expérience à envisager. Arrivez au moins une heure avant l'appel à la prière pour trouver une place confortable. En dehors du vendredi, la mosquée reçoit peu de visiteurs et offre un cadre de recueillement tranquille.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Si votre séjour à Médine couvre un vendredi, accomplir la Salat al-Jumua à Masjid al-Jumua est une expérience unique : c'est prier là où le Prophète ﷺ a accompli la toute première Salat al-Jumua de l'Islam. Votre guide SAFARUMA vous y conduit en avance et vous explique l'histoire du lieu avant la prière, pour que vous puissiez vivre ce moment avec toute la profondeur qu'il mérite.",
          },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "La mosquée est ouverte tous les jours pour les cinq prières quotidiennes. L'affluence est faible en semaine. Le vendredi, en revanche, la mosquée peut être pleine bien avant l'appel à la prière du Jumua. Arrivez une heure à l'avance pour être bien placé. La salle des femmes est séparée.",
          },
          {
            type: 'list',
            items: [
              "Distance depuis Masjid an-Nabawi : environ 4 km, 10 à 15 minutes en taxi",
              "Pas de transport public direct depuis le centre de Médine",
              "Horaires d'ouverture : pour les cinq prières quotidiennes",
              "Tenue propre recommandée, voire parfumée le vendredi (Sunnah)",
              "Photographies permises à l'extérieur, modération recommandée à l'intérieur",
            ],
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-an-nabawi', label: 'Masjid an-Nabawi : la mosquée du Prophète ﷺ' }],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          {
            type: 'list',
            items: [
              "Croire que prier à Masjid al-Jumua confère une vertu supérieure à la prière du vendredi ordinaire : aucun hadith authentique n'attribue une valeur multipliée à cette mosquée spécifiquement.",
              "Confondre Masjid al-Jumua et Masjid Quba : les deux sont sur l'itinéraire de l'Hijra mais à des étapes différentes. Quba fut la première mosquée fondée, al-Jumua le lieu de la première prière du vendredi.",
              "Arriver le vendredi sans prévoir suffisamment de temps avant l'iqama : la salle est petite (650 personnes) et se remplit tôt.",
              "Négliger la visite en pensant qu'elle est sans intérêt : pour tout pèlerin attaché à la Sîra, ce lieu discret est l'un des plus chargés de sens à Médine.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Pourquoi cette mosquée s'appelle-t-elle al-Jumua ?", answer: "Parce que c'est l'endroit où le Prophète ﷺ accomplit la toute première Salat al-Jumua (prière du vendredi) de l'histoire islamique, lors de son Hégire de La Mecque à Médine en l'an 622. Le mot arabe «Jumua» signifie «vendredi» ou «rassemblement»." },
      { question: "Le Prophète ﷺ a-t-il vraiment prié à cet endroit précis ?", answer: "Oui, selon les récits de la Sîra rapportés par Ibn Ishaq et Ibn Hisham, confirmés par des historiens comme Ibn Kathir. Le Prophète ﷺ s'arrêta dans le quartier des Banu Salim ibn Awf un vendredi matin et y accomplit la première Salat al-Jumua avant de continuer vers Médine." },
      { question: "Combien de personnes peuvent y prier ?", answer: "Environ 650 fidèles dans la salle principale. La mosquée est petite comparée aux grands sanctuaires de Médine. Il existe également un espace extérieur pouvant accueillir quelques fidèles supplémentaires." },
      { question: "Comment s'y rendre depuis Masjid an-Nabawi ?", answer: "En taxi, le trajet dure environ 10 à 15 minutes depuis Masjid an-Nabawi (environ 4 km). Il n'existe pas de ligne de bus directe. Votre guide peut organiser le transport ou vous indiquer où trouver un taxi au tarif local." },
      { question: "Est-elle ouverte tous les jours ?", answer: "Oui, pour les cinq prières quotidiennes. L'affluence est faible en semaine. Le vendredi, elle reçoit plus de visiteurs souhaitant accomplir la Jumua en ce lieu historique." },
      { question: "Y a-t-il des espaces séparés hommes/femmes ?", answer: "Oui, comme dans toutes les mosquées saoudiennes, les espaces de prière sont entièrement séparés. Les femmes disposent d'une entrée et d'une salle de prière distinctes." },
      { question: "Cette mosquée est-elle mentionnée dans le Coran ?", answer: "Non, la mosquée n'est pas mentionnée directement. En revanche, la Sourate Al-Jumua (verset 9) institue l'obligation de la prière du vendredi, et cet endroit est le lieu où cette institution fut mise en pratique pour la première fois." },
      { question: "Combien de temps prévoir pour la visite ?", answer: "30 à 45 minutes suffisent pour une visite calme avec prière de salutation. Si vous y assistez à la Salat al-Jumua, prévoyez 2h30 à 3h au total (arrivée en avance, prière, retour)." },
    ],
  },

  'wadi-al-aqiq': {
    slug: 'wadi-al-aqiq',
    title: "Wadi al-Aqiq : la vallée bénie de Médine",
    location: "À l'ouest de Médine",
    locationKicker: 'LIEU SAINT · MÉDINE',
    excerpt: "Vallée naturelle traversant l'ouest de Médine, qualifiée de «vallée bénie» par le Prophète Muhammad ﷺ et associée au lieu de la talbiyah pour la Omra.",
    readingTime: 5,
    publishedAt: '2026-05-11T12:30:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine et signification prophétique',
        content: [
          {
            type: 'paragraph',
            content: "Wadi al-Aqiq est une vallée naturelle traversant l'ouest de Médine sur une longueur d'environ trente kilomètres. Son nom, «l'Aqiq», désigne en arabe l'agate rouge, une pierre semi-précieuse, probablement en référence à la couleur de ses sols lors des crues.",
          },
          {
            type: 'callout',
            text: "Un envoyé est venu cette nuit de la part de mon Seigneur en m'ordonnant de prier dans cette vallée bénie et de dire : Omra et Hajj ensemble.",
            reference: "Sahih al-Bukhari, n° 1534, rapporté par Umar ibn al-Khattab (ra), le Prophète ﷺ évoquant la vision reçue à Wadi al-Aqiq",
          },
          {
            type: 'paragraph',
            content: "Ce hadith de Bukhari établit la bénédiction divine de la vallée par révélation directe. La formule «vallée bénie» (wadi mubarak) n'est pas une qualification humaine mais une désignation prophétique. C'est dans cette vallée que le Prophète ﷺ commençait sa talbiyah lors de ses déplacements vers La Mecque pour la Omra ou le Hajj.",
          },
          {
            type: 'paragraph',
            content: "La vallée est également mentionnée dans un hadith de Muslim (n° 1186) relatant que le Prophète ﷺ s'y arrêtait pour prier et y formulait l'intention de l'Omra. Ces deux témoignages concordants des plus grands compilateurs de hadiths confirment l'importance du lieu.",
          },
        ],
      },
      {
        id: 'geographie',
        title: 'Description géographique',
        content: [
          {
            type: 'stats',
            items: [
              { label: 'Longueur', value: '~30 km' },
              { label: 'Distance Nabawi', value: '~8 km' },
              { label: 'Hadith de référence', value: 'Bukhari 1534' },
              { label: 'Hadith de référence', value: 'Muslim 1186' },
            ],
          },
          {
            type: 'paragraph',
            content: "Wadi al-Aqiq s'étend du nord-est au sud-ouest de Médine, traversant l'ensemble de la partie occidentale de l'oasis. Sa largeur varie de quelques centaines de mètres à plus d'un kilomètre selon les sections. Le fond de la vallée était historiquement cultivé en palmiers dattiers, en jardins et en champs irrigués par les eaux de crues saisonnières.",
          },
          {
            type: 'paragraph',
            content: "Aujourd'hui, la vallée est en grande partie urbanisée et intégrée dans le tissu de Médine moderne. Certaines sections, notamment près de Masjid al-Miqat (Dhul-Hulayfah), préservent encore un caractère naturel. La mosquée du miqat est précisément située dans la portion de la vallée la plus chargée de signification prophétique.",
          },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          {
            type: 'paragraph',
            content: "La désignation de Wadi al-Aqiq comme «vallée bénie» par le Prophète ﷺ en fait l'un des rares lieux géographiques à avoir reçu une qualification divine explicite dans les hadiths authentiques. Cette bénédiction s'étend à ceux qui y accomplissent des actes d'adoration sincères.",
          },
          {
            type: 'paragraph',
            content: "La recommandation prophétique de prier dans cette vallée avant de se rendre à La Mecque trouve sa réalisation pratique à Masjid al-Miqat : les pèlerins y accomplissent deux rak'ahs avant d'entrer en ihram, perpétuant ainsi la Sunnah du Prophète ﷺ dans ce lieu béni.",
          },
          {
            type: 'paragraph',
            content: "Les savants islamiques s'accordent à dire que la bénédiction de la vallée est réelle mais ne justifie pas de déplacement spécifique en dehors du passage au miqat, qui en est l'expression naturelle. Visiter la vallée comme site touristique distinct n'est ni recommandé ni déconseillé, mais doit être fait avec conscience de sa signification.",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Visite et recueillement',
        content: [
          {
            type: 'paragraph',
            content: "En pratique, visiter Wadi al-Aqiq ne constitue pas une démarche distincte de la visite de Masjid al-Miqat. La mosquée du miqat est au cœur de la zone la plus significative de la vallée. Lorsque vous accomplirez votre ihram à Masjid al-Miqat, vous serez déjà dans la vallée bénie du Prophète ﷺ.",
          },
          {
            type: 'paragraph',
            content: "Il est possible de demander à votre guide de vous montrer les contours naturels de la vallée depuis un point élevé lors du trajet vers La Mecque. La conscience d'être dans ce lieu béni, même en transit, contribue au recueillement spirituel du départ vers le pèlerinage.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Wadi al-Aqiq n'est pas un site à visiter séparément : la vallée traverse toute la zone du miqat et est aujourd'hui urbanisée. Quand vous accomplissez votre ihram à Masjid al-Miqat, vous êtes au cœur de la vallée bénie. Votre guide SAFARUMA mentionnera ce contexte avant votre entrée en ihram pour enrichir spirituellement ce moment fondateur de votre Omra.",
          },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "Aucun déplacement spécifique vers Wadi al-Aqiq n'est nécessaire. Le passage naturel au miqat lors du départ pour La Mecque vous place automatiquement dans la vallée bénie. La conscience de ce contexte géographique enrichit la spiritualité du moment sans requérir de visite supplémentaire.",
          },
          {
            type: 'list',
            items: [
              "La visite de Wadi al-Aqiq est incluse naturellement dans le passage au miqat",
              "Aucune infrastructure touristique spécifique à la vallée",
              "La zone naturelle préservée se trouve principalement autour de Masjid al-Miqat",
              "Mentionner la vallée à votre guide : il pourra vous en montrer les contours",
            ],
          },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          {
            type: 'list',
            items: [
              "Organiser une visite séparée et longue de «Wadi al-Aqiq» en tant que site touristique : la vallée est urbanisée et n'offre pas de vue ni d'infrastructure particulières.",
              "Confondre la vallée et la mosquée : Wadi al-Aqiq est une vallée géographique de 30 km, Masjid al-Miqat est la mosquée construite en son sein au point le plus significatif.",
              "Croire que marcher dans la vallée confère automatiquement une bénédiction sans acte d'adoration sincère : c'est la prière et le dhikr accomplis dans ce lieu béni qui ont une valeur, pas le simple passage.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Quelle est la différence entre Wadi al-Aqiq et Masjid al-Miqat ?", answer: "Wadi al-Aqiq est une vallée naturelle de 30 km traversant l'ouest de Médine. Masjid al-Miqat (Dhul-Hulayfah) est la mosquée construite dans la portion la plus significative de cette vallée, là où le Prophète ﷺ s'arrêtait pour prier et entrer en ihram. La mosquée est au sein de la vallée." },
      { question: "Pourquoi le Prophète ﷺ a-t-il qualifié cette vallée de bénie ?", answer: "Selon le hadith rapporté par Bukhari (n° 1534), le Prophète ﷺ reçut une instruction divine lors d'une vision nocturne lui ordonnant de prier dans «cette vallée bénie». La désignation est donc d'origine divine, transmise par le Prophète ﷺ à ses compagnons." },
      { question: "Faut-il prier spécifiquement dans la vallée ?", answer: "La Sunnah est de prier à Masjid al-Miqat qui est dans la vallée, avant d'entrer en ihram. C'est la réalisation pratique la plus simple de la recommandation prophétique. Une prière dans n'importe quel point de la vallée est valide mais pas nécessairement plus méritoire." },
      { question: "Peut-on y aller sans passer par la mosquée du miqat ?", answer: "Techniquement oui, mais sans intérêt pratique. La partie de la vallée préservant un caractère naturel est précisément autour du miqat. Ailleurs, la vallée est urbanisée et intégrée dans Médine moderne." },
      { question: "Quelle est la longueur exacte de la vallée ?", answer: "Wadi al-Aqiq s'étend sur environ 30 km, du nord-est au sud-ouest de Médine. C'est l'une des plus importantes vallées de la région du Hijaz." },
      { question: "Y a-t-il d'autres lieux saints dans la vallée ?", answer: "Masjid al-Miqat est le lieu saint principal situé dans la vallée. Historiquement, plusieurs jardins et domaines du Prophète ﷺ et des compagnons étaient également dans cette zone, mais ils ne sont plus identifiables aujourd'hui." },
    ],
  },

  'badr': {
    slug: 'badr',
    title: "Badr : la première grande victoire de l'Islam",
    location: "À 130 km au sud-ouest de Médine",
    locationKicker: 'LIEU SAINT · MÉDINE',
    excerpt: "Lieu de la bataille fondatrice de Badr (an 2 H.), où 313 Musulmans ont vaincu une armée qurayshite trois fois plus nombreuse, événement célébré dans le Coran sous le nom de «Yawm al-Furqan».",
    readingTime: 7,
    publishedAt: '2026-05-11T14:00:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'La bataille fondatrice',
        content: [
          {
            type: 'paragraph',
            content: "Le 17 Ramadan de l'an 2 de l'Hégire (17 mars 624), une armée de 313 Musulmans affronta une force qurayshite de près de 1 000 guerriers dans la plaine de Badr, à environ 130 kilomètres au sud-ouest de Médine. L'affrontement dura une matinée. À son terme, 70 Quraysh avaient été tués et 70 autres faits prisonniers, contre 14 martyrs côté musulman.",
          },
          {
            type: 'callout',
            text: "Allah vous a secourus à Badr, alors que vous étiez dans la faiblesse. Craignez Allah, peut-être serez-vous reconnaissants.",
            reference: 'Sourate Aal-Imran, verset 123, rappelant le secours divin accordé à Badr',
          },
          {
            type: 'paragraph',
            content: "La bataille éclata autour d'une caravane commerciale qurayshite que le Prophète ﷺ cherchait à intercepter pour compenser les biens confisqués aux Musulmans lors de leur expulsion de La Mecque. Abu Sufyan, à la tête de la caravane, put l'esquiver, mais les notables mecquois décidèrent tout de même d'affronter les Musulmans pour leur donner une leçon. Ce calcul se révéla fatal pour la puissance qurayshite.",
          },
          {
            type: 'paragraph',
            content: "Parmi les Quraysh tombés figuraient certains des ennemis les plus acharnés de l'Islam : Abu Jahl, Utba ibn Rabi'a, Shaybah ibn Rabi'a. Ces pertes furent un choc considérable pour la société mecquoise. Le Coran consacra à cet événement une sourate entière : Al-Anfal (le Butin), révélée peu après la bataille.",
          },
        ],
      },
      {
        id: 'geographie',
        title: 'Description géographique',
        content: [
          {
            type: 'stats',
            items: [
              { label: 'Année', value: 'An 2 H.' },
              { label: 'Soldats musulmans', value: '313' },
              { label: 'Soldats Quraysh', value: '~1 000' },
              { label: 'Distance Médine', value: '130 km' },
            ],
          },
          {
            type: 'paragraph',
            content: "La plaine de Badr est une vaste étendue sablonneuse encadrée de petites collines, sur l'ancienne route caravanière reliant La Mecque à la Syrie. C'est un point d'eau stratégique que les deux armées cherchaient à contrôler. Aujourd'hui, la ville moderne de Badr Hunayn s'est développée sur et autour du site historique.",
          },
          {
            type: 'paragraph',
            content: "Le Cimetière des Martyrs de Badr (Maqbarat Shuhada Badr) est le site le plus visité. Il abrite les tombes des 14 Compagnons tombés lors de la bataille. Parmi eux figurent Ubaydah ibn al-Harith (ra), cousin du Prophète ﷺ, et Umair ibn Abi Waqqas (ra), frère cadet de Sad ibn Abi Waqqas, qui aurait à peine seize ans lors de la bataille.",
          },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          {
            type: 'paragraph',
            content: "Badr est appelé «Yawm al-Furqan», le Jour du Discernement, c'est-à-dire le jour où la vérité et le mensonge furent clairement séparés. Le Coran y voit la première manifestation tangible du soutien divin aux croyants sincères face aux puissants : 313 hommes mal armés, pour la plupart des jeunes gens, face à l'élite militaire et commerciale de La Mecque.",
          },
          {
            type: 'callout',
            text: "Ce n'est pas vous qui les avez tués, mais c'est Allah qui les a tués. Et tu n'as pas lancé quand tu as lancé, mais c'est Allah qui a lancé.",
            reference: "Sourate Al-Anfal, verset 17, attribuant la victoire à Allah plutôt qu'aux hommes",
          },
          {
            type: 'paragraph',
            content: "Les versets 9 à 13 de la Sourate Aal-Imran décrivent l'envoi de 1 000 puis 3 000 anges au soutien des Musulmans à Badr. Cette aide angélique, que les Compagnons perçurent comme une forme de sérénité et d'assurance qui les envahit soudainement, explique leur résolution face à une infériorité numérique écrasante.",
          },
          {
            type: 'paragraph',
            content: "La leçon centrale de Badr est celle du tawakkul radical : la confiance totale en Allah, indépendante des rapports de force matériels. Cette leçon, répétée à Hunayn dans le sens inverse (le grand nombre ne garantit rien), constitue l'un des enseignements spirituels les plus récurrents de la Sîra.",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Visite et recueillement',
        content: [
          {
            type: 'paragraph',
            content: "La visite de Badr s'articule principalement autour du Cimetière des Martyrs. Il est recommandé d'y réciter les salutations islamiques aux morts : «Al-salam alaykum ya ahl al-qubur» (Que la paix soit sur vous, habitants des tombeaux). Faire des invocations pour les martyrs et pour les proches décédés est une Sunnah établie.",
          },
          {
            type: 'paragraph',
            content: "Il est important de souligner que les invocations se font pour les martyrs, non aux martyrs. Demander aux morts d'intercéder est une pratique catégoriquement rejetée par l'Islam. La prière du pèlerin s'adresse à Allah, en demandant Sa miséricorde pour les martyrs et pour soi-même.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "La visite de Badr est une excursion à la journée depuis Médine (environ 2h30 de route aller). Préparez-vous physiquement et logistiquement. L'essentiel de la visite se concentre au Cimetière des Martyrs. Votre guide SAFARUMA retrace le déroulement de la bataille sur le terrain, ce qui rend la visite infiniment plus vivante que la simple lecture. Prévoir 1h30 à 2h sur le site.",
          },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "La visite de Badr se fait généralement en excursion à la journée depuis Médine. Aucun transport public régulier ne dessert Badr depuis Médine : il faut louer un taxi privé ou passer par une agence. Le trajet prend environ 2h à 2h30 selon la circulation. Les routes sont bonnes mais longues.",
          },
          {
            type: 'list',
            items: [
              "Distance Médine : 130 km, environ 2h à 2h30 de route",
              "Transport : taxi privé ou agence (pas de bus public)",
              "Durée sur site : 1h30 à 2h (cimetière + panorama de la plaine)",
              "Emportez eau, protection solaire et encas pour la journée",
              "Le cimetière est ouvert mais les horaires peuvent varier",
              "Tenue modeste obligatoire, comme pour tout site islamique",
            ],
          },
        ],
        seeAlso: [{ href: '/lieux-saints/jabal-uhud', label: "Jabal Uhud : la montagne des martyrs de Médine" }],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          {
            type: 'list',
            items: [
              "Invoquer les martyrs directement (leur demander d'intercéder, faire des demandes à leurs tombes) : c'est une forme de shirk catégoriquement rejetée en Islam. On prie pour eux, non par eux.",
              "Confondre Badr et Uhud : ce sont deux batailles distinctes. Badr (an 2 H.) fut une victoire totale ; Uhud (an 3 H.) fut une défaite partielle due à la désobéissance de certains archers.",
              "Confondre Badr et Hunayn : Badr opposait 313 Musulmans à 1 000 Quraysh ; Hunayn opposait 12 000 Musulmans aux Hawazin.",
              "Partir de Médine sans eau ni nourriture suffisante : la journée est longue et les services en route sont limités.",
              "Photographier les tombes en gros plan ou adopter un comportement irrespectueux au cimetière.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Combien de Musulmans participaient à la bataille de Badr ?", answer: "313 Compagnons du Prophète ﷺ participèrent à la bataille. Ce chiffre est unanimement attesté dans les sources islamiques authentiques. Parmi eux, des compagnons de tous âges et de toutes origines sociales, dont certains très jeunes comme Umair ibn Abi Waqqas (ra)." },
      { question: "Où se trouve exactement le site de Badr aujourd'hui ?", answer: "Le site historique correspond à l'actuelle ville de Badr Hunayn, à environ 130 km au sud-ouest de Médine. Le Cimetière des Martyrs (Maqbarat Shuhada Badr) est le site principal identifiable. La plaine environnante correspond approximativement au champ de bataille." },
      { question: "Pourquoi cette bataille est-elle si importante en Islam ?", answer: "Badr est la première grande victoire militaire de l'Islam, contre toute probabilité. Elle confirma aux yeux des Compagnons et des adversaires que le Prophète ﷺ bénéficiait d'un soutien divin réel. Le Coran y consacra une sourate entière (Al-Anfal) et la qualifia de «Yawm al-Furqan» (Jour du Discernement)." },
      { question: "Qui sont les 14 martyrs de Badr ?", answer: "Les 14 martyrs musulmans de Badr incluent notamment Ubaydah ibn al-Harith (ra), cousin du Prophète ﷺ, Sa'd ibn Khaythama (ra), Umair ibn Abi Waqqas (ra, environ 16 ans), et Rafi' ibn al-Mu'alla (ra). Leurs noms sont consignés dans les livres de Sîra, notamment chez Ibn Hisham et Ibn Kathir." },
      { question: "Faut-il visiter Badr pendant la Omra ?", answer: "Non, c'est une excursion historique et spirituelle facultative. Les rites de la Omra se déroulent exclusivement à La Mecque. Badr est une visite recommandée pour les pèlerins séjournant à Médine et souhaitant approfondir leur connaissance de la Sîra prophétique." },
      { question: "Comment s'y rendre depuis Médine ?", answer: "En taxi privé ou avec un guide, car il n'existe pas de transport public régulier. Négociez le prix aller-retour avec plusieurs chauffeurs. Certaines agences proposent des excursions organisées vers Badr. Le trajet dure environ 2h à 2h30 selon les conditions de circulation." },
      { question: "Combien de temps prévoir pour l'excursion ?", answer: "Comptez une journée complète : 2h30 de trajet aller, 1h30 à 2h sur le site (cimetière et panorama), puis 2h30 de retour. Partez tôt le matin pour éviter la chaleur de la mi-journée sur le site." },
      { question: "Y a-t-il des restrictions d'accès ?", answer: "Le Cimetière des Martyrs est généralement accessible mais les horaires et les conditions d'accès peuvent varier selon les périodes et les décisions des autorités saoudiennes. Votre guide SAFARUMA vérifie l'accessibilité avant de programmer la visite." },
    ],
  },

  'bir-aris': {
    slug: 'bir-aris',
    title: "Bir Aris : le puits où tomba le sceau prophétique",
    location: 'Quartier Quba, Médine',
    locationKicker: 'LIEU SAINT · MÉDINE',
    excerpt: "Ancien puits de Médine, célèbre pour avoir été le lieu où la bague-sceau du Prophète Muhammad ﷺ, portée par le calife Othman, tomba accidentellement et ne fut jamais retrouvée.",
    readingTime: 5,
    publishedAt: '2026-05-11T14:30:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Histoire du puits et du sceau perdu',
        content: [
          {
            type: 'paragraph',
            content: "Bir Aris est un ancien puits situé dans le quartier de Quba, à quelques centaines de mètres de Masjid Quba. Il est également connu sous le nom de «Bir al-Khatim», le Puits du Sceau, en référence à l'événement qui lui valut sa célébrité.",
          },
          {
            type: 'paragraph',
            content: "Le Prophète Muhammad ﷺ avait l'habitude de visiter ce jardin, de s'y asseoir au bord du puits et d'y faire ses ablutions. Anas ibn Malik (ra), serviteur du Prophète ﷺ, rapporte dans le Sahih al-Bukhari (n° 3105) que le Prophète ﷺ s'assit un jour au bord de Bir Aris, les pieds pendants dans le puits.",
          },
          {
            type: 'callout',
            text: "Le Prophète ﷺ portait une bague en argent gravée de «Muhammad, Messager d'Allah». Il dit : «Ne faites pas graver cette inscription.» Après lui, Abu Bakr, puis Umar, puis Othman la portèrent.",
            reference: "Sahih al-Bukhari, n° 5873, rapporté par Anas ibn Malik (ra), sur la bague-sceau du Prophète ﷺ",
          },
          {
            type: 'paragraph',
            content: "Sous le califat d'Othman ibn Affan (ra), alors qu'il était assis au bord du puits, la bague-sceau lui glissa du doigt et tomba dans le puits. Othman (ra) fit entreprendre des recherches pendant trois jours consécutifs. L'eau fut épuisée, des hommes descendirent dans le puits, mais le sceau ne fut jamais retrouvé. Selon Ibn Kathir et d'autres historiens, cette perte fut vécue comme un mauvais présage. Les années qui suivirent furent effectivement marquées par les premières grandes fitnas (troubles politiques) de l'histoire islamique.",
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-quba', label: 'Masjid Quba : la première mosquée de l\'Islam' }],
      },
      {
        id: 'description',
        title: 'Description physique',
        content: [
          {
            type: 'stats',
            items: [
              { label: 'Profondeur', value: '~10 m' },
              { label: 'Diamètre', value: '~3 m' },
              { label: 'Distance Quba', value: '~500 m' },
              { label: 'Accès', value: 'Restreint' },
            ],
          },
          {
            type: 'paragraph',
            content: "Le puits est creusé dans la roche locale. Son diamètre est d'environ trois mètres, sa profondeur d'environ dix mètres. Il est aujourd'hui partiellement recouvert et son accès direct est restreint. Le jardin environnant a été en grande partie urbanisé, mais le puits lui-même est identifiable et préservé.",
          },
          {
            type: 'paragraph',
            content: "La zone de Quba dans laquelle se trouve Bir Aris correspond au quartier historique où le Prophète ﷺ séjourna à son arrivée à Médine lors de l'Hégire, avant de rejoindre la ville. C'est dans ce même quartier que se trouve Masjid Quba, la première mosquée de l'Islam.",
          },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance historique',
        content: [
          {
            type: 'paragraph',
            content: "La valeur de Bir Aris est principalement historique et anecdotique plutôt que liturgique. Ce puits est un témoin matériel de la vie quotidienne du Prophète ﷺ et de ses Compagnons à Médine. Il rappelle que les plus grands personnages de l'Islam étaient des êtres humains ordinaires dans leur quotidien, qui se reposaient au bord des puits, qui perdaient des bijoux.",
          },
          {
            type: 'paragraph',
            content: "L'histoire du sceau perdu a également une dimension historique significative : la bague portait l'inscription «Muhammad Rasul Allah» et servait à sceller les lettres envoyées aux rois et gouverneurs de l'époque, les invitant à embrasser l'Islam. Sa perte symbolique sous Othman marque, selon certains historiens et commentateurs islamiques, un tournant dans la cohésion de la communauté.",
          },
          {
            type: 'paragraph',
            content: "Bir Aris est un exemple de ces lieux «secondaires» de l'histoire islamique qui, précisément parce qu'ils sont peu fréquentés et peu médiatisés, offrent une intimité rare avec la Sîra prophétique. Leur visite relève de la curiosité historique sincère plutôt que d'une démarche liturgique.",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Visite et recueillement',
        content: [
          {
            type: 'paragraph',
            content: "La visite de Bir Aris s'effectue le plus souvent lors d'une excursion vers Masjid Quba, à laquelle elle est naturellement associée en raison de la proximité géographique. Elle ne requiert pas de rituel particulier. Une méditation courte sur l'histoire du sceau perdu et sur les transitions historiques après le Prophète ﷺ constitue le recueillement approprié.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Bir Aris est un site historique secondaire qui mérite une visite courte si vous êtes déjà dans le quartier de Quba. Méditez sur le sceau perdu d'Othman : un objet minuscule, chargé d'histoire, qui ne fut jamais retrouvé malgré trois jours de recherche. Votre guide SAFARUMA vous explique le contexte politique du califat d'Othman et la symbolique de cette perte pour la communauté islamique des premières générations.",
          },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "Bir Aris est situé à environ 500 mètres de Masjid Quba. La visite est courte (quinze à trente minutes) et peut être facilement intégrée dans un circuit Quba lors d'une demi-journée consacrée aux sites historiques du sud de Médine. L'accès au puits lui-même peut être restreint selon les périodes.",
          },
          {
            type: 'list',
            items: [
              "Distance depuis Masjid an-Nabawi : environ 4 km, 15 minutes en taxi",
              "Distance depuis Masjid Quba : environ 500 mètres à pied",
              "Durée de visite : 15 à 30 minutes",
              "Accès restreint possible : vérifier auprès de votre guide",
              "Pas d'infrastructure touristique sur place",
            ],
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-an-nabawi', label: 'Masjid an-Nabawi : la mosquée du Prophète ﷺ' }],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          {
            type: 'list',
            items: [
              "Attribuer au puits lui-même des vertus spirituelles particulières : Bir Aris est un site historique, pas un lieu d'adoration.",
              "Tenter de puiser de l'eau du puits : l'accès est restreint et l'eau n'est pas potable.",
              "Confondre Bir Aris avec Bir Zamzam : Zamzam est le puits sacré du Masjid Al-Haram à La Mecque. Bir Aris est un puits historique ordinaire de Médine.",
              "Prévoir une demi-journée entière pour ce seul site : la visite est courte et doit être combinée avec d'autres lieux du quartier de Quba.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Qu'est-ce que la bague-sceau du Prophète ﷺ ?", answer: "C'était une bague en argent portant l'inscription «Muhammad Rasul Allah» (Muhammad, Messager d'Allah) gravée en trois lignes. Elle servait de sceau officiel pour authentifier les lettres du Prophète ﷺ envoyées aux rois et gouverneurs de l'époque. Après sa mort, Abu Bakr, puis Umar, puis Othman la portèrent successivement." },
      { question: "Comment est-elle tombée dans le puits ?", answer: "Selon le Sahih al-Bukhari (n° 3105), elle glissa du doigt d'Othman ibn Affan (ra) alors qu'il était assis au bord du puits. Certaines narrations mentionnent qu'il la tenait en la faisant tourner entre ses doigts lorsqu'elle lui échappa." },
      { question: "A-t-on jamais retrouvé le sceau ?", answer: "Non. Trois jours de recherches intensives, incluant le vidage partiel du puits et la descente d'hommes dans ses profondeurs, ne permirent pas de retrouver la bague. Elle n'a jamais été retrouvée depuis. Son absence rendit la falsification des documents officiels plus facile et contribua aux troubles politiques de l'époque." },
      { question: "Pourquoi visiter ce puits ?", answer: "Pour les passionnés de Sîra, Bir Aris est un lien concret avec la vie quotidienne du Prophète ﷺ et de ses Compagnons. C'est l'un de ces lieux modestes qui, précisément parce qu'ils sont hors des circuits touristiques habituels, offrent une intimité particulière avec l'histoire islamique." },
      { question: "Comment s'y rendre ?", answer: "Bir Aris est situé dans le quartier de Quba, à environ 4 km de Masjid an-Nabawi. Depuis Masjid Quba, il est accessible à pied (environ 500 mètres). En taxi depuis Masjid an-Nabawi, comptez 15 minutes." },
      { question: "Y a-t-il d'autres puits historiques à Médine ?", answer: "Plusieurs puits ont une histoire prophétique à Médine, dont Bir Ruuma (dont Othman racheta l'accès pour le mettre à disposition de tous les Musulmans) et les puits associés aux jardins du Prophète ﷺ. Ces sites sont généralement moins identifiables et moins accessibles que Bir Aris." },
    ],
  },

  'masjid-ghamamah': {
    slug: 'masjid-ghamamah',
    title: "Masjid al-Ghamamah : la mosquée du nuage miraculeux",
    location: 'À 200 m à l\'ouest de Masjid an-Nabawi, Médine',
    locationKicker: 'LIEU SAINT · MÉDINE',
    excerpt: "Mosquée historique de Médine commémorant la prière de demande de pluie (Salat al-Istisqa) accomplie par le Prophète Muhammad ﷺ, lors de laquelle un nuage descendit miraculeusement.",
    readingTime: 5,
    publishedAt: '2026-05-11T14:45:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Le miracle du nuage',
        content: [
          {
            type: 'paragraph',
            content: "Masjid al-Ghamamah, «la mosquée du nuage», est construite sur l'emplacement où le Prophète Muhammad ﷺ accomplit la Salat al-Istisqa, la prière islamique de demande de pluie. Lors d'une période de sécheresse sévère frappant Médine, il sortit avec ses Compagnons vers cet espace ouvert, en dehors de la mosquée, pour supplier Allah.",
          },
          {
            type: 'paragraph',
            content: "Anas ibn Malik (ra) rapporte dans le Sahih al-Bukhari (n° 1013) que lors de cette prière, un homme entra dans la mosquée un vendredi et dit au Prophète ﷺ que les récoltes et les troupeaux périssaient. Le Prophète ﷺ leva les mains en supplication, et des nuages se formèrent «comme des montagnes». La pluie tomba abondamment pendant sept jours, à tel point que le vendredi suivant, un homme vint demander au Prophète ﷺ de prier pour que la pluie s'arrête.",
          },
          {
            type: 'callout',
            text: "Le Prophète ﷺ leva les deux mains jusqu'à ce que l'on voie le blanc de ses aisselles, suppliant pour la pluie.",
            reference: "Sahih al-Bukhari, n° 1013, rapporté par Anas ibn Malik (ra), décrivant la Salat al-Istisqa du Prophète ﷺ",
          },
          {
            type: 'paragraph',
            content: "La mosquée tient son nom du mot arabe «ghamamah» (nuage). Elle commémore également, selon certaines sources historiques, l'endroit où le Prophète ﷺ accomplit les prières des deux Aïds (Al-Fitr et Al-Adha) à ciel ouvert, conformément à la Sunnah.",
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
              { label: 'Capacité', value: '~600 fidèles' },
              { label: 'Distance Nabawi', value: '~200 m' },
              { label: 'Dômes', value: '6 dômes' },
              { label: 'Style', value: 'Ottoman' },
            ],
          },
          {
            type: 'paragraph',
            content: "Masjid al-Ghamamah est l'une des mosquées historiques les mieux préservées de Médine. Contrairement à beaucoup d'autres sites islamiques de la ville qui ont été démolis ou entièrement reconstruits, elle a conservé des éléments de son architecture ottomane caractéristique. Ses six dômes blancs, dont un principal imposant et plusieurs annexes plus petits, lui confèrent une silhouette reconnaissable depuis les rues environnantes.",
          },
          {
            type: 'paragraph',
            content: "La salle de prière est spacieuse et fraîche, illuminée par des fenêtres hautes. L'intérieur est orné de calligraphies coraniques simples. La cour extérieure est ombragée par des arcades. Située à seulement deux cents mètres à l'ouest de Masjid an-Nabawi, cette mosquée est accessible à pied depuis le grand sanctuaire en quelques minutes.",
          },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          {
            type: 'paragraph',
            content: "Masjid al-Ghamamah rappelle l'une des formes de prière les plus belles et les plus humbles de l'Islam : la Salat al-Istisqa. Cette prière collective, accomplie en cas de sécheresse, est une démonstration communautaire de dépendance totale à Allah pour les besoins les plus fondamentaux de la vie. Elle est toujours pratiquée dans les pays musulmans en période de sécheresse.",
          },
          {
            type: 'paragraph',
            content: "Le rite de la Salat al-Istisqa tel qu'enseigné par le Prophète ﷺ comprend une prière de deux rak'ahs en plein air, un sermon (khotba), l'inversion du manteau (les savants diffèrent sur sa signification exacte) et des supplications intenses les mains levées. La communauté se rend vers l'espace de prière dans un esprit de contrition et de repentir collectif.",
          },
          {
            type: 'paragraph',
            content: "La mosquée est également associée aux prières des Aïds, cette tradition prophétique de sortir en plein air pour célébrer collectivement les grandes fêtes islamiques. Prier dans cet espace permet de se relier à cette double tradition de recueillement communautaire, dans la joie comme dans l'épreuve.",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Visite et recueillement',
        content: [
          {
            type: 'paragraph',
            content: "La visite de Masjid al-Ghamamah est l'une des plus accessibles parmi les mosquées historiques de Médine : elle se trouve à deux minutes à pied de Masjid an-Nabawi. Aucun rituel spécifique n'est prescrit. Accomplir deux rak'ahs de prière (tahiyat al-masjid) à l'arrivée, prendre un moment de méditation sur la Salat al-Istisqa et ses conditions d'exaucement constituent le recueillement approprié.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Masjid al-Ghamamah est une perle architecturale méconnue de Médine, à deux minutes à pied de Masjid an-Nabawi. Son nom rappelle le miracle du nuage qui ombragea le Prophète ﷺ lors de sa supplication pour la pluie. Prenez un moment pour prier deux rak'ahs et méditer sur la Salat al-Istisqa, cette prière de demande de pluie toujours pratiquée par les communautés musulmanes en période de sécheresse. Votre guide SAFARUMA vous en explique le rite et l'histoire.",
          },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "La mosquée est ouverte pour les cinq prières quotidiennes. L'affluence y est généralement faible comparée à Masjid an-Nabawi, ce qui en fait un refuge de tranquillité. La visite est courte (quinze à vingt minutes) et peut être facilement intégrée dans une promenade entre les deux prières quotidiennes.",
          },
          {
            type: 'list',
            items: [
              "Distance depuis Masjid an-Nabawi : environ 200 mètres à pied vers l'ouest",
              "Durée de visite : 15 à 20 minutes",
              "Ouverte pour les cinq prières, affluence faible",
              "Espace séparé pour les femmes",
              "Photographies autorisées à l'extérieur",
            ],
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-an-nabawi', label: 'Masjid an-Nabawi : la mosquée du Prophète ﷺ' }],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          {
            type: 'list',
            items: [
              "Confondre Masjid al-Ghamamah avec Masjid al-Jumua ou Masjid al-Qiblatayn : trois petites mosquées historiques distinctes autour de Masjid an-Nabawi.",
              "Croire que prier dans cette mosquée multiplie la valeur de la prière : aucun hadith authentique n'attribue une valeur multipliée à cette mosquée.",
              "Manquer cette mosquée par méconnaissance : elle est à 200 mètres de Masjid an-Nabawi et offre une expérience historique et architecturale rare à Médine.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Que signifie le mot Ghamamah ?", answer: "«Ghamamah» signifie «nuage» en arabe. Le nom de la mosquée rappelle le miracle du nuage qui descendit lors de la Salat al-Istisqa du Prophète ﷺ, ombragé les fidèles et annonçant la pluie abondante qui suivit." },
      { question: "Qu'est-ce que la Salat al-Istisqa ?", answer: "C'est la prière islamique de demande de pluie, accomplie collectivement en plein air lors de sécheresses. Elle comprend deux rak'ahs, un sermon, des supplications les mains levées et, selon la Sunnah prophétique, l'inversion du manteau. Cette prière est toujours pratiquée dans les pays musulmans." },
      { question: "Le Prophète ﷺ a-t-il prié les Aïds à Ghamamah ?", answer: "Selon plusieurs sources historiques et certains commentateurs, le Prophète ﷺ accomplit les prières des deux Aïds (Al-Fitr et Al-Adha) dans cet espace ouvert, conformément à la Sunnah de prier les Aïds en plein air avec toute la communauté. Cette attribution est confirmée par des récits historiques mais n'est pas unanime." },
      { question: "Comment s'y rendre depuis Masjid an-Nabawi ?", answer: "La mosquée est à environ 200 mètres à l'ouest de Masjid an-Nabawi. Depuis la grande mosquée, marchez vers l'ouest pendant deux à trois minutes. Elle est facilement reconnaissable à ses dômes ottomans blancs." },
      { question: "Est-elle ouverte toute la journée ?", answer: "Elle est ouverte pour les cinq prières quotidiennes. En dehors des heures de prière, l'accès peut être limité. Il est conseillé de la visiter juste avant ou après l'une des prières pour être sûr d'y entrer." },
      { question: "Y a-t-il un espace pour les femmes ?", answer: "Oui, comme dans toutes les mosquées d'Arabie Saoudite, un espace de prière séparé est réservé aux femmes, avec une entrée distincte." },
    ],
  },

  'masjid-al-jinn': {
    slug: 'masjid-al-jinn',
    title: "Masjid al-Jinn : la mosquée du pacte des djinns",
    location: "Quartier Al-Ma'la, La Mecque",
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "Mosquée historique de La Mecque marquant le lieu où le Prophète Muhammad ﷺ récita le Coran à un groupe de djinns, qui acceptèrent l'Islam, événement relaté dans la Sourate Al-Jinn.",
    readingTime: 6,
    publishedAt: '2026-05-11T15:00:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'La rencontre avec les djinns',
        content: [
          {
            type: 'paragraph',
            content: "Masjid al-Jinn est située dans le quartier Al-Ma'la, à environ 1,5 kilomètre au nord du Masjid Al-Haram, non loin du cimetière de Jannat al-Mu'alla. La tradition islamique situe à cet endroit la rencontre entre le Prophète Muhammad ﷺ et un groupe de djinns qui l'écoutèrent réciter le Coran et embrassèrent l'Islam.",
          },
          {
            type: 'callout',
            text: "Dis : Il m'a été révélé qu'un groupe de djinns a écouté. Ils ont dit : Nous avons entendu un Coran admirable, qui guide vers la droiture. Nous croyons en lui et nous n'associerons rien à notre Seigneur.",
            reference: 'Sourate Al-Jinn, versets 1 et 2, récit de la conversion des djinns à l\'Islam',
          },
          {
            type: 'paragraph',
            content: "Les sources islamiques situent cet événement lors d'un retour du Prophète ﷺ de Ta'if, où il avait prêché l'Islam sans succès et été rejeté avec violence. Sur le chemin du retour vers La Mecque, il s'arrêta pour prier. C'est à cet endroit qu'un groupe de djinns l'entendit réciter le Coran pendant la prière de Fajr. Ils retournèrent ensuite auprès de leur peuple pour l'inviter à l'Islam.",
          },
          {
            type: 'paragraph',
            content: "Un hadith rapporté par al-Bukhari (n° 3860) et Muslim précise que le Prophète ﷺ n'avait pas vu les djinns mais en fut informé par révélation divine. Abdullah ibn Mas'ud (ra) rapporte une version différente où il accompagnait le Prophète ﷺ et celui-ci traça un cercle autour de lui pour le protéger pendant qu'il allait rencontrer les djinns. Les deux récits sont authentiques et se complètent.",
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
              { label: 'Capacité', value: '~600 fidèles' },
              { label: 'Distance Haram', value: '1,5 km' },
              { label: 'Quartier', value: "Al-Ma'la" },
              { label: 'Style', value: 'Moderne' },
            ],
          },
          {
            type: 'paragraph',
            content: "La mosquée actuelle est une structure moderne après rénovation saoudienne. Elle est de taille modeste (environ 600 fidèles), avec un dôme principal blanc et un minaret unique. L'intérieur est simple et fonctionnel. Des espaces séparés pour les hommes et les femmes sont disponibles.",
          },
          {
            type: 'paragraph',
            content: "La mosquée est dans un quartier résidentiel et commerçant animé. À proximité immédiate se trouve le cimetière de Jannat al-Mu'alla, l'un des cimetières les plus sacrés de l'Islam, où reposent notamment Khadija (ra), première épouse du Prophète ﷺ, et Abd al-Muttalib, son grand-père.",
          },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Signification théologique',
        content: [
          {
            type: 'paragraph',
            content: "Masjid al-Jinn rappelle un point de théologie islamique fondamental : l'Islam s'adresse à l'ensemble des êtres doués de raison (mukallafin), c'est-à-dire les humains et les djinns. La Sourate Al-Jinn (72e sourate) est entièrement consacrée à la rencontre entre le Prophète ﷺ et ces êtres invisibles, et à leur adhésion à l'Islam.",
          },
          {
            type: 'paragraph',
            content: "Les djinns en Islam sont des créatures créées par Allah, comme les humains, mais à partir du feu (Sourate Al-Hijr, verset 27). Ils sont invisibles aux humains dans leur état naturel, dotés d'une liberté de choix (ils peuvent croire ou non), et soumis aux mêmes obligations religieuses que les humains. Ils peuvent être musulmans ou non-musulmans, croyants ou incrédules.",
          },
          {
            type: 'paragraph',
            content: "La Sourate Al-Jinn illustre l'universalité du message coranique : même les créatures invisibles, inconnues de la plupart des humains, furent touchées par la récitation du Coran. Cette universalité est l'une des preuves avancées par les théologiens de la valeur prophétique de Muhammad ﷺ.",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Visite et recueillement',
        content: [
          {
            type: 'paragraph',
            content: "La visite de Masjid al-Jinn s'accompagne naturellement de la lecture ou de la récitation de la Sourate Al-Jinn (72e sourate, 28 versets courts). C'est l'une des sourates les plus accessibles du Coran par sa longueur et l'une des plus riches théologiquement. Accomplir deux rak'ahs de prière (tahiyat al-masjid) à l'arrivée est recommandé pour toute mosquée.",
          },
          {
            type: 'paragraph',
            content: "La visite peut très naturellement être combinée avec celle du cimetière de Jannat al-Mu'alla, à quelques mètres de la mosquée. Jannat al-Mu'alla est le cimetière où repose Khadija bint Khuwaylid (ra), première épouse et première croyante du Prophète ﷺ, ainsi que plusieurs membres de sa famille et des premiers Compagnons de l'Islam.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Masjid al-Jinn rappelle un point théologique important : l'Islam s'adresse à tous les êtres doués de raison, y compris aux djinns que nous ne voyons pas. Avant votre visite, lisez la Sourate Al-Jinn (courte et magnifique). À quelques mètres, le cimetière de Jannat al-Mu'alla mérite absolument une visite : c'est là que repose Khadija (ra), la première croyante de l'Islam, dont le rôle dans la vie du Prophète ﷺ fut central. Votre guide SAFARUMA organise les deux visites ensemble.",
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-al-haram', label: 'Masjid Al-Haram et la Kaaba' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "La mosquée est accessible en taxi depuis le Masjid Al-Haram (environ cinq minutes, 1,5 km). Elle peut aussi être atteinte à pied depuis le Haram en vingt à vingt-cinq minutes, en remontant vers le quartier Al-Ma'la. La visite est courte (vingt à trente minutes pour la mosquée et la prière).",
          },
          {
            type: 'list',
            items: [
              "Distance depuis Masjid Al-Haram : 1,5 km, 5 minutes en taxi",
              "Durée de visite mosquée : 20 à 30 minutes",
              "Combiner avec Jannat al-Mu'alla : ajouter 20 à 30 minutes",
              "Mosquée ouverte pour les cinq prières",
              "Quartier animé, commerces et restaurants à proximité",
            ],
          },
        ],
      },
      {
        id: 'erreurs',
        title: 'Erreurs à éviter',
        content: [
          {
            type: 'list',
            items: [
              "Croire qu'on peut «voir» ou «communiquer» avec des djinns dans cette mosquée : les djinns sont invisibles aux humains dans leur état naturel, et chercher à les contacter est formellement interdit en Islam (cela relève de la sorcellerie).",
              "Associer cette mosquée à des pratiques superstitieuses ou ésotériques : la valeur du lieu est uniquement historique et mémorielle.",
              "Confondre les djinns islamiques avec la représentation des génies dans la culture populaire ou les contes des Mille et Une Nuits : les djinns en Islam sont des créatures rationnelles soumises aux mêmes obligations que les humains.",
              "Négliger la visite de Jannat al-Mu'alla à proximité : le cimetière abrite la tombe de Khadija (ra) et mérite autant d'attention que la mosquée.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Qu'est-ce que les djinns en Islam ?", answer: "Les djinns sont des créatures créées par Allah à partir du feu (Sourate Al-Hijr, verset 27), dotées d'une liberté de choix et d'obligations religieuses similaires à celles des humains. Ils sont invisibles dans leur état naturel. Ils peuvent être croyants ou non-croyants. La Sourate Al-Jinn (72) leur est entièrement consacrée." },
      { question: "Le Prophète ﷺ a-t-il vu les djinns à cet endroit ?", answer: "Selon le hadith de Bukhari (n° 3860), le Prophète ﷺ fut informé par révélation de la présence des djinns mais ne les vit pas directement. Un récit d'Ibn Mas'ud (ra) mentionne cependant une rencontre plus directe. Les deux récits sont authentiques et les savants les conciliement en distinguant deux événements distincts." },
      { question: "Que dit la Sourate Al-Jinn ?", answer: "La Sourate Al-Jinn (72e sourate, 28 versets) rapporte la conversion de djinns à l'Islam après avoir entendu la récitation du Coran. Elle décrit leur émerveillement devant le Coran, leur engagement à ne rien associer à Allah, leur adhésion à l'Islam et leur retour vers leur peuple pour l'inviter. Elle aborde aussi la question de la connaissance de l'Invisible." },
      { question: "Y a-t-il un quelconque danger à visiter cette mosquée ?", answer: "Absolument aucun. Masjid al-Jinn est une mosquée ordinaire, un lieu de prière. La croyance en l'existence des djinns fait partie de la foi islamique, mais chercher à les contacter ou à les voir est une pratique interdite. La visite est une démarche historique et mémorielle, sans aucun danger." },
      { question: "Comment s'y rendre depuis Masjid al-Haram ?", answer: "En taxi depuis Masjid al-Haram, comptez environ cinq minutes (1,5 km). La montée vers le quartier Al-Ma'la peut aussi se faire à pied en vingt à vingt-cinq minutes. Demandez au chauffeur «Masjid al-Jinn» ou «Masjid al-Bai'ah», deux noms parfois utilisés localement." },
      { question: "Quelle est la durée de visite recommandée ?", answer: "Vingt à trente minutes pour la mosquée (prière et méditation). En ajoutant la visite du cimetière de Jannat al-Mu'alla voisin, prévoyez une heure à une heure trente au total." },
      { question: "Peut-on combiner cette visite avec Jannat al-Mu'alla ?", answer: "Oui, et c'est fortement recommandé. Le cimetière de Jannat al-Mu'alla est à quelques mètres de la mosquée. Il abrite la tombe de Khadija bint Khuwaylid (ra), première épouse du Prophète ﷺ et première croyante de l'Islam. Sa visite est une expérience très émouvante pour beaucoup de pèlerins." },
      { question: "Cette mosquée est-elle ouverte 24h/24 ?", answer: "Non, elle est ouverte pour les cinq prières quotidiennes. En dehors des horaires de prière, l'accès peut être limité. Planifiez votre visite autour de l'une des prières pour être sûr d'y entrer." },
    ],
  },
};
