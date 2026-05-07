'use client';

import { useState } from 'react';
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
  rating: number;
  packages: Package[];
  places: Place[];
  reviews: Review[];
  certifications: string[];
  services: string[];
  bioFull: string[];
  languages: string[];
  activePlaceKeys?: string[];
  guideCity?: 'MAKKAH' | 'MADINAH';
}

const COMPANION_GUIDES: Record<'MAKKAH' | 'MADINAH', Array<{ slug: string; name: string; specialty: string; initials: string }>> = {
  MAKKAH: [
    { slug: 'naim-laamari', name: 'Naïm LAAMARI', specialty: 'Guide Officiel · Responsable Terrain', initials: 'NL' },
  ],
  MADINAH: [
    { slug: 'rachid-al-madani', name: 'Rachid Al-Madani', specialty: 'Cheikh · Spécialiste Sîra', initials: 'RA' },
    { slug: 'fatima-al-omari', name: 'Fatima Al-Omari', specialty: 'Guide femme · Familles', initials: 'FA' },
    { slug: 'abdullah-ben-yusuf', name: 'Abdullah Ben Yusuf', specialty: 'Diplômé · Univ. Madinah', initials: 'AB' },
  ],
};

const TAB_LABELS = ['Présentation', 'Lieux Saints', 'Avis'];

