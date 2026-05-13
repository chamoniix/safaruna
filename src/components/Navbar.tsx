'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

const HIDE_BANNER_PATHS = ['/connexion', '/inscription', '/guide/connexion', '/guide/inscription', '/admin'];

// ─── Menu structure ─────────────────────────────────────────────────────────

const MENUS = [
  {
    id: 'decouvrir',
    label: 'Découvrir',
    items: [
      { href: '/guides',             label: 'Nos guides',            desc: 'Trouvez votre guide certifié' },
      { href: '/lieux-saints',       label: 'Lieux saints',          desc: '26 fiches encyclopédiques' },
      { href: '/nos-guides-certifies', label: 'Guides certifiés',    desc: 'Notre processus de vérification' },
    ],
  },
  {
    id: 'services',
    label: 'Nos services',
    items: [
      { href: '/vivre-la-omra',      label: 'Vivre la Omra',         desc: 'Accompagnement spirituel' },
      { href: '/comment-ca-marche',  label: 'Comment ça marche',     desc: 'Le parcours en 3 étapes' },
      { href: '/guide-omra',         label: 'Guide Omra PDF',         desc: 'Guide étape par étape' },
    ],
  },
  {
    id: 'ressources',
    label: 'Ressources',
    items: [
      { href: '/blog',               label: 'Blog',                  desc: 'Articles & conseils' },
      { href: '/faq',                label: 'FAQ',                   desc: 'Questions fréquentes' },
    ],
  },
] as const;

