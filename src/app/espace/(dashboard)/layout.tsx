'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function PelerinLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FDFBF7', color: '#1A1209', fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 260,
        background: 'white',
        borderRight: '1px solid #E8DFC8',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: mobileOpen ? 0 : undefined,
        bottom: 0,
        zIndex: 50,
        overflowY: 'auto',
        flexShrink: 0,
        transition: 'transform 0.25s',
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }} className={mobileOpen ? 'flex' : 'hidden lg:flex'}>

        {/* Logo */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #FAF3E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 600, color: '#1A1209', textDecoration: 'none' }}>
            SAFAR<span style={{ color: '#C9A84C' }}>U</span>NA
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#7A6D5A' }}>✕</button>
        </div>

        {/* User */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FAF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#C9A84C', flexShrink: 0, border: '1px solid #F0D897' }}>
            KL
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1209', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Karim Lamrani</div>
            <Link href="/espace/profil" style={{ fontSize: '0.72rem', color: '#7A6D5A', textDecoration: 'none', marginTop: 2, display: 'inline-block' }}>Voir le profil →</Link>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
          <SidebarSection label="Mon voyage" />
          <SidebarLink href="/espace/tableau-de-bord" icon="🏠" label="Accueil" isActive={isActive('/espace/tableau-de-bord')} onClick={() => setMobileOpen(false)} />
          <SidebarLink href="/espace/reservations"   icon="🌴" label="Mes Réservations" isActive={isActive('/espace/reservations')} onClick={() => setMobileOpen(false)} />
          <SidebarLink href="/espace/messages"        icon="💬" label="Messages" badge="1" badgeColor="#1A4A8A" isActive={isActive('/espace/messages')} onClick={() => setMobileOpen(false)} />

          <SidebarSection label="Spiritualité & Préparation" />
          <SidebarLink href="/espace/academy"   icon="🎓" label="Safaruna Academy"   isActive={isActive('/espace/academy')} onClick={() => setMobileOpen(false)} />
          <SidebarLink href="/espace/dua"       icon="🤲" label="Mon carnet de Du'a" isActive={isActive('/espace/dua')} onClick={() => setMobileOpen(false)} />
          <SidebarLink href="/espace/checklist" icon="📋" label="Ma Checklist"       isActive={isActive('/espace/checklist')} onClick={() => setMobileOpen(false)} />
          <SidebarLink href="/espace/favoris"   icon="❤️" label="Mes Favoris"        isActive={isActive('/espace/favoris')} onClick={() => setMobileOpen(false)} />

          <div style={{ margin: '0.75rem 1.5rem', borderTop: '1px solid #E8DFC8' }}></div>

          <SidebarLink href="/espace/profil"    icon="👤" label="Modifier mon profil" isActive={isActive('/espace/profil')} onClick={() => setMobileOpen(false)} />
          <SidebarLink href="/espace/parrainage" icon="🎁" label="Parrainage" badge="50€ offerts" badgeColor="#1D5C3A" isActive={isActive('/espace/parrainage')} onClick={() => setMobileOpen(false)} />
          <SidebarLink href="/espace/parametres" icon="⚙️" label="Paramètres" isActive={isActive('/espace/parametres')} onClick={() => setMobileOpen(false)} />
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E8DFC8' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 700, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49 }}
          className="lg:hidden"
        />
      )}

      {/* ── MAIN CONTENT ── */}
      {/* KEY FIX: margin-left in inline style (wins over Tailwind), 0 on mobile via CSS class */}
      <div className="main-content-pelerin" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .main-content-pelerin { margin-left: 0; }
          @media (min-width: 1024px) { .main-content-pelerin { margin-left: 260px; } }
        `}} />

        {/* Topbar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E8DFC8', padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger — visible only on mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden"
              style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #E8DFC8', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}
            >
              ☰
            </button>
            <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', color: '#1A1209', fontWeight: 400 }}>Espace Pèlerin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', border: '1px solid #E8DFC8', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem' }}>
              🔔
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#C0392B', border: '2px solid white' }}></span>
            </button>
            <Link href="/guides" style={{ padding: '0.5rem 1.25rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700, background: '#1A1209', color: '#F0D897', textDecoration: 'none' }}>
              Trouver un guide
            </Link>
          </div>
        </div>

        <main style={{ padding: '2rem 1.5rem', maxWidth: 1200, width: '100%', margin: '0 auto', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarSection({ label }: { label: string }) {
  return (
    <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(122,109,90,0.5)', padding: '0.75rem 1.5rem 0.4rem' }}>
      {label}
    </div>
  );
}

function SidebarLink({ href, icon, label, isActive, badge, badgeColor, onClick }: {
  href: string; icon: string; label: string; isActive: boolean;
  badge?: string; badgeColor?: string; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.6rem 1.5rem', textDecoration: 'none',
      fontSize: '0.875rem', fontWeight: isActive ? 700 : 500,
      color: isActive ? '#8B6914' : '#7A6D5A',
      background: isActive ? '#FAF3E0' : 'transparent',
      borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent',
      transition: 'all 0.15s',
    }}>
      <span style={{ width: 20, textAlign: 'center', fontSize: '1rem' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{ background: badgeColor || '#1A4A8A', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 50 }}>
          {badge}
        </span>
      )}
    </Link>
  );
}
