'use client';
import { useEffect, useRef, useState } from 'react';

const STATS = [
  { end: 15,  prefix: '', suffix: '+', label: 'Guides certifiés & vérifiés', duration: 1200 },
  { end: 850, prefix: '', suffix: '+', label: 'Pèlerins accompagnés',         duration: 1800 },
  { end: 97,  prefix: '', suffix: '%', label: 'Taux de recommandation',       duration: 1600 },
  { end: 17,  prefix: '', suffix: '',  label: 'Langues couvertes',             duration: 1400 },
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
        setValue(0); // ensure starts at 0
        const t0 = Date.now();
        const tick = () => {
          const elapsed = Date.now() - t0;
          const p = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          setValue(Math.round(eased * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
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
