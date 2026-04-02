'use client';
import { useEffect, useRef, useState } from 'react';

const STATS = [
  { end: 320,   prefix: '',  suffix: '+', label: 'Guides certifiés',         duration: 1800 },
  { end: 15000, prefix: '',  suffix: '+', label: 'Pèlerins accompagnés',      duration: 2000 },
  { end: 98,    prefix: '',  suffix: '%', label: 'Satisfaction pèlerins',     duration: 1600 },
  { end: 12,    prefix: '',  suffix: '',  label: 'Langues couvertes',          duration: 1400 },
];

function useCounting(end: number, duration: number) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        obs.disconnect();
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / duration, 1);
          setValue(Math.round((1 - Math.pow(1 - p, 3)) * end)); // ease-out cubic
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);

  return { value, ref };
}

function StatItem({ stat }: { stat: typeof STATS[0] }) {
  const { value, ref } = useCounting(stat.end, stat.duration);
  const display = stat.end >= 1000
    ? value.toLocaleString('fr-FR')
    : String(value);

  return (
    <div ref={ref} className="stat-item">
      <div className="stat-number">
        {stat.prefix}{display}{stat.suffix}
      </div>
      <div className="stat-divider" />
      <div className="stat-label">{stat.label}</div>
    </div>
  );
}

export default function StatsSection() {
  return (
    <div className="stats-section">
      <div className="stats-grid">
        {STATS.map((s) => (
          <StatItem key={s.label} stat={s} />
        ))}
      </div>
    </div>
  );
}
