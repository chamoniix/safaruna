import type { Metadata } from "next";
import GuideOmraClient from "./GuideOmraClient";

export const metadata: Metadata = {
  title: "La Omra étape par étape — Rituels, Du'as & Conseils | SAFARUMA",
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

export default function GuideOmraPage() {
  return <GuideOmraClient />;
}
