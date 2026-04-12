'use client';

import { useState } from 'react';
import BookingWidget from './BookingWidget';
import { PLACES as LIB_PLACES } from '@/lib/places';

interface Package {
  name: string;
  price: number;
  days: number;
  label: string;
  description: string;
  features: string[];
}

interface Place {
  emoji: string;
  nameAr: string;
  nameFr: string;
  desc: string;
  category: 'MAKKAH' | 'MADINAH' | 'HISTORIQUE';
}

interface Review {
  name: string;
  country: string;
  flag: string;
  date: string;
  rating: number;
  text: string;
}

interface GuideProfileClientProps {
  slug: string;
  guideName: string;
  isOfficial: boolean;
  packages: Package[];
  places: Place[];
  reviews: Review[];
  certifications: string[];
  services: string[];
  bioFull: string[];
  activePlaceKeys?: string[];
}

const TAB_LABELS = ['Présentation', 'Lieux Saints', 'Forfaits', 'Avis'];

export default function GuideProfileClient({
  slug,
  guideName,
  isOfficial,
  packages,
  places,
  reviews,
  certifications,
  services,
  bioFull,
  activePlaceKeys,
}: GuideProfileClientProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedForfait, setSelectedForfait] = useState(1);

  const makkahPlaces = places.filter(p => p.category === 'MAKKAH');
  const madinahPlaces = places.filter(p => p.category === 'MADINAH');
  const historiquePlaces = places.filter(p => p.category === 'HISTORIQUE');

  const tabStyle = (i: number): React.CSSProperties => ({
    padding: '0.7rem 1.2rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-manrope), sans-serif',
    fontWeight: activeTab === i ? 700 : 500,
    fontSize: '0.85rem',
    color: activeTab === i ? 'var(--deep)' : 'var(--muted)',
    borderBottom: activeTab === i ? '2px solid var(--gold)' : '2px solid transparent',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  });

  return (
    <div style={{ minHeight: '70vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .profile-main-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem 6rem;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2.5rem;
          align-items: start;
          min-height: 600px;
        }
        .profile-tabs-bar {
          display: flex;
          border-bottom: 1px solid var(--sand);
          margin-bottom: 2rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          gap: 0;
        }
        .profile-tabs-bar::-webkit-scrollbar { display: none; }
        .profile-packages-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .profile-services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 0.5rem;
        }
        .profile-places-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 0.75rem;
        }
        /* Mobile booking bar */
        .profile-mobile-booking {
          display: none;
        }
        @media (max-width: 900px) {
          .profile-main-grid {
            grid-template-columns: 1fr !important;
            padding: 1.5rem 1rem 8rem;
            gap: 2rem;
          }
          .profile-booking-sticky {
            display: none !important;
          }
          .profile-mobile-booking {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: white;
            border-top: 1px solid var(--sand);
            padding: 0.875rem 1rem;
            box-shadow: 0 -4px 24px rgba(26,18,9,0.1);
          }
          .profile-services-grid {
            grid-template-columns: 1fr 1fr;
          }
          .profile-places-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }
        }
        @media (max-width: 480px) {
          .profile-main-grid {
            padding: 1rem 0.875rem 8rem;
          }
          .profile-services-grid {
            grid-template-columns: 1fr;
          }
          .profile-places-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        /* Fix overflow visibility */
        .profile-main-grid {
          overflow: visible !important;
        }
        .profile-main-grid > div:first-child {
          overflow: visible !important;
          min-height: 0;
        }
      `}} />

      <div className="profile-main-grid">
        {/* LEFT SIDE */}
        <div>
          {/* Tab Navigation */}
          <div className="profile-tabs-bar">
            {TAB_LABELS.map((label, i) => (
              <button key={i} style={tabStyle(i)} onClick={() => setActiveTab(i)}>
                {label}
              </button>
            ))}
          </div>

          {/* TAB: PRESENTATION */}
          {activeTab === 0 && (
            <div style={{ minHeight: '50vh' }}>
              {/* ── RESPONSABLE TERRAIN CARD (officiel uniquement) ── */}
              {isOfficial && (
                <div style={{
                  background: '#1A1209',
                  borderLeft: '4px solid #C9A84C',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '2rem',
                }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#F0D897',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    🛡️ Responsable Terrain SAFARUMA
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                    Naïm LAAMARI est le garant de la qualité SAFARUMA sur le terrain à Makkah. En cas d&apos;imprévu, de remplacement de guide ou de situation d&apos;urgence, Naïm intervient en moins de 2h. Sa présence permanente à Makkah est votre assurance d&apos;une expérience réussie.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {[
                      '✓ Disponible 7j/7',
                      '✓ Intervention sous 2h',
                      '✓ Formateur certifié',
                      '✓ Urgences gérées',
                    ].map(item => (
                      <span key={item} style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#C9A84C',
                        background: 'rgba(201,168,76,0.1)',
                        border: '1px solid rgba(201,168,76,0.3)',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '50px',
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '2.5rem' }}>
                {bioFull.map((para, i) => (
                  <p key={i} style={{
                    fontSize: '0.95rem',
                    color: 'var(--warm)',
                    lineHeight: 1.9,
                    marginBottom: '1.25rem',
                  }}>
                    {para}
                  </p>
                ))}
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: 'var(--deep)',
                  marginBottom: '1rem',
                }}>
                  Certifications &amp; Diplômes
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {certifications.map((cert, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                      padding: '0.55rem 0',
                      borderBottom: i < certifications.length - 1 ? '1px solid var(--sand)' : 'none',
                      fontSize: '0.88rem',
                      color: 'var(--warm)',
                    }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>✓</span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: 'var(--deep)',
                  marginBottom: '1rem',
                }}>
                  Services inclus
                </h3>
                <div className="profile-services-grid">
                  {services.map((svc, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.8rem',
                      background: 'white',
                      border: '1px solid var(--sand)',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      color: 'var(--warm)',
                    }}>
                      <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.9rem' }}>✓</span>
                      {svc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIEUX SAINTS */}
          {activeTab === 1 && (
            <div style={{ minHeight: '50vh' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '6px', height: '28px', background: 'var(--gold)', borderRadius: '3px' }}></div>
                  <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.3rem', fontWeight: 600, color: 'var(--deep)' }}>
                    Makkah Al-Mukarramah
                  </h3>
                </div>
                <PlaceGrid places={makkahPlaces} activePlaceKeys={activePlaceKeys} />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '6px', height: '28px', background: 'var(--deep)', borderRadius: '3px' }}></div>
                  <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.3rem', fontWeight: 600, color: 'var(--deep)' }}>
                    Al-Madinah Al-Munawwarah
                  </h3>
                </div>
                <PlaceGrid places={madinahPlaces} activePlaceKeys={activePlaceKeys} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '6px', height: '28px', background: 'var(--muted)', borderRadius: '3px' }}></div>
                  <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.3rem', fontWeight: 600, color: 'var(--deep)' }}>
                    Sites Historiques
                  </h3>
                </div>
                <PlaceGrid places={historiquePlaces} activePlaceKeys={activePlaceKeys} />
              </div>
            </div>
          )}

          {/* TAB: FORFAITS */}
          {activeTab === 2 && (
            <div style={{ minHeight: '50vh' }}>
            {/* Durées officielles des rites */}
            <div style={{ background: '#1A1209', borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginBottom: '0.6rem' }}>
                Durées officielles des rites de la Omra
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  { label: 'Ihram + Niyyah au Meeqat', time: '30-45 min' },
                  { label: 'Tawaf (7 tours Kaaba)', time: '1h30 – 3h' },
                  { label: "Sa'i Safa & Marwa (7×)", time: '45 min – 1h30' },
                  { label: 'Tahallul (rasage/coupe)', time: '15-30 min' },
                  { label: 'OMRA COMPLÈTE', time: '4h – 6h selon affluence', highlight: true },
                ].map((r: { label: string; time: string; highlight?: boolean }) => (
                  <span key={r.label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: r.highlight ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)',
                    border: r.highlight ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 50, padding: '0.3rem 0.85rem',
                    fontSize: '0.72rem', color: r.highlight ? '#F0D897' : 'rgba(255,255,255,0.75)',
                    fontWeight: r.highlight ? 700 : 500,
                  }}>
                    {r.label}
                    <strong style={{ color: r.highlight ? '#C9A84C' : 'rgba(255,255,255,0.5)' }}>· {r.time}</strong>
                  </span>
                ))}
              </div>
            </div>
            <div className="profile-packages-grid">
              {packages.map((pkg, i) => (
                <div key={i} style={{
                  background: 'white',
                  border: i === 1 ? '2px solid var(--gold)' : '1.5px solid var(--sand)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {i === 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'var(--gold)',
                      color: 'var(--deep)',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '50px',
                    }}>
                      RECOMMANDÉ
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-cormorant), serif',
                        fontSize: '1.35rem',
                        fontWeight: 700,
                        color: 'var(--deep)',
                        marginBottom: '0.35rem',
                      }}>
                        {pkg.name}
                      </h3>
                      <span style={{
                        display: 'inline-block',
                        background: 'var(--cream)',
                        border: '1px solid var(--sand)',
                        color: 'var(--muted)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '50px',
                      }}>
                        {pkg.days} {pkg.days === 1 ? 'jour' : 'jours'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontFamily: 'var(--font-cormorant), serif',
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'var(--deep)',
                        lineHeight: 1,
                      }}>
                        {pkg.price}€
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.2rem' }}>par personne</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    {pkg.description}
                  </p>

                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                    {pkg.features.map((feat, j) => (
                      <li key={j} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        padding: '0.4rem 0',
                        borderBottom: j < pkg.features.length - 1 ? '1px solid var(--sand)' : 'none',
                        fontSize: '0.83rem',
                        color: 'var(--warm)',
                      }}>
                        <span style={{ color: 'var(--gold)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setSelectedForfait(i)}
                    style={{
                      width: '100%',
                      padding: '0.7rem 1.5rem',
                      background: i === 1 ? 'var(--deep)' : 'transparent',
                      color: i === 1 ? 'var(--gold-light)' : 'var(--deep)',
                      border: i === 1 ? 'none' : '1.5px solid var(--deep)',
                      borderRadius: '50px',
                      fontFamily: 'var(--font-manrope), sans-serif',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Sélectionner ce forfait
                  </button>
                </div>
              ))}
            </div>
            </div>
          )}

          {/* TAB: AVIS */}
          {activeTab === 3 && (
            <div style={{ minHeight: '50vh' }}>
              <div style={{
                background: 'white',
                border: '1px solid var(--sand)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}>
                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                  <div style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    color: 'var(--deep)',
                    lineHeight: 1,
                    marginBottom: '0.25rem',
                  }}>
                    {isOfficial ? '5.0' : '4.97'}
                  </div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.1rem', letterSpacing: '2px', marginBottom: '0.25rem' }}>★★★★★</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{reviews.length} avis vérifiés</div>
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', width: '10px', textAlign: 'right' }}>{star}</span>
                        <span style={{ color: 'var(--gold)', fontSize: '0.72rem' }}>★</span>
                        <div style={{ flex: 1, height: '6px', background: 'var(--sand)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold)', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', width: '28px' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((rev, i) => (
                  <div key={i} style={{
                    background: 'white',
                    border: '1px solid var(--sand)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--sand)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: 'var(--warm)',
                          flexShrink: 0,
                        }}>
                          {rev.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--deep)' }}>
                            {rev.name} <span style={{ fontSize: '1rem' }}>{rev.flag}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{rev.country} · {rev.date}</div>
                        </div>
                      </div>
                      <div style={{ color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '1px', flexShrink: 0 }}>
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--warm)', lineHeight: 1.75 }}>
                      {rev.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE — Booking Widget (desktop) */}
        <div className="profile-booking-sticky">
          <BookingWidget
            slug={slug}
            guideName={guideName}
            packages={packages.map(p => ({ name: p.name, price: p.price, days: p.days, label: p.label }))}
          />
        </div>
      </div>

      {/* Mobile booking bar (fixed bottom) */}
      <div className="profile-mobile-booking">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>À partir de</div>
            <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--deep)', lineHeight: 1 }}>
              {packages[0].price}€ <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-manrope)', fontWeight: 400, color: 'var(--muted)' }}>/ pers</span>
            </div>
          </div>
          <a href={`/espace/checkout/${slug}`} style={{
            background: '#C9A84C',
            color: '#1A1209',
            fontFamily: 'var(--font-manrope), sans-serif',
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '0.875rem 1.75rem',
            borderRadius: '50px',
            textDecoration: 'none',
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}>
            Réserver →
          </a>
        </div>
      </div>
    </div>
  );
}

function PlaceGrid({ places, activePlaceKeys }: { places: Place[]; activePlaceKeys?: string[] }) {
  // Build a nameFr -> key map from the lib places for availability lookup
  const nameFrToKey: Record<string, string> = {}
  LIB_PLACES.forEach(p => { nameFrToKey[p.nameFr] = p.key })

  const hasConfig = activePlaceKeys && activePlaceKeys.length > 0

  return (
    <div className="profile-places-grid">
      {places.map((place, i) => {
        const placeKey = nameFrToKey[place.nameFr]
        const libPlace = LIB_PLACES.find(p => p.nameFr === place.nameFr)
        // If includedInBase, always active
        const isBase = libPlace?.includedInBase ?? false
        const isUnavailable = hasConfig && placeKey && !isBase && !activePlaceKeys!.includes(placeKey)

        return (
          <div key={i} style={{
            background: 'white',
            border: '1px solid var(--sand)',
            borderRadius: '12px',
            padding: '0.9rem 1rem',
            transition: 'transform 0.15s, box-shadow 0.15s',
            opacity: isUnavailable ? 0.4 : 1,
            filter: isUnavailable ? 'grayscale(100%)' : 'none',
            position: 'relative',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{place.emoji}</div>
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--muted)',
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              marginBottom: '0.15rem',
              direction: 'rtl',
              textAlign: 'right',
            }}>
              {place.nameAr}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--deep)', marginBottom: '0.25rem' }}>
              {place.nameFr}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              {place.desc}
            </div>
            {isUnavailable && (
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                fontSize: '0.55rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                background: '#F3F4F6',
                color: '#6B7280',
                border: '1px solid #E5E7EB',
                padding: '0.15rem 0.45rem',
                borderRadius: 20,
              }}>
                Non disponible
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}
