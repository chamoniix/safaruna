'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { adminLogout } from '@/app/admin/login/actions';

const NAV = [
  {
    href: '/admin/tableau-de-bord', label: 'Tableau de bord',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: '/admin/guides', label: 'Guides',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  },
  {
    href: '/admin/pelerins', label: 'Pèlerins',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href: '/admin/reservations', label: 'Réservations',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  },
  {
    href: '/admin/litiges', label: 'Litiges', badge: 2,
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    href: '/admin/contenu', label: 'Contenu',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  },
  {
    href: '/admin/revenus', label: 'Revenus',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    href: '/admin/parametres', label: 'Paramètres',
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentNav = pathname ? NAV.find(n => pathname === n.href || pathname.startsWith(n.href + '/')) : undefined;
  const pageTitle = currentNav?.label ?? 'Administration';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F6F2', fontFamily: 'var(--font-manrope, sans-serif)' }}>
      <style>{`
        .adm-sb { position: fixed; top: 0; left: 0; width: 240px; height: 100vh; background: #0F0A05; display: flex; flex-direction: column; z-index: 100; border-right: 1px solid rgba(201,168,76,0.12); transition: transform 0.25s ease; }
        .adm-main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
        .adm-overlay { display: none; }
        .adm-burger { display: none; }
        @media (max-width: 1024px) {
          .adm-sb { transform: translateX(-240px); }
          .adm-sb.open { transform: translateX(0); box-shadow: 8px 0 32px rgba(0,0,0,0.5); }
          .adm-main { margin-left: 0; }
          .adm-overlay.open { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
          .adm-burger { display: flex !important; }
        }
        .adm-link { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; font-size: 0.82rem; font-weight: 500; color: rgba(255,255,255,0.5); margin-bottom: 2px; transition: all 0.15s; }
        .adm-link:hover { background: rgba(201,168,76,0.12); color: rgba(255,255,255,0.85); }
        .adm-link.active { background: #C9A84C; color: #0F0A05; font-weight: 700; }
        .adm-link.active svg { stroke: #0F0A05; }
        .adm-link svg { stroke: rgba(255,255,255,0.4); flex-shrink: 0; }
        .adm-link:hover svg { stroke: rgba(255,255,255,0.8); }
      `}</style>

      {/* Overlay mobile */}
      <div className={`adm-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* Sidebar */}
      <aside className={`adm-sb${mobileOpen ? ' open' : ''}`}>

        {/* Logo */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,0.1)', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: 'white', letterSpacing: '0.04em', lineHeight: 1 }}>
            SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
          </div>
          <div style={{ fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginTop: '0.3rem' }}>
            Administration
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.6rem 0.75rem' }}>
          {NAV.map(({ href, label, icon, badge }) => {
            const active = pathname ? (pathname === href || pathname.startsWith(href + '/')) : false;
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`adm-link${active ? ' active' : ''}`}>
                {icon}
                <span style={{ flex: 1 }}>{label}</span>
                {badge && !active && (
                  <span style={{ background: '#DC2626', color: 'white', fontSize: '0.58rem', fontWeight: 800, padding: '2px 6px', borderRadius: 10, lineHeight: 1 }}>{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <form action={adminLogout}>
            <button type="submit" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '9px 12px', borderRadius: 8, border: 'none', background: 'rgba(220,38,38,0.08)', color: '#F87171', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}>
              <svg width="16" height="16" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="adm-main">
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: '1px solid #E8DFC8', height: 60, padding: '0 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <button className="adm-burger" onClick={() => setMobileOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #E8DFC8', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" fill="none" stroke="#1A1209" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>{pageTitle}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1A1209' }}>Admin</div>
              <div style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>admin@safaruma.com</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #F0D897)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>A</div>
          </div>
        </header>
        <main style={{ flex: 1, padding: '1.75rem' }}>{children}</main>
      </div>
    </div>
  );
}
