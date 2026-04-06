'use client';

import { useState } from 'react';

const CATEGORIES = ['Tous', 'Rituels (Fiqh)', 'Histoire (Sīrah)', 'Spiritualité', 'Guides Pratiques'];

const BADGE_CONFIG: Record<string, { bg: string; color: string }> = {
  'NOUVEAU':  { bg: '#C9A84C', color: '#1A1209' },
  'EN COURS': { bg: '#1A4A8A', color: 'white' },
  'TERMINÉ':  { bg: '#1D5C3A', color: 'white' },
};

const COURSES = [
  { id: 1, cat: 'Rituels (Fiqh)',      title: "Les rites de la Omra : étape par étape",          duration: '45 min', modules: '4 modules', badge: 'EN COURS', progress: 45 },
  { id: 2, cat: 'Histoire (Sīrah)',    title: "L'histoire de Zamzam et Hajar",                    duration: '28 min', modules: '2 modules', badge: 'EN COURS', progress: 80 },
  { id: 3, cat: 'Rituels (Fiqh)',      title: "L'état de l'Ihram : règles et interdits",          duration: '45 min', modules: '4 modules', badge: 'NOUVEAU',  progress: 0  },
  { id: 4, cat: 'Rituels (Fiqh)',      title: "Comment accomplir le Tawaf correctement",          duration: '32 min', modules: '3 modules', badge: 'EN COURS', progress: 30 },
  { id: 5, cat: 'Rituels (Fiqh)',      title: "Le Sa'i entre Safa et Marwa",                      duration: '28 min', modules: '2 modules', badge: null,       progress: 0  },
  { id: 6, cat: 'Rituels (Fiqh)',      title: "La fin de la Omra : rasage ou coupe",              duration: '15 min', modules: '1 module',  badge: 'TERMINÉ',  progress: 100},
  { id: 7, cat: 'Histoire (Sīrah)',    title: "La biographie du Prophète ﷺ à Makkah",             duration: '2h 15m', modules: '8 modules', badge: 'NOUVEAU',  progress: 0  },
  { id: 8, cat: 'Histoire (Sīrah)',    title: "La Bataille de Badr : leçon de foi",               duration: '55 min', modules: '3 modules', badge: null,       progress: 0  },
  { id: 9, cat: 'Histoire (Sīrah)',    title: "Uhud : l'importance de l'obéissance",              duration: '48 min', modules: '3 modules', badge: null,       progress: 0  },
  { id: 10, cat: 'Spiritualité',       title: "Purifier son intention avant le départ",           duration: '20 min', modules: '2 modules', badge: 'NOUVEAU',  progress: 0  },
  { id: 11, cat: 'Spiritualité',       title: "La présence du cœur pendant les rituels",         duration: '35 min', modules: '3 modules', badge: null,       progress: 0  },
  { id: 12, cat: 'Guides Pratiques',   title: "Conseils pratiques pour la Omra en famille",      duration: '25 min', modules: '2 modules', badge: null,       progress: 0  },
];

function BadgePill({ badge }: { badge: string }) {
  const conf = BADGE_CONFIG[badge];
  if (!conf) return null;
  return (
    <span style={{ background: conf.bg, color: conf.color, fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 50 }}>
      {badge}
    </span>
  );
}

function PlayButton() {
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'white', fontSize: '0.9rem', marginLeft: 3 }}>▶</span>
    </div>
  );
}