// ─── Chevron SVG ─────────────────────────────────────────────────────────────

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12" fill="none"
      style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── User icon SVG ───────────────────────────────────────────────────────────

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Navbar({
  transparentOnHero = false,
  scrollThreshold = 80,
  darkHeroMode = false,
}: {
  transparentOnHero?: boolean;
  scrollThreshold?: number;
  darkHeroMode?: boolean;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Scroll detection (ancien prop-based)
  useEffect(() => {
    if (!transparentOnHero && !darkHeroMode) return;
    const onScroll = () => setScrolled(window.scrollY > scrollThreshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentOnHero, darkHeroMode, scrollThreshold]);

  // Scroll detection — background beige au-dessus du 1er bloc chiffres (~1 viewport de hauteur)
  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpenMenu(null); setUserMenuOpen(false); setMobileOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isTransparent = transparentOnHero && !scrolled;
  const isDarkHero = darkHeroMode && !scrolled;
  const hideBanner = pathname ? HIDE_BANNER_PATHS.some(p => pathname.startsWith(p)) : false;
  const role = (session?.user as { role?: string })?.role;

  const dashboardHref =
    role === 'GUIDE' ? '/guide/tableau-de-bord' :
    role === 'ADMIN' ? '/admin/tableau-de-bord' :
    '/espace/tableau-de-bord';

  // Hover handlers with delay to prevent accidental close
  const handleMenuEnter = useCallback((id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(id);
  }, []);

  const handleMenuLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  }, []);

  const handleMenuItemClick = useCallback(() => {
    setOpenMenu(null);
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .nb-root {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          font-family: var(--font-manrope, sans-serif);
        }
        /* ── Banner ── */
        .nb-banner {
          background: #251913; color: #FFFFFF;
          display: flex; align-items: center; justify-content: center; gap: 20px;
          padding: 12px 16px; border-bottom: 1px solid rgba(201,168,76,0.3);
        }
        .nb-banner-pdf-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 8px 18px; border: 0.5px solid #C9A84C; border-radius: 999px;
          font-size: 11px; color: #22C55E; letter-spacing: 0.08em; font-weight: 600;
          flex-shrink: 0; text-decoration: none;
        }
        /* ── Bar ── */
        .nb-bar {
          border-radius: 20px;
          padding: 0 2rem;
          gap: 1rem;
          height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          transition:
            height      300ms cubic-bezier(0.4,0,0.2,1),
            margin      300ms cubic-bezier(0.4,0,0.2,1),
            background  250ms ease,
            backdrop-filter 250ms ease,
            box-shadow  250ms ease;
        }
        .nb-bar-dark {
          background: #1A1209 !important;
          backdrop-filter: none !important;
          border-bottom: 1px solid rgba(201,168,76,0.15) !important;
        }
        /* ── Logo ── */
        .nb-logo {
          display: flex; align-items: center; flex-shrink: 0; text-decoration: none;
        }
        .nb-logo img { height: 36px; width: auto; display: block; transition: height 300ms cubic-bezier(0.4,0,0.2,1); }
        /* ── Desktop nav ── */
        .nb-nav {
          display: flex; align-items: center; gap: 0.25rem; flex: 1; justify-content: center;
        }
        .nb-menu-btn {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.9);
          letter-spacing: 0.05em; text-transform: uppercase;
          background: none; border: none; cursor: pointer;
          padding: 0.5rem 0.75rem; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
          font-family: var(--font-manrope, sans-serif); white-space: nowrap;
        }
        .nb-menu-btn:hover, .nb-menu-btn[aria-expanded="true"] { color: #FFFFFF; background: rgba(255,255,255,0.1); }
        .nb-nav-link {
          font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.9);
          letter-spacing: 0.05em; text-transform: uppercase;
          text-decoration: none; padding: 0.5rem 0.75rem; border-radius: 8px;
          transition: color 0.15s, background 0.15s; white-space: nowrap;
        }
        .nb-nav-link:hover { color: #FFFFFF; background: rgba(255,255,255,0.1); }
        .nb-nav-dark .nb-menu-btn { color: rgba(240,216,151,0.75); }
        .nb-nav-dark .nb-menu-btn:hover, .nb-nav-dark .nb-menu-btn[aria-expanded="true"] { color: #C9A84C; background: rgba(201,168,76,0.12); }
        .nb-nav-dark .nb-nav-link { color: rgba(240,216,151,0.75); }
        .nb-nav-dark .nb-nav-link:hover { color: #C9A84C; background: rgba(201,168,76,0.12); }
        /* ── Dropdown ── */
        .nb-dropdown {
          position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%);
          background: #FFFFFF; border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
          padding: 0.5rem; min-width: 240px;
          animation: nb-fadein 0.18s ease forwards;
          z-index: 300;
        }
        @keyframes nb-fadein {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .nb-dropdown-item {
          display: flex; flex-direction: column; gap: 2px;
          padding: 0.6rem 0.875rem; border-radius: 8px;
          text-decoration: none; transition: background 0.12s;
          border-bottom: 0.5px solid #F0EBE0;
        }
        .nb-dropdown-item:last-child { border-bottom: none; }
        .nb-dropdown-item:hover { background: #FAF7F0; }
        .nb-dropdown-label { font-size: 0.875rem; font-weight: 600; color: #1A1209; }
        .nb-dropdown-desc { font-size: 0.75rem; color: #9A8D7A; }
        /* ── Dropdown wrapper (relative) ── */
        .nb-menu-wrap { position: relative; }
        /* ── Actions ── */
        .nb-actions { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
        .nb-btn-login {
          font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.9); text-decoration: none; white-space: nowrap;
        }
        .nb-btn-login:hover { color: #FFFFFF; }
        .nb-btn-login-dark { color: rgba(240,216,151,0.85) !important; }
        .nb-btn-login-dark:hover { color: #C9A84C !important; }
        .nb-btn-register {
          background: #C9A84C; color: #1A1209; padding: 0.5rem 1.2rem; border-radius: 50px;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; transition: background 0.2s; white-space: nowrap;
        }
        .nb-btn-register:hover { background: #b8962e; }
        /* ── User menu ── */
        .nb-user-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: none; border: 1px solid rgba(255,255,255,0.35); border-radius: 50px;
          padding: 0.35rem 0.75rem 0.35rem 0.5rem; cursor: pointer;
          font-family: var(--font-manrope, sans-serif); transition: border-color 0.15s;
          color: rgba(255,255,255,0.9);
        }
        .nb-user-btn:hover { border-color: #C9A84C; color: #FFFFFF; }
        .nb-user-name { font-size: 0.78rem; font-weight: 600; color: rgba(255,255,255,0.9); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .nb-user-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #FFFFFF; border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06);
          padding: 0.5rem; min-width: 180px;
          animation: nb-fadein-right 0.18s ease forwards;
          z-index: 300;
        }
        @keyframes nb-fadein-right {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nb-user-item {
          display: block; padding: 0.6rem 0.875rem; border-radius: 8px;
          font-size: 0.85rem; font-weight: 500; color: #1A1209; text-decoration: none;
          transition: background 0.12s; border-bottom: 0.5px solid #F0EBE0;
        }
        .nb-user-item:last-child { border-bottom: none; }
        .nb-user-item:hover { background: #FAF7F0; }
        .nb-user-item-danger { color: #9A3B2A !important; }
        .nb-user-item-btn {
          width: 100%; text-align: left; background: none; border: none; cursor: pointer;
          font-family: var(--font-manrope, sans-serif);
        }
        /* ── Hamburger ── */
        .nb-hamburger {
          display: none; flex-direction: column; justify-content: center; gap: 5px;
          background: none; border: 1.5px solid rgba(255,255,255,0.35); border-radius: 8px;
          cursor: pointer; padding: 6px 8px; width: 40px; height: 36px;
        }
        .nb-hamburger span {
          display: block; height: 2px; background: rgba(255,255,255,0.9); border-radius: 2px;
          transition: transform 0.2s, opacity 0.2s; width: 100%;
        }
        .nb-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .nb-hamburger.open span:nth-child(2) { opacity: 0; }
        .nb-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        /* ── Mobile overlay ── */
        .nb-mobile-overlay {
          display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.35);
          z-index: 198; animation: nb-overlay-in 0.2s ease;
        }
        @keyframes nb-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        .nb-mobile-overlay.open { display: block; }
        /* ── Mobile drawer ── */
        .nb-mobile-drawer {
          position: fixed; top: 0; right: 0; bottom: 0; width: min(340px, 92vw);
          background: #FAF7F0; z-index: 199; overflow-y: auto;
          display: flex; flex-direction: column;
          transform: translateX(100%); transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          box-shadow: -8px 0 32px rgba(0,0,0,0.12);
        }
        .nb-mobile-drawer.open { transform: translateX(0); }
        .nb-drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.25rem; border-bottom: 1px solid rgba(201,168,76,0.2);
          flex-shrink: 0;
        }
        .nb-drawer-close {
          background: none; border: none; cursor: pointer; padding: 6px;
          color: #7A6D5A; border-radius: 6px; display: flex; align-items: center;
        }
        .nb-drawer-close:hover { color: #1A1209; background: rgba(201,168,76,0.1); }
        .nb-drawer-body { flex: 1; padding: 0.75rem 0; }
        .nb-drawer-section { border-bottom: 1px solid rgba(201,168,76,0.15); }
        .nb-drawer-section-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 0.875rem 1.25rem; background: none; border: none; cursor: pointer;
          font-family: var(--font-manrope, sans-serif); font-size: 0.82rem; font-weight: 700;
          color: #1A1209; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .nb-drawer-section-btn:hover { background: rgba(201,168,76,0.06); }
        .nb-drawer-items { overflow: hidden; }
        .nb-drawer-link {
          display: flex; flex-direction: column; gap: 2px;
          padding: 0.65rem 1.5rem; text-decoration: none;
          border-bottom: 0.5px solid rgba(201,168,76,0.1);
          transition: background 0.12s;
        }
        .nb-drawer-link:last-child { border-bottom: none; }
        .nb-drawer-link:hover { background: rgba(201,168,76,0.06); }
        .nb-drawer-link-label { font-size: 0.875rem; font-weight: 600; color: #1A1209; }
        .nb-drawer-link-desc { font-size: 0.75rem; color: #9A8D7A; }
        .nb-drawer-direct {
          display: block; padding: 0.875rem 1.25rem; text-decoration: none;
          font-size: 0.82rem; font-weight: 700; color: #1A1209;
          letter-spacing: 0.08em; text-transform: uppercase;
          border-bottom: 1px solid rgba(201,168,76,0.15);
          transition: background 0.12s;
        }
        .nb-drawer-direct:hover { background: rgba(201,168,76,0.06); }
        .nb-drawer-footer {
          padding: 1.25rem; border-top: 1px solid rgba(201,168,76,0.2);
          display: flex; flex-direction: column; gap: 0.75rem; flex-shrink: 0;
        }
        .nb-drawer-register {
          background: #1A1209; color: #F0D897; padding: 0.8rem; border-radius: 50px;
          font-size: 0.85rem; font-weight: 600; text-align: center; text-decoration: none;
          display: block; letter-spacing: 0.05em;
        }
        .nb-drawer-login {
          font-size: 0.85rem; font-weight: 600; color: #1A1209; text-decoration: none;
          text-align: center; padding: 0.4rem 0;
        }
        .nb-drawer-dash {
          background: #1A1209; color: #F0D897; padding: 0.8rem; border-radius: 50px;
          font-size: 0.85rem; font-weight: 600; text-align: center; text-decoration: none; display: block;
        }
        .nb-drawer-out {
          background: none; border: 1px solid #E8DFC8; color: #7A6D5A; padding: 0.75rem;
          border-radius: 50px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
          font-family: var(--font-manrope, sans-serif); width: 100%;
        }
        /* ── Responsive ── */
        @media (max-width: 1023px) {
          .nb-nav { display: none; }
          .nb-actions { display: none; }
          .nb-hamburger { display: flex !important; }
          .nb-bar { margin: 8px 1rem 0 !important; padding: 0 1.25rem !important; }
        }
      `}} />

      <div className="nb-root" ref={navRef}>

        {/* ── Banner ── */}
        {!hideBanner && (
          <div className="nb-banner">
            <Link href="/guide-omra" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                  <path d="M3 2h7l3 3v9H3V2z" stroke="#C9A84C" strokeWidth="1" strokeLinejoin="round" fill="rgba(201,168,76,0.08)"/>
                  <path d="M10 2v3h3" stroke="#C9A84C" strokeWidth="1" strokeLinejoin="round"/>
                  <path d="M5 8h6M5 10h6M5 12h4" stroke="#C9A84C" strokeWidth="0.7" strokeLinecap="round"/>
                </svg>
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', letterSpacing: '0.02em', lineHeight: 1.25 }}>Guide PDF gratuit</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.25 }}>La Omra étape par étape</div>
              </div>
            </Link>
            <Link href="/guide-omra" className="nb-banner-pdf-btn">RECEVOIR →</Link>
          </div>
        )}

        {/* ── Bar desktop ── */}
        <div className={`nb-bar${isDarkHero ? ' nb-bar-dark' : ''}`}
          style={hasScrolled ? {
            background: 'rgba(26,18,9,0.82)',
            backdropFilter: 'blur(16px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35), 0 1px 4px rgba(201,168,76,0.15)',
            height: '44px',
            margin: '8px 9rem 0',
          } : {
            background: 'rgba(26,18,9,0.45)',
            backdropFilter: 'blur(12px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35), 0 1px 4px rgba(201,168,76,0.15)',
            height: '56px',
            margin: '12px 2rem 0',
          }}>

          {/* Logo */}
          <Link href="/" className="nb-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="SAFARUMA" style={{ height: hasScrolled ? '28px' : '36px' }} />
          </Link>

          {/* Desktop nav */}
          {!isTransparent && (
            <div role="navigation" aria-label="Navigation principale" className={`nb-nav${isDarkHero ? ' nb-nav-dark' : ''}`}>
              {MENUS.map(menu => (
                <div
                  key={menu.id}
                  className="nb-menu-wrap"
                  onMouseEnter={() => handleMenuEnter(menu.id)}
                  onMouseLeave={handleMenuLeave}
                >
                  <button
                    className="nb-menu-btn"
                    aria-expanded={openMenu === menu.id}
                    aria-haspopup="menu"
                    onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
                  >
                    {menu.label}
                    <ChevronDown open={openMenu === menu.id} />
                  </button>
                  {openMenu === menu.id && (
                    <div className="nb-dropdown" role="menu">
                      {menu.items.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="nb-dropdown-item"
                          role="menuitem"
                          onClick={handleMenuItemClick}
                        >
                          <span className="nb-dropdown-label">{item.label}</span>
                          <span className="nb-dropdown-desc">{item.desc}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/a-propos" className="nb-nav-link" onClick={handleMenuItemClick}>
                À propos
              </Link>
            </div>
          )}

          {/* Desktop actions */}
          {!isTransparent && (
            <div className="nb-actions">
              {status === 'loading' ? null : session ? (
                <div className="nb-menu-wrap" style={{ position: 'relative' }}>
                  <button
                    className="nb-user-btn"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => setUserMenuOpen(o => !o)}
                    aria-label="Mon compte"
                  >
                    <UserIcon />
                    <span className="nb-user-name">{session.user?.name?.split(' ')[0] || 'Bienvenu'}</span>
                    <ChevronDown open={userMenuOpen} />
                  </button>
                  {userMenuOpen && (
                    <div className="nb-user-dropdown" role="menu">
                      <Link href={dashboardHref} className="nb-user-item" role="menuitem" onClick={handleMenuItemClick}>
                        Mon espace
                      </Link>
                      <button
                        className="nb-user-item nb-user-item-danger nb-user-item-btn"
                        role="menuitem"
                        onClick={() => { handleMenuItemClick(); signOut({ callbackUrl: '/' }); }}
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/connexion" className={`nb-btn-login${isDarkHero ? ' nb-btn-login-dark' : ''}`}>
                    Connexion
                  </Link>
                  <Link href="/inscription" className="nb-btn-register">
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Hamburger */}
          <button
            className={`nb-hamburger${mobileOpen ? ' open' : ''}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            style={isDarkHero || isTransparent ? { borderColor: 'rgba(201,168,76,0.4)' } : {}}
          >
            <span style={isDarkHero || isTransparent ? { background: 'rgba(240,216,151,0.9)' } : {}} />
            <span style={isDarkHero || isTransparent ? { background: 'rgba(240,216,151,0.9)' } : {}} />
            <span style={isDarkHero || isTransparent ? { background: 'rgba(240,216,151,0.9)' } : {}} />
          </button>
        </div>

        {/* ── Mobile overlay ── */}
        <div
          className={`nb-mobile-overlay${mobileOpen ? ' open' : ''}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        {/* ── Mobile drawer ── */}
        <div className={`nb-mobile-drawer${mobileOpen ? ' open' : ''}`} role="dialog" aria-label="Menu navigation" aria-modal="true">
          <div className="nb-drawer-header">
            <Link href="/" className="nb-logo" onClick={() => setMobileOpen(false)} style={{ fontSize: '1.5rem' }}>
              SAFAR<span>U</span>MA
            </Link>
            <button className="nb-drawer-close" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="nb-drawer-body">
            {MENUS.map(menu => (
              <div key={menu.id} className="nb-drawer-section">
                <button
                  className="nb-drawer-section-btn"
                  onClick={() => setOpenMobileSection(openMobileSection === menu.id ? null : menu.id)}
                  aria-expanded={openMobileSection === menu.id}
                >
                  {menu.label}
                  <ChevronDown open={openMobileSection === menu.id} />
                </button>
                {openMobileSection === menu.id && (
                  <div className="nb-drawer-items">
                    {menu.items.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="nb-drawer-link"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="nb-drawer-link-label">{item.label}</span>
                        <span className="nb-drawer-link-desc">{item.desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/a-propos" className="nb-drawer-direct" onClick={() => setMobileOpen(false)}>
              À propos
            </Link>
          </div>

          <div className="nb-drawer-footer">
            {session ? (
              <>
                <Link href={dashboardHref} className="nb-drawer-dash" onClick={() => setMobileOpen(false)}>
                  Mon espace
                </Link>
                <button
                  className="nb-drawer-out"
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }); }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/inscription" className="nb-drawer-register" onClick={() => setMobileOpen(false)}>
                  S&apos;inscrire gratuitement
                </Link>
                <Link href="/connexion" className="nb-drawer-login" onClick={() => setMobileOpen(false)}>
                  Déjà un compte ? Se connecter
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
