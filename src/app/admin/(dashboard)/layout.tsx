'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { adminLogout } from '@/app/admin/login/actions';

const NAV = [
  { href: '/admin/tableau-de-bord', label: 'Tableau de bord', icon: '⊞' },
  { href: '/admin/guides',          label: 'Guides',          icon: '👤' },
  { href: '/admin/pelerins',        label: 'Pèlerins',        icon: '🕌' },
  { href: '/admin/reservations',    label: 'Réservations',    icon: '📅' },
  { href: '/admin/litiges',         label: 'Litiges',         icon: '⚠', badge: 2 },
  { href: '/admin/contenu',         label: 'Contenu',         icon: '✏' },
  { href: '/admin/revenus',         label: 'Revenus',         icon: '$' },
  { href: '/admin/parametres',      label: 'Paramètres',      icon: '⚙' },
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
          transition: transform 0.25s ease;
        }
        .admin-main { margin-left: 240px; min-height: 100vh; background: #F8F6F2; display: flex; flex-direction: column; }
        .admin-hamburger { display: none; }
        .admin-overlay { display: none; }
        @media (max-width: 1024px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.4); }
          .admin-main { margin-left: 0; }
          .admin-hamburger { display: flex; }
          .admin-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        }
        .admin-nav-link { display: flex; align-items: center; gap: 0.7rem; padding: 0.6rem 0.75rem; border-radius: 8px; text-decoration: none; font-size: 0.83rem; margin-bottom: 0.15rem; transition: background 0.15s, color 0.15s; }
        .admin-nav-link:hover { background: rgba(201,168,76,0.1); }
      `}</style>

      {mobileOpen && <div className="admin-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`admin-sidebar${mobileOpen ? ' open' : ''}`}>

        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(201,168,76,0.12)', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>
            SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
          </div>
          <div style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: '0.2rem' }}>
            Administration
          </div>
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg, #C9A84C44, #C9A84C88, #C9A84C44)', flexShrink: 0 }} />

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {NAV.map(({ href, label, icon, badge }) => {
            const active = pathname ? (pathname === href || pathname.startsWith(href + '/')) : false;
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="admin-nav-link" style={{
                fontWeight: active ? 700 : 500,
                color: active ? '#0F0A05' : '#7A6D5A',
                background: active ? '#C9A84C' : 'transparent',
              }}>
                <span style={{ flexShrink: 0, fontSize: '1rem' }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge && !active && (
                  <span style={{ background: '#DC2626', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: 10 }}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <form action={adminLogout}>
            <button type="submit" style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.6rem 0.75rem', borderRadius: 8, border: 'none',
              background: 'rgba(220,38,38,0.1)', color: '#F87171',
              fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              ← Déconnexion
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-main">
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: '#FFFFFF', borderBottom: '1px solid #E8DFC8',
          height: 64, padding: '0 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="admin-hamburger" onClick={() => setMobileOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: '#1A1209', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>
              {pageTitle}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1A1209' }}>Admin</div>
              <div style={{ fontSize: '0.65rem', color: '#7A6D5A' }}>admin@safaruma.com</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #F0D897)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>A</div>
          </div>
        </header>
        <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
      </div>
    </>
  );
}
