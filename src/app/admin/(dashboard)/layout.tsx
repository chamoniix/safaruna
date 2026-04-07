'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { adminLogout } from '@/app/admin/login/actions';

const NAV = [
  {
    href: '/admin/tableau-de-bord', label: 'Tableau de bord',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: '/admin/guides', label: 'Guides',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  },
  {
    href: '/admin/pelerins', label: 'Pèlerins',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href: '/admin/reservations', label: 'Réservations',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  },
  {
    href: '/admin/litiges', label: 'Litiges', badge: 2,
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    href: '/admin/contenu', label: 'Contenu',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  },
  {
    href: '/admin/revenus', label: 'Revenus',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    href: '/admin/parametres', label: 'Paramètres',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentNav = pathname ? NAV.find(n => pathname === n.href || pathname.startsWith(n.href + '/')) : undefined;
  const pageTitle = currentNav?.label ?? 'Administration';

  return (
    <>
      <style>{`
        .admin-sidebar {
          position: fixed; top: 0; left: 0; height: 100vh; width: 240px;
          background: #0F0A05; z-index: 50; display: flex; flex-direction: column;
          border-right: 1px solid rgba(201,168,76,0.1);
          transition: transform 0.25s ease; overflow: hidden;
        }
        .admin-main {
          margin-left: 240px; min-height: 100vh;
          background: #F8F6F2; display: flex; flex-direction: column;
        }
        .admin-hamburger { display: none; }
        .admin-overlay { display: none; }
        @media (max-width: 1024px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.4); }
          .admin-main { margin-left: 0; }
          .admin-hamburger { display: flex; }
          .admin-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        }
      `}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="admin-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${mobileOpen ? ' open' : ''}`}>

        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
            SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
          </div>
          <div style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '0.2rem' }}>
            Administration
          </div>
        </div>

        {/* Gold divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, #C9A84C44, #C9A84C88, #C9A84C44)', margin: '0' }} />

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {NAV.map(({ href, label, icon, badge }) => {
            const active = pathname ? (pathname === href || pathname.startsWith(href + '/')) : false;
            return (
              <Link
                key={href} href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.6rem 0.75rem', borderRadius: 8, textDecoration: 'none',
                  fontSize: '0.83rem', fontWeight: active ? 700 : 500,
                  color: active ? '#0F0A05' : '#7A6D5A',
                  background: active ? '#C9A84C' : 'transparent',
                  marginBottom: '0.15rem',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge && !active && (
                  <span style={{
                    background: '#DC2626', color: 'white', fontSize: '0.6rem',
                    fontWeight: 700, padding: '1px 6px', borderRadius: 10, lineHeight: '16px',
                  }}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <form action={adminLogout}>
            <button type="submit" style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.6rem 0.75rem', borderRadius: 8, border: 'none',
              background: 'rgba(220,38,38,0.1)', color: '#F87171',
              fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}>
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="admin-main">

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: '#FFFFFF', borderBottom: '1px solid #E8DFC8',
          height: 64, padding: '0 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Hamburger */}
            <button
              className="admin-hamburger"
              onClick={() => setMobileOpen(o => !o)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 6, borderRadius: 6, color: '#1A1209',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', margin: 0,
            }}>
              {pageTitle}
            </h1>
          </div>

          {/* Admin identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1A1209' }}>Admin</div>
              <div style={{ fontSize: '0.65rem', color: '#7A6D5A' }}>admin@safaruma.com</div>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg, #C9A84C, #F0D897)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', flexShrink: 0,
            }}>
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '2rem' }}>
          {children}
        </main>
      </div>
    </>
  );
}
