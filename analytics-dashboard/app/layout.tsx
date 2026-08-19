import type { Metadata } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import './globals.css'

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' })
const body = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' })

export const metadata: Metadata = {
  title: 'SAFARUMA Analytics',
  description: 'Tableau de bord privé SAFARUMA',
  robots: { index: false, follow: false, nocache: true },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" className={`${display.variable} ${body.variable}`}><body>{children}</body></html>
}
