import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/AnnouncementBar";
import WhatsAppButton from "@/components/WhatsAppButton";

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
  title: "SAFARUMA — Le voyage vers tes origines commence ici.",
  description: "SAFARUMA connecte les voyageurs avec des guides privés certifiés pour vivre la Omra, découvrir l'histoire de l'Islam et retrouver ses origines spirituelles. 320 guides certifiés, 12 langues.",
  keywords: ["omra", "guide omra", "umrah", "guide privé", "arabie saoudite", "makkah", "madinah", "pèlerinage", "guide islamique"],
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
  openGraph: {
    title: 'SAFARUMA — Le voyage vers tes origines commence ici',
    description: 'Guides privés certifiés pour la Omra, la découverte historique et le tourisme spirituel.',
    url: 'https://safaruma.com',
    siteName: 'SAFARUMA',
    images: [{ url: '/logo.png', width: 1200, height: 630 }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SAFARUMA — Le voyage vers tes origines commence ici.",
    description: "SAFARUMA connecte les voyageurs avec des guides privés certifiés pour vivre la Omra, découvrir l'histoire de l'Islam et retrouver ses origines spirituelles. 320 guides certifiés, 12 langues.",
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://safaruma.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="antialiased font-sans bg-[var(--cream)] text-[var(--deep)]">
        <AnnouncementBar />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
