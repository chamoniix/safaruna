'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const BASE_PLACES: Record<string, string[]> = {
  MAKKAH: ['masjid-al-haram', 'kaaba', 'zamzam', 'safa-marwa'],
  MADINAH: ['masjid-nabawi', 'rawdah', 'masjid-quba', 'baqi'],
  BOTH: ['masjid-al-haram', 'kaaba', 'zamzam', 'safa-marwa', 'masjid-nabawi', 'rawdah'],
};

type NextReservation = {
  id: string;
  refNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  selectedCities: 'MAKKAH' | 'MADINAH' | 'BOTH';
  selectedPlaces: string[];
  guide: { slug: string | null; firstName: string; fullName: string };
};

type DashboardData = {
  user: { firstName: string | null; name: string };
  nextReservation: NextReservation | null;
  unreadMessages: number;
  notificationsCount: number;
  lastNotification: { title: string; message: string; createdAt: string } | null;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}j`;
  if (h > 0) return `${h}h`;
  return `${Math.floor(diff / 60000)}min`;
}

function getDestinationLabel(c: 'MAKKAH' | 'MADINAH' | 'BOTH') {
  if (c === 'MAKKAH') return 'Makkah';
  if (c === 'MADINAH') return 'Madinah';
  return 'Makkah · Madinah';
}

function getCurrentStep(r: NextReservation): number {
  if (r.status === 'COMPLETED') return 4;
  if (r.status === 'CONFIRMED') {
    const days = Math.ceil((new Date(r.startDate).getTime() - Date.now()) / 86400000);
    return days <= 7 ? 3 : 2;
  }
  return 1;
}

function calcCountdown(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
      <path d="M3 6l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export default function EspaceTableauDeBord() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [time, setTime]       = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true); setError('');
    fetch('/api/espace/dashboard')
      .then(r => { if (!r.ok) throw new Error('Erreur ' + r.status); return r.json(); })
      .then((d: DashboardData) => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!data?.nextReservation) return;
    const target = new Date(data.nextReservation.startDate);
    const tick = () => setTime(calcCountdown(target));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [data?.nextReservation?.startDate]);

  if (loading) {
    return (
      <div className="pelerin-body">
        <div style={{ height: 280, background: 'rgba(26,18,9,0.04)', borderRadius: 18, marginTop: 8 }} />
        <div style={{ height: 48, background: 'rgba(26,18,9,0.03)', borderRadius: 12, marginTop: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 18 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ height: 72, background: 'rgba(26,18,9,0.03)', borderRadius: 14 }} />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pelerin-body">
        <div style={{ background: '#FEE2E2', border: '0.5px solid #FCA5A5', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#C53030' }}>
          {error || 'Impossible de charger.'}{' '}
          <button onClick={fetchData} style={{ color: '#C53030', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Réessayer</button>
        </div>
      </div>
    );
  }

  const { nextReservation: r, unreadMessages, lastNotification } = data;
  const currentStep = r ? getCurrentStep(r) : 0;
  const destination = r ? getDestinationLabel(r.selectedCities) : '';
  const isUrgent    = r
    ? (new Date(r.startDate).getTime() - Date.now()) <= 172800000 && new Date(r.startDate).getTime() > Date.now()
    : false;

  void BASE_PLACES;

  return (
    <div className="pelerin-body">

      {!r ? (
        /* ── ÉTAT VIDE ── */
        <section className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 14L16 4l12 10v14H4V14z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M16 28v-8h6v8" stroke="#C9A84C" strokeWidth="1.5"/>
            </svg>
          </div>
          <h2 className="empty-state-title">Bienvenue dans ton <span className="empty-gold">espace pèlerin</span></h2>
          <p className="empty-state-sub">Tu n&apos;as pas encore de Omra prévue. Trouve un guide privé certifié dans ta langue pour commencer ton voyage.</p>
          <Link href="/guides" className="empty-state-cta">
            Trouver mon guide
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="#1A1209" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </Link>
        </section>
      ) : (
        <>
          {/* ── HERO VOYAGE ── */}
          <section className="trip-hero" aria-label="Ta prochaine Omra">
            <span className="trip-arabic-bg" aria-hidden="true">عمرة</span>
            <div className="trip-glow" aria-hidden="true" />
            <div className="trip-kaaba" aria-hidden="true" />
            <div className="trip-stars" aria-hidden="true">
              {[
                { t: '15%', l: '20%', d: '0s'   },
                { t: '22%', l: '75%', d: '1s'   },
                { t: '30%', l: '40%', d: '0.5s' },
                { t: '18%', l: '60%', d: '1.5s' },
                { t: '38%', l: '85%', d: '0.8s' },
                { t: '25%', l: '10%', d: '2s'   },
              ].map((s, i) => (
                <span key={i} className="trip-star" style={{ top: s.t, left: s.l, animationDelay: s.d }} />
              ))}
            </div>

            <div className="trip-content">
              <div className="trip-top">
                <span className="trip-status">
                  <span className="trip-status-dot" aria-hidden="true" />
                  {r.status === 'CONFIRMED' ? 'Confirmée' : r.status === 'PENDING' ? 'En attente' : 'Terminée'}
                </span>
                <button className="trip-share" aria-label="Partager">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M11 4l3 3-3 3M14 7H6c-2 0-4 2-4 4" stroke="#FAF7F0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="trip-info">
                <div className="trip-eyebrow">Ta prochaine Omra</div>
                <h2 className="trip-title">
                  {destination} <span className="trip-title-gold">avec {r.guide.firstName}</span>
                </h2>
                <div className="trip-dates">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <rect x="2" y="3" width="10" height="9" rx="1" stroke="rgba(250,247,240,0.7)" strokeWidth="1"/>
                    <path d="M2 6h10M5 1.5v3M9 1.5v3" stroke="rgba(250,247,240,0.7)" strokeWidth="1"/>
                  </svg>
                  {formatDate(r.startDate)}
                  <span className="trip-dates-sep" aria-hidden="true" />
                  {formatDate(r.endDate)}
                </div>
                <div className="trip-countdown" role="timer" aria-label="Compte à rebours avant le départ">
                  {([
                    { v: time.days,    u: 'Jours'  },
                    { v: time.hours,   u: 'Heures' },
                    { v: time.minutes, u: 'Min'    },
                    { v: time.seconds, u: 'Sec'    },
                  ] as { v: number; u: string }[]).map(({ v, u }) => (
                    <div key={u} className="countdown-cell">
                      <div className="countdown-num">{pad(v)}</div>
                      <div className="countdown-unit">{u}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── NOTIFICATION BANNER ── */}
          {lastNotification && (
            <div className="notif-banner">
              <div className="notif-banner-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 6l2 2 4-4" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="notif-banner-text">
                <strong>{lastNotification.title}</strong> — {lastNotification.message}
              </div>
              <div className="notif-banner-time">{formatRelativeTime(lastNotification.createdAt)}</div>
            </div>
          )}

          {/* ── QUICK ACTIONS ── */}
          <section className="qa-section">
            <h3 className="qa-title">Actions rapides</h3>
            <div className="qa-grid">

              <Link href="/espace/messages" className="qa-btn">
                <div className="qa-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4a1.5 1.5 0 011.5-1.5h9A1.5 1.5 0 0114 4v6a1.5 1.5 0 01-1.5 1.5H7l-3 2.5V11.5H3.5A1.5 1.5 0 012 10V4z" stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="qa-label">Message</span>
                {unreadMessages > 0 && (
                  <span className="qa-badge" aria-label="Nouveau message">{unreadMessages}</span>
                )}
              </Link>

              <Link href="/espace/checklist" className="qa-btn">
                <div className="qa-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="3" width="10" height="10" rx="1" stroke="#C9A84C" strokeWidth="1.4"/>
                    <path d="M5 8l2 2 4-4" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="qa-label">Checklist</span>
                {isUrgent && (
                  <span className="qa-badge qa-badge-urgent" aria-label="48h avant le départ : valide ta checklist !">!</span>
                )}
              </Link>

              <Link href="/espace/dua" className="qa-btn">
                <div className="qa-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 2.5h8a1.5 1.5 0 011.5 1.5V13l-5.5-2.5L1.5 13V4A1.5 1.5 0 013 2.5z" stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="qa-label">Du&apos;as</span>
              </Link>

              <Link href={`/espace/reservations/${r.id}`} className="qa-btn">
                <div className="qa-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 2.5h7l3 3V13a1 1 0 01-1 1H3a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round"/>
                    <path d="M10 2.5v3h3" stroke="#C9A84C" strokeWidth="1.4"/>
                  </svg>
                </div>
                <span className="qa-label">Réservation</span>
              </Link>

            </div>
          </section>

          {/* ── INFOS VOYAGE ── */}
          <section className="info-section">
            <h3 className="info-title">Tes infos voyage</h3>
            <div className="info-list">

              {r.guide.slug ? (
                <Link href={`/guides/${r.guide.slug}`} className="info-row">
                  <div className="info-row-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="6" r="2.5" stroke="#C9A84C" strokeWidth="1.3"/>
                      <path d="M3 13a5 5 0 0110 0" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="info-row-content">
                    <div className="info-row-label">Ton guide</div>
                    <div className="info-row-value">{r.guide.fullName}</div>
                  </div>
                  <span className="info-row-arrow" aria-hidden="true">›</span>
                </Link>
              ) : (
                <div className="info-row" style={{ cursor: 'default' }}>
                  <div className="info-row-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="6" r="2.5" stroke="#C9A84C" strokeWidth="1.3"/>
                      <path d="M3 13a5 5 0 0110 0" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="info-row-content">
                    <div className="info-row-label">Ton guide</div>
                    <div className="info-row-value">{r.guide.fullName}</div>
                  </div>
                </div>
              )}

              <div className="info-row" style={{ cursor: 'default' }}>
                <div className="info-row-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 13s-5-3-5-7a5 5 0 0110 0c0 4-5 7-5 7z" stroke="#C9A84C" strokeWidth="1.3"/>
                    <circle cx="8" cy="6" r="1.5" fill="#C9A84C"/>
                  </svg>
                </div>
                <div className="info-row-content">
                  <div className="info-row-label">Destination</div>
                  <div className="info-row-value">{destination}</div>
                </div>
              </div>

              <Link href={`/espace/reservations/${r.id}`} className="info-row">
                <div className="info-row-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="11" rx="1" stroke="#C9A84C" strokeWidth="1.3"/>
                    <path d="M2 7h12M6 1v4M10 1v4" stroke="#C9A84C" strokeWidth="1.3"/>
                  </svg>
                </div>
                <div className="info-row-content">
                  <div className="info-row-label">Référence</div>
                  <div className="info-row-value info-row-mono">{r.refNumber}</div>
                </div>
                <span className="info-row-arrow" aria-hidden="true">›</span>
              </Link>

            </div>
          </section>

          {/* ── PROGRESSION ── */}
          <section className="progression-card">
            <div className="progression-header">
              <h3 className="progression-title">Progression</h3>
              <span className="progression-count">{currentStep} / 4</span>
            </div>
            <div className="progression-timeline">
              <div className="progression-line" aria-hidden="true" />
              <div
                className="progression-line-active"
                style={{ width: `${Math.max(0, (currentStep - 1) * 25)}%` }}
                aria-hidden="true"
              />
              {[
                { label: ['Demande', 'reçue'] },
                { label: ['Confirmé']         },
                { label: ['Départ']           },
                { label: ['Terminé']          },
              ].map((step, idx) => {
                const stepNum  = idx + 1;
                const isDone   = currentStep > stepNum;
                const isActive = currentStep === stepNum;
                return (
                  <div key={idx} className="progression-step">
                    <div
                      className={`progression-circle${isDone ? ' done' : isActive ? ' active' : ''}`}
                      aria-hidden="true"
                    >
                      {isDone   && <CheckIcon color="#FFFFFF" />}
                      {isActive && <CheckIcon color="#1A1209" />}
                    </div>
                    <span className={`progression-label${isDone ? ' done' : isActive ? ' active' : ''}`}>
                      {step.label[0]}{step.label[1] && <><br />{step.label[1]}</>}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

    </div>
  );
}
