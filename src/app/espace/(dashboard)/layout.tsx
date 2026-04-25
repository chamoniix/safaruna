'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const IcoHome = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#C9A84C' : 'none'} stroke={active ? '#C9A84C' : 'rgba(26,18,9,0.4)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IcoExplore = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#C9A84C' : 'rgba(26,18,9,0.4)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const IcoTrips = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#C9A84C' : 'rgba(26,18,9,0.4)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M3 7h18M3 12h18"/>
  </svg>
);

const IcoMessages = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#C9A84C' : 'none'} stroke={active ? '#C9A84C' : 'rgba(26,18,9,0.4)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IcoProfil = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#C9A84C' : 'rgba(26,18,9,0.4)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const TABS = [
  { href: '/espace/tableau-de-bord', label: 'Accueil',     Icon: IcoHome },
  { href: '/guides',                 label: 'Explorer',    Icon: IcoExplore },
  { href: '/espace/reservations',    label: 'Mes voyages', Icon: IcoTrips },
  { href: '/espace/messages',        label: 'Messages',    Icon: IcoMessages },
  { href: '/espace/profil',          label: 'Profil',      Icon: IcoProfil },
] as const;

export default function PelerinLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; }
        html, body {
          margin: 0; padding: 0;
          overscroll-behavior: none;
          background: #FAF3E0;
        }
        .pelerin-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          height: 100dvh;
          background: #FAF3E0;
          font-family: var(--font-manrope, 'Manrope', sans-serif);
          color: #1A1209;
          display: flex;
          flex-direction: column;
        }
        .pelerin-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          height: calc(100dvh - 80px);
        }
        .pelerin-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: calc(80px + env(safe-area-inset-bottom));
          padding-bottom: env(safe-area-inset-bottom);
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(201, 168, 76, 0.2);
          display: flex;
          align-items: flex-start;
          justify-content: space-around;
          z-index: 100;
          user-select: none;
        }
        .pelerin-tab {
          -webkit-tap-highlight-color: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex: 1;
          height: 80px;
          text-decoration: none;
          cursor: pointer;
          position: relative;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          padding-top: 12px;
        }
        .pelerin-tab:active {
          transform: scale(0.92);
        }
        .pelerin-tab-label {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          transition: color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          line-height: 1;
        }
        .pelerin-tab-dot {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #C9A84C;
        }
        .pelerin-tab-icon {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pelerin-tab.is-active .pelerin-tab-icon {
          transform: translateY(-1px);
        }
      `}} />

      <div className="pelerin-root">
        <div className="pelerin-scroll">
          <main style={{ minHeight: 'calc(100dvh - 80px)', padding: '0' }}>
            {children}
          </main>
        </div>

        <nav className="pelerin-bottom-nav" aria-label="Navigation principale">
          {TABS.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`pelerin-tab${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                aria-label={label}
              >
                <span className="pelerin-tab-icon">
                  <Icon active={active} />
                </span>
                <span
                  className="pelerin-tab-label"
                  style={{ color: active ? '#C9A84C' : 'rgba(26,18,9,0.4)' }}
                >
                  {label}
                </span>
                {active && (
                  <span className="pelerin-tab-dot" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
