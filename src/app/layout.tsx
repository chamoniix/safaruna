import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/AnnouncementBar";

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
  openGraph: {
    type: 'website',
    url: 'https://safaruma.com',
    siteName: 'SAFARUMA',
    title: "SAFARUMA — Le voyage vers tes origines commence ici.",
    description: "SAFARUMA connecte les voyageurs avec des guides privés certifiés pour vivre la Omra, découvrir l'histoire de l'Islam et retrouver ses origines spirituelles. 320 guides certifiés, 12 langues.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SAFARUMA' }],
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
      </body>
    </html>
  );
}
