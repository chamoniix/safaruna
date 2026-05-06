import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import ConditionalWhatsApp from "@/components/ConditionalWhatsApp";
import Providers from "@/components/Providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-cormorant",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://safaruma.com'),
  title: "Guide privé Omra certifié à La Mecque & Médine | SAFARUMA",
  description: "SAFARUMA connecte les pèlerins avec des guides privés certifiés pour la Omra à La Mecque et Médine. 15+ guides vérifiés, 17 langues, accompagnement personnalisé PMR.",
  keywords: ["guide omra", "guide privé omra", "guide francophone La Mecque", "omra avec guide", "guide omra certifié", "omra privée", "guide Médine", "omra famille", "omra PMR", "umrah guide"],

  openGraph: {
    title: 'SAFARUMA — Le voyage vers tes origines commence ici',
    description: 'Guides privés certifiés pour la Omra, la découverte historique et le tourisme spirituel.',
    url: 'https://safaruma.com',
    siteName: 'SAFARUMA',
    images: [{ url: '/icon-logo.png', width: 800, height: 800, alt: 'SAFARUMA' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'SAFARUMA',
    images: ['/icon-logo.png'],
  },
  alternates: {
    canonical: 'https://safaruma.com',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading headers opts this layout into dynamic rendering, which is required
  // for Next.js to extract and apply the per-request nonce from the CSP header.
  const nonce = (await headers()).get('x-nonce') ?? '';
  void nonce; // nonce is consumed automatically by Next.js from the CSP header
  return (
    <html lang="fr" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-sans bg-[var(--cream)] text-[var(--deep)]">
        <a href="#main-content" className="skip-link">Passer au contenu principal</a>
        <Providers>
          <main id="main-content">
            {children}
          </main>
        </Providers>
        <ConditionalWhatsApp />
      </body>
    </html>
  );
}
