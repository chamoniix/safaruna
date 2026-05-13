'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const { data: session } = useSession();
  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');

  const su = session?.user as any;
  const displayName = su?.firstName && su?.lastName
    ? `${su.firstName} ${su.lastName}`
    : su?.name || su?.email || 'Guide';
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || 'G';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; padding: 0; }
        .guide-sidebar {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 260px !important;
          height: 100vh !important;
          z-index: 50 !important;
          overflow-y: auto;
          background: #1A1209;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          transform: translateX(0);
        }
        @media (max-width: 1023px) {
          .guide-sidebar { transform: translateX(-260px); }
          .guide-sidebar.is-open { transform: translateX(0); }
        }
        .guide-main {
          margin-left: 260px !important;
          width: calc(100% - 260px) !important;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 1023px) {
          .guide-main { margin-left: 0 !important; width: 100% !important; }
        }
        .guide-hamburger { display: none !important; }
        @media (max-width: 1023px) { .guide-hamburger { display: flex !important; } }
        .guide-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 49; backdrop-filter: blur(2px); }
        @media (max-width: 1023px) { .guide-overlay.is-open { display: block; } }
        .guide-sb-close { display: none !important; }
        @media (max-width: 1023px) { .guide-sb-close { display: flex !important; } }
        .g-nav-link { transition: background 0.15s, color 0.15s; }
        .g-nav-link:hover { background: rgba(201,168,76,0.08) !important; color: rgba(255,255,255,0.8) !important; }
        /* Override global nav { position: fixed } inside sidebar */
        .guide-sidebar nav {
          position: static !important;
          background: transparent !important;
          border: none !important;
          backdrop-filter: none !important;
          padding: 0 !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          z-index: auto !important;
          display: flex !important;
          flex-direction: column !important;
        }
      `}} />

      <div style={{ height: '100vh', overflow: 'hidden', background: '#F5F2EC', fontFamily: 'var(--font-manrope, sans-serif)', color: '#1A1209' }}>

        {/* ── SIDEBAR GUIDE (dark) ── */}
        <aside className={`guide-sidebar${open ? ' is-open' : ''}`}>
          {/* Brand + badge */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: 'white', textDecoration: 'none', letterSpacing: '0.04em' }}>
              SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#C9A84C', color: '#1A1209', fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.18rem 0.55rem', borderRadius: 50 }}>Guide</span>
              <button className="guide-sb-close" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1, padding: 0, alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>✕</button>
            </div>
          </div>

          {/* Guide profile + availability toggle */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#1A1209' }}>{initials}</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: isAvailable ? '#27AE60' : 'rgba(255,255,255,0.3)', border: '2px solid #1A1209' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
              <div style={{ fontSize: '0.65rem', color: '#C9A84C', marginBottom: 6 }}>★★★★★ 4.97</div>
              {/* Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setIsAvailable(!isAvailable)}>
                <div style={{ width: 30, height: 16, borderRadius: 50, background: isAvailable ? '#27AE60' : 'rgba(255,255,255,0.15)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, width: 10, height: 10, borderRadius: '50%', background: 'white', transition: 'left 0.2s', left: isAvailable ? 17 : 3 }} />
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 600, color: isAvailable ? '#6EC68A' : 'rgba(255,255,255,0.35)' }}>{isAvailable ? 'Disponible' : 'Indisponible'}</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, paddingTop: '0.5rem', overflowY: 'auto' }}>
            {[
              { section: 'Tableau de bord', items: [
                { href: '/guide/tableau-de-bord', icon: '⌂', label: 'Accueil' },
                { href: '/guide/demandes',        icon: '📥', label: 'Nouvelles demandes' },
                { href: '/guide/missions',        icon: '✦', label: 'Mes missions' },
                { href: '/guide/messages',        icon: '◎', label: 'Messages' },
              ]},
              { section: 'Gestion', items: [
                { href: '/guide/calendrier', icon: '◻', label: 'Calendrier' },
                { href: '/guide/lieux',      icon: '📍', label: 'Lieux de visite' },
                { href: '/guide/revenus',    icon: '◈', label: 'Mes revenus' },
                { href: '/guide/avis',       icon: '★', label: 'Mes avis' },
              ]},
              { section: 'Mon profil', items: [
                { href: '/guide/profil',   icon: '◎', label: 'Modifier profil' },
                { href: '/guide/forfaits', icon: '▤', label: 'Mes forfaits' },
              ]},
              { section: 'Ressources', items: [
                { href: '/guide/formation',    icon: '🎓', label: 'Formation SAFARUMA' },
                { href: '/guide/documents',    icon: '📄', label: 'Mes documents' },
                { href: '/guide/performances', icon: '📊', label: 'Performances' },
                { href: '/conditions-guides',  icon: '📋', label: 'Conditions Guides' },
                { href: '/charte',             icon: '🔒', label: 'Charte SAFARUMA' },
                { href: '/devenir-guide',      icon: '◈', label: 'Revenus & Écosystème' },
                { href: '/nos-guides-certifies', icon: '✦', label: 'Certification SAFARUMA' },
              ]},
            ].map((group) => (
              <div key={group.section}>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '0.9rem 1.5rem 0.35rem' }}>{group.section}</div>
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="g-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 1.5rem', textDecoration: 'none', fontSize: '0.82rem', fontWeight: isActive(item.href) ? 700 : 400, color: isActive(item.href) ? '#F0D897' : 'rgba(255,255,255,0.5)', background: isActive(item.href) ? 'rgba(201,168,76,0.12)' : 'transparent', borderLeft: `2px solid ${isActive(item.href) ? '#C9A84C' : 'transparent'}` }}>
                    <span style={{ width: 16, textAlign: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <button onClick={() => signOut({ callbackUrl: '/guide/connexion' })} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>↩ Déconnexion</button>
          </div>
        </aside>

        {/* Mobile overlay */}
        <div className={`guide-overlay${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} />

        {/* ── MAIN ── */}
        <div className="guide-main">
          {/* Topbar */}
          <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(245,242,236,0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #EDE8DC', padding: '0.9rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className="guide-hamburger" onClick={() => setOpen(true)} style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid #EDE8DC', background: 'white', cursor: 'pointer', gap: 4, flexShrink: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ display: 'block', width: 16, height: 1.5, background: '#1A1209', borderRadius: 2 }} />
                <span style={{ display: 'block', width: 12, height: 1.5, background: '#1A1209', borderRadius: 2 }} />
                <span style={{ display: 'block', width: 16, height: 1.5, background: '#1A1209', borderRadius: 2 }} />
              </button>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 600, color: '#1A1209' }}>Espace Guide</span>
            </div>
            <Link href="/" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', letterSpacing: '0.08em', whiteSpace: 'nowrap', textDecoration: 'none' }}>
              SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', border: '1px solid #EDE8DC', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>
                🔔
                <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#C0392B', border: '2px solid white' }} />
              </button>
              <button style={{ padding: '0.5rem 1.25rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: '#C9A84C', color: '#1A1209', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Partager mon profil</button>
            </div>
          </header>

          <main style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '2rem 1.75rem', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
