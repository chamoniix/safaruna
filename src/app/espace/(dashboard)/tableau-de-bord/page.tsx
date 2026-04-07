'use client';

import Link from 'next/link';

const STATS = [
  { icon: '✦', iconBg: 'linear-gradient(135deg, #F0D897, #C9A84C)', iconColor: '#7A5200', value: '1', label: 'Omra réservée', sub: 'Juin 2025', href: '/espace/reservations' },
  { icon: '▶', iconBg: 'linear-gradient(135deg, #9FE1CB, #1D9E75)', iconColor: 'white',  value: '45%', label: 'Academy', sub: 'Module 2/5', href: '/espace/academy' },
  { icon: '☑', iconBg: 'linear-gradient(135deg, #A8C4FF, #1A4A8A)', iconColor: 'white',  value: '6/12', label: 'Checklist', sub: 'En cours', href: '/espace/checklist' },
  { icon: '◎', iconBg: 'linear-gradient(135deg, #F4A8A8, #C0392B)', iconColor: 'white',  value: '2', label: 'Messages', sub: 'Non lus', href: '/espace/messages' },
];

const CHECKLIST_ITEMS = [
  { done: false, label: 'Demander le visa Nusuk (eVisa)' },
  { done: false, label: 'Vaccin méningite ACYW' },
  { done: false, label: 'Réserver l\'hébergement' },
  { done: false, label: 'Acheter l\'Ihram (2 pièces blanches)' },
  { done: false, label: 'Mémoriser les du\'a du tawaf' },
  { done: false, label: 'Préparer la trousse médicale' },
];

const MESSAGES = [
  { initials: 'RM', name: 'Cheikh Rachid', time: '09:42', preview: 'Wa aleykoum salam, oui je prévois un siège auto pour le petit.', online: true, unread: false, bg: 'linear-gradient(135deg, #F0D897, #C9A84C)' },
  { initials: '✦',  name: 'Équipe SAFARUMA', time: 'Hier', preview: 'Votre reçu de paiement SAF-2025-012 est disponible.', online: false, unread: true, bg: 'linear-gradient(135deg, #2D1F08, #1A1209)' },
];

