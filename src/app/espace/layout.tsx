'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/espace/tableau-de-bord', label: 'Tableau de bord', emoji: '🏠' },
  { href: '/espace/reservations',    label: 'Mes réservations', emoji: '📋' },
  { href: '/espace/messages',        label: 'Messages',         emoji: '💬' },
  { href: '/espace/favoris',         label: 'Mes favoris',      emoji: '❤️' },
  { href: '/espace/profil',          label: 'Mon profil',       emoji: '👤' },
  { href: '/espace/parrainage',      label: 'Parrainage',       emoji: '🎁' },
  { href: '/espace/parametres',      label: 'Paramètres',       emoji: '⚙️' },
];

const BOTTOM_NAV = NAV.slice(0, 5);

const PAGE_TITLES: Record<string, string> = {
  '/espace/tableau-de-bord': 'Tableau de bord',
  '/espace/reservations':    'Mes réservations',
  '/espace/messages':        'Messages',
  '/espace/favoris':         'Mes favoris',
  '/espace/profil':          'Mon profil',
  '/espace/parrainage':      'Parrainage',
  '/espace/parametres':      'Paramètres',
};

export default function EspaceLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/connexion?redirect=' + encodeURIComponent(pathname));
    }
  }, [status, pathname, router]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F2' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid #E8DFC8', borderTopColor: '#C9A84C',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
          }} />
          <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { to { transform: rotate(360deg); } }' }} />
          <div style={{ fontSize: '0.82rem', color: '#7A6D5A', fontFamily: 'var(--font-manrope, sans-serif)' }}>Chargement…</div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const user       = session?.user as any;
  const userName   = user?.name || user?.firstName || user?.email || 'Pèlerin';
  const userInitials = userName.slice(0, 2).toUpperCase();
  const pageTitle  = PAGE_TITLES[pathname] || 'Espace Pèlerin';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        .espace-nav-link { transition: background 0.15s, color 0.15s; }
        .espace-nav-link:hover { background: rgba(201,168,76,0.12) !important; }
        @media (max-width: 767px) {
          .espace-sidebar   { display: none !important; }
          .espace-main      { margin-left: 0 !important; }
          .espace-header    { left: 0 !important; }
          .espace-bottom-nav { display: flex !important; }
          .espace-content   { padding-bottom: 72px !important; }
        }
        @media (min-width: 768px) {
          .espace-bottom-nav { display: none !important; }
        }
      `}} />

      {/* ── Sidebar ── */}
      <aside className="espace-sidebar" style={{
        position: 'fixed', top: 0, left: 0, width: 240, height: '100vh',
        background: '#1A1209', display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(201,168,76,0.15)', zIndex: 100, overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1 }}>
            <span style={{ color: 'white' }}>SAFAR</span>
            <span style={{ color: '#C9A84C' }}>U</span>
            <span style={{ color: 'white' }}>MA</span>
          </div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: '0.35rem' }}>
            Espace Pèlerin
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {NAV.map(({ href, label, emoji }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} className="espace-nav-link" style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.6rem 0.875rem', borderRadius: 8, textDecoration: 'none',
                background: active ? '#C9A84C' : 'transparent',
                color: active ? '#1A1209' : 'rgba(255,255,255,0.6)',
                fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                fontFamily: 'var(--font-manrope, sans-serif)',
              }}>
                <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{emoji}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User block */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: '#C9A84C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#1A1209', flexShrink: 0,
            }}>
              {userInitials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              width: '100%', padding: '0.5rem', borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em',
            }}
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="espace-main" style={{ marginLeft: 240, minHeight: '100vh', background: '#F8F6F2', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header className="espace-header" style={{
          position: 'sticky', top: 0, left: 240, right: 0, height: 60, zIndex: 50,
          background: 'white', borderBottom: '1px solid #E8DFC8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>
            {pageTitle}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#7A6D5A', fontFamily: 'var(--font-manrope, sans-serif)' }}>{userName}</div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#C9A84C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-cormorant, serif)', fontSize: '0.9rem', fontWeight: 700, color: '#1A1209',
            }}>
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="espace-content" style={{ flex: 1, padding: '1.75rem 1.5rem 3rem', maxWidth: 1100, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="espace-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 60, zIndex: 100,
        background: '#1A1209', borderTop: '1px solid rgba(201,168,76,0.2)',
        justifyContent: 'space-around', alignItems: 'center',
        fontFamily: 'var(--font-manrope, sans-serif)',
      }}>
        {BOTTOM_NAV.map(({ href, label, emoji }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
              textDecoration: 'none', padding: '0.4rem 0.5rem',
              color: active ? '#C9A84C' : 'rgba(255,255,255,0.45)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
              <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
