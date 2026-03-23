'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BookingWidget({ guideId, pricePerDay }: { guideId: string, pricePerDay: number }) {
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Mock calendar for April 2026
  const daysInMonth = 30;
  const startDayOfWeek = 3; // Wednesday
  const today = 10;
  
  // Mock occupied dates (e.g. 15 to 18)
  const occupiedDates = [15, 16, 17, 18];

  const handleDateClick = (day: number) => {
    if (day < today || occupiedDates.includes(day)) return;

    if (selectedDates.length === 0 || selectedDates.length === 2) {
      setSelectedDates([day]);
      setIsAvailable(null);
    } else {
      const start = selectedDates[0];
      const end = day;
      if (end < start) {
        setSelectedDates([end, start]);
      } else {
        setSelectedDates([start, end]);
      }
      
      // Simulate availability check
      setIsChecking(true);
      setTimeout(() => {
        setIsChecking(false);
        // Check if any occupied dates fall within the selection
        const rangeStart = Math.min(start, end);
        const rangeEnd = Math.max(start, end);
        const hasConflict = occupiedDates.some(d => d >= rangeStart && d <= rangeEnd);
        setIsAvailable(!hasConflict);
      }, 600);
    }
  };

  const getDayClass = (day: number) => {
    if (day < today) return 'opacity-30 cursor-not-allowed line-through';
    if (occupiedDates.includes(day)) return 'bg-[var(--sand)] text-[var(--muted)] opacity-50 cursor-not-allowed';
    
    if (selectedDates.length === 1 && selectedDates[0] === day) {
      return 'bg-[var(--deep)] text-[var(--gold-light)] font-bold';
    }
    if (selectedDates.length === 2) {
      const [start, end] = selectedDates;
      if (day === start || day === end) return 'bg-[var(--deep)] text-[var(--gold-light)] font-bold';
      if (day > start && day < end) return 'bg-[var(--gold-pale)] text-[var(--deep)] font-semibold';
    }
    return 'hover:border-[var(--gold)] border-transparent border cursor-pointer';
  };

  const calculateTotal = () => {
    if (selectedDates.length === 2) {
      const days = selectedDates[1] - selectedDates[0] + 1;
      return days * pricePerDay;
    }
    return pricePerDay;
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--sand)] shadow-sm overflow-hidden sticky top-[100px]">
      <div className="p-6 border-b border-[var(--sand)]">
        <h3 className="text-xl font-serif text-[var(--deep)] mb-1">Disponibilités en temps réel</h3>
        <p className="text-sm text-[var(--muted)]">Sélectionnez vos dates pour vérifier et réserver.</p>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <button className="text-[var(--muted)] hover:text-[var(--deep)] p-1">←</button>
          <span className="font-bold text-[var(--deep)]">Avril 2026</span>
          <button className="text-[var(--muted)] hover:text-[var(--deep)] p-1">→</button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(d => (
            <div key={d} className="text-xs font-bold text-[var(--muted)]">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center mb-6">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => (
            <div 
              key={i + 1}
              onClick={() => handleDateClick(i + 1)}
              className={`p-2 text-sm rounded-lg transition-colors ${getDayClass(i + 1)}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Status Area */}
        <div className="min-h-[120px]">
          {selectedDates.length === 0 && (
            <div className="text-center p-4 bg-[var(--cream)] rounded-xl border border-[var(--sand)] text-sm text-[var(--muted)]">
              Cliquez sur une date de début et de fin pour commencer.
            </div>
          )}

          {selectedDates.length === 1 && (
            <div className="text-center p-4 bg-[var(--gold-pale)] rounded-xl border border-[var(--gold)] text-sm font-semibold text-[var(--gold-dark)]">
              Sélectionnez la date de fin...
            </div>
          )}

          {selectedDates.length === 2 && isChecking && (
            <div className="text-center p-4 text-sm font-semibold text-[var(--muted)] animate-pulse">
              Vérification des disponibilités...
            </div>
          )}

          {selectedDates.length === 2 && !isChecking && isAvailable === false && (
            <div className="text-center p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              <strong>Dates indisponibles</strong><br/>
              Le guide est déjà réservé sur une partie de ces dates.
            </div>
          )}

          {selectedDates.length === 2 && !isChecking && isAvailable === true && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-end mb-4 p-4 bg-[var(--cream)] rounded-xl border border-[var(--sand)]">
                <div>
                  <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1">Total calculé</div>
                  <div className="text-2xl font-serif text-[var(--deep)]">{calculateTotal()}€</div>
                </div>
                <div className="text-right text-xs text-[var(--muted)]">
                  {selectedDates[1] - selectedDates[0] + 1} jours × {pricePerDay}€
                </div>
              </div>

              <Link href={`/espace/checkout/${guideId}`} className="block w-full">
                <button className="w-full py-4 bg-[var(--deep)] text-[var(--gold-light)] font-bold rounded-xl hover:bg-[var(--warm)] transition-shadow shadow-md hover:shadow-lg">
                  Réserver mon guide
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
