'use client';

import { useState } from 'react';

const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: '0.62rem', fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.45rem',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.75rem 1rem',
  border: '1.5px solid #E8DFC8', borderRadius: 10,
  fontFamily: 'var(--font-manrope, sans-serif)', fontSize: '0.875rem',
  color: '#1A1209', background: '#FDFBF7', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const BADGES = [
  { icon: '🎓', name: 'Étudiant Assidu',  desc: '3 modules',      unlocked: true },
  { icon: '🤲', name: 'Dhikr Master',     desc: '7 jours de duʿā', unlocked: true },
  { icon: '✈️', name: 'Prêt au départ',   desc: 'Checklist 100%', unlocked: false },
  { icon: '🕌', name: 'Tawaaf',           desc: 'Omra validée',   unlocked: false },
  { icon: '📖', name: 'Sīrah',            desc: 'Histoire',       unlocked: false },
  { icon: '🕋', name: 'Hajji',            desc: 'Hajj accompli',  unlocked: false },
];

function Badge({ icon, name, desc, unlocked }: typeof BADGES[0]) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: unlocked ? 1 : 0.38 }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.4rem', marginBottom: '0.5rem',
        background: unlocked ? '#FAF3E0' : '#F5F2EC',
        border: unlocked ? '2px solid #C9A84C' : '1px solid #E8DFC8',
        boxShadow: unlocked ? '0 4px 12px rgba(201,168,76,0.25)' : 'none',
      }}>
        {icon}
      </div>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.3, marginBottom: 2 }}>{name}</div>
      <div style={{ fontSize: '0.6rem', color: '#7A6D5A' }}>{desc}</div>
    </div>
  );
}

export default function PelerinProfile() {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .profil-grid { display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; align-items: start; }
        @media (max-width: 900px) { .profil-grid { grid-template-columns: 1fr; } }
        .profil-input:focus { border-color: #C9A84C !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
        .badge-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        @media (max-width: 480px) { .badge-grid { grid-template-columns: repeat(2, 1fr); } }
      `}} />

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, color: '#1A1209', marginBottom: '0.25rem' }}>
            Mon Profil Pèlerin
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#7A6D5A' }}>Gérez vos informations et découvrez vos badges spirituels.</p>
        </div>
        <button
          onClick={handleSave}
          style={{ padding: '0.8rem 2rem', borderRadius: 50, border: 'none', background: saved ? '#1D5C3A' : '#1A1209', color: '#F0D897', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.04em', cursor: 'pointer', fontFamily: 'var(--font-manrope, sans-serif)', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
        >
          {saved ? '✓ Enregistré' : 'Enregistrer les modifications'}
        </button>
      </div>

      <div className="profil-grid">

        {/* ── LEFT — Carte profil ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Identity card */}
          <div style={{ background: '#1A1209', borderRadius: 16, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
            {/* Glow */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              {/* Avatar */}
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#F0D897', margin: '0 auto 1rem', boxShadow: '0 0 24px rgba(201,168,76,0.2)' }}>
                KL
              </div>
              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>Karim Lamrani</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1.5rem' }}>Voyageur Spirituel</div>

              {/* Level + Points */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem', gap: '0.75rem', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Niveau</div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: '#F0D897', lineHeight: 1 }}>3</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', height: 32, width: 1 }} />
                <div>
                  <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Points Noor</div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.4rem', fontWeight: 700, color: '#F0D897', lineHeight: 1 }}>1 450</div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  <span>Vers niveau 4</span>
                  <span>50 pts</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 50, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '95%', background: 'linear-gradient(90deg, #C9A84C, #F0D897)', borderRadius: 50, boxShadow: '0 0 8px rgba(201,168,76,0.5)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 16, padding: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 700, color: '#1A1209', marginBottom: '1.1rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F0EBD8' }}>
              Mes Badges
            </div>
            <div className="badge-grid">
              {BADGES.map(b => <Badge key={b.name} {...b} />)}
            </div>
          </div>
        </div>

        {/* ── RIGHT — Formulaire ── */}
        <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 16, padding: '2rem' }}>

          {/* Informations personnelles */}
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 700, color: '#1A1209', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F0EBD8' }}>
            Informations personnelles
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={fieldLabel}>Prénom</label>
                <input className="profil-input" style={inputStyle} type="text" defaultValue="Karim" />
              </div>
              <div>
                <label style={fieldLabel}>Nom</label>
                <input className="profil-input" style={inputStyle} type="text" defaultValue="Lamrani" />
              </div>
            </div>
            <div>
              <label style={fieldLabel}>Email de contact</label>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inputStyle, background: '#F5F2EC', color: '#7A6D5A', cursor: 'not-allowed' }} type="email" defaultValue="karim.lamrani@example.com" disabled />
                <span style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.62rem', fontWeight: 800, color: '#1D5C3A', background: '#E8F5EE', padding: '0.15rem 0.6rem', borderRadius: 50 }}>Vérifié</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={fieldLabel}>Ville de résidence</label>
                <input className="profil-input" style={inputStyle} type="text" defaultValue="Lyon, France" />
              </div>
              <div>
                <label style={fieldLabel}>Téléphone (WhatsApp)</label>
                <input className="profil-input" style={inputStyle} type="tel" defaultValue="+33 6 12 34 56 78" />
              </div>
            </div>
          </div>

          {/* Préférences de voyage */}
          <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 700, color: '#1A1209', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F0EBD8' }}>
            Préférences de voyage
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Mobilité Réduite (PMR)', desc: "Assistance fauteuil roulant lors du Tawaaf et localement.", checked: true },
              { label: 'Régime alimentaire spécial', desc: 'Diabétique, Sans gluten, Allergies sévères.', checked: false },
            ].map(({ label, desc, checked }) => (
              <label key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '0.9rem 1rem', border: '1.5px solid #E8DFC8', borderRadius: 10, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={checked} style={{ width: 16, height: 16, accentColor: '#C9A84C', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1A1209', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7A6D5A' }}>{desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Langues préférées */}
          <div>
            <label style={fieldLabel}>Langues préférées pour un guide</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[
                { lang: 'Français', active: true },
                { lang: 'Arabe', active: true },
                { lang: 'Anglais', active: false },
                { lang: 'Darija', active: false },
              ].map(({ lang, active }) => (
                <span key={lang} style={{ padding: '0.4rem 0.9rem', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: active ? '#FAF3E0' : '#FDFBF7', color: active ? '#8B6914' : '#7A6D5A', border: active ? '1px solid rgba(201,168,76,0.4)' : '1px solid #E8DFC8' }}>
                  {lang}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
