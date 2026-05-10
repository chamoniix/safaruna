import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import ConditionalWhatsApp from "@/components/ConditionalWhatsApp";
import Providers from "@/components/Providers";
import { GoogleTagManager } from '@next/third-parties/google';

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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-logo.png', type: 'image/png' },
    ],
    apple: { url: '/icon-logo.png', type: 'image/png' },
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://safaruma.com/#organization",
                "name": "SAFARUMA",
                "legalName": "HOLDINGAI LTD",
                "url": "https://safaruma.com",
                "logo": { "@type": "ImageObject", "url": "https://safaruma.com/icon-logo.png", "width": 512, "height": 512 },
                "description": "Plateforme francophone de guides privés certifiés pour la Omra à La Mecque et Médine.",
                "slogan": "La première plateforme dédiée aux guides privés pour la Omra",
                "address": { "@type": "PostalAddress", "streetAddress": "Wareham Road", "addressLocality": "Freeland Park, Poole", "postalCode": "BH16 6FA", "addressCountry": "GB" },
                "areaServed": ["FR","BE","CH","MC","LU","MA","DZ","TN","SN","CI","ML","BF","GN","NE","TG","BJ","CM","GA","CA"],
                "knowsAbout": ["Omra","Pèlerinage islamique","La Mecque","Médine","Tawaf","Sa'i","Ihram","Lieux saints"],
                "sameAs": [
                  "https://www.instagram.com/safaruma_",
                  "https://www.tiktok.com/@safaruma",
                  "https://x.com/safaruma",
                  "https://www.snapchat.com/add/safaruma",
                  "https://youtube.com/@safaruma",
                  "https://pin.it/2AfX27PBM",
                  "https://www.linkedin.com/company/safaruma"
                ]
              },
              {
                "@type": "WebSite",
                "@id": "https://safaruma.com/#website",
                "url": "https://safaruma.com",
                "name": "SAFARUMA",
                "inLanguage": "fr-FR",
                "publisher": { "@id": "https://safaruma.com/#organization" }
              }
            ]
          }) }}
        />
      </head>
      <body className="antialiased font-sans bg-[var(--cream)] text-[var(--deep)]">
        <a href="#main-content" className="skip-link">Passer au contenu principal</a>
        <Providers>
          <main id="main-content">
            {children}
          </main>
        </Providers>
        <ConditionalWhatsApp />
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        )}
      </body>
    </html>
  );
}
