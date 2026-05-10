export type SectionBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'list'; items: string[] }
  | { type: 'callout'; text: string; reference: string }
  | { type: 'stats'; items: { label: string; value: string }[] }
  | { type: 'rituals'; items: { icon: 'rotate-cw' | 'droplets' | 'heart'; title: string; description: string }[] }
  | { type: 'expert-tip'; title?: string; text: string };

export type LieuSection = {
  id: string;
  title: string;
  content: SectionBlock[];
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
};
