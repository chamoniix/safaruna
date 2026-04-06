'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const HIDE_BANNER_PATHS = ['/connexion', '/inscription', '/guide/connexion', '/guide/inscription', '/admin'];

const NAV_LINKS = [
  { href: '/guides', label: 'Nos guides' },
  { href: '/#packages', label: 'Forfaits' },
  { href: '/services', label: 'Services' },
  { href: '/guide-omra', label: 'Guide Omra' },
  { href: '/certification', label: 'Certification' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/a-propos', label: 'À propos' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const hideBanner = HIDE_BANNER_PATHS.some(p => pathname.startsWith(p));
  const role = (session?.user as any)?.role;

  const dashboardHref =
    role === 'GUIDE' ? '/guide/tableau-de-bord' :
    role === 'ADMIN' ? '/admin/tableau-de-bord' :
    '/espace/tableau-de-bord';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .nb-root {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          font-family: var(--font-manrope, sans-serif);
        }
        .nb-banner {
          background: #1A1209; color: #F0D897;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.55rem 1rem; font-size: 0.78rem; font-weight: 500; text-align: center;
        }
        .nb-banner a { color: #C9A84C; font-weight: 700; text-decoration: underline; }
        .nb-banner-dot { width: 6px; height: 6px; border-radius: 50%; background: #C9A84C; flex-shrink: 0; animation: nbpulse 2s infinite; }
        @keyframes nbpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .nb-bar {
          background: rgba(250,247,240,0.95); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(201,168,76,0.2);
          padding: 0.9rem 2rem;
          display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
        }
        .nb-logo {
          font-family: var(--font-cormorant, serif); font-size: 1.75rem; font-weight: 700;
          color: #1A1209; text-decoration: none; letter-spacing: 0.05em; white-space: nowrap;
        }
        .nb-logo span { color: #C9A84C; }
        .nb-links {
          display: flex; align-items: center; gap: 1.75rem; flex-wrap: nowrap;
        }
        .nb-links a {
          font-size: 0.8rem; font-weight: 500; color: #7A6D5A; text-decoration: none;
          letter-spacing: 0.05em; text-transform: uppercase; transition: color 0.2s; white-space: nowrap;
        }
        .nb-links a:hover { color: #8B6914; }
        .nb-actions { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
        .nb-user-name { font-size: 0.82rem; font-weight: 600; color: #1A1209; white-space: nowrap; }
        .nb-btn-dash {
          background: #1A1209; color: #F0D897; padding: 0.5rem 1.1rem; border-radius: 50px;
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          text-decoration: none; transition: background 0.2s; white-space: nowrap;
        }
        .nb-btn-dash:hover { background: #2D1F08; }
        .nb-btn-out {
          background: none; border: 1px solid #E8DFC8; color: #7A6D5A; padding: 0.45rem 1rem;
          border-radius: 50px; font-size: 0.78rem; font-weight: 600; cursor: pointer;
          font-family: var(--font-manrope, sans-serif); transition: border-color 0.2s, color 0.2s;
          white-space: nowrap;
        }
        .nb-btn-out:hover { border-color: #C9A84C; color: #1A1209; }
        .nb-btn-login {
          font-size: 0.82rem; font-weight: 600; color: #1A1209; text-decoration: none; white-space: nowrap;
        }
        .nb-btn-login:hover { color: #8B6914; }
        .nb-btn-register {
          background: #1A1209; color: #F0D897; padding: 0.55rem 1.3rem; border-radius: 50px;
          font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; transition: background 0.2s; white-space: nowrap;
        }
        .nb-btn-register:hover { background: #2D1F08; }
        .nb-hamburger {
          display: none; flex-direction: column; justify-content: center; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px; width: 36px; height: 36px;
        }
        .nb-hamburger span {
          display: block; height: 2px; background: #1A1209; border-radius: 2px;
          transition: transform 0.2s, opacity 0.2s;
        }
        .nb-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .nb-hamburger.open span:nth-child(2) { opacity: 0; }
        .nb-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .nb-mobile-menu {
          display: none; flex-direction: column; background: rgba(250,247,240,0.98);
          border-top: 1px solid rgba(201,168,76,0.15); padding: 1.25rem 1.5rem 1.5rem;
          gap: 0.25rem;
        }
        .nb-mobile-menu.open { display: flex; }
        .nb-mobile-link {
          font-size: 0.9rem; font-weight: 500; color: #7A6D5A; text-decoration: none;
          padding: 0.65rem 0; border-bottom: 1px solid rgba(201,168,76,0.1);
          text-transform: uppercase; letter-spacing: 0.05em; transition: color 0.15s;
        }
        .nb-mobile-link:last-of-type { border-bottom: none; }
        .nb-mobile-link:hover { color: #1A1209; }
        .nb-mobile-auth { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .nb-mobile-dash {
          background: #1A1209; color: #F0D897; padding: 0.75rem; border-radius: 50px;
          font-size: 0.85rem; font-weight: 600; text-align: center; text-decoration: none;
          letter-spacing: 0.05em;
        }
        .nb-mobile-out {
          background: none; border: 1px solid #E8DFC8; color: #7A6D5A; padding: 0.7rem;
          border-radius: 50px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
          font-family: var(--font-manrope, sans-serif); width: 100%;
        }
        .nb-mobile-register {
          background: #1A1209; color: #F0D897; padding: 0.75rem; border-radius: 50px;
          font-size: 0.85rem; font-weight: 600; text-align: center; text-decoration: none;
          display: block;
        }
        .nb-mobile-login {
          font-size: 0.85rem; font-weight: 600; color: #1A1209; text-decoration: none;
          text-align: center; padding: 0.5rem 0;
        }
        @media (max-width: 1023px) {
          .nb-links { display: none; }
          .nb-actions { display: none; }
          .nb-hamburger { display: flex; }
        }
      `}} />

      <div className="nb-root">
        {!hideBanner && (
          <div className="nb-banner">
            <span className="nb-banner-dot" />
            <span className="nb-banner-desktop" style={{ display: 'none' }}>
              🕌 Ramadan 2025 — Réservez votre guide dès maintenant et bénéficiez de{' '}
              <Link href="/guides">disponibilités prioritaires</Link>
              {' '}· Paiement sécurisé · Annulation gratuite 48h
            </span>
            <span>
              🕌 <Link href="/guides">Réservez votre guide Omra</Link>
            </span>
          </div>
        )}

        <div className="nb-bar">
          <Link href="/" className="nb-logo">
            SAFAR<span>U</span>MA
          </Link>

          <div className="nb-links">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </div>

          <div className="nb-actions">
            {session ? (
              <>
                <span className="nb-user-name">{session.user?.name || session.user?.email}</span>
                <Link href={dashboardHref} className="nb-btn-dash">Mon espace</Link>
                <button className="nb-btn-out" onClick={() => signOut({ callbackUrl: '/' })}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/connexion" className="nb-btn-login">Connexion</Link>
                <Link href="/inscription" className="nb-btn-register">S&apos;inscrire</Link>
              </>
            )}
          </div>

          <button
            className={`nb-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>

        <div className={`nb-mobile-menu${menuOpen ? ' open' : ''}`}>
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="nb-mobile-link" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}

          <div className="nb-mobile-auth">
            {session ? (
              <>
                <Link href={dashboardHref} className="nb-mobile-dash" onClick={() => setMenuOpen(false)}>
                  Mon espace
                </Link>
                <button className="nb-mobile-out" onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }); }}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/inscription" className="nb-mobile-register" onClick={() => setMenuOpen(false)}>
                  S&apos;inscrire gratuitement
                </Link>
                <Link href="/connexion" className="nb-mobile-login" onClick={() => setMenuOpen(false)}>
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
