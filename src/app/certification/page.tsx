import type { Metadata } from "next";
import CertificationClient from "./CertificationClient";

export const metadata: Metadata = {
  title: "Certification SAFARUMA — Le gage de confiance islamique pour les guides Omra",
  description:
    "Découvrez le protocole de certification SAFARUMA : processus en 3 étapes, badge certifié, Board de validation islamique. Réservez un guide certifié ou passez la certification.",
  keywords: [
    "certification guide omra",
    "guide certifié safaruma",
    "mutawwif certifié",
    "badge guide omra",
    "formation guide pèlerinage",
    "certification islamique guide",
    "safaruma certification",
  ],
  openGraph: {
    title: "Certification SAFARUMA — Le gage de confiance islamique",
    description:
      "Connaissance islamique, savoir-faire terrain, éthique et confiance : découvrez le protocole strict qui certifie les guides SAFARUMA.",
    url: "https://safaruma.com/certification",
    siteName: "SAFARUMA",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Certification SAFARUMA — Le gage de confiance islamique",
    description:
      "Un protocole de certification développé avec des savants islamiques reconnus pour garantir l'excellence de chaque guide.",
  },
  alternates: {
    canonical: "https://safaruma.com/certification",
  },
};

export default function CertificationPage() {
  return <CertificationClient />;
}
