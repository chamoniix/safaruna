import React from 'react';
import type { Viewport } from 'next';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const viewport: Viewport = { themeColor: '#FAF7F0' };
import Link from 'next/link';
import { IconShield, IconCar, IconAccessibility, IconBuilding, IconDocument, IconGraduationCap } from '@/components/Icons';

const WHATSAPP = 'https://wa.me/message/ZGUPRJRNVJRGN1';

const WhatsAppSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

type Service = {
  href: string;
  badge: string;
  icon: React.ReactNode;
  arabic: string;
  title: string;
  desc: string;
  features: string[];
  price: string;
  color: string;
  bgLight: string;
  whatsapp?: boolean;
};

const SERVICES: Service[] = [
  {
    href: '/guides',
    badge: 'Guide certifié',
    icon: <IconGraduationCap size={36} stroke="#C9A84C" />,
    arabic: 'مرشد',
    title: 'Guide privé certifié',
    desc: 'Chaque guide Safaruma est sélectionné, interviewé et certifié. Maîtrise des rituels, connaissance des lieux saints, accompagnement en français — votre guide est là du premier au dernier rite.',
    features: ['Certification Safaruma vérifiée', 'Maîtrise des rituels Omra', 'Francophone natif', 'Accompagnement du début à la fin'],
    price: 'Sur devis',
    color: '#8B6914',
    bgLight: '#FAF3E0',
  },
  {
    href: '/services/transfert',
    badge: 'Transport',
    icon: <IconCar size={36} stroke="#C9A84C" />,
    arabic: 'نقل',
    title: 'Transfert & Transport',
    desc: 'Navettes aéroport, transferts Makkah–Madinah, véhicules privés avec chauffeur certifié. Ponctualité garantie.',
    features: ['Aéroports JED & MED', 'Navette Makkah → Madinah', 'Véhicule privé 4–8 places', 'Suivi temps réel'],
    price: 'À partir de 45€',
    color: '#1D5C3A',
    bgLight: '#EAF4EE',
  },
  {
    href: '/guides',
    badge: 'Accessibilité',
    icon: <IconAccessibility size={36} stroke="#C9A84C" />,
    arabic: 'إمكانية',
    title: 'Prise en charge PMR',
    desc: 'Votre guide planifie et met en place tous les besoins liés à votre mobilité réduite — voiture adaptée, fauteuil roulant, assistant sur place. Vous vous concentrez sur le spirituel, il gère le reste.',
    features: ['Véhicule adapté réservé', 'Fauteuil roulant coordonné', 'Assistant disponible', 'Accès PMR Haram & Nabawi'],
    price: 'Inclus dans le guide',
    color: '#1A4A7A',
    bgLight: '#EAF0F8',
  },
  {
    href: '/services/hotels',
    badge: 'Hébergement',
    icon: <IconBuilding size={36} stroke="#C9A84C" />,
    arabic: 'فندق',
    title: 'Hôtels & Hébergement',
    desc: "Sélection d'hôtels à Makkah et Madinah triés sur le volet — proximité Haram, confort, rapport qualité-prix.",
    features: ['Vue Kaaba disponible', 'Makkah & Madinah', 'Check-in facilité', 'Annulation flexible'],
    price: 'À partir de 89€/nuit',
    color: '#7A3A1A',
    bgLight: '#F8F0EA',
    whatsapp: true,
  },
  {
    href: '/services/visa',
    badge: 'Visa',
    icon: <IconDocument size={36} stroke="#C9A84C" />,
    arabic: 'تأشيرة',
    title: 'Assistance Visa Omra',
    desc: "Traitement complet de votre demande de visa Omra. Documents, soumission et suivi jusqu'à l'obtention.",
    features: ['Dossier complet inclus', 'Suivi de demande', 'Délai express disponible', 'Assistance 7j/7'],
    price: 'À partir de 79€',
    color: '#1A4A7A',
    bgLight: '#EAF0F8',
    whatsapp: true,
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar transparentOnHero scrollThreshold={280} />

      {/* Hero */}
      <section style={{ background: '#1A1209', padding: '6rem 1.5rem 5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Nos services</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, color: 'white', lineHeight: 1.05, margin: '0 0 1.25rem' }}>
            Tout pour votre<br />
            <span style={{ color: '#C9A84C' }}>voyage spirituel</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 2.5rem', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Guide certifié, transferts, accessibilité, visa et hébergement — des services pensés pour que vous puissiez vous concentrer sur l&apos;essentiel.
          </p>
          <Link href="/guides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', borderRadius: 50, background: '#C9A84C', color: '#1A1209', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.04em' }}>
            Trouver un guide →
          </Link>
        </div>
      </section>

      {/* Services grid */}
      <section style={{ background: '#F5F2EC', padding: '5rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {SERVICES.map((s) => (
              <div key={s.title} style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(26,18,9,0.06)' }}>

                {/* Card header */}
                <div style={{ background: '#1A1209', padding: '2rem 1.75rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -10, top: -10, fontSize: '5rem', opacity: 0.07, fontFamily: 'serif', color: 'white', userSelect: 'none', lineHeight: 1 }}>{s.arabic}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    <div>
                      <span style={{ background: s.bgLight, color: s.color, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.2rem 0.65rem', borderRadius: 50, marginBottom: '0.75rem', display: 'inline-block' }}>{s.badge}</span>
                      <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.2 }}>{s.title}</h2>
                    </div>
                    <div style={{ flexShrink: 0, opacity: 0.9 }}>{s.icon}</div>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '1.5rem 1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <p style={{ fontSize: '0.875rem', color: '#5A4E3A', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {s.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#5A4E3A' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#FAF7F0', border: '1px solid #EDE8DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#C9A84C', flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #F5F2EC', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#AEA491', marginBottom: '0.1rem' }}>Tarif</div>
                        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>{s.price}</div>
                      </div>
                      <Link href={s.href} style={{ padding: '0.65rem 1.5rem', borderRadius: 50, background: '#1A1209', color: '#F0D897', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        En savoir plus →
                      </Link>
                    </div>
                    {s.whatsapp && (
                      <a
                        href={WHATSAPP}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', borderRadius: 50, background: '#25D366', color: 'white', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.02em' }}
                      >
                        <WhatsAppSVG />
                        Pas envie d&apos;attendre ? Nous contacter
                      </a>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Bundle banner — Bientôt disponible */}
          <div style={{ marginTop: '3rem', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(26,18,9,0.1)' }}>
            <div style={{ background: '#C9A84C', color: '#1A1209', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', padding: '0.45rem' }}>
              Bientôt disponible
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1A1209 0%, #2C1F0E 100%)', padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Offre complète</div>
                <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: 'white', margin: '0 0 0.5rem', lineHeight: 1.2 }}>Guide + Services<br />en bundle</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.65 }}>Combinez guide certifié, transferts, visa et hébergement. Économisez jusqu&apos;à 20% sur votre pack complet.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Guide certifié inclus', 'Transferts aéroport', 'Assistance visa', 'Hôtel Makkah & Madinah'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ color: '#C9A84C', fontSize: '0.75rem' }}>✦</span> {item}
                  </div>
                ))}
                <button disabled style={{ marginTop: '0.5rem', padding: '0.85rem 2rem', borderRadius: 50, background: 'rgba(201,168,76,.3)', color: 'rgba(201,168,76,.6)', border: 'none', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em', cursor: 'not-allowed', textAlign: 'center' }}>
                  Bientôt disponible
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