export default function GuideProfileClient({
  slug,
  guideName,
  isOfficial,
  rating,
  packages,
  places,
  reviews,
  certifications,
  services,
  bioFull,
  languages,
  activePlaceKeys,
  guideCity,
}: GuideProfileClientProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [companionSlug, setCompanionSlug] = useState<string | null>(null);

  const companionCity: 'MAKKAH' | 'MADINAH' | null =
    guideCity === 'MAKKAH' ? 'MADINAH' :
    guideCity === 'MADINAH' ? 'MAKKAH' :
    null;
  const companionCityLabel = companionCity === 'MAKKAH' ? 'La Mecque' : companionCity === 'MADINAH' ? 'Médine' : null;
  const companions = companionCity ? COMPANION_GUIDES[companionCity] : [];
  const checkoutHref = companionSlug
    ? `/espace/checkout/${slug}?pair=${companionSlug}`
    : `/espace/checkout/${slug}`;

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
    color: activeTab === i ? '#1A1209' : '#7A6D5A',
    borderBottom: activeTab === i ? '2px solid #C9A84C' : '2px solid transparent',
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
          border-bottom: 1px solid #E8DFC8;
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
            border-top: 1px solid #E8DFC8;
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
        /* Fix overflow visibility + background explicite */
        .profile-main-grid {
          overflow: visible !important;
          background: #FAF7F0;
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
                <>
                  <h2 style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    color: '#1A1209',
                    marginBottom: '1rem',
                  }}>
                    Responsable Terrain SAFARUMA
                  </h2>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M12 2L3 7v6c0 5.1 3.9 9.5 9 11 5.1-1.5 9-5.9 9-11V7L12 2z" stroke="#C9A84C" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Responsable Terrain SAFARUMA
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
                </>
              )}

              <h2 style={{
                fontFamily: 'var(--font-cormorant), serif',
                fontSize: '1.4rem',
                fontWeight: 600,
                color: '#1A1209',
                margin: '0 0 1rem',
              }}>
                À propos
              </h2>
              <div style={{ marginBottom: '2.5rem' }}>
                {bioFull.map((para, i) => (
                  <p key={i} style={{
                    fontSize: '0.95rem',
                    color: '#4A3F30',
                    lineHeight: 1.9,
                    marginBottom: '1.25rem',
                  }}>
                    {para}
                  </p>
                ))}
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: '#1A1209',
                  marginBottom: '1rem',
                }}>
                  Parcours et certifications
                </h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {certifications.map((cert, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                      padding: '0.55rem 0',
                      borderBottom: i < certifications.length - 1 ? '1px solid #E8DFC8' : 'none',
                      fontSize: '0.88rem',
                      color: '#4A3F30',
                    }}>
                      <span style={{ color: '#C9A84C', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>✓</span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: '#1A1209',
                  marginBottom: '1rem',
                }}>
                  Services inclus
                </h2>
                <div className="profile-services-grid">
                  {services.map((svc, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.8rem',
                      background: 'white',
                      border: '1px solid #E8DFC8',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      color: '#4A3F30',
                    }}>
                      <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.9rem' }}>✓</span>
                      {svc}
                    </div>
                  ))}
                </div>
              </div>

              {languages.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h2 style={{
                    fontFamily: 'var(--font-cormorant), serif',
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    color: '#1A1209',
                    marginBottom: '1rem',
                  }}>
                    Langues parlées
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {languages.map((lang, i) => (
                      <span key={i} style={{
                        padding: '0.35rem 0.9rem',
                        borderRadius: '50px',
                        background: i === 0 ? '#FEF3C7' : '#F5F0E8',
                        color: i === 0 ? '#78350F' : '#4A3F30',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: '1px solid #E8DFC8',
                      }}>
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: LIEUX SAINTS */}
          {activeTab === 1 && (
            <div style={{ minHeight: '50vh', background: '#FAF7F0', padding: '1rem 0' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '6px', height: '28px', background: '#C9A84C', borderRadius: '3px' }}></div>
                  <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.3rem', fontWeight: 600, color: '#1A1209' }}>
                    Makkah Al-Mukarramah
                  </h3>
                </div>
                <PlaceGrid places={makkahPlaces} activePlaceKeys={activePlaceKeys} />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '6px', height: '28px', background: '#1A1209', borderRadius: '3px' }}></div>
                  <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.3rem', fontWeight: 600, color: '#1A1209' }}>
                    Al-Madinah Al-Munawwarah
                  </h3>
                </div>
                <PlaceGrid places={madinahPlaces} activePlaceKeys={activePlaceKeys} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '6px', height: '28px', background: '#7A6D5A', borderRadius: '3px' }}></div>
                  <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.3rem', fontWeight: 600, color: '#1A1209' }}>
                    Sites Historiques
                  </h3>
                </div>
                <PlaceGrid places={historiquePlaces} activePlaceKeys={activePlaceKeys} />
              </div>
            </div>
          )}

          {/* TAB: AVIS */}
          {activeTab === 2 && (
            <div style={{ minHeight: '50vh' }}>
              <div style={{
                background: 'white',
                border: '1px solid #E8DFC8',
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
                    color: '#1A1209',
                    lineHeight: 1,
                    marginBottom: '0.25rem',
                  }}>
                    {rating.toFixed(1)}
                  </div>
                  <div style={{ color: '#C9A84C', fontSize: '1.1rem', letterSpacing: '2px', marginBottom: '0.25rem' }}>★★★★★</div>
                  <div style={{ fontSize: '0.75rem', color: '#7A6D5A' }}>{reviews.length} avis vérifiés</div>
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#7A6D5A', width: '10px', textAlign: 'right' }}>{star}</span>
                        <span style={{ color: '#C9A84C', fontSize: '0.72rem' }}>★</span>
                        <div style={{ flex: 1, height: '6px', background: '#E8DFC8', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#C9A84C', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#7A6D5A', width: '28px' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map((rev, i) => (
                  <div key={i} style={{
                    background: 'white',
                    border: '1px solid #E8DFC8',
                    borderRadius: '14px',
                    padding: '1.25rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#E8DFC8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: '#4A3F30',
                          flexShrink: 0,
                        }}>
                          {rev.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1A1209' }}>
                            {rev.name} <span style={{ fontSize: '1rem' }}>{rev.flag}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#7A6D5A' }}>{rev.country} · {rev.date}</div>
                        </div>
                      </div>
                      <div style={{ color: '#C9A84C', fontSize: '0.85rem', letterSpacing: '1px', flexShrink: 0 }}>
                        {'★'.repeat(rev.rating)}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#4A3F30', lineHeight: 1.75 }}>
                      {rev.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE — Bouton réserver (desktop) */}
        <div className="profile-booking-sticky">
          <div style={{ position: 'sticky', top: '90px', background: 'white', borderRadius: '20px', border: '1px solid #E8DFC8', boxShadow: '0 8px 32px rgba(26,18,9,0.08)', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#D1FAE5', color: '#1D5C3A', fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.875rem', borderRadius: 50, marginBottom: '1.25rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1D5C3A', display: 'inline-block' }}/>
              Disponible
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 600, color: '#1A1209', marginBottom: '1.25rem', lineHeight: 1.4 }}>
              Réserver avec<br/>{guideName}
            </div>

            <a
              href={checkoutHref}
              style={{
                display: 'block', padding: '0.875rem 1.5rem',
                background: companionSlug
                  ? 'linear-gradient(135deg, #10B981 0%, #1D5C3A 100%)'
                  : 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)',
                color: companionSlug ? 'white' : '#1A1209',
                borderRadius: 12, fontFamily: 'var(--font-manrope, sans-serif)', fontWeight: 800,
                fontSize: '0.88rem', letterSpacing: '0.05em', textDecoration: 'none',
                boxShadow: companionSlug ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(201,168,76,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {companionSlug ? 'Réserver mon duo 🕋🌿' : 'Réserver ce guide'}
            </a>
            <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: '#9CA3AF', lineHeight: 1.6 }}>
              Guide certifié SAFARUMA · Paiement sécurisé
            </div>
          </div>
        </div>
      </div>

      {/* Mobile booking bar (fixed bottom) */}
      <div className="profile-mobile-booking">
        <a
          href={checkoutHref}
          style={{
            display: 'block', width: '100%', padding: '0.875rem',
            background: companionSlug
              ? 'linear-gradient(135deg, #10B981 0%, #1D5C3A 100%)'
              : 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)',
            color: companionSlug ? 'white' : '#1A1209',
            borderRadius: 50, fontFamily: 'var(--font-manrope, sans-serif)', fontWeight: 800,
            fontSize: '0.88rem', textDecoration: 'none', textAlign: 'center',
            letterSpacing: '0.05em', boxSizing: 'border-box',
          }}
        >
          {companionSlug ? 'Réserver mon duo 🕋🌿' : 'Réserver ce guide'}
        </a>
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
            background: isUnavailable ? '#E5E7EB' : 'white',
            border: '1px solid #E8DFC8',
            borderRadius: '12px',
            padding: '0.9rem 1rem',
            transition: 'transform 0.15s, box-shadow 0.15s',
            opacity: isUnavailable ? 0.6 : 1,
            position: 'relative',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{place.emoji}</div>
            <div style={{
              fontSize: '0.65rem',
              color: '#7A6D5A',
              fontFamily: 'var(--font-cormorant), serif',
              fontStyle: 'italic',
              marginBottom: '0.15rem',
              direction: 'rtl',
              textAlign: 'right',
            }}>
              {place.nameAr}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.25rem' }}>
              {place.nameFr}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7A6D5A', lineHeight: 1.5 }}>
              {place.desc}
            </div>
            {isUnavailable && (
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                fontSize: '0.65rem',
                fontWeight: 700,
                background: '#6B7280',
                color: 'white',
                padding: '0.2rem 0.6rem',
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
