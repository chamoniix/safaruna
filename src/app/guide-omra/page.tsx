import type { Metadata } from "next";
import GuideOmraClient from "./GuideOmraClient";

export const metadata: Metadata = {
  title: "Guide complet de la Omra 2025 — Rituels, Du'as & Conseils | SAFARUMA",
  description:
    "Guide spirituel complet de la Omra : Ihram, Tawaf, Sa'i, Tahallul — chaque rituel expliqué étape par étape avec les du'as, conseils pratiques et checklist de préparation.",
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
    title: "Guide complet de la Omra — SAFARUMA",
    description:
      "Tout ce qu'il faut savoir pour accomplir la Omra dans les meilleures conditions spirituelles : rituels, du'as, conseils et checklist.",
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

export default function GuideOmraPage() {
  return <GuideOmraClient />;
}
