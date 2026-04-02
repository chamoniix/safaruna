'use client';
import { useEffect } from 'react';

/**
 * Zero-render client component — attaches IntersectionObserver to every
 * element with class `.reveal`, `.reveal-left`, or `.reveal-scale`.
 * Adds `.visible` when the element enters the viewport.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-scale';
    const els = Array.from(document.querySelectorAll(selectors));
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return null;
}
