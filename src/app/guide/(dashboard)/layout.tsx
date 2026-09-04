'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGuideSession } from '@/components/GuideSessionGuard';
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  HandCoins,
  House,
  Inbox,
  LockKeyhole,
  LogOut,
  MapPinned,
  Menu,
  MessageCircle,
  Sparkles,
  Star,
  UserRoundPen,
  X,
  type LucideIcon,
} from 'lucide-react';

type GuideNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
};

const GUIDE_NAV_SECTIONS: { section: string; items: GuideNavItem[] }[] = [
  {
    section: 'Tableau de bord',
    items: [
      { href: '/guide/tableau-de-bord', icon: House, label: 'Accueil' },
      { href: '/guide/demandes', icon: Inbox, label: 'Nouvelles demandes' },
      { href: '/guide/missions', icon: Sparkles, label: 'Mes missions' },
      { href: '/guide/messages', icon: MessageCircle, label: 'Messages' },
    ],
  },
  {
    section: 'Gestion',
    items: [
      { href: '/guide/calendrier', icon: CalendarDays, label: 'Calendrier' },
      { href: '/guide/lieux', icon: MapPinned, label: 'Lieux de visite' },
      { href: '/guide/revenus', icon: CircleDollarSign, label: 'Mes revenus' },
      { href: '/guide/avis', icon: Star, label: 'Mes avis' },
    ],
  },
  {
    section: 'Mon profil',
    items: [
      { href: '/guide/profil', icon: UserRoundPen, label: 'Modifier profil' },
    ],
  },
  {
    section: 'Ressources',
    items: [
      { href: '/guide/formation', icon: GraduationCap, label: 'Formation SAFARUMA' },
      { href: '/guide/documents', icon: ClipboardList, label: 'Mes documents' },
      { href: '/guide/performances', icon: ChartNoAxesCombined, label: 'Performances' },
      { href: '/conditions-guides', icon: ClipboardList, label: 'Conditions Guides', external: true },
      { href: '/charte-islamique', icon: LockKeyhole, label: 'Charte SAFARUMA', external: true },
      { href: '/devenir-guide', icon: HandCoins, label: 'Revenus & Écosystème' },
      { href: '/nos-guides-certifies', icon: BadgeCheck, label: 'Certification SAFARUMA', external: true },
    ],
  },
];

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const guideSession = useGuideSession();
  const router = useRouter();
  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');

  const su = guideSession;
  const displayName = su?.firstName && su?.lastName
    ? `${su.firstName} ${su.lastName}`
    : su?.displayName || su?.email || 'Guide';
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || 'G';
  const isLive = su.guideStatus === 'ACTIVE'
    && su.acceptingBookings
    && (su.servesMakkah || su.servesMadinah)
    && Boolean(su.guideSlug);
  const publicProfileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/guides/${su.guideSlug}`;

  const copyProfileLink = async () => {
    if (!isLive) return;
    await navigator.clipboard.writeText(publicProfileUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const shareProfile = async () => {
    if (!isLive) return;
    if (navigator.share) {
      await navigator.share({ title: `Profil Guide SAFARUMA — ${displayName}`, url: publicProfileUrl }).catch(() => null);
      return;
    }
    await copyProfileLink();
  };

  const logout = async () => {
    await fetch('/api/guide/auth/logout', { method: 'POST' }).catch(() => null);
    router.replace('/guide/connexion');
    router.refresh();
  };

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
        @media (max-width: 1023px) { .guide-center-brand { display: none !important; } }
        .guide-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 49; backdrop-filter: blur(2px); }
        @media (max-width: 1023px) { .guide-overlay.is-open { display: block; } }
        .guide-sb-close { display: none !important; }
        @media (max-width: 1023px) { .guide-sb-close { display: flex !important; } }
        .g-nav-link { transition: background-color 0.15s ease-out, color 0.15s ease-out, transform 0.15s ease-out; }
        .g-nav-link:hover { background: rgba(201,168,76,0.08) !important; color: rgba(255,255,255,0.8) !important; }
        .g-nav-link:active { transform: translateX(2px); }
        .g-nav-link:focus-visible,
        .guide-main button:focus-visible,
        .guide-main a:focus-visible {
          outline: 3px solid rgba(201,168,76,0.48);
          outline-offset: 2px;
        }
        .guide-main button {
          transition: transform 0.14s ease-out, box-shadow 0.14s ease-out, background-color 0.14s ease-out, color 0.14s ease-out, opacity 0.14s ease-out;
        }
        .guide-main button:active:not(:disabled) { transform: translateY(1px) scale(0.985); }
        .guide-route-loading__spinner {
          width: 34px;
          height: 34px;
          border: 3px solid rgba(201,168,76,0.24);
          border-top-color: #C9A84C;
          border-radius: 50%;
          animation: guide-spin 0.72s linear infinite;
        }
        @keyframes guide-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .guide-sidebar,
          .g-nav-link,
          .guide-main button { transition: none !important; }
          .guide-route-loading__spinner { animation-duration: 1.5s; }
        }
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
              <button type="button" aria-label="Fermer le menu Guide" className="guide-sb-close" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.72)', lineHeight: 1, padding: 0, alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}><X size={19} /></button>
            </div>
          </div>

          {/* Guide profile + availability toggle */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#1A1209' }}>{initials}</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: isLive ? '#22C55E' : '#6B7280', border: '2px solid #1A1209', boxShadow: isLive ? '0 0 0 3px rgba(34,197,94,0.13)' : 'none' }} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
              <div style={{ marginTop: 2, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em', color: isLive ? '#86EFAC' : 'rgba(255,255,255,0.4)' }}>
                {isLive ? '● LIVE' : '● OFF'}
              </div>
              <Link href="/guide/calendrier" aria-label="Gérer mes disponibilités dans le calendrier" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', textDecoration: 'none' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#F0D897' }}>Gérer les disponibilités →</span>
              </Link>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, paddingTop: '0.5rem', overflowY: 'auto' }}>
            {GUIDE_NAV_SECTIONS.map((group) => (
              <div key={group.section}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.44)', padding: '0.95rem 1.5rem 0.4rem' }}>{group.section}</div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const content = <><Icon size={18} strokeWidth={active ? 2.2 : 1.8} style={{ flex: '0 0 18px' }} /><span style={{ flex: 1 }}>{item.label}</span></>;
                  const linkStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.75rem', minHeight: 44, padding: '0.55rem 1.5rem', boxSizing: 'border-box', textDecoration: 'none', fontSize: '0.84rem', fontWeight: active ? 700 : 500, color: active ? '#F0D897' : 'rgba(255,255,255,0.68)', background: active ? 'rgba(201,168,76,0.12)' : 'transparent', borderLeft: `2px solid ${active ? '#C9A84C' : 'transparent'}` };
                  return item.external ? (
                    <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="g-nav-link" style={linkStyle}>{content}<ExternalLink aria-hidden="true" size={13} /></a>
                  ) : (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="g-nav-link" style={linkStyle}>{content}</Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <button onClick={logout} style={{ minHeight: 44, display: 'flex', alignItems: 'center', gap: 9, fontSize: '0.82rem', fontWeight: 700, color: '#FCA5A5', background: 'rgba(220,38,38,0.11)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 9, cursor: 'pointer', textAlign: 'left', padding: '0.65rem 0.8rem' }}><LogOut size={18} /> Déconnexion</button>
          </div>
        </aside>

        {/* Mobile overlay */}
        <div className={`guide-overlay${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} />

        {/* ── MAIN ── */}
        <div className="guide-main">
          {/* Topbar */}
          <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(245,242,236,0.94)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #EDE8DC', padding: '0.9rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="button" aria-label="Ouvrir le menu Guide" aria-expanded={open} className="guide-hamburger" onClick={() => setOpen(true)} style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid #EDE8DC', background: 'white', cursor: 'pointer', gap: 4, flexShrink: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><Menu size={20} /></button>
              <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 600, color: '#1A1209' }}>Espace Guide</span>
            </div>
            <Link href="/" className="guide-center-brand" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', letterSpacing: '0.08em', whiteSpace: 'nowrap', textDecoration: 'none' }}>
              SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
              <button type="button" aria-label="Notifications" style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', border: '1px solid #EDE8DC', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Bell size={18} />
                <span style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#C0392B', border: '2px solid white' }} />
              </button>
              <button
                type="button"
                disabled={!isLive}
                aria-expanded={shareOpen}
                onClick={() => setShareOpen(value => !value)}
                title={isLive ? 'Partager mon profil public' : 'Le partage sera disponible lorsque votre profil sera LIVE'}
                style={{ padding: '0.5rem 1.25rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, background: isLive ? '#C9A84C' : '#E5E1D8', color: isLive ? '#1A1209' : '#8B8174', border: 'none', cursor: isLive ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}
              >
                Partager mon profil
              </button>
              {shareOpen && isLive && (
                <div style={{ position: 'absolute', top: 'calc(100% + 0.65rem)', right: 0, zIndex: 60, width: 230, padding: '0.65rem', borderRadius: 12, border: '1px solid #E8DFC8', background: 'white', boxShadow: '0 16px 40px rgba(26,18,9,0.16)', display: 'grid', gap: '0.35rem' }}>
                  <button type="button" onClick={shareProfile} style={{ padding: '0.65rem 0.75rem', border: 0, borderRadius: 8, background: '#F5F2EC', color: '#1A1209', textAlign: 'left', fontWeight: 700, cursor: 'pointer' }}>Partager…</button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Découvrez mon profil Guide SAFARUMA : ${publicProfileUrl}`)}`} target="_blank" rel="noopener noreferrer" style={{ padding: '0.65rem 0.75rem', borderRadius: 8, background: '#F0FDF4', color: '#166534', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 700 }}>Partager sur WhatsApp</a>
                  <button type="button" onClick={copyProfileLink} style={{ padding: '0.65rem 0.75rem', border: 0, borderRadius: 8, background: '#F5F2EC', color: '#1A1209', textAlign: 'left', fontWeight: 700, cursor: 'pointer' }}>{copied ? 'Lien copié ✓' : 'Copier le lien'}</button>
                </div>
              )}
            </div>
          </header>

          <main style={{ position: 'relative', flex: 1, overflowY: 'auto', minHeight: 0, padding: '2rem 1.75rem', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
