'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import NotificationBell from '@/components/NotificationBell';

/* ── HEROICONS SVG (stroke, 18×18) ── */
const IcoHome = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IcoCalendar = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IcoChat = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IcoCap = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
const IcoBook = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const IcoCheckCircle = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IcoHeart = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IcoUser = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IcoGift = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);
const IcoCog = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IcoLogout = ({ c }: { c: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

type NavItem = { href: string; Icon: React.ComponentType<{ c: string }>; label: string; badge?: string; badgeColor?: string };
const NAV: { section: string; items: NavItem[] }[] = [
  { section: 'Mon voyage', items: [
    { href: '/espace/tableau-de-bord', Icon: IcoHome,     label: 'Tableau de bord' },
    { href: '/espace/reservations',   Icon: IcoCalendar, label: 'Mes réservations' },
    { href: '/espace/messages',       Icon: IcoChat,     label: 'Messages' },
    { href: '/espace/favoris',        Icon: IcoHeart,    label: 'Mes favoris' },
  ]},
  { section: 'Spiritualité', items: [
    { href: '/espace/academy',    Icon: IcoCap,         label: 'SAFARUMA Academy' },
    { href: '/espace/dua',        Icon: IcoBook,        label: "Carnet de Du'a" },
    { href: '/espace/checklist',  Icon: IcoCheckCircle, label: 'Ma Checklist' },
    { href: '/espace/guide-omra', Icon: IcoBook,        label: 'Guide complet la Omra' },
  ]},
  { section: 'Mon compte', items: [
    { href: '/espace/profil',     Icon: IcoUser, label: 'Mon profil' },
    { href: '/espace/parrainage', Icon: IcoGift, label: 'Parrainage', badge: '80€', badgeColor: '#1D5C3A' },
    { href: '/espace/parametres', Icon: IcoCog,  label: 'Paramètres' },
  ]},
];

const EXTRA: NavItem[] = [];

export default function PelerinLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');

  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const firstName = sessionUser?.firstName || session?.user?.name?.split(' ')[0] || 'Pèlerin';
  const lastName  = sessionUser?.lastName  || session?.user?.name?.split(' ').slice(1).join(' ') || '';
  const fullName  = [firstName, lastName].filter(Boolean).join(' ');
  const initials  = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || 'P';

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    return (
      <Link href={item.href} onClick={() => setOpen(false)} className="sb-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.5rem', textDecoration: 'none', fontSize: '0.82rem', fontWeight: active ? 700 : 500, color: active ? '#8B6914' : '#5A4E3A', background: active ? '#FDF5E0' : 'transparent', borderLeft: `3px solid ${active ? '#C9A84C' : 'transparent'}`, borderRadius: '0 8px 8px 0', marginRight: '0.75rem' }}>
        <span style={{ flexShrink: 0, display: 'flex' }}><item.Icon c={active ? '#C9A84C' : '#7A6D5A'} /></span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.badge && <span style={{ background: item.badgeColor, color: item.badgeColor === '#C9A84C' ? '#1A1209' : 'white', fontSize: '0.58rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 50, flexShrink: 0 }}>{item.badge}</span>}
      </Link>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; padding: 0; }
        .pelerin-sidebar {
          position: fixed !important; left: 0 !important; top: 0 !important;
          width: 260px !important; height: 100vh !important;
          z-index: 50 !important; overflow: hidden;
          background: #FFFFFF; border-right: 1px solid #EDE8DC;
          display: flex; flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          transform: translateX(0);
        }
        @media (max-width: 1023px) {
          .pelerin-sidebar { transform: translateX(-260px); }
          .pelerin-sidebar.is-open { transform: translateX(0); }
        }
        .pelerin-main {
          margin-left: 260px !important; width: calc(100% - 260px) !important;
          min-height: 100vh; display: flex; flex-direction: column;
        }
        @media (max-width: 1023px) {
          .pelerin-main { margin-left: 0 !important; width: 100% !important; }
        }
        .pelerin-hamburger { display: none !important; }
        @media (max-width: 1023px) { .pelerin-hamburger { display: flex !important; } }
        .pelerin-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 49; backdrop-filter: blur(2px); }
        @media (max-width: 1023px) { .pelerin-overlay.is-open { display: block; } }
        .sb-nav-link { transition: background 0.15s, color 0.15s; }
        .sb-nav-link:hover { background: #FAF7F0 !important; }
        .sb-logout-btn { transition: color 0.15s; }
        .sb-logout-btn:hover { opacity: 0.8; }
        .sb-close-btn { display: none !important; }
        @media (max-width: 1023px) { .sb-close-btn { display: flex !important; } }
        .pelerin-sidebar nav {
          position: static !important; background: transparent !important;
          border: none !important; backdrop-filter: none !important;
          padding: 0 !important; top: auto !important; left: auto !important;
          right: auto !important; z-index: auto !important;
          display: flex !important; flex-direction: column !important;
        }
        @media (max-width: 1023px) {
          .pelerin-sidebar {
            height: 100dvh !important;
            max-height: 100dvh !important;
          }
          .pelerin-sidebar nav {
            -webkit-overflow-scrolling: touch !important;
          }
        }
      `}} />

      <div style={{ minHeight: '100vh', background: '#F5F2EC', fontFamily: 'var(--font-manrope, sans-serif)', color: '#1A1209' }}>

        {/* ── SIDEBAR ── */}
        <aside className={`pelerin-sidebar${open ? ' is-open' : ''}`}>
          <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid #EDE8DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', textDecoration: 'none', letterSpacing: '0.04em' }}>
              SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
            </Link>
            <button className="sb-close-btn" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6D5A', fontSize: '1.1rem', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid #EDE8DC', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#1A1209', flexShrink: 0, border: '2px solid #EDE8DC' }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1209', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullName}</div>
              <Link href="/espace/profil" style={{ fontSize: '0.68rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>Modifier le profil →</Link>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', minHeight: 0 }}>
            {NAV.map((group) => (
              <div key={group.section}>
                <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(122,109,90,0.45)', padding: '1rem 1.5rem 0.4rem' }}>{group.section}</div>
                {group.items.map(item => <NavLink key={item.href} item={item} />)}
              </div>
            ))}
          </nav>

          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #EDE8DC', flexShrink: 0, background: 'white', position: 'relative', zIndex: 1 }}>
            <button className="sb-logout-btn" onClick={() => signOut({ callbackUrl: '/' })} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', fontWeight: 600, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
              <IcoLogout c="#C0392B" /> Déconnexion
            </button>
          </div>
        </aside>

        <div className={`pelerin-overlay${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} />

        {/* ── MAIN ── */}
        <div className="pelerin-main">
          <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(245,242,236,0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #EDE8DC', padding: '0.9rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className="pelerin-hamburger" onClick={() => setOpen(true)} style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid #EDE8DC', background: 'white', cursor: 'pointer', gap: 4, flexShrink: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ display: 'block', width: 16, height: 1.5, background: '#1A1209', borderRadius: 2 }} />
                <span style={{ display: 'block', width: 12, height: 1.5, background: '#1A1209', borderRadius: 2 }} />
                <span style={{ display: 'block', width: 16, height: 1.5, background: '#1A1209', borderRadius: 2 }} />
              </button>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 600, color: '#1A1209' }}>Espace Pèlerin</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <NotificationBell />
              <Link href="/guides" style={{ padding: '0.5rem 1.25rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: '#1A1209', color: '#F0D897', textDecoration: 'none', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>+ Nouveau guide</Link>
            </div>
          </header>

          <main style={{ flex: 1, padding: '2rem 1.75rem', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
