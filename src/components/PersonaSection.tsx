'use client';

import { useState } from 'react';
import Link from 'next/link';

const PERSONAS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'En famille',
    desc: '"Je veux emmener mes proches mais j\'ai peur de mal organiser."',
    response: "Partir en famille est l'un des voyages les plus puissants. Nos guides sont habitués — enfants, personnes âgées, PMR. Ils s'adaptent à chaque membre du groupe et gèrent tous les imprévus.",
    link: null,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4h-1"/>
        <circle cx="14" cy="7" r="3"/>
        <path d="M9 21v-1a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v1"/>
        <circle cx="6" cy="9" r="2.5"/>
        <path d="M11 13l1 8"/>
        <path d="M11 13h3"/>
      </svg>
    ),
    title: 'Pour mes parents',
    desc: '"SVP prenez soin de mes parents." — Ces mots que vous direz à leur guide.',
    response: "Ils partent. Vous restez. Votre guide privé prend soin de vos parents comme vous le feriez vous-même — il les accompagne à chaque étape des rituels, leur raconte l'histoire de ces lieux saints qu'ils n'ont jamais eu l'occasion d'apprendre, à leur rythme, avec patience. Ils repartiront avec quelque chose que vous leur aurez offert pour toujours.",
    link: '/offrir-omra-parents',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="1.5"/>
        <path d="M9 8h4l1 5h3"/>
        <path d="M10 13v4l2 2"/>
        <circle cx="8" cy="20" r="2"/>
        <circle cx="16" cy="20" r="2"/>
        <path d="M8 13H6l-1-5"/>
      </svg>
    ),
    title: 'Mobilité réduite',
    desc: '"Je pensais que ce voyage n\'était pas possible pour moi."',
    response: "Beaucoup pensent que leur mobilité réduite les empêche de faire la Omra. Votre guide connaît les accès adaptés, les parcours aménagés, et ajuste chaque étape à votre situation — du tawaf au sa'i. Ce voyage est le vôtre aussi, sans compromis et sans vous sentir un fardeau.",
    link: '/omra-mobilite-reduite',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
    title: 'Je prie, je jeûne',
    desc: '"Je veux enfin faire la Omra mais je ne sais pas par où commencer."',
    response: "Vous avez les bases. Vous connaissez la valeur de ce voyage. Ce qu'il vous manque, c'est quelqu'un qui vous accompagne pas à pas — dans votre langue, à votre rythme. C'est exactement ce que font nos guides.",
    link: null,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    title: "Converti·e récemment",
    desc: '"Je veux faire la Omra mais j\'ai encore beaucoup à apprendre."',
    response: "Vous n'avez pas besoin de tout savoir avant de partir. Nos guides répondent à chaque question, sans jugement, sans comparaison. Ce voyage peut être votre première rencontre profonde et transformante avec cette tradition.",
    link: null,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
        <path d="M3.6 9h16.8M3.6 15h16.8"/>
        <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z"/>
      </svg>
    ),
    title: 'Mes origines spirituelles',
    desc: '"L\'histoire de ces lieux sacrés m\'intrigue. Je veux comprendre d\'où vient tout ça."',
    response: "Ces lieux portent des millénaires d'histoire spirituelle. Ibrahim, Hajar, le Prophète ﷺ — nos guides vous racontent ces récits sur les lieux mêmes où ils se sont passés. Une expérience que nulle lecture ne peut remplacer.",
    link: null,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    title: "J'hésite encore",
    desc: '"Je pense que ce n\'est pas encore le bon moment pour moi."',
    response: "Le bon moment, c'est maintenant. Pas parce que vous êtes prêt — personne ne l'est vraiment. Mais parce que ce voyage est justement ce qui peut tout changer. Nos guides vous accompagnent, où que vous en soyez.",
    link: null,
  },
];

export default function PersonaSection() {
  const [active, setActive] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .persona-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        @media (max-width: 768px) { .persona-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .persona-grid { grid-template-columns: 1fr; } }
        .persona-card { background: white; border: 1px solid #EDE8DC; border-radius: 14px; padding: 1.25rem; cursor: pointer; transition: border-color 0.15s, transform 0.15s; text-align: left; width: 100%; }
        .persona-card:hover { border-color: #C9A84C; transform: translateY(-2px); }
        .persona-card.active { border: 1.5px solid #C9A84C; background: #FAF8F0; transform: none; }
        .persona-icon-wrap { width: 40px; height: 40px; border-radius: 10px; background: #FAF3E0; border: 1px solid rgba(201,168,76,0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem; }
        .persona-inline-response { border-top: 1px solid rgba(201,168,76,0.3); margin-top: 0.85rem; padding-top: 0.85rem; animation: fadeIn 0.2s ease; }
        .persona-extra { display: block; }
        @media (max-width: 480px) { .persona-extra-hidden { display: none; } }
        .persona-show-more { display: none; }
        @media (max-width: 480px) { .persona-show-more { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; background: white; border: 1px dashed #C9A84C; border-radius: 14px; padding: 0.9rem; font-size: 0.82rem; font-weight: 600; color: #8B6914; cursor: pointer; margin-bottom: 1.5rem; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      <div className="persona-grid">
        {PERSONAS.map((p, i) => (
          <div
            key={i}
            className={`persona-card${active === i ? ' active' : ''}${i >= 4 && !showAll ? ' persona-extra-hidden' : ''}`}
            onClick={() => setActive(active === i ? null : i)}
          >
            <div className="persona-icon-wrap">{p.icon}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.35rem' }}>{p.title}</div>
            <div style={{ fontSize: '0.78rem', color: '#7A6D5A', lineHeight: 1.55, fontStyle: 'italic' }}>{p.desc}</div>
            {active === i && (
              <div className="persona-inline-response">
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.45rem' }}>Pour vous</div>
                <p style={{ fontSize: '0.84rem', color: '#1A1209', lineHeight: 1.7, margin: 0, fontFamily: 'var(--font-cormorant, serif)', fontStyle: 'italic' }}>
                  {p.response}
                </p>
                {p.link && (
                  <Link
                    href={p.link}
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#8B6914', textDecoration: 'none', letterSpacing: '0.05em' }}
                  >
                    En savoir plus →
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!showAll && (
        <button className="persona-show-more" onClick={() => setShowAll(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Voir tous les profils
        </button>
      )}

      <div style={{ textAlign: 'center' }}>
        <Link href="/guide-omra" style={{ display: 'inline-block', background: '#1A1209', color: '#F0D897', padding: '0.8rem 2rem', borderRadius: 50, fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.04em' }}>
          La Omra n&apos;attend pas que vous soyez prêt
        </Link>
      </div>
    </>
  );
}
