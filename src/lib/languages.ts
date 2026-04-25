/**
 * Source de vérité unique pour les langues guides.
 * Le `code` est stocké en DB (GuideLanguage.languageCode).
 * Le `label` est affiché partout (filtre client, profil guide, fiche guide).
 * Le filtre /guides envoie le `code` en query param → API filtre par `languageCode`.
 */
export const GUIDE_LANGUAGES = [
  { code: 'fr',        label: '🇫🇷 Français' },
  { code: 'ar',        label: '🇸🇦 Arabe' },
  { code: 'en',        label: '🇬🇧 English' },
  { code: 'darija',    label: '🇲🇦 Darija (Maroc)' },
  { code: 'algerien',  label: '🇩🇿 Algérien' },
  { code: 'tunisien',  label: '🇹🇳 Tunisien' },
  { code: 'wolof',     label: '🇸🇳 Wolof' },
  { code: 'bambara',   label: '🎵 Bambara' },
  { code: 'fulfulde',  label: '🇲🇱 Fulfuldé' },
  { code: 'turk',      label: '🇹🇷 Türkçe' },
  { code: 'bahasa_id', label: '🇮🇩 Bahasa Indonesia' },
  { code: 'bahasa_my', label: '🇲🇾 Bahasa Melayu' },
  { code: 'urdu',      label: '🇵🇰 Urdu' },
  { code: 'punjabi',   label: '🌿 Punjabi' },
  { code: 'bengali',   label: '🇧🇩 Bengali' },
  { code: 'hindi',     label: '🇮🇳 Hindi' },
  { code: 'tamil',     label: '🇮🇳 Tamil' },
  { code: 'farsi',     label: '🇮🇷 Farsi (Persan)' },
  { code: 'azeri',     label: '🇦🇿 Azéri' },
  { code: 'ouzbek',    label: '🇺🇿 Ouzbek' },
  { code: 'kazakh',    label: '🇰🇿 Kazakh' },
  { code: 'haoussa',   label: '🌍 Haoussa' },
  { code: 'somali',    label: '🌍 Somali' },
  { code: 'swahili',   label: '🌍 Swahili' },
  { code: 'amharique', label: '🌍 Amharique' },
  { code: 'russe',     label: '🇷🇺 Russe' },
  { code: 'mandarin',  label: '🇨🇳 Mandarin' },
  { code: 'espanol',   label: '🇪🇸 Español' },
  { code: 'portugues', label: '🇵🇹 Português' },
  { code: 'deutsch',   label: '🇩🇪 Deutsch' },
  { code: 'kabyle',    label: '🏔️ Kabyle' },
  { code: 'chleuh',    label: '🏔️ Chleuh (Tachelhit)' },
  { code: 'tamazight', label: '🏔️ Tamazight (Souss)' },
  { code: 'dioula',    label: '🌿 Dioula' },
  { code: 'moore',     label: '🌿 Mooré' },
] as const;

export type LanguageCode = typeof GUIDE_LANGUAGES[number]['code'];

/** code → label affiché */
export const LANG_CODE_TO_LABEL: Record<string, string> = Object.fromEntries(
  GUIDE_LANGUAGES.map(l => [l.code, l.label])
);
