import type { Metadata } from "next";
import CertificationClient from "./CertificationClient";

export const metadata: Metadata = {
  title: "Nos guides certifiés SAFARUMA | Vérification & expertise",
  description:
    "Tous nos guides privés Omra sont vérifiés par SAFARUMA : expérience terrain, connaissances islamiques, compétences linguistiques. Découvrez notre processus de certification.",
  keywords: [
    "guides certifiés omra",
    "vérification guide omra",
    "guide privé certifié",
    "certification guide safaruma",
    "guide omra certifié",
    "badge guide pèlerinage",
  ],
  openGraph: {
    title: "Nos guides certifiés SAFARUMA | Vérification & expertise",
    description:
      "Connaissance islamique, savoir-faire terrain, éthique et confiance : découvrez le protocole strict qui certifie les guides SAFARUMA.",
    url: "https://safaruma.com/nos-guides-certifies",
    siteName: "SAFARUMA",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nos guides certifiés SAFARUMA | Vérification & expertise",
    description:
      "Un protocole de certification développé avec des savants islamiques reconnus pour garantir l'excellence de chaque guide.",
  },
  alternates: {
    canonical: "https://safaruma.com/nos-guides-certifies",
  },
};

export default function NosGuidesCertifiesPage() {
  return <CertificationClient />;
}
