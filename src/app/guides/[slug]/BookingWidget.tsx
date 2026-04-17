'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Package {
  name: string;
  price: number;
  days: number;
  label: string;
}

interface BookingWidgetProps {
  slug: string;
  guideName: string;
  packages: Package[];
}

export default function BookingWidget({ slug, guideName, packages }: BookingWidgetProps) {
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [groupSize, setGroupSize] = useState(2);

  const now = new Date();
  const [calYear, setCalYear]   = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-indexed

  const daysInMonth    = new Date(calYear, calMonth + 1, 0).getDate();
  const startDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // 0=Lundi
  const todayDate      = now.getDate();
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth();
  const occupiedDates: number[] = []; // À brancher sur les vraies dispo plus tard

  const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setSelectedDates([]);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setSelectedDates([]);
  };

  // Empêcher navigation vers le passé
  const isPrevDisabled = calYear === now.getFullYear() && calMonth <= now.getMonth();

  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const handleDateClick = (day: number) => {
    if ((isCurrentMonth && day < todayDate) || occupiedDates.includes(day)) return;
    if (selectedDates.length === 0 || selectedDates.length === 2) {
      setSelectedDates([day]);
    } else {
      const start = selectedDates[0];
      const end = day;
      if (end < start) {
        setSelectedDates([end, start]);
      } else {
        setSelectedDates([start, end]);
      }
    }
  };

  const getDayStyle = (day: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '0.4rem',
      fontSize: '0.78rem',
      borderRadius: '8px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'background 0.15s',
    };

    if (isCurrentMonth && day < todayDate) {
      return { ...base, opacity: 0.3, cursor: 'not-allowed', textDecoration: 'line-through' };
    }
    if (occupiedDates.includes(day)) {
      return { ...base, background: 'var(--sand)', color: 'var(--muted)', opacity: 0.5, cursor: 'not-allowed' };
    }

    if (selectedDates.length >= 1 && selectedDates[0] === day) {
      return { ...base, background: 'var(--deep)', color: 'var(--gold-light)', fontWeight: 700 };
    }
    if (selectedDates.length === 2) {
      const [start, end] = selectedDates;
      if (day === end) return { ...base, background: 'var(--deep)', color: 'var(--gold-light)', fontWeight: 700 };
      if (day > start && day < end) return { ...base, background: 'var(--gold-pale)', color: 'var(--deep)', fontWeight: 600 };
    }

    return { ...base, border: '1px solid transparent' };
  };

  const pkg = packages[selectedPackage] ?? packages[0];
  const livePrice = pkg ? pkg.price * groupSize : 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      border: '1px solid var(--sand)',
      boxShadow: '0 8px 32px rgba(26,18,9,0.08)',
      overflow: 'hidden',
      position: 'sticky',
      top: '90px',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--deep)',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.3rem' }}>
          Réserver avec
        </div>
        <div style={{ color: 'white', fontFamily: 'var(--font-cormorant), serif', fontSize: '1.2rem', fontWeight: 600 }}>
          {guideName}
        </div>
      </div>

      <div style={{ padding: '1.25rem 1.5rem' }}>
        {/* Package selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.6rem' }}>
            Forfait
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {packages.map((p, i) => (
              <button
                key={i}
                onClick={() => setSelectedPackage(i)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '10px',
                  border: selectedPackage === i ? '1.5px solid var(--gold)' : '1.5px solid var(--sand)',
                  background: selectedPackage === i ? 'rgba(201,168,76,0.06)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  fontFamily: 'var(--font-manrope), sans-serif',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--deep)' }}>{p.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{p.days} jours</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-cormorant), serif',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: selectedPackage === i ? 'var(--gold-dark)' : 'var(--deep)',
                }}>
                  {p.price}€
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 400, color: 'var(--muted)' }}>/pers</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Group size */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.6rem' }}>
            Taille du groupe
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1.5px solid var(--sand)', borderRadius: '10px', overflow: 'hidden' }}>
            <button
              onClick={() => setGroupSize(g => Math.max(1, g - 1))}
              style={{
                width: '42px',
                height: '42px',
                border: 'none',
                background: groupSize === 1 ? 'var(--cream)' : 'white',
                cursor: groupSize === 1 ? 'not-allowed' : 'pointer',
                fontSize: '1.2rem',
                color: groupSize === 1 ? 'var(--muted)' : 'var(--deep)',
                fontFamily: 'var(--font-manrope), sans-serif',
                transition: 'background 0.15s',
              }}
            >
              −
            </button>
            <div style={{
              flex: 1,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--deep)',
              borderLeft: '1px solid var(--sand)',
              borderRight: '1px solid var(--sand)',
              padding: '0.6rem 0',
            }}>
              {groupSize} {groupSize === 1 ? 'personne' : 'personnes'}
            </div>
            <button
              onClick={() => setGroupSize(g => Math.min(12, g + 1))}
              style={{
                width: '42px',
                height: '42px',
                border: 'none',
                background: groupSize === 12 ? 'var(--cream)' : 'white',
                cursor: groupSize === 12 ? 'not-allowed' : 'pointer',
                fontSize: '1.2rem',
                color: groupSize === 12 ? 'var(--muted)' : 'var(--deep)',
                fontFamily: 'var(--font-manrope), sans-serif',
                transition: 'background 0.15s',
              }}
            >
              +
            </button>
          </div>
          {groupSize > 6 && (
            <div style={{ fontSize: '0.72rem', color: 'var(--gold-dark)', marginTop: '0.4rem', fontWeight: 600 }}>
              Grand groupe — véhicule adapté inclus
            </div>
          )}
        </div>

        {/* Calendar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.6rem' }}>
            Dates de départ
          </div>
          <div style={{ background: 'var(--cream)', borderRadius: '12px', padding: '0.75rem', border: '1px solid var(--sand)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <button
                onClick={prevMonth}
                disabled={isPrevDisabled}
                style={{ border: 'none', background: 'none', cursor: isPrevDisabled ? 'not-allowed' : 'pointer', color: isPrevDisabled ? 'var(--sand)' : 'var(--muted)', fontSize: '1rem' }}
              >←</button>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--deep)' }}>
                {MONTHS_FR[calMonth]} {calYear}
              </span>
              <button
                onClick={nextMonth}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '1rem' }}
              >→</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', marginBottom: '0.4rem' }}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <div key={i} style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', padding: '0.2rem' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`e-${i}`}></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => (
                <div
                  key={i + 1}
                  onClick={() => handleDateClick(i + 1)}
                  style={getDayStyle(i + 1)}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          {selectedDates.length === 1 && (
            <div style={{ fontSize: '0.68rem', color: 'var(--gold-dark)', marginTop: '0.4rem', fontWeight: 600 }}>
              Sélectionnez la date de fin
            </div>
          )}
          {selectedDates.length === 2 && (
            <div style={{ fontSize: '0.68rem', color: 'var(--green)', marginTop: '0.4rem', fontWeight: 600 }}>
              ✓ {selectedDates[1] - selectedDates[0] + 1} jours sélectionnés
            </div>
          )}
        </div>

        {/* Live Price */}
        <div style={{
          background: 'linear-gradient(135deg, var(--deep) 0%, var(--warm) 100%)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,216,151,0.6)', marginBottom: '0.25rem' }}>
              Total estimé
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '2rem', fontWeight: 700, color: 'var(--gold-light)', lineHeight: 1 }}>
              {livePrice.toLocaleString('fr-FR')} €
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
            <div>{groupSize} pers.</div>
            <div>× {pkg.price}€</div>
            <div>{pkg.days} jours</div>
          </div>
        </div>

        {/* Availability */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.6rem 0.8rem', background: 'var(--green-bg)', borderRadius: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', flexShrink: 0 }}></span>
          <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 600 }}>Disponible · Répond en moins de 2h</span>
        </div>

        {/* CTA */}
        <Link
          href={`/espace/checkout/${slug}?forfait=${selectedPackage}&personnes=${groupSize}${selectedDates.length >= 1 ? `&dateDebut=${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDates[0]).padStart(2, '0')}` : ''}${selectedDates.length === 2 ? `&dateFin=${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDates[1]).padStart(2, '0')}` : ''}`}
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <button style={{
            width: '100%',
            padding: '0.9rem',
            background: 'var(--gold)',
            color: 'var(--deep)',
            border: 'none',
            borderRadius: '12px',
            fontFamily: 'var(--font-manrope), sans-serif',
            fontWeight: 800,
            fontSize: '0.88rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background 0.2s, transform 0.15s',
          }}>
            Demander ce guide
          </button>
        </Link>

        {/* Trust badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem', padding: '0.75rem', background: 'var(--cream)', borderRadius: 10, border: '1px solid var(--sand)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--warm)', fontWeight: 600 }}>
            <span style={{ color: 'var(--green)' }}>✓</span> Guide Certifié SAFARUMA
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--warm)', fontWeight: 600 }}>
            <span style={{ color: 'var(--gold-dark)' }}>🛡️</span> Paiement 100% sécurisé
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--warm)', fontWeight: 600 }}>
            <span>↩️</span> Annulation gratuite sous 48h
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.75rem', lineHeight: 1.6 }}>
          Sans engagement · Réponse sous 2h · 88% d&apos;acceptation
        </div>
      </div>
    </div>
  );
}
