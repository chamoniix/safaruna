'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAvailable, setIsAvailable] = useState(true);
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF7F0', color: '#1A1209', fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>
      {/* SIDEBAR — inline styles to circumvent globals.css nav rule */}
      <div style={{
        width: 250,
        background: '#1A1209',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        overflowY: 'auto',
        flexShrink: 0,
      }} className="hidden md:flex">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 600, color: 'white', textDecoration: 'none' }}>
            SAFAR<span style={{ color: '#C9A84C' }}>U</span>NA
          </Link>
          <span style={{ background: '#C9A84C', color: '#1A1209', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: 50 }}>Guide</span>
        </div>
        
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>رم</div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: isAvailable ? '#27AE60' : '#aaa', border: '2px solid #1A1209' }}></div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Rachid Al-Madani</div>
            <div style={{ fontSize: '0.7rem', color: '#C9A84C' }}>★★★★★ 4.97</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, cursor: 'pointer' }} onClick={() => setIsAvailable(!isAvailable)}>
              <div style={{ width: 28, height: 14, borderRadius: 50, background: isAvailable ? '#27AE60' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 2, width: 10, height: 10, borderRadius: '50%', background: 'white', transition: 'left 0.2s', left: isAvailable ? 16 : 2 }}></div>
              </div>
              <span style={{ fontSize: '0.625rem', color: isAvailable ? '#6EC68A' : 'rgba(255,255,255,0.4)' }}>{isAvailable ? 'Disponible' : 'Indisponible'}</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <GuideSection label="Tableau de bord" />
          <GuideLink href="/guide/tableau-de-bord" icon="🏠" label="Accueil" isActive={isActive('/guide/tableau-de-bord')} />
          <GuideLink href="/guide/demandes" icon="📥" label="Demandes" badge="3" isActive={isActive('/guide/demandes')} />
          <GuideLink href="/guide/missions" icon="📋" label="Mes missions" isActive={isActive('/guide/missions')} />
          <GuideLink href="/guide/messages" icon="💬" label="Messages" badge="5" isActive={isActive('/guide/messages')} />

          <GuideSection label="Gestion" />
          <GuideLink href="/guide/calendrier" icon="📅" label="Calendrier" isActive={isActive('/guide/calendrier')} />
          <GuideLink href="/guide/revenus" icon="💰" label="Mes revenus" isActive={isActive('/guide/revenus')} />
          <GuideLink href="/guide/avis" icon="⭐" label="Mes avis" isActive={isActive('/guide/avis')} />

          <GuideSection label="Mon profil" />
          <GuideLink href="/guide/profil" icon="👤" label="Modifier profil" isActive={isActive('/guide/profil')} />
          <GuideLink href="/guide/forfaits" icon="📦" label="Mes forfaits" isActive={isActive('/guide/forfaits')} />
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/charte" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
            <span>🔒</span> Charte SAFARUNA
          </Link>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </div>

      {/* MAIN CONTENT — margin-left via CSS class to avoid inline-style override */}
      <div className="main-content-guide" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .main-content-guide { margin-left: 0; }
          @media (min-width: 768px) { .main-content-guide { margin-left: 250px; } }
        `}} />
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(250,247,240,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E8DFC8', padding: '1rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', color: '#1A1209' }}>Tableau de bord guide</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', border: '1px solid #E8DFC8', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
              🔔
              <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: '#C0392B', border: '2px solid white' }}></span>
            </button>
            <button style={{ padding: '0.4rem 1rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: '#1A1209', color: '#F0D897', border: 'none', cursor: 'pointer' }}>Partager profil</button>
            <button style={{ padding: '0.4rem 1rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: '#C9A84C', color: '#1A1209', border: 'none', cursor: 'pointer' }}>+ Dispo</button>
          </div>
        </div>

        <main style={{ padding: '2rem', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function GuideSection({ label }: { label: string }) {
  return (
    <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.5rem 0.35rem' }}>
      {label}
    </div>
  );
}

function GuideLink({ href, icon, label, isActive, badge }: { href: string; icon: string; label: string; isActive: boolean; badge?: string }) {
  return (
    <Link href={href} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.55rem 1.5rem',
      textDecoration: 'none',
      fontSize: '0.875rem',
      fontWeight: isActive ? 700 : 400,
      color: isActive ? '#F0D897' : 'rgba(255,255,255,0.5)',
      background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
      borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
      transition: 'all 0.15s',
    }}>
      <span style={{ width: 16, textAlign: 'center', fontSize: '0.9rem' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{ background: '#C0392B', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 50, minWidth: 16, textAlign: 'center' }}>{badge}</span>
      )}
    </Link>
  );
}
