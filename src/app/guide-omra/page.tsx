import type { Metadata, Viewport } from "next";
import GuideOmraClient from "./GuideOmraClient";

export const viewport: Viewport = { themeColor: '#FAF7F0' };

export const metadata: Metadata = {
  title: "La Omra étape par étape 2026 — Rituels, Du'as & Conseils | SAFARUMA",
  description:
    "Guide spirituel complet de la Omra : Ihram, Tawaf, Sa'i, Tahallul. Chaque rituel expliqué simplement avec ses du'as et ses conseils pratiques.",
  keywords: [
    "guide omra",
    "comment faire la omra",
    "rituels omra",
    "ihram tawaf sai tahallul",
    "dua omra",
    "checklist omra",
    "guide spirituel omra",
    "safaruma",
  ],
  openGraph: {
    title: "La Omra étape par étape — SAFARUMA",
    description: "De l'Ihram au Tahallul, chaque rituel expliqué simplement.",
    url: "https://safaruma.com/guide-omra",
    siteName: "SAFARUMA",
    locale: "fr_FR",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guide complet de la Omra — SAFARUMA",
    description:
      "Ihram, Tawaf, Sa'i, Tahallul : chaque rituel expliqué avec les du'as et conseils pratiques.",
  },
  alternates: {
    canonical: "https://safaruma.com/guide-omra",
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: "La Omra étape par étape 2026 — Rituels, Du'as & Conseils",
  description: "Guide spirituel complet de la Omra : Ihram, Tawaf, Sa'i, Tahallul.",
  url: 'https://safaruma.com/guide-omra',
  publisher: { '@type': 'Organization', name: 'SAFARUMA', url: 'https://safaruma.com' },
  isAccessibleForFree: false,
  hasPart: {
    '@type': 'WebPageElement',
    isAccessibleForFree: false,
    cssSelector: '.guide-gate-blur',
  },
};

export default function GuideOmraPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideOmraClient />
    </>
  );
}
