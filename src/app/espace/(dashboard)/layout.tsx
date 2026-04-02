'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { section: 'Mon voyage', items: [
    { href: '/espace/tableau-de-bord', icon: '⌂', label: 'Tableau de bord' },
    { href: '/espace/reservations',    icon: '✦', label: 'Mes Réservations' },
    { href: '/espace/messages',        icon: '◎', label: 'Messages', badge: '2', badgeColor: '#C9A84C' },
  ]},
  { section: 'Spiritualité', items: [
    { href: '/espace/academy',   icon: '▶', label: 'Safaruna Academy' },
    { href: '/espace/dua',       icon: '◆', label: 'Carnet de Du\'a' },
    { href: '/espace/checklist', icon: '☑', label: 'Ma Checklist', badge: '6/12', badgeColor: '#1D5C3A' },
    { href: '/espace/favoris',   icon: '♡', label: 'Mes Favoris' },
  ]},
];

export default function PelerinLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');

  return (
    <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: 'var(--font-manrope, sans-serif)', color: '#1A1209' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
        background: '#FFFFFF', borderRight: '1px solid #EDE8DC',
        display: 'flex', flexDirection: 'column', zIndex: 60,
        overflowY: 'auto',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }} className={open ? 'sidebar-open' : 'sidebar-closed'}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 1023px) { .sidebar-closed { transform: translateX(-100%); } .sidebar-open { transform: translateX(0); } }
          @media (min-width: 1024px) { .sidebar-closed, .sidebar-open { transform: translateX(0); } }
          .nav-link { transition: background 0.15s, color 0.15s; }
          .nav-link:hover { background: #FAF7F0 !important; }
          .sb-logout:hover { color: #C0392B !important; }
        `}} />

        {/* Brand */}
        <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid #EDE8DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', textDecoration: 'none', letterSpacing: '0.04em' }}>
            SAFAR<span style={{ color: '#C9A84C' }}>U</span>NA
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6D5A', fontSize: '1.1rem', lineHeight: 1 }}>✕</button>
        </div>

        {/* User profile */}
        <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid #EDE8DC', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#1A1209', flexShrink: 0, border: '2px solid #EDE8DC' }}>
            KL
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Karim Lamrani</div>
            <Link href="/espace/profil" style={{ fontSize: '0.68rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>Modifier le profil →</Link>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          {NAV.map((group) => (
            <div key={group.section}>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(122,109,90,0.45)', padding: '1rem 1.5rem 0.4rem' }}>
                {group.section}
              </div>
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="nav-link" style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 1.5rem', textDecoration: 'none',
                  fontSize: '0.82rem', fontWeight: isActive(item.href) ? 700 : 500,
                  color: isActive(item.href) ? '#8B6914' : '#5A4E3A',
                  background: isActive(item.href) ? '#FDF5E0' : 'transparent',
                  borderLeft: `3px solid ${isActive(item.href) ? '#C9A84C' : 'transparent'}`,
                  borderRadius: '0 8px 8px 0',
                  marginRight: '0.75rem',
                }}>
                  <span style={{ width: 18, textAlign: 'center', fontSize: '0.9rem', flexShrink: 0, opacity: isActive(item.href) ? 1 : 0.55 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ background: item.badgeColor, color: item.badgeColor === '#C9A84C' ? '#1A1209' : 'white', fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 50, flexShrink: 0 }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}

          <div style={{ height: 1, background: '#EDE8DC', margin: '0.75rem 1.5rem' }} />

          {[
            { href: '/espace/profil',     icon: '◎', label: 'Mon profil' },
            { href: '/espace/parrainage', icon: '✦', label: 'Parrainage', badge: '50€', badgeColor: '#1D5C3A' },
            { href: '/espace/parametres', icon: '⚙', label: 'Paramètres' },
          ].map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="nav-link" style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.6rem 1.5rem', textDecoration: 'none',
              fontSize: '0.82rem', fontWeight: isActive(item.href) ? 700 : 500,
              color: isActive(item.href) ? '#8B6914' : '#5A4E3A',
              background: isActive(item.href) ? '#FDF5E0' : 'transparent',
              borderLeft: `3px solid ${isActive(item.href) ? '#C9A84C' : 'transparent'}`,
              borderRadius: '0 8px 8px 0',
              marginRight: '0.75rem',
            }}>
              <span style={{ width: 18, textAlign: 'center', fontSize: '0.9rem', flexShrink: 0, opacity: 0.55 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: item.badgeColor, color: 'white', fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 50 }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #EDE8DC', flexShrink: 0 }}>
          <button className="sb-logout" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', fontWeight: 600, color: '#7A6D5A', background: 'none', border: 'none', cursor: 'pointer', width: '100%', transition: 'color 0.15s' }}>
            <span style={{ fontSize: '0.9rem' }}>↩</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 59, backdropFilter: 'blur(2px)' }} className="lg:hidden" />
      )}

      {/* ── MAIN ── */}
      <div className="dash-main" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .dash-main { margin-left: 0; }
          @media (min-width: 1024px) { .dash-main { margin-left: 260px; } }
          .lg\\:hidden { display: none; }
          @media (max-width: 1023px) { .lg\\:hidden { display: flex !important; } }
        `}} />

        {/* Topbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(245,242,236,0.92)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #EDE8DC', padding: '0.9rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Hamburger */}
            <button onClick={() => setOpen(true)} className="lg:hidden" style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid #EDE8DC', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4, flexShrink: 0 }}>
              <span style={{ display: 'block', width: 16, height: 1.5, background: '#1A1209', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 12, height: 1.5, background: '#1A1209', borderRadius: 2 }} />
              <span style={{ display: 'block', width: 16, height: 1.5, background: '#1A1209', borderRadius: 2 }} />
            </button>
            <div>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 600, color: '#1A1209' }}>Espace Pèlerin</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button style={{ position: 'relative', width: 38, height: 38, borderRadius: '50%', border: '1px solid #EDE8DC', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>
              🔔
              <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#C9A84C', border: '2px solid white' }} />
            </button>
            <Link href="/guides" style={{ padding: '0.5rem 1.25rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: '#1A1209', color: '#F0D897', textDecoration: 'none', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              + Nouveau guide
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 1.75rem', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
