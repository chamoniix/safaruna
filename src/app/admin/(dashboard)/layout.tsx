'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { adminLogout } from '@/app/admin/login/actions';
import styles from './layout.module.css';
import {
  BarChart3, CalendarCheck2, ChevronLeft, ChevronRight,
  CircleDollarSign, ClipboardList, Gauge, Landmark, LogOut, MapPinned,
  MessageSquare, Settings, ShieldCheck, Users, UserRoundCheck,
  Star,
  type LucideIcon,
} from 'lucide-react';

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavSection = { label: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Pilotage',
    items: [
      { href: '/admin/tableau-de-bord', label: 'Tableau de bord', icon: Gauge },
      { href: '/admin/stats', label: 'Statistiques', icon: BarChart3 },
    ],
  },
  {
    label: 'Opérations',
    items: [
      { href: '/admin/candidatures-guides', label: 'Candidatures guides', icon: ClipboardList },
      { href: '/admin/guides', label: 'Guides', icon: UserRoundCheck },
      { href: '/admin/pelerins', label: 'Pèlerins', icon: Users },
      { href: '/admin/reservations', label: 'Réservations', icon: CalendarCheck2 },
      { href: '/admin/avis', label: 'Avis', icon: Star },
      { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/revenus', label: 'Revenus', icon: CircleDollarSign },
      { href: '/admin/commissions', label: 'Commissions', icon: Landmark },
      { href: '/admin/lieux', label: 'Lieux & Tarifs', icon: MapPinned },
    ],
  },
  {
    label: 'Gouvernance',
    items: [
      { href: '/admin/audit', label: 'Audit & sécurité', icon: ShieldCheck },
      { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
    ],
  },
];

const NAV_ITEMS = NAV_SECTIONS.flatMap(section => section.items);

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [admin, setAdmin] = useState<{ email: string; role: 'SUPERADMIN' | 'ADMIN'; individualAccount: boolean } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentNav = NAV_ITEMS.find(n => pathname ? (pathname === n.href || pathname.startsWith(n.href + '/')) : false);
  const pageTitle = currentNav?.label ?? 'Administration';
  const isSuperadmin = admin?.role === 'SUPERADMIN';
  const accent = isSuperadmin ? '#7DD3FC' : '#C9A84C';
  const sidebarBackground = isSuperadmin
    ? 'linear-gradient(180deg, #071827 0%, #10143A 55%, #241043 100%)'
    : '#0F0A05';
  const mainStyle = {
    background: isSuperadmin ? '#F3F7FC' : '#F8F6F2',
    '--admin-accent': accent,
  } as CSSProperties;

  useEffect(() => {
    fetch('/api/admin/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setAdmin(data?.admin ?? null))
      .catch(() => setAdmin(null));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <div id="admin-shell" className={`${styles.shell} ${sidebarCollapsed ? styles.shellCollapsed : ''}`}>

      <button
        type="button"
        className={`${styles.overlay} ${menuOpen ? styles.overlayVisible : ''}`}
        aria-label="Fermer le menu d’administration"
        onClick={() => setMenuOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''} ${menuOpen ? styles.sidebarOpen : ''}`} style={{
        background: sidebarBackground, display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${isSuperadmin ? 'rgba(125,211,252,0.24)' : 'rgba(201,168,76,0.15)'}`,
      }}>
        {/* Logo */}
        <div className={styles.brand} style={{ borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
          <div className={styles.brandText}>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>SAFAR<span style={{ color: accent }}>U</span>MA</div>
            <div style={{ fontSize: '0.48rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: isSuperadmin ? '#A5F3FC' : 'rgba(255,255,255,0.35)', marginTop: 2 }}>{isSuperadmin ? 'Superadmin' : 'Administration'}</div>
          </div>
          <button type="button" className={styles.collapseButton} aria-label={sidebarCollapsed ? 'Déployer le menu' : 'Réduire le menu'} onClick={() => setSidebarCollapsed(value => !value)}>
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, padding: '0.75rem' }}>
          {NAV_SECTIONS.map(section => (
            <section key={section.label} className={styles.navSection}>
              <div className={styles.sectionLabel} style={{ color: isSuperadmin ? 'rgba(165,243,252,0.62)' : 'rgba(255,255,255,0.26)' }}>
                {section.label}
              </div>
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname ? (pathname === href || pathname.startsWith(href + '/')) : false;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={styles.navLink}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      padding: '0.58rem 0.7rem', borderRadius: 8, textDecoration: 'none',
                      marginBottom: 3, fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                      color: active ? (isSuperadmin ? '#071827' : '#0F0A05') : 'rgba(255,255,255,0.66)',
                      background: active ? accent : 'transparent',
                      boxShadow: active && isSuperadmin ? '0 8px 24px rgba(56,189,248,0.18)' : 'none',
                    }}
                  >
                    <Icon size={17} strokeWidth={active ? 2.25 : 1.8} style={{ flex: '0 0 17px' }} />
                    <span className={styles.navLabel}>{label}</span>
                  </Link>
                );
              })}
            </section>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <form action={adminLogout}>
            <button type="submit" className={styles.logoutButton} style={{
              width: '100%', padding: '0.6rem 0.7rem', borderRadius: 8,
              border: 'none', background: 'rgba(220,38,38,0.1)', color: '#F87171',
              fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
            }}>
              <LogOut size={17} /><span className={styles.navLabel}>Déconnexion</span>
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN */}
      <div className={styles.main} style={mainStyle}>
        <header className={styles.header} style={{
          position: 'sticky', top: 0, zIndex: 50, background: isSuperadmin ? 'rgba(255,255,255,0.96)' : 'white',
          borderBottom: `1px solid ${isSuperadmin ? '#C7D8EA' : '#E8DFC8'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div className={styles.headerTitle}>
            <button
              type="button"
              className={styles.menuButton}
              aria-label="Ouvrir le menu d’administration"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
            >
              <span />
              <span />
              <span />
            </button>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>
              {pageTitle}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className={styles.accountDetails} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: isSuperadmin ? '#075985' : '#1A1209', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{isSuperadmin ? 'Superadmin' : 'Admin'}</div>
              <div style={{ fontSize: '0.62rem', color: '#7A6D5A' }}>{admin?.email || 'Compte en cours de vérification'}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: isSuperadmin ? 'linear-gradient(135deg, #38BDF8, #A78BFA)' : 'linear-gradient(135deg, #C9A84C, #F0D897)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: isSuperadmin ? '#071827' : '#1A1209', boxShadow: isSuperadmin ? '0 6px 18px rgba(56,189,248,0.3)' : 'none' }}>
              {(admin?.email?.[0] || 'A').toUpperCase()}
            </div>
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
