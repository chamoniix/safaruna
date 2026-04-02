'use client';
import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        obs.disconnect();

        const startTime = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const t = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(eased * target));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { value, ref };
}

interface StatItem {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  decorator?: string;
}

const STATS: StatItem[] = [
  { value: 320, suffix: '+', label: 'Guides certifiés' },
  { value: 12,  label: 'pays couverts' },
  { value: 98,  suffix: '%', label: 'Satisfaction pèlerins' },
  { value: 2,   prefix: '< ', suffix: 'h', label: 'Temps de réponse', decorator: '⚡' },
  { value: 0,   prefix: '',   suffix: ' compromis', label: 'Sur les rituels', decorator: '🕋' },
];

function CounterItem({ stat }: { stat: StatItem }) {
  const { value, ref } = useCountUp(stat.value, 1800);
  const display = stat.value === 0 ? '0' : String(value);

  return (
    <div className="trust-item">
      <strong>
        <span ref={ref}>
          {stat.prefix ?? ''}{display}{stat.suffix ?? ''}
        </span>
      </strong>
      <span>{stat.label}</span>
    </div>
  );
}

export default function CounterStrip() {
  return (
    <div className="trust">
      {STATS.map((s, i) => (
        <CounterItem key={i} stat={s} />
      ))}
    </div>
  );
}
