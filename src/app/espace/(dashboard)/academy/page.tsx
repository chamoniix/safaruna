'use client';

import { useState } from 'react';

const CATEGORIES = ['Tous', 'Rituels (Fiqh)', 'Histoire (Sīrah)', 'Spiritualité', 'Guides Pratiques'];

const COURSES = [
  { id: 1, cat: 'Rituels (Fiqh)', title: 'Les rites de la Omra : étape par étape', duration: '45 min', modules: '4 modules' },
  { id: 2, cat: 'Histoire (Sīrah)', title: "L'histoire de Zamzam et Hajar", duration: '28 min', modules: '2 modules' },
  { id: 3, cat: 'Rituels (Fiqh)', title: "L'état de l'Ihram : règles et interdits", duration: '45 min', modules: '4 modules' },
  { id: 4, cat: 'Rituels (Fiqh)', title: 'Comment accomplir le Tawaf correctement', duration: '32 min', modules: '3 modules' },
  { id: 5, cat: 'Rituels (Fiqh)', title: "Le Sa'i entre Safa et Marwa", duration: '28 min', modules: '2 modules' },
  { id: 6, cat: 'Rituels (Fiqh)', title: 'La fin de la Omra : rasage ou coupe', duration: '15 min', modules: '1 module' },
  { id: 7, cat: 'Histoire (Sīrah)', title: 'La biographie du Prophète ﷺ à Makkah', duration: '2 h 15 min', modules: '8 modules' },
  { id: 8, cat: 'Histoire (Sīrah)', title: 'La bataille de Badr : leçon de foi', duration: '55 min', modules: '3 modules' },
  { id: 9, cat: 'Histoire (Sīrah)', title: "Uhud : l'importance de l'obéissance", duration: '48 min', modules: '3 modules' },
  { id: 10, cat: 'Spiritualité', title: 'Purifier son intention avant le départ', duration: '20 min', modules: '2 modules' },
  { id: 11, cat: 'Spiritualité', title: 'La présence du cœur pendant les rituels', duration: '35 min', modules: '3 modules' },
  { id: 12, cat: 'Guides Pratiques', title: 'Conseils pratiques pour la Omra en famille', duration: '25 min', modules: '2 modules' },
];

function ComingSoonPill() {
  return <span style={{ background: '#E3DED4', color: '#61594D', fontSize: '0.56rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.22rem 0.55rem', borderRadius: 50 }}>Bientôt disponible</span>;
}

function CourseCard({ course }: { course: typeof COURSES[number] }) {
  return (
    <article aria-label={`${course.title} — bientôt disponible`} style={{ background: '#F8F6F2', border: '1px solid #E0DBD2', borderRadius: 12, overflow: 'hidden', opacity: 0.72, filter: 'grayscale(0.85)' }}>
      <div style={{ position: 'relative', minHeight: 114, background: 'linear-gradient(135deg, #655E53, #3D3932)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ComingSoonPill />
        <span style={{ position: 'absolute', bottom: 7, right: 8, background: 'rgba(0,0,0,0.52)', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '0.14rem 0.42rem', borderRadius: 4 }}>{course.duration}</span>
      </div>
      <div style={{ padding: '0.75rem' }}>
        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#786F62', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{course.modules}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#534B40', lineHeight: 1.35 }}>{course.title}</div>
      </div>
    </article>
  );
}

export default function SAFARUMAAcademy() {
  const [activeCat, setActiveCat] = useState('Tous');
  const sections = activeCat === 'Tous' ? CATEGORIES.slice(1) : [activeCat];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ac-cat-btn { transition: transform .14s ease, background .15s, border-color .15s, color .15s; }
        .ac-cat-btn:active { transform: scale(.97); }
        .ac-cat-btn:hover { border-color: #C9A84C !important; }
        .ac-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
        @media (min-width: 900px) { .ac-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        @media (max-width: 480px) { .ac-grid { grid-template-columns: 1fr; } }
        .ac-cats { display: flex; gap: .5rem; overflow-x: auto; padding-bottom: .25rem; scrollbar-width: none; }
        .ac-cats::-webkit-scrollbar { display: none; }
      `}} />

      <section style={{ background: 'linear-gradient(135deg, #403A31 0%, #24211D 100%)', borderRadius: 20, padding: '2rem', marginBottom: '1.75rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(201,168,76,.16)' }}>
        <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', fontFamily: 'serif', fontSize: '7rem', color: 'rgba(255,255,255,.04)', lineHeight: 1, userSelect: 'none' }}>علم</div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
          <span style={{ display: 'inline-block', marginBottom: '.875rem' }}><ComingSoonPill /></span>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: 'white', fontWeight: 600, lineHeight: 1.2, margin: '0 0 .75rem' }}>SAFARUMA Academy</h1>
          <p style={{ fontSize: '.84rem', color: 'rgba(255,255,255,.62)', lineHeight: 1.7, margin: 0 }}>Découvrez les parcours qui seront prochainement proposés pour préparer votre Omra avec sérénité.</p>
        </div>
      </section>

      <div className="ac-cats" style={{ marginBottom: '1.5rem' }}>
        {CATEGORIES.map(category => (
          <button key={category} type="button" className="ac-cat-btn" onClick={() => setActiveCat(category)} style={{ flexShrink: 0, padding: '.45rem 1rem', borderRadius: 50, fontSize: '.78rem', fontWeight: activeCat === category ? 700 : 500, border: `1.5px solid ${activeCat === category ? '#1A1209' : '#E8DFC8'}`, background: activeCat === category ? '#1A1209' : 'white', color: activeCat === category ? '#F0D897' : '#7A6D5A', cursor: 'pointer', fontFamily: 'inherit' }}>{category}</button>
        ))}
      </div>

      {sections.map(section => {
        const courses = COURSES.filter(course => course.cat === section);
        return (
          <section key={section} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '.875rem' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.35rem', fontWeight: 600, color: '#1A1209', margin: 0 }}>{section}</h2>
              <span style={{ fontSize: '.68rem', fontWeight: 700, color: '#7A6D5A', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>Programme à venir</span>
            </div>
            <div className="ac-grid">{courses.map(course => <CourseCard key={course.id} course={course} />)}</div>
          </section>
        );
      })}
    </>
  );
}