export default function PelerinDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ── WELCOME BANNER ── */}
      <div style={{
        background: '#0D0A06',
        borderRadius: 24,
        padding: 'clamp(1.75rem, 4vw, 3rem)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        {/* Gold radial glow */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(ellipse at top right, rgba(201,168,76,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Arabic watermark */}
        <div style={{
          position: 'absolute', right: '-1rem', top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'serif', fontSize: 'clamp(6rem, 16vw, 11rem)',
          color: 'rgba(201,168,76,0.07)', lineHeight: 1,
          pointerEvents: 'none', userSelect: 'none',
          fontWeight: 700,
        }}>العمرة</div>

        <div className="dash-welcome-inner" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          {/* Left */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#F0D897', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '0.3rem 0.9rem', borderRadius: 50, marginBottom: '1rem' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C9A84C', animation: 'pulse 2s infinite' }} />
              Prochain voyage
            </div>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 600, color: 'white', lineHeight: 1.1, marginBottom: '0.5rem' }}>
              Omra & Histoire
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', fontWeight: 500, marginBottom: '1.5rem' }}>
              Départ le <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>Vendredi 10 Juin 2025</span> · Guide: <span style={{ color: '#F0D897' }}>Rachid Al-Madani</span>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/espace/reservations/SAF-2025-012" style={{
                display: 'inline-block', background: '#C9A84C', color: '#1A1209',
                padding: '0.7rem 1.5rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700,
                textDecoration: 'none', letterSpacing: '0.04em',
                boxShadow: '0 4px 16px rgba(201,168,76,0.35)',
              }}>Voir les détails</Link>
              <Link href="/espace/messages" style={{
                display: 'inline-block', background: 'rgba(255,255,255,0.08)', color: 'white',
                padding: '0.7rem 1.5rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600,
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)',
              }}>Contacter le guide</Link>
            </div>
          </div>

          {/* Right: countdown */}
          <div className="dash-countdown" style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="dash-countdown-num" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(4rem, 10vw, 7rem)', fontWeight: 700, color: '#F0D897', lineHeight: 1, letterSpacing: '-0.02em' }}>47</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '0.25rem' }}>Jours restants</div>
          </div>
        </div>
      </div>

      {/* ── 4 STAT CARDS ── */}
      <div className="dash-stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {STATS.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none', display: 'flex', background: 'white', borderRadius: 18, padding: '1.4rem 1.5rem', border: '1px solid #EDE8DC', boxShadow: '0 2px 8px rgba(26,18,9,0.04)', alignItems: 'center', gap: '1rem', transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s', cursor: 'pointer' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#C9A84C'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 20px rgba(26,18,9,0.08)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#EDE8DC'; el.style.transform = ''; el.style.boxShadow = '0 2px 8px rgba(26,18,9,0.04)'; }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 14, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.iconColor, fontSize: '1rem', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 700, color: '#1A1209', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.2 }}>{s.label}</div>
              <div style={{ fontSize: '0.65rem', color: '#7A6D5A', marginTop: 2 }}>{s.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="dash-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 900px) {
            .dash-grid { grid-template-columns: 1fr !important; }
            .dash-main-grid { grid-template-columns: 1fr !important; }
          }
          .play-btn:hover { transform: scale(1.12) !important; }
          .card-hover:hover { border-color: #C9A84C !important; }
          .msg-row:hover { background: #FAF7F0 !important; }

          @media (max-width: 768px) {
            .dash-main-grid { grid-template-columns: 1fr !important; gap: 1.25rem !important; }
            .dash-welcome-inner { flex-direction: column !important; gap: 1rem !important; }
            .dash-countdown { text-align: left !important; display: flex !important; align-items: center !important; gap: 0.75rem !important; }
            .dash-countdown-num { font-size: 3rem !important; }
            .dash-academy-card { flex-direction: column !important; }
            .dash-academy-thumb { width: 100% !important; min-height: 120px !important; }
            .dash-booking-grid { grid-template-columns: 1fr 1fr !important; }
            .dash-booking-ref { grid-column: 1 / -1 !important; }
            .dash-stat-cards { grid-template-columns: 1fr 1fr !important; gap: 0.75rem !important; }
            .dash-quick-links { grid-template-columns: 1fr 1fr !important; }
          }

          @media (max-width: 480px) {
            .dash-stat-cards { grid-template-columns: 1fr 1fr !important; }
            .dash-booking-grid { grid-template-columns: 1fr !important; }
            .dash-booking-ref { grid-column: auto !important; }
          }
        `}} />

        {/* Left column */}
        <div className="dash-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Next booking card */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE8DC', overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,18,9,0.05)' }}>
            <div style={{ background: 'linear-gradient(135deg, #0D0A06, #1A1209)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209', flexShrink: 0, border: '3px solid rgba(201,168,76,0.3)' }}>
                RM
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.2rem' }}>Guide certifié</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-cormorant, serif)' }}>Cheikh Rachid Al-Madani</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Makkah · Madinah · 14 ans d'expérience</div>
              </div>
              <div style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 50, padding: '0.25rem 0.75rem', fontSize: '0.62rem', fontWeight: 700, color: '#F0D897', whiteSpace: 'nowrap' }}>⭐ 4.97</div>
            </div>

            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div className="dash-booking-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Départ', value: '10 Juin 2025' },
                  { label: 'Retour', value: '17 Juin 2025' },
                  { label: 'Réservation', value: 'SAF-2025-012' },
                ].map((d) => (
                  <div key={d.label} className={d.label === 'Réservation' ? 'dash-booking-ref' : ''} style={{ background: '#FAF7F0', borderRadius: 12, padding: '0.75rem', border: '1px solid #EDE8DC' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.25rem' }}>{d.label}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209' }}>{d.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link href="/espace/reservations/SAF-2025-012" style={{ flex: 1, textAlign: 'center', background: '#1A1209', color: '#F0D897', padding: '0.65rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>Plan de vol →</Link>
                <Link href="/espace/messages" style={{ flex: 1, textAlign: 'center', background: '#FAF7F0', color: '#1A1209', padding: '0.65rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #EDE8DC' }}>Contacter</Link>
              </div>
            </div>
          </div>

          {/* Academy */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 600, color: '#1A1209' }}>SAFARUMA Academy</h2>
              <Link href="/espace/academy" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', textDecoration: 'none' }}>Reprendre →</Link>
            </div>
            <div className="card-hover dash-academy-card" style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE8DC', overflow: 'hidden', display: 'flex', gap: 0, boxShadow: '0 2px 8px rgba(26,18,9,0.04)', transition: 'border-color 0.2s' }}>
              {/* Thumbnail */}
              <div className="dash-academy-thumb" style={{ width: 180, flexShrink: 0, background: '#0D0A06', position: 'relative', overflow: 'hidden', minHeight: 140 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1A1209, #2D1F08)', opacity: 0.9 }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, gap: '0.5rem' }}>
                  <div className="play-btn" style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', backdropFilter: 'blur(8px)' }}>
                    <span style={{ color: 'white', fontSize: '1.1rem', marginLeft: 3 }}>▶</span>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 700 }}>12:45</span>
                </div>
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(201,168,76,0.9)', color: '#1A1209', fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.18rem 0.5rem', borderRadius: 50 }}>Module 2</div>
              </div>
              {/* Content */}
              <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 600, color: '#1A1209', lineHeight: 1.3, marginBottom: '0.4rem' }}>Les rites de la Omra : étape par étape</h3>
                  <p style={{ fontSize: '0.78rem', color: '#7A6D5A', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    Comprenez le Tawaf, le Sa'i et les règles spirituelles de l'Ihram avant d'arriver au Meeqat.
                  </p>
                </div>
                <div style={{ marginTop: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: '#7A6D5A', marginBottom: '0.35rem' }}>
                    <span>Progression</span><span style={{ color: '#1D5C3A' }}>45%</span>
                  </div>
                  <div style={{ height: 5, background: '#EDE8DC', borderRadius: 50, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '45%', background: 'linear-gradient(90deg, #1D9E75, #1D5C3A)', borderRadius: 50 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Du'a quotidien */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 600, color: '#1A1209' }}>Du'a du jour</h2>
              <Link href="/espace/dua" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', textDecoration: 'none' }}>Carnet complet →</Link>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #0D0A06, #1A1209)', borderRadius: 20, padding: '2rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.12)' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontFamily: 'serif', fontSize: '10rem', color: 'rgba(201,168,76,0.04)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>◆</div>
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1.25rem' }}>Du'a d'entrée au Masjid</div>
                <div style={{ fontFamily: 'serif', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', color: '#F0D897', lineHeight: 1.9, direction: 'rtl', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>
                  اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontStyle: 'italic', maxWidth: 400, margin: '0 auto', marginBottom: '1.5rem' }}>
                  "Ô Allah, ouvre-moi les portes de Ta miséricorde."
                </div>
                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                  <button style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.25)', color: '#F0D897', padding: '0.45rem 1.25rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>✓ Lu aujourd'hui</button>
                  <button style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '0.45rem 1rem', borderRadius: 50, fontSize: '0.72rem', cursor: 'pointer' }}>→ Suivante</button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Messages */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.25rem', fontWeight: 600, color: '#1A1209' }}>Messages</h2>
              <Link href="/espace/messages" style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8B6914', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tout voir</Link>
            </div>
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE8DC', overflow: 'hidden', boxShadow: '0 2px 8px rgba(26,18,9,0.04)' }}>
              {MESSAGES.map((m, i) => (
                <div key={m.name}>
                  <Link href="/espace/messages" className="msg-row" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.25rem', textDecoration: 'none', transition: 'background 0.15s' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '0.95rem', fontWeight: 700, color: '#1A1209' }}>
                        {m.initials === '✦' ? <span style={{ color: '#C9A84C', fontSize: '1rem' }}>✦</span> : m.initials}
                      </div>
                      {m.online && <span style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#1D9E75', border: '2px solid white' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209' }}>{m.name}</span>
                        <span style={{ fontSize: '0.65rem', color: '#7A6D5A' }}>{m.time}</span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: '#7A6D5A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.preview}</p>
                    </div>
                    {m.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />}
                  </Link>
                  {i < MESSAGES.length - 1 && <div style={{ height: 1, background: '#EDE8DC', margin: '0 1.25rem' }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.25rem', fontWeight: 600, color: '#1A1209' }}>Préparation</h2>
              <span style={{ background: '#F5F0E8', color: '#7A6D5A', fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: 50 }}>0 / 6</span>
            </div>
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE8DC', padding: '1.25rem', boxShadow: '0 2px 8px rgba(26,18,9,0.04)' }}>
              {/* Progress bar */}
              <div style={{ height: 4, background: '#EDE8DC', borderRadius: 50, overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ height: '100%', width: '0%', background: 'linear-gradient(90deg, #C9A84C, #F0D897)', borderRadius: 50 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {CHECKLIST_ITEMS.map((item) => (
                  <label key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: item.done ? '#C9A84C' : 'transparent',
                      border: item.done ? '2px solid #C9A84C' : '2px solid #EDE8DC',
                      transition: 'all 0.2s',
                    }}>
                      {item.done && <span style={{ color: '#1A1209', fontSize: '0.6rem', fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: '0.78rem', fontWeight: item.done ? 500 : 600,
                      color: item.done ? '#7A6D5A' : '#1A1209',
                      textDecoration: item.done ? 'line-through' : 'none',
                    }}>{item.label}</span>
                  </label>
                ))}
              </div>
              <Link href="/espace/checklist" style={{ display: 'block', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#8B6914', marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid #EDE8DC', textDecoration: 'none' }}>
                Voir les 12 étapes →
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.25rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.875rem' }}>Accès rapide</h2>
            <div className="dash-quick-links" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { href: '/guides', icon: '✦', label: 'Nos guides', bg: 'linear-gradient(135deg, #F0D897, #C9A84C)', color: '#1A1209' },
                { href: '/espace/favoris', icon: '♡', label: 'Favoris', bg: 'white', color: '#1A1209' },
                { href: '/blog', icon: '📖', label: 'Blog', bg: 'white', color: '#1A1209' },
                { href: '/espace/parrainage', icon: '🎁', label: '50€ offerts', bg: '#E8F5EE', color: '#1D5C3A' },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: l.bg, borderRadius: 14, padding: '0.875rem', border: '1px solid #EDE8DC', textDecoration: 'none', fontWeight: 600, fontSize: '0.78rem', color: l.color, boxShadow: '0 1px 4px rgba(26,18,9,0.04)' }}>
                  <span>{l.icon}</span>{l.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
