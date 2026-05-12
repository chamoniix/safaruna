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
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    if (!transparentOnHero && !darkHeroMode) return;
    const onScroll = () => setScrolled(window.scrollY > scrollThreshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentOnHero, darkHeroMode, scrollThreshold]);

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
          background: rgba(250,247,240,0.96); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(201,168,76,0.2);
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          padding: 0 2rem;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
          transition: background 0.3s ease-in-out, border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        }
        .nb-bar-dark {
          background: #1A1209 !important;
          backdrop-filter: none !important;
          border-bottom: 1px solid rgba(201,168,76,0.15) !important;
        }
        /* ── Logo ── */
        .nb-logo {
          font-family: var(--font-cormorant, serif); font-size: 1.75rem; font-weight: 700;
          color: #1A1209; text-decoration: none; letter-spacing: 0.05em; white-space: nowrap; flex-shrink: 0;
        }
        .nb-logo span { color: #C9A84C; }
        .nb-logo-light { color: #FAF7F0 !important; }
        /* ── Desktop nav ── */
        .nb-nav {
          display: flex; align-items: center; gap: 0.25rem; flex: 1; justify-content: center;
        }
        .nb-menu-btn {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.8rem; font-weight: 500; color: #7A6D5A;
          letter-spacing: 0.05em; text-transform: uppercase;
          background: none; border: none; cursor: pointer;
          padding: 0.5rem 0.75rem; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
          font-family: var(--font-manrope, sans-serif); white-space: nowrap;
        }
        .nb-menu-btn:hover, .nb-menu-btn[aria-expanded="true"] { color: #1A1209; background: rgba(201,168,76,0.08); }
        .nb-nav-link {
          font-size: 0.8rem; font-weight: 500; color: #7A6D5A;
          letter-spacing: 0.05em; text-transform: uppercase;
          text-decoration: none; padding: 0.5rem 0.75rem; border-radius: 8px;
          transition: color 0.15s, background 0.15s; white-space: nowrap;
        }
        .nb-nav-link:hover { color: #1A1209; background: rgba(201,168,76,0.08); }
        .nb-nav-dark .nb-menu-btn { color: rgba(240,216,151,0.75); }
        .nb-nav-dark .nb-menu-btn:hover, .nb-nav-dark .nb-menu-btn[aria-expanded="true"] { color: #C9A84C; background: rgba(201,168,76,0.12); }
        .nb-nav-dark .nb-nav-link { color: rgba(240,216,151,0.75); }
        .nb-nav-dark .nb-nav-link:hover { color: #C9A84C; background: rgba(201,168,76,0.12); }
        .nb-nav-transparent .nb-menu-btn { color: rgba(255,255,255,0.88); }
        .nb-nav-transparent .nb-menu-btn:hover, .nb-nav-transparent .nb-menu-btn[aria-expanded="true"] { color: #FFFFFF; background: rgba(255,255,255,0.12); }
        .nb-nav-transparent .nb-nav-link { color: rgba(255,255,255,0.88); }
        .nb-nav-transparent .nb-nav-link:hover { color: #FFFFFF; background: rgba(255,255,255,0.12); }
        .nb-btn-login-transparent { color: rgba(255,255,255,0.88) !important; }
        .nb-btn-login-transparent:hover { color: #FFFFFF !important; }
        .nb-btn-register-transparent { background: #C9A84C !important; color: #FFFFFF !important; }
        .nb-btn-register-transparent:hover { background: #B8962E !important; }
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
          font-size: 0.8rem; font-weight: 600; color: #1A1209; text-decoration: none; white-space: nowrap;
        }
        .nb-btn-login:hover { color: #8B6914; }
        .nb-btn-login-dark { color: rgba(240,216,151,0.85) !important; }
        .nb-btn-login-dark:hover { color: #C9A84C !important; }
        .nb-btn-register {
          background: #1A1209; color: #F0D897; padding: 0.5rem 1.2rem; border-radius: 50px;
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; transition: background 0.2s; white-space: nowrap;
        }
        .nb-btn-register:hover { background: #2D1F08; }
        /* ── User menu ── */
        .nb-user-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: none; border: 1px solid #E8DFC8; border-radius: 50px;
          padding: 0.35rem 0.75rem 0.35rem 0.5rem; cursor: pointer;
          font-family: var(--font-manrope, sans-serif); transition: border-color 0.15s;
          color: #1A1209;
        }
        .nb-user-btn:hover { border-color: #C9A84C; }
        .nb-user-name { font-size: 0.78rem; font-weight: 600; color: #1A1209; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
          background: none; border: 1.5px solid #E8DFC8; border-radius: 8px;
          cursor: pointer; padding: 6px 8px; width: 40px; height: 36px;
        }
        .nb-hamburger span {
          display: block; height: 2px; background: #1A1209; border-radius: 2px;
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
          .nb-bar { padding: 0 1.25rem !important; }
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
          style={isTransparent ? { background: 'transparent', backdropFilter: 'none', WebkitBackdropFilter: 'none', borderBottom: 'none', boxShadow: 'none' } : {}}>

          {/* Logo */}
          <Link href="/" className={`nb-logo${isDarkHero ? ' nb-logo-light' : ''}`}
            style={{ opacity: isTransparent ? 0 : 1, pointerEvents: isTransparent ? 'none' : 'auto', transition: 'opacity 0.3s ease-in-out' }}>
            SAFAR<span>U</span>MA
          </Link>

          {/* Desktop nav — toujours rendu, classe dynamique pour couleur */}
          {true && (
            <nav className={`nb-nav${isDarkHero ? ' nb-nav-dark' : isTransparent ? ' nb-nav-transparent' : ''}`} aria-label="Navigation principale">
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
            </nav>
          )}

          {/* Desktop actions — toujours rendues, classes dynamiques */}
          {true && (
            <div className="nb-actions">
              {session ? (
                <div className="nb-menu-wrap" style={{ position: 'relative' }}>
                  <button
                    className="nb-user-btn"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => setUserMenuOpen(o => !o)}
                    aria-label="Mon compte"
                    style={isTransparent ? { borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' } : {}}
                  >
                    <UserIcon />
                    <span className="nb-user-name" style={isTransparent ? { color: '#FFFFFF' } : {}}>{session.user?.name?.split(' ')[0] || 'Mon compte'}</span>
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
                  <Link href="/connexion" className={`nb-btn-login${isDarkHero ? ' nb-btn-login-dark' : isTransparent ? ' nb-btn-login-transparent' : ''}`}>
                    Connexion
                  </Link>
                  <Link href="/inscription" className={`nb-btn-register${isTransparent ? ' nb-btn-register-transparent' : ''}`}>
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
