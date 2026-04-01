'use client';

import { useState } from 'react';
import BookingWidget from './BookingWidget';

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
  packages: Package[];
  places: Place[];
  reviews: Review[];
  certifications: string[];
  services: string[];
  bioFull: string[];
}

const TAB_LABELS = ['Présentation', 'Lieux Saints', 'Forfaits', 'Avis'];

export default function GuideProfileClient({
  slug,
  guideName,
  packages,
  places,
  reviews,
  certifications,
  services,
  bioFull,
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
  });

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '3rem 2rem 6rem',
      display: 'grid',
      gridTemplateColumns: '1fr 340px',
      gap: '2.5rem',
      alignItems: 'start',
    }}
    className="profile-main-grid"
    >
      {/* LEFT SIDE */}
      <div>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--sand)',
          marginBottom: '2rem',
          overflowX: 'auto',
          gap: '0',
        }}>
          {TAB_LABELS.map((label, i) => (
            <button key={i} style={tabStyle(i)} onClick={() => setActiveTab(i)}>
              {label}
            </button>
          ))}
        </div>

        {/* TAB: PRESENTATION */}
        {activeTab === 0 && (
          <div>
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
                Certifications & Diplômes
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
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
          <div>
            {/* MAKKAH */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}>
                <div style={{
                  width: '6px',
                  height: '28px',
                  background: 'var(--gold)',
                  borderRadius: '3px',
                }}></div>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--deep)',
                }}>
                  Makkah Al-Mukarramah
                </h3>
              </div>
              <PlaceGrid places={makkahPlaces} />
            </div>

            {/* MADINAH */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}>
                <div style={{
                  width: '6px',
                  height: '28px',
                  background: 'var(--deep)',
                  borderRadius: '3px',
                }}></div>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--deep)',
                }}>
                  Al-Madinah Al-Munawwarah
                </h3>
              </div>
              <PlaceGrid places={madinahPlaces} />
            </div>

            {/* HISTORIQUE */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}>
                <div style={{
                  width: '6px',
                  height: '28px',
                  background: 'var(--muted)',
                  borderRadius: '3px',
                }}></div>
                <h3 style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--deep)',
                }}>
                  Sites Historiques
                </h3>
              </div>
              <PlaceGrid places={historiquePlaces} />
            </div>
          </div>
        )}

        {/* TAB: FORFAITS */}
        {activeTab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                    POPULAIRE
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
                      {pkg.days} jours
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
        )}

        {/* TAB: AVIS */}
        {activeTab === 3 && (
          <div>
            {/* Rating Overview */}
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
                  4.97
                </div>
                <div style={{ color: 'var(--gold)', fontSize: '1.1rem', letterSpacing: '2px', marginBottom: '0.25rem' }}>★★★★★</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{reviews.length} avis vérifiés</div>
              </div>
              <div style={{ flex: 1, minWidth: '180px' }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = Math.round((count / reviews.length) * 100);
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

            {/* Review Cards */}
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

      {/* RIGHT SIDE — Booking Widget */}
      <div>
        <BookingWidget
          slug={slug}
          guideName={guideName}
          packages={packages.map(p => ({ name: p.name, price: p.price, days: p.days, label: p.label }))}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .profile-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
}

function PlaceGrid({ places }: { places: Place[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
      gap: '0.75rem',
    }}>
      {places.map((place, i) => (
        <div key={i} style={{
          background: 'white',
          border: '1px solid var(--sand)',
          borderRadius: '12px',
          padding: '0.9rem 1rem',
          transition: 'transform 0.15s, box-shadow 0.15s',
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
        </div>
      ))}
    </div>
  );
}
