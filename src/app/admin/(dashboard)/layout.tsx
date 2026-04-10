'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { adminLogout } from '@/app/admin/login/actions';

const NAV = [
  { href: '/admin/tableau-de-bord', label: 'Tableau de bord' },
  { href: '/admin/guides',          label: 'Guides' },
  { href: '/admin/pelerins',        label: 'Pèlerins' },
  { href: '/admin/reservations',    label: 'Réservations' },
  { href: '/admin/messages',        label: 'Messages' },
  { href: '/admin/litiges',         label: 'Litiges', badge: 2 },
  { href: '/admin/contenu',         label: 'Contenu' },
  { href: '/admin/revenus',         label: 'Revenus' },
  { href: '/admin/commissions',     label: 'Commissions' },
  { href: '/admin/parametres',      label: 'Paramètres' },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentNav = NAV.find(n => pathname ? (pathname === n.href || pathname.startsWith(n.href + '/')) : false);
  const pageTitle = currentNav?.label ?? 'Administration';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-manrope, sans-serif)', overflow: 'hidden' }}>

      {/* SIDEBAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: 240, height: '100vh',
        background: '#0F0A05', display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(201,168,76,0.15)', zIndex: 9999,
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>
            SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
          </div>
          <div style={{ fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
            Administration
          </div>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, padding: '0.75rem' }}>
          {NAV.map(({ href, label, badge }) => {
            const active = pathname ? (pathname === href || pathname.startsWith(href + '/')) : false;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.65rem 0.875rem', borderRadius: 8, textDecoration: 'none',
                  marginBottom: 4, fontSize: '0.83rem', fontWeight: active ? 700 : 500,
                  color: active ? '#0F0A05' : 'rgba(255,255,255,0.6)',
                  background: active ? '#C9A84C' : 'transparent',
                }}
              >
                <span>{label}</span>
                {badge && !active && (
                  <span style={{ background: '#DC2626', color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 10 }}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <form action={adminLogout}>
            <button type="submit" style={{
              width: '100%', padding: '0.65rem 0.875rem', borderRadius: 8,
              border: 'none', background: 'rgba(220,38,38,0.1)', color: '#F87171',
              fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
            }}>
              Déconnexion
            </button>
          </form>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', background: '#F8F6F2', height: '100vh', overflow: 'hidden' }}>
        <header style={{
          position: 'sticky', top: 0, zIndex: 50, background: 'white',
          borderBottom: '1px solid #E8DFC8', height: 60, padding: '0 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>
            {pageTitle}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1A1209' }}>Admin</div>
              <div style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>admin@safaruma.com</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #F0D897)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>
              A
            </div>
          </div>
        </header>
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