function CourseCard({ course, large }: { course: typeof COURSES[0]; large?: boolean }) {
  const badgeConf = course.badge ? BADGE_CONFIG[course.badge] : null;
  return (
    <div style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s', display: 'flex', flexDirection: large ? 'row' : 'column' }}>
      {/* Thumbnail */}
      <div style={{ position: 'relative', background: 'linear-gradient(135deg, #1A1209, #2D1F08)', flexShrink: 0, width: large ? 160 : '100%', aspectRatio: large ? undefined : '16/9', height: large ? 100 : undefined, minHeight: large ? 100 : undefined }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <PlayButton />
        </div>
        {badgeConf && (
          <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3 }}>
            <BadgePill badge={course.badge!} />
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 6, right: 8, zIndex: 3, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.62rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 4 }}>
          {course.duration}
        </div>
        {course.progress > 0 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.15)', zIndex: 3 }}>
            <div style={{ height: '100%', width: `${course.progress}%`, background: '#1D9E75' }} />
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '0.875rem 1rem', flex: 1 }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{course.modules}</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.35, marginBottom: large ? '0.5rem' : 0 }}>{course.title}</div>
        {large && course.progress > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#7A6D5A', marginBottom: '0.25rem' }}>
              <span>Progression</span><span style={{ color: '#1D5C3A', fontWeight: 700 }}>{course.progress}%</span>
            </div>
            <div style={{ height: 4, background: '#F0EBD8', borderRadius: 50, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${course.progress}%`, background: 'linear-gradient(90deg, #1D9E75, #1D5C3A)', borderRadius: 50 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SAFARUMAAcademy() {
  const [activeCat, setActiveCat] = useState('Tous');

  const inProgress = COURSES.filter(c => c.badge === 'EN COURS');
  const filtered = activeCat === 'Tous' ? COURSES : COURSES.filter(c => c.cat === activeCat);
  const sections = activeCat === 'Tous'
    ? ['Rituels (Fiqh)', 'Histoire (Sīrah)', 'Spiritualité', 'Guides Pratiques']
    : [activeCat];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ac-cat-btn { transition: background 0.15s, border-color 0.15s, color 0.15s; }
        .ac-cat-btn:hover { border-color: #C9A84C !important; }
        .ac-course:hover { border-color: #C9A84C !important; box-shadow: 0 4px 16px rgba(26,18,9,0.08) !important; }
        .ac-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @media (min-width: 900px) { .ac-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 480px) { .ac-grid { grid-template-columns: 1fr; } }
        .ac-progress-cards { display: grid; grid-template-columns: 1fr; gap: 0.875rem; }
        @media (min-width: 640px) { .ac-progress-cards { grid-template-columns: 1fr 1fr; } }
        .ac-cats { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem; scrollbar-width: none; }
        .ac-cats::-webkit-scrollbar { display: none; }
      `}} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1A1209 0%, #2D1F08 100%)', borderRadius: 20, padding: '2rem', marginBottom: '1.75rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 80% 50%, rgba(201,168,76,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontFamily: 'serif', fontSize: '7rem', color: 'rgba(201,168,76,0.05)', lineHeight: 1, userSelect: 'none' }}>علم</div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
          <span style={{ background: '#C9A84C', color: '#1A1209', fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.2rem 0.7rem', borderRadius: 50, display: 'inline-block', marginBottom: '0.875rem' }}>Nouveau Module</span>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'white', fontWeight: 600, lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Comprendre le Tafsir des versets du Hajj & de la Omra
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Plongez dans les profondeurs du Coran avec Cheikh Rachid pour comprendre la signification spirituelle de chaque action à Makkah.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button style={{ background: '#C9A84C', color: '#1A1209', border: 'none', borderRadius: 50, padding: '0.65rem 1.5rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ▶ Commencer le cours
            </button>
            <button style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 50, padding: '0.65rem 1.25rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              + Ma liste
            </button>
          </div>
        </div>
      </div>

      {/* En cours */}
      {inProgress.length > 0 && activeCat === 'Tous' && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.875rem' }}>Reprendre</h2>
          <div className="ac-progress-cards">
            {inProgress.map(c => (
              <div key={c.id} className="ac-course" style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', display: 'flex', gap: 0 }}>
                <div style={{ width: 110, flexShrink: 0, background: 'linear-gradient(135deg, #1A1209, #2D1F08)', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PlayButton /></div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.15)' }}>
                    <div style={{ height: '100%', width: `${c.progress}%`, background: '#1D9E75' }} />
                  </div>
                </div>
                <div style={{ flex: 1, padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <BadgePill badge="EN COURS" />
                    <span style={{ fontSize: '0.65rem', color: '#7A6D5A' }}>{c.duration}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.35, marginBottom: '0.5rem' }}>{c.title}</div>
                  <div style={{ height: 4, background: '#F0EBD8', borderRadius: 50, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.progress}%`, background: 'linear-gradient(90deg, #1D9E75, #1D5C3A)', borderRadius: 50 }} />
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#1D5C3A', fontWeight: 700, marginTop: '0.25rem' }}>{c.progress}% terminé</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Catégories */}
      <div className="ac-cats" style={{ marginBottom: '1.5rem' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className="ac-cat-btn"
            onClick={() => setActiveCat(cat)}
            style={{ flexShrink: 0, padding: '0.45rem 1rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: activeCat === cat ? 700 : 500, border: `1.5px solid ${activeCat === cat ? '#1A1209' : '#E8DFC8'}`, background: activeCat === cat ? '#1A1209' : 'white', color: activeCat === cat ? '#F0D897' : '#7A6D5A', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sections */}
      {sections.map(section => {
        const sectionCourses = filtered.filter(c => c.cat === section);
        if (sectionCourses.length === 0) return null;
        return (
          <section key={section} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 600, color: '#1A1209' }}>{section}</h2>
              <button style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8B6914', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Voir tout</button>
            </div>
            <div className="ac-grid">
              {sectionCourses.map(c => (
                <div key={c.id} className="ac-course" style={{ background: 'white', border: '1px solid #EDE8DC', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', background: 'linear-gradient(135deg, #1A1209, #2D1F08)', aspectRatio: '16/9' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><PlayButton /></div>
                    {c.badge && <div style={{ position: 'absolute', top: 7, left: 7, zIndex: 3 }}><BadgePill badge={c.badge} /></div>}
                    <div style={{ position: 'absolute', bottom: 6, right: 7, zIndex: 3, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.58rem', fontWeight: 700, padding: '0.12rem 0.4rem', borderRadius: 4 }}>{c.duration}</div>
                    {c.progress > 0 && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.15)', zIndex: 3 }}>
                        <div style={{ height: '100%', width: `${c.progress}%`, background: '#1D9E75' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#8B6914', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{c.modules}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.35 }}>{c.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
