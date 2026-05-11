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
        seeAlso: [{ href: '/lieux-saints/hira', label: 'La grotte de Hira, berceau de la révélation' }],
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

  'hira': {
    slug: 'hira',
    title: "La grotte de Hira : berceau de la révélation coranique",
    location: 'Sommet de Jabal al-Nour, La Mecque',
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "La petite cavité rocheuse au sommet de Jabal al-Nour où le Prophète Muhammad ﷺ reçut le tout premier verset du Coran de l'ange Jibril, en l'an 610.",
    readingTime: 6,
    publishedAt: '2026-05-11T10:15:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'La nuit de la première révélation',
        content: [
          {
            type: 'paragraph',
            content: "La grotte de Hira est nichée au sommet de Jabal al-Nour, à 640 mètres d'altitude, à quatre kilomètres du Masjid Al-Haram. C'est en ce lieu précis que l'histoire de l'Islam commença. Le Prophète Muhammad ﷺ y méditait régulièrement, parfois plusieurs jours d'affilée, emportant des vivres et passant ses nuits dans la solitude et la contemplation.",
          },
          {
            type: 'paragraph',
            content: "Aïcha (ra) relate dans le Sahih al-Bukhari (hadith n° 3) le récit complet de cette nuit fondatrice : l'ange Jibril apparut soudainement, étreignit le Prophète ﷺ avec force et lui dit «Iqra !» (Lis !). Le Prophète ﷺ répondit trois fois qu'il ne savait pas lire. À la troisième fois, Jibril lui récita les cinq premiers versets de la Sourate Al-Alaq, qui devinrent les premiers mots du Coran révélés à l'humanité.",
          },
          {
            type: 'callout',
            text: "Lis, au nom de ton Seigneur qui a créé. Il a créé l'homme d'un caillot. Lis ! Ton Seigneur est le Très Noble. Lui qui a enseigné par le calame. Il a enseigné à l'homme ce qu'il ne savait pas.",
            reference: 'Sourate Al-Alaq, versets 1 à 5, Sahih al-Bukhari hadith n° 3',
          },
          {
            type: 'paragraph',
            content: "Tremblant et profondément ébranlé, le Prophète ﷺ descendit la montagne et rejoignit Khadija (ra), lui demandant d'être couvert. Il lui raconta l'événement. Khadija, femme d'une grande sagesse et d'une foi inébranlable, le rassura : «Par Allah, Il ne te décevra jamais. Tu es fidèle envers tes proches, tu soulèves les fardeaux des autres, tu gagnes ce que les pauvres ne peuvent acquérir, tu honores tes invités et tu soutiens ceux qui souffrent pour la vérité.» Elle l'emmena ensuite chez son cousin Waraqah ibn Nawfal, un chrétien érudit, qui confirma que Muhammad ﷺ venait de recevoir le même envoyé qui avait transmis la Tawrat à Moïse.",
          },
        ],
        seeAlso: [{ href: '/lieux-saints/jabal-al-nour', label: 'Jabal al-Nour : la montagne de la première révélation' }],
      },
      {
        id: 'description',
        title: 'Description physique de la grotte',
        content: [
          {
            type: 'stats',
            items: [
              { label: 'Longueur', value: '3,5 m' },
              { label: 'Largeur', value: '2 m' },
              { label: 'Altitude', value: '640 m' },
              { label: 'Distance Kaaba', value: '4 km' },
            ],
          },
          {
            type: 'paragraph',
            content: "La grotte de Hira est d'une modestie saisissante : elle mesure environ 3,5 mètres de long sur 2 mètres de large, suffisamment grande pour qu'un homme puisse s'y tenir debout. Elle est taillée naturellement dans la roche de granit gris, avec une entrée relativement étroite nécessitant de se pencher légèrement pour y accéder.",
          },
          {
            type: 'paragraph',
            content: "L'orientation de la grotte est particulièrement remarquée par les visiteurs : son ouverture fait face à la Kaaba, comme si la montagne elle-même pointait vers le sanctuaire sacré. Cette qibla naturelle, à quatre kilomètres de distance, est perceptible par temps clair. L'intérieur, sombre et frais même par grande chaleur, offre un contraste saisissant avec l'exposition solaire du sentier d'ascension.",
          },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Signification spirituelle',
        content: [
          {
            type: 'paragraph',
            content: "Hira est le commencement. Non pas le commencement de l'Islam comme structure institutionnelle, mais le commencement de la relation directe entre Allah et l'humanité à travers le dernier prophète. Dans cet espace étroit de roche et d'obscurité, le mot «Iqra» fut prononcé pour la première fois : une injonction à la lecture, à la connaissance et à la réflexion qui allait transformer le monde.",
          },
          {
            type: 'paragraph',
            content: "La visite de la grotte de Hira n'est pas un rite prescrit de l'Omra ou du Hajj. C'est une démarche de mémoire historique et de connexion à la Sîra prophétique. Les savants islamiques contemporains s'accordent à dire que cette visite relève de la culture et de l'enrichissement spirituel, non de l'adoration au sens rituel du terme.",
          },
          {
            type: 'callout',
            text: "L'eau de Zamzam vaut ce pour quoi elle est bue.",
            reference: "Hadith rapporté par Ibn Majah (n° 3062) et Ahmad, souvent cité dans le contexte des invocations à Hira, pour rappeler que l'intention sincère est au cœur de toute démarche spirituelle",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Visite et recueillement',
        content: [
          {
            type: 'paragraph',
            content: "Accéder à la grotte de Hira nécessite d'abord de gravir Jabal al-Nour (environ 600 marches, 1h30 d'ascension), puis de parcourir quelques mètres supplémentaires jusqu'à l'entrée de la grotte. La grotte elle-même ne peut accueillir que deux à trois personnes simultanément, ce qui impose parfois une longue file d'attente en haute saison.",
          },
          {
            type: 'paragraph',
            content: "Il n'existe aucun rituel imposé à l'intérieur. Les formes les plus appropriées de recueillement consistent à réciter les versets d'Al-Alaq (96:1-5), à faire une invocation personnelle sincère et, pour ceux qui le souhaitent, à accomplir deux rak'ahs de prière nafl si l'espace le permet. Si la foule empêche d'entrer, accomplir ces actes à l'entrée de la grotte est pleinement valide.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Visiter la grotte de Hira est une expérience profondément émotionnelle pour la grande majorité des pèlerins. Si l'affluence vous empêche d'y entrer, ne vous découragez pas : les invocations accomplies à l'entrée, face à l'ouverture orientée vers la Kaaba, sont tout aussi sincères. L'important n'est pas la photographie dans la grotte, mais la présence du cœur dans ce lieu chargé d'histoire.",
          },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "Hira est accessible uniquement après l'ascension complète de Jabal al-Nour. Préparez-vous à la montée : chaussures fermées, eau abondante, vêtements légers et modestes. La grotte est plus fréquentée pendant les saisons du Hajj et du Ramadan, où les files d'attente peuvent dépasser une heure.",
          },
          {
            type: 'paragraph',
            content: "Pour une visite sereine, privilégiez le petit matin juste après Fajr (entre 5h et 7h30) : la chaleur est supportable, la lumière est belle sur La Mecque depuis le sommet, et les files d'attente sont plus courtes. Évitez les vendredis de Ramadan où l'affluence est maximale.",
          },
          {
            type: 'list',
            items: [
              "Accès uniquement après ascension complète de Jabal al-Nour (600 marches environ)",
              "File d'attente possible de 20 à 60 minutes selon la saison",
              "Grotte gratuite et ouverte en permanence, pas de réservation possible",
              "Photographies autorisées à l'extérieur, modération recommandée à l'intérieur",
              "Interdiction de fumer sur l'ensemble du sentier et au sommet",
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
              "Se bousculer pour entrer dans la grotte : le respect du lieu et des autres pèlerins prime sur la précipitation.",
              "Croire que toucher la roche intérieure exauce des vœux : aucune tradition islamique authentique ne valide cette pratique.",
              "Photographier d'autres pèlerins sans leur consentement à l'intérieur de la grotte.",
              "Tenter d'y entrer avec un groupe nombreux simultanément : la grotte ne contient physiquement que 2 à 3 personnes.",
              "Confondre la grotte de Hira avec la grotte de Thawr, qui est au sommet de Jabal Thawr, au sud de La Mecque.",
              "S'y rendre sans eau suffisante : la déshydratation est un risque réel sur le chemin d'ascension.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Faut-il visiter la grotte de Hira pendant la Omra ?", answer: "Non, ce n'est pas un rite de la Omra. La Omra comprend l'ihram, le Tawaf, le Sa'i et le rasage ou la coupe des cheveux. La visite de Hira est une démarche historique et spirituelle facultative, recommandée pour enrichir sa connaissance de la Sîra du Prophète ﷺ." },
      { question: "Combien de personnes peuvent entrer en même temps ?", answer: "La grotte mesure environ 3,5 mètres sur 2 mètres. Elle ne tient confortablement que 2 à 3 personnes. En haute saison, une file d'attente se forme à l'entrée. La patience est indispensable." },
      { question: "Peut-on prier dans la grotte ?", answer: "Oui, accomplir deux rak'ahs de prière nafl (surérogatoire) est possible si l'espace le permet. Ce n'est pas une obligation. Si la grotte est bondée, les invocations et la récitation du Coran à l'entrée sont tout aussi valides." },
      { question: "L'accès est-il payant ?", answer: "Non, la grotte de Hira et le sentier d'ascension de Jabal al-Nour sont entièrement gratuits et ouverts en permanence. Des vendeurs proposent de l'eau et des snacks le long du sentier à prix modéré." },
      { question: "Le Prophète ﷺ a-t-il vécu longtemps dans cette grotte ?", answer: "Non, il s'y retirait régulièrement pour des retraites contemplatives, parfois plusieurs jours d'affilée, mais sans y vivre de façon permanente. Après la première révélation, ces retraites prirent une signification nouvelle dans le cadre de la prophétie." },
      { question: "Que faire si la grotte est inaccessible en raison de la foule ?", answer: "Restez à l'entrée et accomplissez vos invocations face à l'ouverture orientée vers la Kaaba. Récitez les versets d'Al-Alaq. La sincérité du cœur en ce lieu chargé d'histoire vaut largement le fait d'y poser le pied physiquement." },
      { question: "Peut-on toucher la pierre où le Prophète méditait ?", answer: "Il n'y a aucune tradition islamique authentique encourageant à toucher une pierre spécifique dans la grotte pour une bénédiction. L'Islam est attentif à éviter toute pratique qui pourrait dériver vers la superstition. La valeur du lieu est mémorielle et historique." },
      { question: "Y a-t-il des photographies historiques de la grotte ?", answer: "Les premières photographies connues datent de la fin du XIXe siècle. De nombreuses images contemporaines sont disponibles en ligne. L'apparence de la grotte n'a pas fondamentalement changé, bien que des aménagements de sécurité aient été ajoutés sur le sentier d'accès." },
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

  'masjid-aisha': {
    slug: 'masjid-aisha',
    title: "Masjid Aïcha : le miqat des Mecquois pour la Omra",
    location: "Tan'im, à 7 km de La Mecque",
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "La mosquée de Tan'im, miqat le plus proche de La Mecque, où les résidents et visiteurs déjà à La Mecque entrent en état d'ihram pour accomplir une Omra supplémentaire.",
    readingTime: 6,
    publishedAt: '2026-05-11T10:45:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine et histoire',
        content: [
          {
            type: 'paragraph',
            content: "Masjid Aïcha tire son nom d'un épisode touchant du Hajj d'adieu du Prophète ﷺ, en l'an 10 de l'Hégire (632). Aïcha (ra), épouse bien-aimée du Prophète ﷺ, avait prévu d'accomplir la Omra en même temps que le Hajj. Mais en raison de ses règles, elle ne put effectuer ce rite dans les délais initiaux. À la fin du Hajj, le Prophète ﷺ lui demanda si quelque chose l'attristait. Aïcha (ra) exprima sa peine de n'avoir pu accomplir la Omra.",
          },
          {
            type: 'callout',
            text: "Pars avec ton frère vers Tan'im, entre en état d'ihram et rejoins-nous à l'endroit où nous serons.",
            reference: "Hadith rapporté par al-Bukhari (n° 1516) et Muslim, le Prophète ﷺ ordonnant à Abd ar-Rahman ibn Abi Bakr d'accompagner Aïcha à Tan'im",
          },
          {
            type: 'paragraph',
            content: "Le frère d'Aïcha (ra), Abd ar-Rahman ibn Abi Bakr, l'accompagna donc jusqu'à Tan'im, à la limite du Haram de La Mecque. C'est là qu'elle entra en état d'ihram et retourna à La Mecque pour accomplir sa Omra. Depuis cet épisode, ce lieu porte son nom. La mosquée a été reconstruite et agrandie à plusieurs reprises au cours des siècles, la version actuelle datant des années 1980.",
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
              { label: 'Capacité', value: '15 000' },
              { label: 'Distance Haram', value: '7 km' },
              { label: 'Reconstruction', value: '1981' },
              { label: 'Accès', value: 'Bus et taxi' },
            ],
          },
          {
            type: 'paragraph',
            content: "La mosquée actuelle est une structure moderne dotée de deux minarets blancs caractéristiques. Elle dispose d'espaces de prière séparés pour les hommes et les femmes, de vastes salles de bains pour les ablutions (wudu) et la grande purification (ghusl), ainsi que de vestiaires permettant aux pèlerins de revêtir leurs vêtements d'ihram.",
          },
          {
            type: 'paragraph',
            content: "Le parking est généreux, et des bus réguliers relient Masjid Aïcha au centre de La Mecque et aux quartiers hôteliers. La mosquée fonctionne 24h/24 et est particulièrement animée la nuit, lorsque de nombreux pèlerins choisissent de partir pour leur Omra après Isha ou Tahajjud.",
          },
        ],
      },
      {
        id: 'liturgique',
        title: 'Importance liturgique',
        content: [
          {
            type: 'paragraph',
            content: "Masjid Aïcha est le miqat désigné pour les personnes qui se trouvent déjà à l'intérieur des limites du Haram de La Mecque et qui souhaitent accomplir une Omra supplémentaire. Ce point est fondamental : les miqats classiques (Dhul Hulayfa pour les pèlerins venant de Madinah, Juhfah pour ceux venant de Syrie, etc.) sont destinés aux pèlerins arrivant de l'extérieur de La Mecque. Pour quiconque est déjà sur place, Tan'im est le point de départ légal.",
          },
          {
            type: 'paragraph',
            content: "Un pèlerin qui souhaiterait entrer en ihram depuis sa chambre d'hôtel à La Mecque commettrait une erreur liturgique : il se trouverait déjà à l'intérieur du Haram, sans avoir franchi le miqat. La sortie jusqu'à Tan'im (ou un autre miqat extérieur) est obligatoire pour la validité de la Omra supplémentaire, selon le consensus des quatre madhabs.",
          },
          {
            type: 'callout',
            text: "Accomplissez le Hajj et la Omra pour Allah.",
            reference: 'Sourate Al-Baqara, verset 196, fondement juridique de l\'obligation de respecter les miqats',
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-al-miqat', label: 'Masjid Dhul Hulayfah : le miqat principal de Madinah' }],
      },
      {
        id: 'rituels',
        title: 'Rituels associés au miqat',
        content: [
          {
            type: 'paragraph',
            content: "La séquence à effectuer à Masjid Aïcha avant de retourner à La Mecque pour la Omra suit un ordre précis recommandé par la Sunnah.",
          },
          {
            type: 'rituals',
            items: [
              {
                icon: 'droplets',
                title: 'Ghusl et wudu',
                description: "Effectuer la grande purification (ghusl) est une Sunna recommandée avant d'entrer en ihram. Si ce n'est pas possible, les ablutions mineures (wudu) suffisent. Des salles de bains complètes sont disponibles à la mosquée.",
              },
              {
                icon: 'sun',
                title: "Vêtement d'ihram et niyyah",
                description: "Les hommes revêtent les deux pièces de tissu blanc non cousu. Les femmes portent une tenue pudique couvrant tout le corps sauf le visage et les mains. L'intention (niyyah) pour la Omra est formulée à voix basse.",
              },
              {
                icon: 'target',
                title: 'Talbiyah et retour au Haram',
                description: "Dès l'entrée en ihram, la Talbiyah est prononcée à voix haute : «Labbayk Allahumma Umratan.» On la répète jusqu'au début du Tawaf. Le retour vers La Mecque peut se faire en taxi ou bus depuis la mosquée.",
              },
            ],
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-al-haram', label: 'Masjid Al-Haram et la Kaaba' }, { href: '/blog/comment-preparer-omra-10-etapes', label: 'Comment préparer son Omra en 10 étapes' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "La mosquée est très fréquentée pendant le Ramadan et les saisons du Hajj. Pour une visite sereine, privilégiez les heures de mi-journée (entre 10h et 14h) où les flux de pèlerins sont plus faibles. Le trajet depuis le centre de La Mecque dure environ 15 à 20 minutes en taxi. En période de haute saison, prévoyez 30 à 40 minutes de trajet aller.",
          },
          {
            type: 'paragraph',
            content: "Préparez votre vêtement d'ihram à l'avance dans votre chambre d'hôtel avant de partir pour éviter de vous changer dans un espace bondé. Emportez votre eau de Zamzam depuis le Haram, car les fontaines à Masjid Aïcha ne fournissent pas de l'eau de Zamzam.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Si vous souhaitez accomplir une Omra supplémentaire pendant votre séjour à La Mecque, Masjid Aïcha est le point de départ le plus pratique. Votre guide SAFARUMA coordonne le transport aller-retour, le timing par rapport aux heures de prière et le programme du Tawaf et du Sa'i pour maximiser le recueillement et minimiser l'attente.",
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
              "Entrer en ihram depuis la chambre d'hôtel à La Mecque pour une Omra supplémentaire : on se trouve déjà à l'intérieur du Haram, le miqat n'a pas été franchi, la Omra serait incomplète.",
              "Oublier la Talbiyah au moment d'entrer en ihram : c'est le signal vocal de l'entrée en état sacré.",
              "Confondre le miqat de Tan'im avec les miqats classiques : Tan'im est réservé aux résidents et visiteurs déjà dans La Mecque, pas aux pèlerins arrivant de l'extérieur.",
              "Parler de choses mondaines ou se quereller pendant l'état d'ihram : la sérénité de l'état sacré exige le contrôle de la parole et des émotions.",
              "Se changer en ihram dans des espaces communs bondés sans préparation : préparez votre tenue à l'avance pour éviter stress et précipitation.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Pourquoi appelle-t-on cette mosquée Masjid Aïcha ?", answer: "En mémoire d'Aïcha (ra), épouse du Prophète ﷺ, qui entra en état d'ihram à Tan'im lors du Hajj d'adieu pour accomplir une Omra supplémentaire, sur instruction du Prophète ﷺ. Ce récit est authentifié dans le Sahih al-Bukhari (n° 1516) et le Sahih Muslim." },
      { question: "Faut-il aller à Masjid Aïcha pour la première Omra ?", answer: "Non. Pour la première Omra, les pèlerins entrent en ihram à leur miqat géographique respectif avant d'arriver à La Mecque (Dhul Hulayfa pour ceux venant de Madinah, Juhfah pour ceux de Syrie, etc.). Masjid Aïcha n'est utilisé que pour les Omras supplémentaires effectuées par des personnes déjà à La Mecque." },
      { question: "Combien d'Omras peut-on faire pendant un séjour ?", answer: "Il n'y a pas de limite prescrite. Chaque Omra supplémentaire nécessite de sortir jusqu'à Tan'im (ou un autre miqat), d'y entrer en ihram, puis de revenir au Haram pour accomplir le Tawaf, le Sa'i et la coupe des cheveux. Certains pèlerins en accomplissent plusieurs pendant leur séjour, notamment pendant le Ramadan." },
      { question: "Quels sont les autres miqats ?", answer: "Les cinq miqats principaux sont : Dhul Hulayfa (pour les pèlerins venant de Madinah), Al-Juhfah (Syrie, Égypte, Maroc), Qarn al-Manazil (Najd), Yalamlam (Yémen) et Dhat Iraq (Irak). Pour les résidents de La Mecque et les visiteurs déjà sur place, le miqat est Tan'im ou les limites du Haram." },
      { question: "Comment s'y rendre depuis La Mecque ?", answer: "Des taxis sont disponibles en permanence depuis les quartiers hôteliers proches du Haram. Le trajet dure environ 15 à 20 minutes. En haute saison, des bus réguliers desservent également Tan'im depuis plusieurs points de la ville. Votre guide peut organiser le transport." },
      { question: "Y a-t-il des frais d'entrée ?", answer: "Non, Masjid Aïcha est entièrement gratuite et ouverte 24h/24. Les salles d'ablutions et les espaces de changement sont accessibles gratuitement." },
      { question: "Les femmes peuvent-elles s'y rendre seules ?", answer: "Pour accomplir une Omra, la question du mahram pour les femmes dépend de leur situation et des règles saoudiennes en vigueur. Concernant le déplacement à Masjid Aïcha en groupe organisé ou accompagnées d'autres pèlerins de confiance, c'est généralement pratiqué. Votre agence ou votre guide clarifiera les modalités selon votre situation." },
      { question: "Que faire si on oublie l'ihram à La Mecque ?", answer: "Si vous partez pour Masjid Aïcha sans votre vêtement d'ihram, il est conseillé de retourner le chercher plutôt que d'improviser. Entrer en ihram avec une tenue inadaptée ou partielle invalide potentiellement le rite. Des boutiques à proximité de la mosquée vendent des vêtements d'ihram de base en cas d'urgence." },
    ],
  },

  'hunayn': {
    slug: 'hunayn',
    title: "Hunayn : la vallée de la victoire et de l'humilité",
    location: "À 20 km au nord-est de La Mecque",
    locationKicker: 'LIEU SAINT · LA MECQUE',
    excerpt: "Vallée historique où eut lieu la bataille de Hunayn en l'an 8 de l'Hégire, rappel coranique de l'humilité face au nombre et de la confiance en Allah seul.",
    readingTime: 6,
    publishedAt: '2026-05-11T11:00:00+03:00',
    sections: [
      {
        id: 'contexte',
        title: 'Contexte historique',
        content: [
          {
            type: 'paragraph',
            content: "La bataille de Hunayn eut lieu en l'an 8 de l'Hégire, en 630 de l'ère chrétienne, quelques semaines seulement après la conquête de La Mecque. L'armée musulmane, forte de 12 000 hommes, dont 2 000 Mecquois fraîchement convertis, se dirigeait vers Ta'if pour affronter les tribus Hawazin et Thaqif, qui avaient refusé l'Islam et rassemblé leurs forces.",
          },
          {
            type: 'paragraph',
            content: "En pénétrant dans la vallée encaissée de Hunayn, les Musulmans tombèrent dans une embuscade soigneusement préparée par l'habile stratège Malik ibn Awf al-Nasri, commandant des Hawazin. Surpris par une pluie de flèches dans l'obscurité de l'aube, les premières lignes reculèrent en désordre, provoquant une débandade qui toucha une grande partie de l'armée.",
          },
          {
            type: 'callout',
            text: "Le jour de Hunayn, lorsque votre grand nombre vous avait enorgueilli, mais il ne vous servit à rien. La terre, malgré son étendue, vous parut étroite, puis vous tournâtes le dos pour fuir. Ensuite, Allah fit descendre Sa sérénité sur Son messager et sur les croyants, fit descendre des armées que vous ne vîtes pas et châtia les mécréants.",
            reference: 'Sourate At-Tawba, versets 25 et 26',
          },
          {
            type: 'paragraph',
            content: "Dans la tourmente, le Prophète ﷺ fit preuve d'un courage exceptionnel. Il continua d'avancer sur sa mule blanche sans reculer, en criant : «Je suis le Prophète, cela n'est pas un mensonge. Je suis le fils d'Abd al-Muttalib.» Son oncle al-Abbas (ra), à la voix puissante, rassembla les fuyards qui revinrent se battre. La victoire finale fut totale : les tribus Hawazin furent défaites et leurs prisonniers, libérés par la clémence du Prophète ﷺ.",
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
              { label: 'Année bataille', value: 'An 8 H.' },
              { label: 'Distance La Mecque', value: '20 km' },
              { label: 'Soldats musulmans', value: '12 000' },
              { label: 'Mention coranique', value: 'Sourate 9:25' },
            ],
          },
          {
            type: 'paragraph',
            content: "La vallée de Hunayn est située sur la route reliant La Mecque à Ta'if, à environ vingt kilomètres au nord-est de la ville. Aujourd'hui, ce secteur est en grande partie urbanisé et intégré dans le tissu résidentiel et commercial de la grande banlieue mecquoise. Les vestiges physiques de la bataille sont quasi inexistants pour un visiteur non averti.",
          },
          {
            type: 'paragraph',
            content: "La topographie originelle, une vallée encaissée avec des hauteurs dominant l'axe de passage, explique l'efficacité de l'embuscade des Hawazin. Ces positions élevées permettaient à leurs archers de prendre les Musulmans sous un feu croisé dès les premières lueurs de l'aube. C'est la géographie elle-même qui fut l'instrument de l'épreuve initiale.",
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-al-haram', label: 'Masjid Al-Haram et la Kaaba' }],
      },
      {
        id: 'spiritualite',
        title: 'Enseignement spirituel',
        content: [
          {
            type: 'paragraph',
            content: "La bataille de Hunayn est d'abord un enseignement coranique sur l'hubris : la confiance en son propre nombre et en ses propres forces, au détriment de la confiance en Allah. La phrase coranique est claire : «Votre grand nombre vous avait enorgueilli.» Cette leçon s'adresse à toute communauté qui placerait sa confiance dans ses ressources humaines plutôt que dans la protection divine.",
          },
          {
            type: 'paragraph',
            content: "La bataille enseigne aussi la résilience et l'effet mobilisateur du leadership. Le Prophète ﷺ n'a pas fui malgré la panique générale. Sa présence sereine et courageuse au cœur du chaos fut le facteur décisif du retournement de situation. Les savants islamiques soulignent que la sakina, la sérénité divine mentionnée dans le verset 26, descendit d'abord sur le Prophète ﷺ et, à travers lui, sur les croyants.",
          },
          {
            type: 'paragraph',
            content: "Hunayn montre également la clémence prophétique dans la victoire : malgré la résistance armée des Hawazin, le Prophète ﷺ libéra leurs prisonniers sans contrepartie lorsque leurs émissaires vinrent le lui demander. «J'ai choisi les personnes», aurait-il dit, refusant de conserver les biens capturés au détriment du retour à la paix.",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Visite et recueillement',
        content: [
          {
            type: 'paragraph',
            content: "Hunayn n'est pas un site touristique aménagé. La zone ne présente aucun vestige archéologique visible ni signalétique spécifique pour les visiteurs. C'est un lieu de mémoire historique et de méditation coranique, pas un site de rituel ou d'adoration. La visite s'adresse avant tout aux pèlerins passionnés par l'histoire islamique et la Sîra prophétique.",
          },
          {
            type: 'paragraph',
            content: "Le recueillement approprié consiste à réciter et méditer les versets 25 et 26 de la Sourate At-Tawba, à réfléchir à la leçon d'humilité et de tawakkul qu'ils contiennent, et à faire des invocations pour la solidité de la foi. Une visite courte (30 à 45 minutes sur place) est largement suffisante.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Hunayn n'est pas un site touristique classique et la vallée elle-même n'offre rien de spectaculaire à voir : c'est le récit coranique qu'on vient méditer. Votre guide SAFARUMA contextualise l'histoire, lit et commente les versets coraniques sur place, et transforme cette visite apparemment anodine en l'un des moments les plus marquants du voyage pour les pèlerins sensibles à l'histoire islamique.",
          },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "La route vers Hunayn passe par la sortie nord-est de La Mecque en direction de Ta'if. Le trajet depuis le centre de La Mecque dure environ 30 minutes sans embouteillages. Il n'existe pas d'infrastructure touristique sur place (pas de parking dédié, pas de sanitaires, pas de guides locaux).",
          },
          {
            type: 'list',
            items: [
              "Visite rapide : comptez 1h à 1h30 au total, transport inclus",
              "Pas d'infrastructure sur place, prévoyez eau et collation",
              "Visite plus adaptée en matinée, avant les embouteillages de la mi-journée",
              "Idéalement combinée avec d'autres visites hors-Haram (Jabal al-Nour, Jabal Thawr)",
              "Transport en taxi ou avec votre guide recommandé",
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
              "Confondre Hunayn et la bataille de Badr : ce sont deux événements distincts. Badr (an 2 H.) opposa 313 Musulmans à 1 000 Qurayshites. Hunayn (an 8 H.) opposa 12 000 Musulmans aux tribus Hawazin et Thaqif.",
              "S'attendre à voir des vestiges visibles ou un site aménagé : la zone est urbanisée et ne présente aucune infrastructure touristique.",
              "Croire que la visite de Hunayn est un rite de la Omra ou du Hajj : c'est une démarche culturelle et historique entièrement facultative.",
              "Négliger la sécurité routière sur la route de Ta'if : l'axe est fréquenté et la conduite à La Mecque et ses environs requiert une attention particulière.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Quelle est la différence entre Hunayn et Badr ?", answer: "Badr (an 2 H., 624) opposa 313 Musulmans à une armée de 1 000 Qurayshites, résultant en une victoire décisive contre toute attente. Hunayn (an 8 H., 630) opposa 12 000 Musulmans aux tribus Hawazin et Thaqif. À Badr, la confiance était humainement faible mais la foi forte. À Hunayn, l'orgueil du nombre fut d'abord sanctionné avant que la victoire ne soit accordée." },
      { question: "Qui combattit le Prophète ﷺ à Hunayn ?", answer: "Les tribus Hawazin et Thaqif, deux grandes tribus de la péninsule arabique qui avaient refusé l'Islam après la conquête de La Mecque. Leur commandant, Malik ibn Awf al-Nasri, avait élaboré la stratégie de l'embuscade dans la vallée de Hunayn." },
      { question: "Combien de Musulmans participaient à la bataille ?", answer: "12 000 hommes au total, dont 10 000 pèlerins du Hajj et 2 000 Mecquois récemment convertis. C'était la plus grande armée jamais rassemblée par les Musulmans jusqu'alors, ce qui explique l'avertissement coranique contre l'orgueil du nombre." },
      { question: "Pourquoi les Musulmans furent-ils en difficulté au début ?", answer: "Les Hawazin avaient soigneusement préparé une embuscade dans la vallée encaissée de Hunayn. Attaqués à l'aube par une pluie de flèches depuis les hauteurs, les premières lignes reculèrent en désordre. Le Coran explique cette épreuve initiale par l'orgueil du grand nombre." },
      { question: "Quelle est la leçon spirituelle de Hunayn ?", answer: "L'humilité face au succès et la confiance en Allah plutôt qu'en ses propres ressources. Le Coran le formule directement : le grand nombre n'a servi à rien, c'est la sakina (sérénité) accordée par Allah et Ses armées invisibles qui ont retourné la bataille. Toute victoire vient d'Allah, non des capacités humaines." },
      { question: "Y a-t-il des vestiges visibles aujourd'hui ?", answer: "Non, la zone de Hunayn est aujourd'hui urbanisée et intégrée dans les faubourgs de La Mecque. Il n'y a aucun vestige archéologique visible, aucun monument ni signalétique touristique. La valeur du lieu est entièrement mémorielle et coranique." },
      { question: "Faut-il visiter Hunayn pendant la Omra ?", answer: "Non, c'est une visite historique et facultative. Les rites de la Omra ne comprennent que l'ihram, le Tawaf, le Sa'i et la coupe des cheveux, tous effectués à La Mecque et au Haram. Hunayn est une démarche de connaissance de la Sîra, adaptée aux pèlerins passionnés d'histoire islamique." },
      { question: "Hunayn est-il mentionné dans le Coran ?", answer: "Oui, c'est l'un des rares batailles citées explicitement dans le Coran par son nom. Les versets 25 et 26 de la Sourate At-Tawba (le Repentir) évoquent directement la bataille, sa leçon d'humilité et l'intervention divine." },
    ],
  },

  'masjid-al-miqat': {
    slug: 'masjid-al-miqat',
    title: "Masjid al-Miqat : le point d'entrée en ihram pour la Omra",
    location: "Dhul-Hulayfah, à 9 km de Médine",
    locationKicker: 'LIEU SAINT · MÉDINE',
    excerpt: "Aussi appelée Abyar Ali, c'est la mosquée du miqat pour tous les pèlerins venant de Médine vers La Mecque, le plus grand et le plus éloigné des cinq miqats islamiques.",
    readingTime: 7,
    publishedAt: '2026-05-11T12:00:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Origine et importance historique',
        content: [
          {
            type: 'paragraph',
            content: "Masjid al-Miqat, également connue sous le nom d'Abyar Ali (les puits d'Ali), est située à Dhul-Hulayfah, à environ neuf kilomètres au sud-ouest de Médine sur la route menant à La Mecque. C'est en ce lieu que le Prophète Muhammad ﷺ a fixé le miqat des habitants et des visiteurs de Médine pour les pèlerinages.",
          },
          {
            type: 'callout',
            text: "Le Prophète ﷺ a fixé Dhul-Hulayfah comme miqat pour les habitants de Médine, Al-Juhfa pour les habitants de Syrie, Qarn al-Manazil pour les habitants de Najd, et Yalamlam pour les habitants du Yémen.",
            reference: 'Sahih al-Bukhari, n° 1526, et Sahih Muslim, n° 1181, rapporté par Ibn Abbas (ra)',
          },
          {
            type: 'paragraph',
            content: "Le Prophète ﷺ lui-même entra en ihram depuis Dhul-Hulayfah lors de son Hajj d'adieu en l'an 10 de l'Hégire (632). C'est le miqat le plus éloigné de La Mecque parmi les cinq miqats, à environ 420 kilomètres, ce qui laisse au pèlerin un long chemin de recueillement dans l'état sacré avant d'arriver au Masjid Al-Haram.",
          },
          {
            type: 'paragraph',
            content: "Le nom «Abyar Ali» (les puits d'Ali) est d'origine populaire et fait référence à un puits associé à Ali ibn Abi Talib (ra) dans les traditions locales. Ce nom est couramment utilisé par les populations locales et les chauffeurs de bus, mais le nom islamiquement correct est Masjid Dhul-Hulayfah ou Masjid al-Miqat.",
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
              { label: 'Capacité', value: '5 000' },
              { label: 'Distance Médine', value: '9 km' },
              { label: 'Distance La Mecque', value: '~420 km' },
              { label: 'Reconstruction', value: '1985' },
            ],
          },
          {
            type: 'paragraph',
            content: "La mosquée actuelle est une structure moderne dotée de vastes espaces pour accueillir les flux de pèlerins venant de Médine. Elle dispose de salles d'ablutions séparées pour les hommes et les femmes, de vestiaires permettant de revêtir les vêtements d'ihram, ainsi que d'un grand parking pouvant accueillir de nombreux bus de pèlerins.",
          },
          {
            type: 'paragraph',
            content: "Plusieurs fontaines d'eau potable sont disponibles dans l'enceinte. La mosquée fonctionne en continu et est particulièrement animée lors des saisons de Hajj et d'Omra, où des milliers de pèlerins y transitent chaque heure. L'organisation saoudienne y maintient un personnel permanent pour orienter et assister les pèlerins.",
          },
        ],
      },
      {
        id: 'liturgique',
        title: 'Importance liturgique',
        content: [
          {
            type: 'paragraph',
            content: "Masjid al-Miqat est obligatoirement le point de passage pour tout pèlerin qui se trouve à Médine ou qui emprunte la route de Médine pour rejoindre La Mecque. Franchir le miqat sans être en état d'ihram est une faute liturgique grave (elle nécessite une compensation : un dam, c'est-à-dire un sacrifice expiatoire) selon le consensus des quatre madhabs.",
          },
          {
            type: 'paragraph',
            content: "Les cinq miqats sont chacun désignés selon la direction géographique d'où vient le pèlerin. Pour un pèlerin volant directement vers Djeddah ou prenant un avion survolant le miqat, l'ihram doit être pris avant l'embarquement ou dès que l'avion atteint la hauteur correspondant au miqat géographique survolé.",
          },
          {
            type: 'callout',
            text: "Accomplissez le Hajj et la Omra en l'honneur d'Allah.",
            reference: 'Sourate Al-Baqara, verset 196, fondement coranique de l\'obligation de respecter les miqats dans leur intégralité',
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-aisha', label: "Masjid Aïcha : le miqat des Mecquois pour la Omra" }],
      },
      {
        id: 'rituels',
        title: "Rituels du miqat",
        content: [
          {
            type: 'paragraph',
            content: "La séquence des actes à accomplir à Masjid al-Miqat est précisément définie par la Sunnah. Chaque étape prépare le pèlerin à entrer dans l'état sacré de l'ihram.",
          },
          {
            type: 'rituals',
            items: [
              {
                icon: 'droplets',
                title: 'Ghusl et ablutions',
                description: "Effectuer la grande purification (ghusl) est une Sunnah fortement recommandée. Elle peut être faite dans votre hôtel à Médine avant de partir. Sur place, des salles de bains complètes sont disponibles. Les ablutions mineures (wudu) sont au minimum nécessaires.",
              },
              {
                icon: 'sun',
                title: "Port de l'ihram",
                description: "Les hommes revêtent deux pièces de tissu blanc non cousu : le rida (haut) et l'izar (bas), avec des sandales ouvertes. Les femmes portent une tenue pudique couvrant tout le corps sauf le visage et les mains. Aucun parfum ne doit être appliqué après l'ihram.",
              },
              {
                icon: 'target',
                title: 'Niyyah et Talbiyah',
                description: "L'intention (niyyah) pour la Omra ou le Hajj est formulée en silence ou à voix basse. Puis la Talbiyah est prononcée à voix haute : «Labbayk Allahumma labbayk, labbayk la sharika laka labbayk, innal hamda wan-ni'mata laka wal-mulk, la sharika lak.» Elle est répétée jusqu'au début du Tawaf.",
              },
            ],
          },
        ],
        seeAlso: [{ href: '/blog/comment-preparer-omra-10-etapes', label: 'Comment préparer son Omra en 10 étapes' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "Pour optimiser votre passage au miqat, effectuez le ghusl dans votre chambre d'hôtel à Médine avant de partir. Revêtez votre ihram ou préparez-le dans votre bagage à main. Arrivez à la mosquée en état de pureté pour ne plus avoir qu'à formuler l'intention et prononcer la Talbiyah avant de reprendre le bus ou le taxi.",
          },
          {
            type: 'paragraph',
            content: "En saison de pointe, les salles d'ablutions et de change peuvent être saturées pendant une à deux heures. Préférez les matinées (entre 6h et 10h) ou les soirées (après 21h) pour trouver des conditions plus calmes. Les après-midis sont généralement les plus chargés.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Préparez votre ihram dans votre bagage à main avec un savon non parfumé, une serviette et votre eau de Zamzam. À Masjid al-Miqat, l'organisation est efficace mais l'affluence peut être importante. Plus vous arrivez préparé depuis Médine, plus le passage au miqat devient un moment de recueillement plutôt qu'une logistique stressante. Votre guide SAFARUMA coordonne le timing pour éviter les heures d'affluence maximale.",
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
              "Franchir le miqat en bus ou en voiture sans être en état d'ihram : c'est une faute grave nécessitant un dam (sacrifice expiatoire) selon tous les madhabs.",
              "Appliquer du parfum après avoir revêtu l'ihram : le parfum est strictement interdit en état d'ihram. Appliquez-le avant, si souhaité.",
              "Croire que le ghusl est obligatoire : il est fortement recommandé (Sunnah muakkadah) mais les ablutions mineures suffisent si le ghusl est impossible.",
              "Oublier de formuler l'intention (niyyah) avant de franchir le miqat : sans intention explicite, l'ihram n'est pas validement entré.",
              "Oublier d'apporter son ihram dans le bus : il est trop tard une fois le miqat franchi sans être en état sacré.",
              "Confondre les règles hommes et femmes : les femmes ne portent pas le deux-pièces blanc et gardent le visage et les mains découverts.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Pourquoi appelle-t-on cette mosquée Abyar Ali ?", answer: "Ce nom populaire signifie «les puits d'Ali» et fait référence à des puits associés à Ali ibn Abi Talib (ra) dans les traditions locales. Le nom islamiquement correct est Masjid Dhul-Hulayfah ou Masjid al-Miqat. Les deux noms désignent le même lieu." },
      { question: "Faut-il obligatoirement faire le ghusl avant l'ihram ?", answer: "Non, le ghusl est une Sunnah fortement recommandée mais pas une obligation. Les ablutions mineures (wudu) sont suffisantes pour la validité de l'ihram. En cas d'impossibilité, l'ihram reste valide sans ghusl ni wudu selon certains savants, mais la pureté rituelle est fortement conseillée." },
      { question: "Que se passe-t-il si on franchit le miqat sans ihram ?", answer: "C'est une faute grave (contraventions aux règles du Hajj ou de la Omra). La règle générale est qu'il faut retourner au miqat pour y entrer en ihram. Si ce retour est impossible, un dam (sacrifice d'un animal à La Mecque) est requis comme expiation, selon le consensus des savants islamiques." },
      { question: "Combien de temps prévoir pour le rituel d'ihram ?", answer: "Comptez 30 à 45 minutes pour le ghusl, le changement et la prière. Si les salles d'ablutions sont bondées, prévoyez jusqu'à 1h30. En arrivant préparé depuis Médine (ghusl fait à l'hôtel), vous pouvez réduire le temps sur place à 15 à 20 minutes." },
      { question: "Les femmes ont-elles un endroit séparé ?", answer: "Oui, Masjid al-Miqat dispose d'espaces entièrement séparés pour les femmes : salles d'ablutions, vestiaires et salle de prière. Le personnel féminin assiste les pèlerines." },
      { question: "Quels vêtements ne sont pas autorisés en ihram ?", answer: "Pour les hommes : tout vêtement cousu, les chaussettes, les sous-vêtements et les chaussures couvrant le talon. Pour les femmes : le niqab et les gants (selon la majorité des savants). Pour les deux : tout vêtement parfumé. En revanche, les femmes peuvent porter leur tenue habituelle modeste couvrant tout le corps sauf le visage et les mains." },
      { question: "Peut-on revenir à Médine après l'ihram ?", answer: "Oui, mais en restant en état d'ihram. Si vous revenez à Médine après avoir passé le miqat en ihram, vous devez maintenir toutes les restrictions de l'ihram (pas de parfum, pas de relations conjugales, pas de couture, etc.) jusqu'au début du Tawaf à La Mecque." },
      { question: "Comment se rend-on à Masjid al-Miqat ?", answer: "Des bus réguliers partent des hôtels proches de Masjid an-Nabawi vers Masjid al-Miqat. Des taxis collectifs (hiace) fonctionnent également. Votre agence ou guide organise généralement le transport. Le trajet depuis le centre de Médine dure environ 15 à 20 minutes." },
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
        seeAlso: [{ href: '/lieux-saints/masjid-al-miqat', label: "Masjid al-Miqat : le point d'entrée en ihram" }],
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

  'masjid-fateh': {
    slug: 'masjid-fateh',
    title: "Masjid al-Fateh : la mosquée de la victoire de Khandaq",
    location: "Mont Sal', ouest de Médine",
    locationKicker: 'LIEU SAINT · MÉDINE',
    excerpt: "Mosquée bâtie sur le site où le Prophète Muhammad ﷺ pria trois jours pour la victoire lors du siège de Médine (bataille du Khandaq, an 5 H.).",
    readingTime: 6,
    publishedAt: '2026-05-11T12:45:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Le contexte historique : la bataille du Khandaq',
        content: [
          {
            type: 'paragraph',
            content: "En l'an 5 de l'Hégire (627 de l'ère chrétienne), une coalition de 10 000 guerriers qurayshites, juifs de Khaybar et tribus alliées assiégea Médine. Face à cette menace sans précédent, Salman al-Farisi (ra) proposa une stratégie inédite dans la péninsule arabique : creuser une tranchée (khandaq) pour protéger les frontières nord de Médine.",
          },
          {
            type: 'callout',
            text: "Ô vous qui avez cru, rappelez-vous le bienfait d'Allah sur vous, quand des armées vinrent contre vous et que Nous envoyâmes sur elles un vent violent et des troupes que vous n'avez pas vues.",
            reference: 'Sourate Al-Ahzab, verset 9, relatant la bataille du Khandaq',
          },
          {
            type: 'paragraph',
            content: "Le siège dura vingt-sept jours. Les Musulmans, moins de 3 000 combattants, tinrent la tranchée face à une armée dix fois supérieure. Le Prophète ﷺ posta ses lieutenants le long de la ligne de défense et monta lui-même au flanc du mont Sal' pour observer et diriger. C'est à cet endroit précis qu'il pria pendant trois jours et trois nuits consécutives, suppliant Allah de secourir les croyants.",
          },
          {
            type: 'paragraph',
            content: "Selon les récits du Sahih al-Bukhari, le mercredi à l'heure de Dhuhr, la réponse divine arriva : un vent violent s'abattit sur le camp des coalisés, semant la confusion. Puis la discorde éclata entre les alliés de la coalition. La tribu de Ghatafan demanda sa part du butin avant de combattre, les Qurayshites refusèrent. La coalition se disloqua et leva le siège.",
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
              { label: 'Superficie', value: '~70 m²' },
              { label: 'Année événement', value: 'An 5 H.' },
              { label: 'Ensemble', value: '7 mosquées' },
              { label: 'Accès public', value: 'Variable' },
            ],
          },
          {
            type: 'paragraph',
            content: "Masjid al-Fateh est une petite mosquée modeste, d'environ 70 mètres carrés, construite à flanc du mont Sal'. Son architecture est simple : une salle de prière blanche avec un minaret unique et une cour minimaliste. Elle fait partie d'un ensemble de petites mosquées historiques connues sous le nom des «Sept Mosquées» (Sab'a Masajid), bâties en souvenir des sites liés à la bataille du Khandaq.",
          },
          {
            type: 'paragraph',
            content: "Les Sept Mosquées comprennent notamment Masjid al-Fateh, Masjid Salman al-Farisi, Masjid Abu Bakr, Masjid Umar, Masjid Ali et Masjid al-Qiblatayn (cette dernière ayant une signification distincte). L'ensemble est situé dans le quartier ouest de Médine, non loin du site de la tranchée historique.",
          },
        ],
      },
      {
        id: 'spiritualite',
        title: 'Importance spirituelle',
        content: [
          {
            type: 'paragraph',
            content: "Masjid al-Fateh symbolise la puissance de la prière sincère dans l'épreuve. Pendant trois jours de siège, alors que Médine était au bord de la capitulation, le Prophète ﷺ ne cessa pas de prier. Sa conviction que la victoire viendrait d'Allah, et non du nombre ou des armes, est l'une des expressions les plus saisissantes du tawakkul dans toute la Sîra.",
          },
          {
            type: 'paragraph',
            content: "Le nom «al-Fateh» signifie «la victoire» ou «l'ouverture», en référence directe à la victoire accordée par Allah après ces trois jours de prière. Cette mosquée rappelle que la prière en temps d'épreuve n'est pas une passivité mais un acte de résistance spirituelle active.",
          },
          {
            type: 'paragraph',
            content: "La position théologique sur la visite des Sept Mosquées mérite d'être mentionnée avec transparence : plusieurs savants contemporains, dont certains membres du Conseil du Grand Mouftiat saoudien, considèrent que les visiter spécifiquement toutes ensemble, dans l'idée d'y accomplir une Sunna, relève de la bid'ah (innovation blâmable). La visite reste licite à titre de mémoire historique.",
          },
        ],
      },
      {
        id: 'visite',
        title: 'Visite et recueillement',
        content: [
          {
            type: 'paragraph',
            content: "Masjid al-Fateh est parfois fermée au public, notamment pendant les périodes de travaux dans la zone ou selon les décisions des autorités saoudiennes. Il est conseillé de se renseigner sur l'accessibilité auprès de votre guide avant de planifier une visite.",
          },
          {
            type: 'paragraph',
            content: "Si la mosquée est accessible, la visite s'articule autour d'une prière de salutation (tahiyat al-masjid), d'une méditation sur l'histoire du Khandaq et d'invocations personnelles. La récitation de la Sourate Al-Ahzab, qui relate la bataille, enrichit le recueillement. Une visite de quinze à trente minutes est largement suffisante.",
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "La visite des «Sept Mosquées» fait débat parmi les savants. Nombreux sont ceux qui considèrent qu'y aller spécifiquement en y cherchant une vertu liturgique relève de la bid'ah. Masjid al-Fateh est cependant intéressante à titre historique. Votre guide SAFARUMA vous présente le site depuis l'extérieur avec le récit du Khandaq, ce qui suffit à rendre la visite spirituellement riche sans entrer dans les zones de débat théologique.",
          },
        ],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "Le site est peu fréquenté comparé aux grands sanctuaires de Médine. Pas de transport public direct depuis Masjid an-Nabawi : un taxi ou un véhicule avec guide est nécessaire. La visite peut être combinée avec celle du site du Khandaq (la tranchée historique), situé à proximité.",
          },
          {
            type: 'list',
            items: [
              "Vérifiez l'accessibilité avant de vous y rendre (souvent fermée au public)",
              "Distance depuis Masjid an-Nabawi : environ 3 à 4 km, 10 à 15 minutes en taxi",
              "Visite courte : 15 à 30 minutes sur place",
              "Peut être combinée avec la visite du site du Khandaq dans le même trajet",
              "Aucun service sur place (eau, sanitaires) : prévoyez votre eau",
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
              "Visiter toutes les Sept Mosquées dans l'idée d'accomplir une Sunna particulière : certains savants qualifient cela de bid'ah. La visite à titre historique est licite.",
              "Considérer que prier dans Masjid al-Fateh multiplie la valeur de la prière : aucun hadith authentique n'attribue de valeur multipliée à cette mosquée spécifiquement.",
              "Se rendre sur place sans vérifier qu'elle est accessible : la mosquée est parfois fermée par les autorités saoudiennes.",
              "Confondre Masjid al-Fateh et Masjid al-Qiblatayn : les deux sont dans l'ouest de Médine mais ont des histoires entièrement différentes.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Qu'est-ce que la bataille du Khandaq ?", answer: "La bataille du Khandaq (la tranchée) eut lieu en l'an 5 de l'Hégire (627). Une coalition de 10 000 guerriers assiégea Médine pendant 27 jours. Sur la suggestion de Salman al-Farisi, les Musulmans creusèrent une tranchée de 5,5 km pour bloquer les assaillants. La coalition se disloqua sans combattre, après qu'un vent divin sema la confusion dans leur camp." },
      { question: "Pourquoi cette mosquée est-elle parfois fermée ?", answer: "Les autorités saoudiennes ont parfois fermé Masjid al-Fateh et les autres mosquées de l'ensemble des Sept Mosquées, soit pour rénovation, soit en raison du débat théologique sur la bid'ah que représenterait leur visite collective systématique. L'accessibilité varie selon les périodes." },
      { question: "Quelles sont les 7 mosquées de Médine ?", answer: "L'ensemble traditionnel des Sept Mosquées comprend Masjid al-Fateh, Masjid Salman al-Farisi, Masjid Abu Bakr, Masjid Umar, Masjid Ali et Masjid al-Qiblatayn, plus Masjid al-Fath al-A'la selon certaines listes. Elles sont toutes situées dans la zone ouest de Médine, liées au contexte de la bataille du Khandaq." },
      { question: "Faut-il visiter Masjid al-Fateh pendant la visite à Médine ?", answer: "Non, ce n'est pas une obligation ni une Sunna établie. C'est une démarche historique facultative. Pour un pèlerin passionné par l'histoire islamique et la Sîra, la visite à titre mémoriel est enrichissante. Pour un pèlerin avec peu de temps, les lieux prioritaires à Médine sont Masjid an-Nabawi, Al-Baqi' et Masjid Quba." },
      { question: "Quelle est la position des savants sur la visite des 7 mosquées ?", answer: "Les avis divergent. Certains savants (dont Cheikh Ibn Baz et d'autres du Conseil des Grands Oulémas saoudiens) ont considéré qu'y aller en pensant y trouver une vertu spéciale relève de la bid'ah. D'autres autorisent la visite à titre historique sans lui attribuer de vertu liturgique. La règle de prudence est de visiter à titre mémoriel sans intention de Sunna spécifique." },
      { question: "Quelle est la durée historique du siège ?", answer: "Le siège dura vingt-sept jours, selon les sources historiques islamiques majoritaires. La coalition leva le camp sans avoir réussi à franchir la tranchée ni à prendre Médine. C'est l'une des défenses les plus remarquables de l'histoire militaire de l'Islam primitif." },
    ],
  },

  'marche-dattes': {
    slug: 'marche-dattes',
    title: "Le marché aux dattes : tradition millénaire de Médine",
    location: "Centre de Médine, près de Masjid an-Nabawi",
    locationKicker: 'LIEU SAINT · MÉDINE',
    excerpt: "Marché historique de Médine, célèbre dans le monde musulman pour ses dattes Ajwa, fruit béni mentionné dans les hadiths authentiques du Prophète Muhammad ﷺ.",
    readingTime: 6,
    publishedAt: '2026-05-11T13:00:00+03:00',
    sections: [
      {
        id: 'origine',
        title: 'Histoire et tradition des dattes à Médine',
        content: [
          {
            type: 'paragraph',
            content: "La datte est au cœur de la civilisation de Médine depuis des millénaires. L'oasis de Médine, avec ses sols fertiles et son microclimat favorable, produit depuis l'Antiquité certaines des meilleures variétés de dattes du monde arabe. Le Prophète Muhammad ﷺ lui-même évoqua Médine comme une ville aux deux volcans (harras) et à la palmeraie, dans plusieurs hadiths décrivant sa géographie bénie.",
          },
          {
            type: 'callout',
            text: "Celui qui mange chaque matin sept dattes Ajwa, ni poison ni magie ne lui feront de mal ce jour-là.",
            reference: 'Sahih al-Bukhari, n° 5445, et Sahih Muslim, n° 2047, rapporté par Sad ibn Abi Waqqas (ra)',
          },
          {
            type: 'paragraph',
            content: "Ce hadith authentique, transmis par deux des compilateurs les plus rigoureux de l'histoire islamique, fait de la datte Ajwa la seule variété nommément mentionnée dans les hadiths du Prophète ﷺ avec une vertu spécifique. Cette distinction a contribué à faire de l'Ajwa de Médine l'une des dattes les plus recherchées et les plus exportées dans le monde musulman.",
          },
          {
            type: 'paragraph',
            content: "Le marché aux dattes de Médine, connu sous le nom de Souq al-Tamr, est situé à quelques centaines de mètres du Masjid an-Nabawi. Il existe sous diverses formes depuis des siècles, évoluant de simples étals en plein air à un marché structuré proposant aujourd'hui des dizaines de variétés en vrac ou en coffrets cadeaux.",
          },
        ],
        seeAlso: [{ href: '/lieux-saints/masjid-an-nabawi', label: 'Masjid an-Nabawi : la mosquée du Prophète ﷺ' }],
      },
      {
        id: 'description',
        title: 'Description du marché',
        content: [
          {
            type: 'stats',
            items: [
              { label: 'Variétés vendues', value: '50+' },
              { label: 'Variété sacrée', value: 'Ajwa' },
              { label: 'Saison récolte', value: 'Août-oct.' },
              { label: 'Distance Nabawi', value: '~200 m' },
            ],
          },
          {
            type: 'paragraph',
            content: "Le marché propose plus de cinquante variétés de dattes originaires de la région du Hijaz et d'autres zones d'Arabie Saoudite. Parmi les plus réputées : l'Ajwa (la variété prophétique, noire et moelleuse), la Medjool (grosse, charnue et sucrée), la Sukkari (jaune dorée et fondante), la Mabroum (longue et fibreuse), et la Khalas (petit format, très sucrée).",
          },
          {
            type: 'paragraph',
            content: "Les vendeurs proposent généralement à leurs clients de goûter les différentes variétés avant l'achat, une tradition commerciale que les pèlerins apprécient universellement. Au-delà des dattes, le marché offre du miel sauvage de la région (sidr et acacia), des épices, de l'huile d'olive, du kohl traditionnel et divers produits médicinaux naturels.",
          },
        ],
      },
      {
        id: 'culture',
        title: 'Importance culturelle et spirituelle',
        content: [
          {
            type: 'paragraph',
            content: "La datte occupe une place centrale dans la Sunnah du Prophète ﷺ. Il rompait le jeûne du Ramadan avec des dattes fraîches (ratab) ou sèches avant de prier, conformément au hadith d'Anas ibn Malik (ra) rapporté par Abu Dawud (n° 2356). Il les mangeait en nombre impair : une, trois ou cinq. Il recommandait de commencer le repas de l'Aïd al-Fitr avec des dattes.",
          },
          {
            type: 'paragraph',
            content: "Le Coran évoque les dattes dans un contexte de grâce divine : lors de la naissance de Jésus (Isa), Allah ordonna à Maryam de secouer le palmier pour en faire tomber des dattes fraîches (Sourate Maryam, versets 25-26). Cette mention coranique confirme la place de la datte dans le patrimoine spirituel des trois religions abrahamiques.",
          },
          {
            type: 'paragraph',
            content: "Ramener des dattes de Médine, et en particulier des Ajwa, constitue une tradition du pèlerinage profondément ancrée dans la culture musulmane. C'est l'un des cadeaux les plus appréciés et les plus symboliques qu'un pèlerin peut offrir à sa famille et à ses proches à son retour.",
          },
        ],
      },
      {
        id: 'achats',
        title: 'Que faire et quoi acheter',
        content: [
          {
            type: 'paragraph',
            content: "La visite du marché aux dattes est une expérience sensorielle complète : les arômes sucrés des dattes séchées, la couleur dorée ou noire selon les variétés, les échantillons offerts par les vendeurs. Prenez le temps de goûter plusieurs variétés avant de décider.",
          },
          {
            type: 'list',
            items: [
              "Ajwa : variété prophétique, noire et moelleuse, la plus onéreuse. Budget : 80 à 150 SAR/kg (20 à 40 EUR) selon qualité",
              "Sukkari : dorée, fondante, très accessible. Budget : 20 à 50 SAR/kg",
              "Medjool : grosse, charnue, idéale pour les coffrets cadeaux. Budget : 40 à 80 SAR/kg",
              "Coffrets cadeaux : 2 à 5 variétés en boîtes décorées, idéaux pour les cadeaux de pèlerinage",
              "Miel sidr : miel d'une qualité exceptionnelle, récolté sur les jujubiers sauvages du Hijaz",
              "Négocier est attendu et normal : proposer 70 à 80% du prix affiché est une pratique courante",
            ],
          },
          {
            type: 'expert-tip',
            title: 'Conseil expert SAFARUMA',
            text: "Les dattes Ajwa authentiques de Médine coûtent généralement entre 80 et 150 SAR/kg selon la qualité. Méfiez-vous des prix anormalement bas, qui peuvent indiquer des dattes cultivées hors de Médine et commercialisées sous le label Ajwa. Notre recommandation : achetez chez un vendeur référencé par votre guide SAFARUMA et ramenez 1 à 2 kg d'Ajwa pour votre famille comme cadeau de pèlerinage authentique.",
          },
        ],
        seeAlso: [{ href: '/blog/comment-preparer-omra-10-etapes', label: 'Comment préparer son Omra en 10 étapes' }],
      },
      {
        id: 'conseils',
        title: 'Conseils pratiques',
        content: [
          {
            type: 'paragraph',
            content: "Le marché est accessible à pied depuis Masjid an-Nabawi (environ 200 mètres). Il est ouvert sept jours sur sept, de tôt le matin jusqu'à tard le soir. Les meilleures heures pour la visite sont la matinée (entre 10h et 12h) ou après la prière de Asr, quand l'affluence est modérée et les vendeurs disponibles pour discuter et faire goûter.",
          },
          {
            type: 'paragraph',
            content: "Pour les achats en grande quantité (au-delà de 5 kg), négociez directement avec le propriétaire du stand plutôt qu'avec les vendeurs. Demandez toujours d'où viennent les Ajwa (elles doivent provenir d'Al-Aliya, la zone de culture traditionnelle près de Médine). Vérifiez que les coffrets cadeaux sont bien fermés et étanches avant de les mettre dans vos bagages.",
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
              "Acheter des dattes Ajwa à un prix anormalement bas sans vérifier leur provenance : les Ajwa authentiques de Médine ont un coût de production élevé.",
              "Transporter plus de dattes que votre quota de bagages ne le permet : les dattes sont lourdes et volumineuses. Prévoyez le poids dans votre allocation de bagages.",
              "Oublier de vérifier les dates de péremption sur les coffrets fermés : certains lots ont une durée de conservation limitée, surtout pour les dattes fraîches.",
              "Confondre les variétés : les vendeurs peu scrupuleux peuvent proposer de la Mabroum ou de la Sukkari sous l'appellation Ajwa. La vraie Ajwa est petite, noire, ridée et d'une douceur particulière.",
              "Ne pas négocier : c'est une pratique attendue dans ce contexte commercial, et refuser de négocier peut être perçu comme un manque d'intérêt.",
            ],
          },
        ],
      },
    ],
    faq: [
      { question: "Qu'est-ce qui rend les dattes Ajwa si spéciales ?", answer: "La datte Ajwa est la seule variété nommément citée dans les hadiths authentiques du Prophète ﷺ avec une vertu spécifique (Bukhari n° 5445, Muslim n° 2047). Elle est produite dans la zone d'Al-Aliya, près de Médine, dans un microclimat particulier. Sa texture moelleuse, sa saveur douce et légèrement caramélisée, et sa petite taille la distinguent des autres variétés." },
      { question: "Comment reconnaître de vraies dattes Ajwa ?", answer: "La vraie Ajwa de Médine est petite (3 à 4 cm), noire ridée, moelleuse et non collante. Elle a une saveur douce et légèrement chocolatée. Une Ajwa de grande taille, brillante ou très sucrée est probablement une variété différente. Le prix (80 à 150 SAR/kg) et la provenance mentionnée (Al-Aliya, Médine) sont des indicateurs fiables." },
      { question: "Combien de dattes manger par jour selon la Sunnah ?", answer: "Le hadith mentionne sept dattes Ajwa le matin. Plus généralement, le Prophète ﷺ mangeait les dattes en nombre impair. Aucune quantité précise n'est prescrite comme obligation religieuse : le hadith sur les sept dattes indique une vertu protectrice, pas une obligation." },
      { question: "Quelles autres variétés acheter à Médine ?", answer: "La Sukkari (dorée, fondante, très accessible) est la préférée des locaux. La Medjool est idéale pour les coffrets cadeaux (grosse et impressionnante visuellement). La Mabroum est longue et fibreuse. La Khalas est très sucrée et petite. Acheter un assortiment de 3 à 4 variétés est une excellente option." },
      { question: "Peut-on les ramener dans son bagage à l'avion ?", answer: "Oui, les dattes sont autorisées dans les bagages en soute sans restriction particulière. En cabine, les dattes emballées sont permises. Les pâtes de dattes ou produits dérivés liquides sont soumis aux restrictions habituelles des liquides en cabine." },
      { question: "Doit-on négocier les prix ?", answer: "Oui, la négociation est attendue et normale dans les marchés traditionnels de Médine. Proposer 70 à 80% du prix affiché est une pratique courante. Pour les achats importants (plusieurs kilos), la marge de négociation est plus grande. Les boutiques modernes avec prix fixes existent aussi si vous préférez éviter la négociation." },
      { question: "Combien coûtent les Ajwa au kilogramme ?", answer: "Les Ajwa authentiques de Médine coûtent entre 80 et 150 SAR/kg (environ 20 à 40 EUR) selon la qualité. Les Ajwa premium de première récolte peuvent atteindre 200 SAR/kg. Les prix inférieurs à 60 SAR/kg doivent alerter sur l'authenticité ou la provenance." },
      { question: "Quels sont les bienfaits santé des dattes ?", answer: "Les dattes sont riches en fibres, potassium, magnésium, fer et vitamines B. Elles fournissent une énergie rapide et soutenue. Leur indice glycémique, bien que présent, est modéré grâce à leur teneur en fibres. La science moderne confirme leurs propriétés antioxydantes et anti-inflammatoires, sans que cela constitue une garantie médicale au sens clinique." },
    ],
  },
};
