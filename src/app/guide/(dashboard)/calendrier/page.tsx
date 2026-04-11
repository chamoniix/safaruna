'use client';

import { useState, useEffect, useCallback } from 'react';

type Avail = { id: string; date: string; status: string };

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const STATUS_STYLE: Record<string, { bg: string; border: string; color: string; label: string }> = {
  AVAILABLE:   { bg: '#D1FAE5', border: '#1D5C3A', color: '#1D5C3A', label: '✓ Dispo' },
  BOOKED:      { bg: '#DBEAFE', border: '#1D4ED8', color: '#1D4ED8', label: '📅 Réservé' },
  UNAVAILABLE: { bg: '#FEE2E2', border: '#DC2626', color: '#DC2626', label: '✗ Indispo' },
  NONE:        { bg: 'white',   border: '#E8DFC8', color: '#9CA3AF', label: '' },
};

function toYMD(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isToday(dateStr: string): boolean {
  return dateStr === toYMD(new Date());
}

export default function GuidCalendrierPage() {
  const [availabilities, setAvailabilities] = useState<Avail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const fetchAvails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/guide/calendrier');
      const data = await res.json();
      setAvailabilities(data.availabilities || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAvails(); }, [fetchAvails]);

  const availMap = Object.fromEntries(availabilities.map(a => [a.date, a]));

  const handleDayClick = async (dateStr: string) => {
    const current = availMap[dateStr];
    if (current?.status === 'BOOKED') return;

    // Determine next state and optimistic update
    let nextStatus: 'AVAILABLE' | 'UNAVAILABLE' | null = null;
    let nextAvails: Avail[];

    if (!current) {
      nextStatus = 'AVAILABLE';
      const optimistic: Avail = { id: 'optimistic-' + dateStr, date: dateStr, status: 'AVAILABLE' };
      nextAvails = [...availabilities, optimistic];
    } else if (current.status === 'AVAILABLE') {
      nextStatus = 'UNAVAILABLE';
      nextAvails = availabilities.map(a => a.date === dateStr ? { ...a, status: 'UNAVAILABLE' } : a);
    } else {
      // UNAVAILABLE → delete (back to undefined)
      nextStatus = null;
      nextAvails = availabilities.filter(a => a.date !== dateStr);
    }

    setAvailabilities(nextAvails);
    setSaving(dateStr);

    try {
      if (nextStatus === null) {
        await fetch('/api/guide/calendrier', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr }),
        });
      } else {
        await fetch('/api/guide/calendrier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr, status: nextStatus }),
        });
      }
    } catch {
      // Rollback on error
      setAvailabilities(availabilities);
    }

    setSaving(null);
  };

  // Build calendar grid for currentMonth
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  // Monday-based: 0=Mon, 6=Sun
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toYMD(today);

  const cells: { dateStr: string | null; dayNum: number; inMonth: boolean }[] = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ dateStr: null, dayNum: daysInPrevMonth - i, inMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ dateStr: toYMD(date), dayNum: d, inMonth: true });
  }

  // Next month padding to fill last row
  const remainder = cells.length % 7;
  if (remainder > 0) {
    for (let d = 1; d <= 7 - remainder; d++) {
      cells.push({ dateStr: null, dayNum: d, inMonth: false });
    }
  }

  // Stats for current month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthAvails = availabilities.filter(a => a.date.startsWith(monthPrefix));
  const countAvail   = monthAvails.filter(a => a.status === 'AVAILABLE').length;
  const countBooked  = monthAvails.filter(a => a.status === 'BOOKED').length;
  const countUnavail = monthAvails.filter(a => a.status === 'UNAVAILABLE').length;

  const prevMonth = () => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const btnStyle: React.CSSProperties = {
    padding: '0.5rem 1.25rem', background: '#1A1209', color: '#F0D897',
    border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.82rem',
    cursor: 'pointer', fontFamily: 'inherit',
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ background: '#F0EDE8', borderRadius: 12, height: 60, border: '1px solid #E8DFC8' }} />
      <div style={{ background: '#F0EDE8', borderRadius: 12, height: 480, border: '1px solid #E8DFC8' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'var(--font-manrope, sans-serif)' }}>

      {/* Header nav mois */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <button onClick={prevMonth} style={btnStyle}>← Mois précédent</button>
        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#1A1209', margin: 0 }}>
          {MONTHS_FR[month]} {year}
        </h1>
        <button onClick={nextMonth} style={btnStyle}>Mois suivant →</button>
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[
          { bg: '#D1FAE5', border: '#1D5C3A', color: '#1D5C3A', label: 'Disponible' },
          { bg: '#FEE2E2', border: '#DC2626', color: '#DC2626', label: 'Indisponible' },
          { bg: '#DBEAFE', border: '#1D4ED8', color: '#1D4ED8', label: 'Réservé' },
          { bg: 'white',   border: '#E8DFC8', color: '#9CA3AF', label: 'Non défini' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#4A3F30' }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: s.bg, border: `1.5px solid ${s.border}` }} />
            {s.label}
          </div>
        ))}
      </div>

      {/* Grille calendrier */}
      <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden' }}>
        {/* En-têtes jours */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E8DFC8' }}>
          {DAYS_FR.map(d => (
            <div key={d} style={{ padding: '0.6rem 0', textAlign: 'center', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#7A6D5A', textTransform: 'uppercase' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Cases */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((cell, i) => {
            if (!cell.inMonth) {
              return (
                <div key={i} style={{ minHeight: 80, padding: '0.5rem', background: '#FAFAF8', borderRight: (i + 1) % 7 !== 0 ? '1px solid #F0EBE0' : 'none', borderBottom: i < cells.length - 7 ? '1px solid #F0EBE0' : 'none' }}>
                  <span style={{ fontSize: '0.72rem', color: '#D1C9BC' }}>{cell.dayNum}</span>
                </div>
              );
            }

            const dateStr = cell.dateStr!;
            const avail = availMap[dateStr];
            const status = avail?.status || 'NONE';
            const isPast = dateStr < todayStr;
            const isBooked = status === 'BOOKED';
            const isSavingThis = saving === dateStr;
            const s = STATUS_STYLE[status];
            const todayHighlight = isToday(dateStr);

            return (
              <div
                key={i}
                onClick={() => !isPast && !isBooked ? handleDayClick(dateStr) : undefined}
                style={{
                  minHeight: 80,
                  padding: '0.5rem',
                  background: isPast ? '#F5F5F5' : s.bg,
                  border: `1px solid ${isPast ? '#F0EBE0' : s.border}`,
                  borderTop: 'none',
                  borderLeft: i % 7 === 0 ? 'none' : undefined,
                  borderRight: (i + 1) % 7 === 0 ? 'none' : undefined,
                  borderBottom: i >= cells.length - 7 ? 'none' : undefined,
                  cursor: isPast || isBooked ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  opacity: isSavingThis ? 0.6 : 1,
                  transition: 'opacity 0.15s',
                  position: 'relative',
                  outline: todayHighlight ? '2px solid #C9A84C' : 'none',
                  outlineOffset: -2,
                }}
              >
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: todayHighlight ? 800 : 600,
                  color: isPast ? '#C0B8B0' : s.color,
                }}>
                  {cell.dayNum}
                </span>
                {!isPast && s.label && (
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: s.color,
                    lineHeight: 1.2,
                  }}>
                    {s.label}
                  </span>
                )}
                {isSavingThis && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: 8 }}>
                    <div style={{ width: 16, height: 16, border: '2px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats mois */}
      <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7A6D5A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ce mois</span>
        {[
          { count: countAvail,   color: '#1D5C3A', label: 'jours disponibles' },
          { count: countBooked,  color: '#1D4ED8', label: 'jours réservés' },
          { count: countUnavail, color: '#DC2626', label: 'indisponibles' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</span>
            <span style={{ fontSize: '0.78rem', color: '#7A6D5A' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Info card */}
      <div style={{ background: '#FEF9EC', border: '1px solid #FCD34D', borderRadius: 12, padding: '1rem 1.5rem', fontSize: '0.82rem', color: '#92400E', lineHeight: 1.7 }}>
        💡 Cliquez sur une date pour la marquer <strong>disponible</strong>. Cliquez à nouveau pour la marquer <strong>indisponible</strong>. Cliquez une troisième fois pour effacer. Les dates réservées ne peuvent pas être modifiées.
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
