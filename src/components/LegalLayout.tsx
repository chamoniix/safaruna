import Navbar from './Navbar';
import Footer from './Footer';

export interface TocItem { id: string; label: string }

interface Props {
  title: string;
  subtitle: string;
  toc: TocItem[];
  updated?: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, subtitle, toc, updated = '2 avril 2026', children }: Props) {
  return (
    <>
      <style>{`
        .legal-wrap {
          max-width: 1120px; margin: 0 auto;
          padding: 5rem 2rem 6rem;
          display: grid; grid-template-columns: 220px 1fr; gap: 4rem;
          align-items: start;
        }
        .legal-toc { display: block; }
        .legal-toc-inner { position: sticky; top: 5rem; }
        .legal-toc-inner nav a {
          display: block; padding: 0.4rem 0.75rem; border-radius: 6px;
          font-size: 0.78rem; color: #7A6D5A; text-decoration: none;
          font-weight: 500; font-family: var(--font-manrope, sans-serif);
          transition: color 0.15s, background 0.15s;
        }
        .legal-toc-inner nav a:hover { color: #1A1209; background: #F0EBE0; }
        .legal-toc-inner nav a.active { color: #1A1209; background: #F0EBE0; font-weight: 700; }
        .legal-content section:first-child h2 { margin-top: 0 !important; padding-top: 0 !important; border-top: none !important; }
        .legal-content section { scroll-margin-top: 110px; padding: 0 !important; }
        .legal-box-gold {
          background: #FEF9EC; border-left: 3px solid #C9A84C;
          border-radius: 0 8px 8px 0; padding: 1.25rem 1.5rem; margin: 1.5rem 0;
        }
        .legal-box-red {
          background: #FFF5F5; border-left: 3px solid #DC2626;
          border-radius: 0 8px 8px 0; padding: 1.25rem 1.5rem; margin: 1.5rem 0;
        }
        .legal-box-gold .box-title { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #C9A84C; margin-bottom: 0.5rem; }
        .legal-box-red .box-title { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #DC2626; margin-bottom: 0.5rem; }
        @media (max-width: 900px) {
          .legal-wrap { grid-template-columns: 1fr; padding: 3rem 1.5rem 5rem; gap: 2rem; }
          .legal-toc { display: none; }
        }
      `}</style>

      <Navbar />

      {/* Hero */}
      <div style={{ background: '#1A1209', padding: '11rem 2rem 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(201,168,76,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#C9A84C', opacity: 0.7, marginBottom: '1.25rem' }}>
            SAFARUMA · Légal
          </div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(2.2rem, 5vw, 3.25rem)', fontWeight: 700, color: 'white', margin: '0 0 1rem', lineHeight: 1.15, letterSpacing: '0.02em' }}>
            {title}
          </h1>
          <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', color: '#C9A84C', margin: 0, fontStyle: 'italic' }}>
            {subtitle}
          </p>
          <div style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '0.4rem 1rem' }}>
            <svg width="12" height="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>Dernière mise à jour : {updated}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ background: '#FAF7F0', minHeight: '60vh' }}>
        <div className="legal-wrap">

          {/* TOC */}
          <aside className="legal-toc">
            <div className="legal-toc-inner">
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A84C', padding: '0 0.75rem', marginBottom: '0.75rem' }}>
                Sommaire
              </div>
              <div style={{ height: 1, background: 'linear-gradient(90deg, #C9A84C55, transparent)', margin: '0 0.75rem 0.75rem' }} />
              <nav>
                {toc.map(item => (
                  <a key={item.id} href={`#${item.id}`}>{item.label}</a>
                ))}
              </nav>
              <div style={{ marginTop: '2rem', padding: '0.875rem 0.75rem', background: '#F0EBE0', borderRadius: 8, fontSize: '0.72rem', color: '#7A6D5A', lineHeight: 1.6 }}>
                Des questions ?<br />
                <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C', fontWeight: 700, textDecoration: 'none' }}>contact@safaruma.com</a>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="legal-content">
            {children}
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #E8DFC8', fontSize: '0.75rem', color: '#9A8D7A', lineHeight: 1.6 }}>
              Document mis à jour le {updated} — SAFARUMA<br />
              Contact : <a href="mailto:contact@safaruma.com" style={{ color: '#C9A84C' }}>contact@safaruma.com</a>
            </div>
          </main>

        </div>
      </div>

      <Footer />
    </>
  );
}

// ── Shared style helpers exported for pages ──────────────────────

export const h2: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant, serif)',
  fontSize: '1.375rem', fontWeight: 700, color: '#1A1209',
  marginTop: '2.75rem', marginBottom: '1rem',
  paddingTop: '2.75rem', borderTop: '1px solid #E8DFC8',
};

export const p: React.CSSProperties = {
  fontSize: '0.9375rem', lineHeight: 1.8, color: '#3D3530', marginBottom: '1rem',
};

export const ul: React.CSSProperties = {
  fontSize: '0.9375rem', lineHeight: 1.8, color: '#3D3530',
  paddingLeft: '1.375rem', marginBottom: '1rem', marginTop: '0.25rem',
};

export const li: React.CSSProperties = {
  marginBottom: '0.35rem',
};

export const strong: React.CSSProperties = {
  color: '#1A1209', fontWeight: 700,
};
