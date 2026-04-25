'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/guide/tableau-de-bord', icon: '⌂', label: 'Dashboard' },
  { href: '/guide/missions',        icon: '✦', label: 'Missions'  },
  { href: '/guide/messages',        icon: '◎', label: 'Messages'  },
  { href: '/guide/calendrier',      icon: '◻', label: 'Calendrier'},
  { href: '/guide/profil',          icon: '☽', label: 'Profil'    },
];

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; }

        .guide-shell {
          position: fixed;
          inset: 0;
          overflow: hidden;
          height: 100dvh;
          background: #FAF3E0;
          font-family: var(--font-manrope, sans-serif);
          color: #1A1209;
        }

        .guide-content {
          position: absolute;
          inset: 0;
          bottom: calc(80px + env(safe-area-inset-bottom, 0px));
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .guide-content-inner {
          min-height: 100%;
          padding: 1.5rem 1.25rem;
          max-width: 680px;
          margin: 0 auto;
        }

        .guide-bottom-nav {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: calc(80px + env(safe-area-inset-bottom, 0px));
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(201, 168, 76, 0.2);
          display: flex;
          align-items: flex-start;
          justify-content: space-around;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          user-select: none;
          z-index: 100;
        }

        .guide-tab {
          -webkit-tap-highlight-color: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          height: 80px;
          flex: 1;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .guide-tab:active {
          transform: scale(0.9);
        }

        .guide-tab-icon {
          font-size: 1.35rem;
          line-height: 1;
          transition: color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .guide-tab-label {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          transition: color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .guide-tab-dot {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%) scale(0);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #C9A84C;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .guide-tab[data-active="true"] .guide-tab-dot {
          transform: translateX(-50%) scale(1);
        }

        .guide-tab[data-active="true"] .guide-tab-icon,
        .guide-tab[data-active="true"] .guide-tab-label {
          color: #C9A84C;
        }

        .guide-tab[data-active="false"] .guide-tab-icon,
        .guide-tab[data-active="false"] .guide-tab-label {
          color: rgba(26, 18, 9, 0.4);
        }
      `}} />

      <div className="guide-shell">
        <div className="guide-content">
          <div className="guide-content-inner">
            {children}
          </div>
        </div>

        <nav className="guide-bottom-nav">
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="guide-tab"
                data-active={String(active)}
                aria-current={active ? 'page' : undefined}
                aria-label={tab.label}
              >
                <span className="guide-tab-icon" aria-hidden="true">{tab.icon}</span>
                <span className="guide-tab-label">{tab.label}</span>
                <span className="guide-tab-dot" aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
