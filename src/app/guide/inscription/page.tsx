'use client';

import { useState } from 'react';
import Link from 'next/link';

const STEPS = [
  { num: 1, label: "Informations personnelles", icon: "👤" },
  { num: 2, label: "Langues & formation",        icon: "📚" },
  { num: 3, label: "Lieux & services",           icon: "🕌" },
  { num: 4, label: "Forfaits & tarifs",          icon: "💰" },
  { num: 5, label: "Documents",                  icon: "📄" },
  { num: 6, label: "Charte islamique",           icon: "🤝" },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'white',
  border: '1.5px solid #E8DFC8',
  borderRadius: 12,
  fontFamily: 'var(--font-manrope, Manrope, sans-serif)',
  fontSize: '0.875rem',
  color: '#1A1209',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#C9A84C',
  marginBottom: '0.5rem',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function GuideOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [acceptedCharte, setAcceptedCharte] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Step 1
  const [prenom, setPrenom]           = useState('');
  const [nom, setNom]                 = useState('');
  const [guideEmail, setGuideEmail]   = useState('');
  const [whatsapp, setWhatsapp]       = useState('');
  const [city, setCity]               = useState('');
  const [nationality, setNationality] = useState('');

  // Step 2
  const [selectedLangues, setSelectedLangues] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio]                         = useState('');

  // Step 5
  const [iban, setIban] = useState('');

  const toggleLangue = (name: string) =>
    setSelectedLangues(prev => prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]);

  const handleNext = () => setCurrentStep(p => Math.min(p + 1, 6));
  const handlePrev = () => setCurrentStep(p => Math.max(p - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setSubmitError('');
    try {
      const res = await fetch('/api/guide/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: prenom, lastName: nom, email: guideEmail,
          whatsapp, city, nationality, bio,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
          languages: selectedLangues,
          iban: iban || undefined,
          acceptedCharte,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur'); }
      const data = await res.json();
      // Fire welcome email (best-effort)
      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-key': '' },
        body: JSON.stringify({ type: 'welcome_guide', email: guideEmail, name: data.name || guideEmail.split('@')[0] }),
      }).catch(() => {});
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message);
    }
    setSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#1A1209', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: 24, padding: '3rem', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', color: '#1A1209', marginBottom: '1rem', fontWeight: 400 }}>Dossier soumis</h1>
          <p style={{ color: '#7A6D5A', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9rem' }}>
            BarakAllahu fik. L&apos;équipe SAFARUMA a bien reçu votre candidature. Nous examinerons vos documents insha&apos;Allah et vous serez contacté sous 48h.
          </p>
          <Link href="/" style={{ display: 'inline-block', background: '#1A1209', color: '#F0D897', padding: '0.8rem 2rem', borderRadius: 50, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-manrope, Manrope, sans-serif)' }}>

      {/* ── DARK SIDEBAR ── */}
      <div style={{
        width: 300,
        background: '#1A1209',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        overflowY: 'auto',
        flexShrink: 0,
        padding: '2rem 0',
      }} className="guide-sidebar-desktop">

        {/* Logo */}
        <div style={{ padding: '0 2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 600, color: 'white', textDecoration: 'none', letterSpacing: '0.04em' }}>
            SAFAR<span style={{ color: '#C9A84C' }}>U</span>MA
          </Link>
          <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Inscription Guide
          </div>
        </div>

        {/* Progress */}
        <div style={{ padding: '1.5rem 2rem 0' }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: '1.5rem' }}>
            Étape {currentStep} sur {STEPS.length}
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 50, marginBottom: '2rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(currentStep / STEPS.length) * 100}%`, background: 'linear-gradient(90deg, #8B6914, #C9A84C)', borderRadius: 50, transition: 'width 0.4s ease' }} />
          </div>

          {/* Steps list */}
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 15, top: 16, bottom: 16, width: 1, background: 'rgba(255,255,255,0.08)' }} />

            {STEPS.map(({ num, label, icon }) => {
              const isActive = currentStep === num;
              const isPast   = currentStep > num;

              return (
                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                  {/* Circle */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isPast ? '0.8rem' : '0.75rem',
                    fontWeight: 700,
                    background: isActive
                      ? 'linear-gradient(135deg, #F0D897, #C9A84C)'
                      : isPast
                        ? 'rgba(201,168,76,0.2)'
                        : 'rgba(255,255,255,0.06)',
                    color: isActive
                      ? '#1A1209'
                      : isPast
                        ? '#C9A84C'
                        : 'rgba(255,255,255,0.3)',
                    border: isActive
                      ? 'none'
                      : isPast
                        ? '1px solid rgba(201,168,76,0.4)'
                        : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isActive ? '0 0 16px rgba(201,168,76,0.4)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {isPast ? '✓' : isActive ? icon : num}
                  </div>

                  {/* Label */}
                  <div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#F0D897' : isPast ? 'rgba(240,216,151,0.6)' : 'rgba(255,255,255,0.25)',
                      transition: 'color 0.3s',
                    }}>
                      {label}
                    </div>
                    {isActive && (
                      <div style={{ fontSize: '0.6rem', color: '#C9A84C', fontWeight: 600, letterSpacing: '0.05em', marginTop: 2 }}>
                        En cours →
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom note */}
        <div style={{ marginTop: 'auto', padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
            Vos données sont chiffrées et sécurisées. Seule l&apos;équipe SAFARUMA y accède pour la vérification.
          </div>
        </div>
      </div>

      {/* ── MAIN FORM AREA ── */}
      <div className="inscription-main" style={{ flex: 1, background: '#FAF7F0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          .inscription-main { margin-left: 0; }
          @media (min-width: 768px) { .inscription-main { margin-left: 300px; } }
          .ins-input:focus { border-color: #C9A84C !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }
          .ins-input { transition: border-color 0.2s, box-shadow 0.2s; }
          .ins-place-label:hover { border-color: #C9A84C !important; background: #FAF3E0 !important; }
          .ins-place-label:has(input:checked) { border-color: #C9A84C !important; background: #FAF3E0 !important; }
          .guide-sidebar-desktop { display: flex; }
          @media (max-width: 767px) {
            .guide-sidebar-desktop { display: none !important; }
            .inscription-main { margin-left: 0 !important; }
          }
          .guide-mobile-progress { display: none; }
          @media (max-width: 767px) {
            .guide-mobile-progress { display: block !important; }
          }
          @media (max-width: 767px) {
            .ins-form-wrap { padding: 1.25rem 1rem !important; }
            .ins-grid-2 { grid-template-columns: 1fr !important; }
            .ins-grid-places { grid-template-columns: 1fr 1fr !important; }
            .ins-pkg-grid { grid-template-columns: 1fr !important; }
            .ins-nav-btns { margin-top: 1.5rem !important; padding-top: 1rem !important; }
            .ins-h2 { font-size: 1.8rem !important; }
            .ins-topbar { padding: 0.875rem 1rem !important; }
            .ins-topbar-title { font-size: 1rem !important; }
          }
        `}} />

        {/* Top bar */}
        <div className="ins-topbar" style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #E8DFC8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(253,251,247,0.95)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 40 }}>
          <div className="ins-topbar-title" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', color: '#1A1209', fontWeight: 400 }}>
            {STEPS[currentStep - 1].icon} {STEPS[currentStep - 1].label}
          </div>
          {/* Mobile progress */}
          <div style={{ fontSize: '0.75rem', color: '#7A6D5A', fontWeight: 600 }} className="md:hidden">
            {currentStep}/{STEPS.length}
          </div>
          <Link href="/" style={{ fontSize: '0.75rem', color: '#7A6D5A', textDecoration: 'none', padding: '0.4rem 1rem', borderRadius: 50, border: '1px solid #E8DFC8' }}>
            ← Quitter
          </Link>
        </div>

        {/* Mobile progress bar */}
        <div className="guide-mobile-progress" style={{ display: 'none', padding: '0.75rem 1.25rem', background: '#FAF7F0', borderBottom: '1px solid #E8DFC8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>
            <span>Étape {currentStep} sur {STEPS.length} — {STEPS[currentStep - 1].label}</span>
            <span style={{ color: '#C9A84C' }}>{Math.round((currentStep / STEPS.length) * 100)}%</span>
          </div>
          <div style={{ height: 4, background: '#E8DFC8', borderRadius: 50, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(currentStep / STEPS.length) * 100}%`, background: 'linear-gradient(90deg, #8B6914, #C9A84C)', borderRadius: 50, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Form */}
        <div className="ins-form-wrap" style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: 760, width: '100%', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>

            {/* ── STEP 1 ── */}
            {currentStep === 1 && (
              <div>
                <h2 className="ins-h2" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', fontWeight: 300, color: '#1A1209', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                  {STEPS[currentStep - 1].label}
                </h2>
                <p style={{ color: '#7A6D5A', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                  Ces informations seront vérifiées par notre équipe. Elles ne sont pas visibles publiquement.
                </p>
                <div className="ins-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <Field label="Prénom">
                    <input type="text" className="ins-input" style={inputStyle} placeholder="Youssouf" required value={prenom} onChange={e => setPrenom(e.target.value)} />
                  </Field>
                  <Field label="Nom">
                    <input type="text" className="ins-input" style={inputStyle} placeholder="Konaté" required value={nom} onChange={e => setNom(e.target.value)} />
                  </Field>
                  <Field label="WhatsApp">
                    <input type="tel" className="ins-input" style={inputStyle} placeholder="+966 50 123 4567" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                  </Field>
                  <Field label="Adresse email">
                    <input type="email" className="ins-input" style={inputStyle} placeholder="youssouf@exemple.com" required value={guideEmail} onChange={e => setGuideEmail(e.target.value)} />
                  </Field>
                  <Field label="Ville de résidence">
                    <select className="ins-input" style={inputStyle} required value={city} onChange={e => setCity(e.target.value)}>
                      <option value="">Sélectionner</option>
                      <option value="makkah">Makkah</option>
                      <option value="madinah">Madinah</option>
                      <option value="jeddah">Jeddah</option>
                      <option value="autre">Autre</option>
                    </select>
                  </Field>
                  <Field label="Nationalité">
                    <input type="text" className="ins-input" style={inputStyle} placeholder="Sénégalaise" value={nationality} onChange={e => setNationality(e.target.value)} />
                  </Field>
                </div>
                <Field label="Photo de profil (JPG/PNG · max 5 Mo)">
                  <div style={{ border: '2px dashed #E8DFC8', borderRadius: 12, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'white', transition: 'border-color 0.2s' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📸</div>
                    <div style={{ fontSize: '0.8rem', color: '#7A6D5A', marginBottom: '0.75rem' }}>Glissez votre photo ou cliquez pour parcourir</div>
                    <label style={{ display: 'inline-block', background: '#1A1209', color: '#F0D897', padding: '0.5rem 1.25rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      Choisir un fichier
                      <input type="file" style={{ display: 'none' }} accept="image/*" />
                    </label>
                  </div>
                </Field>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {currentStep === 2 && (
              <div>
                <h2 className="ins-h2" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', fontWeight: 300, color: '#1A1209', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                  {STEPS[currentStep - 1].label}
                </h2>
                <p style={{ color: '#7A6D5A', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                  Votre maîtrise linguistique est l&apos;atout principal pour les pèlerins. Soyez précis.
                </p>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={labelStyle}>Langues parlées</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {[
                      { flag: '🇫🇷', name: 'Français' },
                      { flag: '🇸🇦', name: 'Arabe Classique' },
                      { flag: '🇲🇦', name: 'Darija' },
                      { flag: '🇬🇧', name: 'Anglais' },
                      { flag: '🇹🇷', name: 'Turc' },
                      { flag: '🇸🇳', name: 'Wolof' },
                      { flag: '🇮🇩', name: 'Indonésien' },
                    ].map(l => (
                      <label key={l.name} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', border: '1.5px solid #E8DFC8',
                        borderRadius: 50, cursor: 'pointer', background: 'white',
                        fontSize: '0.8rem', fontWeight: 500, color: '#1A1209',
                        transition: 'all 0.15s',
                      }}>
                        <input type="checkbox" style={{ accentColor: '#C9A84C' }} checked={selectedLangues.includes(l.name)} onChange={() => toggleLangue(l.name)} />
                        {l.flag} {l.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="ins-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <Field label="Formation islamique">
                    <select className="ins-input" style={inputStyle} required>
                      <option value="">Niveau d&apos;études</option>
                      <option value="uni">Université Islamique (Madinah / Umm Al-Qura…)</option>
                      <option value="institut">Institut spécialisé</option>
                      <option value="autodidacte">Autodidacte confirmé</option>
                    </select>
                  </Field>
                  <Field label="Années d'expérience">
                    <input type="number" min="0" max="40" className="ins-input" style={inputStyle} placeholder="ex : 8" required value={experienceYears} onChange={e => setExperienceYears(e.target.value)} />
                  </Field>
                </div>
                <Field label="Biographie (visible par les pèlerins)">
                  <textarea className="ins-input" style={{ ...inputStyle, height: 120, resize: 'vertical' }} placeholder="Présentez-vous, votre approche, votre rapport avec les Lieux Saints…" required value={bio} onChange={e => setBio(e.target.value)} />
                </Field>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {currentStep === 3 && (
              <div>
                <h2 className="ins-h2" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', fontWeight: 300, color: '#1A1209', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                  Lieux &amp; services
                </h2>
                <p style={{ color: '#7A6D5A', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                  Cochez tous les lieux pour lesquels vous êtes qualifié pour guider et expliquer en profondeur.
                </p>

                {/* 25 lieux en 6 catégories */}
                {[
                  {
                    cat: 'Rituels',
                    color: '#8B6914',
                    bg: '#FAF3E0',
                    border: 'rgba(201,168,76,0.3)',
                    lieux: [
                      { icon: '🕋', name: 'Masjid Al-Haram' },
                      { icon: '💧', name: 'Zamzam' },
                      { icon: '🔄', name: 'Tawaf complet' },
                      { icon: '🚶', name: "Sa'i (Safa–Marwa)" },
                      { icon: '🪢', name: 'Meeqat (points d\'entrée)' },
                      { icon: '✂️', name: 'Tahallul (fin Ihram)' },
                    ],
                  },
                  {
                    cat: 'Montagnes & Grottes',
                    color: '#1D5C3A',
                    bg: '#E8F5EE',
                    border: 'rgba(29,92,58,0.2)',
                    lieux: [
                      { icon: '⛰️', name: 'Jabal Al-Nour / Hira' },
                      { icon: '⛰️', name: 'Jabal Thawr' },
                      { icon: '⛰️', name: 'Jabal Uhud' },
                      { icon: '🏔️', name: 'Jabal Rahmah / Arafat' },
                    ],
                  },
                  {
                    cat: 'Mosquées de Madinah',
                    color: '#1A4A8A',
                    bg: '#EAF1FB',
                    border: 'rgba(26,74,138,0.2)',
                    lieux: [
                      { icon: '🕌', name: 'Masjid Quba' },
                      { icon: '🕌', name: 'Masjid Al-Qiblatayn' },
                      { icon: '🕌', name: 'Masjid Al-Ghamamah' },
                      { icon: '🕌', name: 'Masjid Al-Fath' },
                    ],
                  },
                  {
                    cat: 'Sites historiques',
                    color: '#8B3A0A',
                    bg: '#FEF0E6',
                    border: 'rgba(192,90,16,0.2)',
                    lieux: [
                      { icon: '⚔️', name: 'Bataille de Badr' },
                      { icon: '🪖', name: 'Fossé de Khandaq' },
                      { icon: '🪦', name: "Al-Baqi'" },
                      { icon: '⛺', name: 'Mina' },
                      { icon: '🌙', name: 'Muzdalifah' },
                    ],
                  },
                  {
                    cat: 'Culture & Musées',
                    color: '#5A2D82',
                    bg: '#F3EAF8',
                    border: 'rgba(90,45,130,0.2)',
                    lieux: [
                      { icon: '📜', name: 'Musée de la Sîra' },
                      { icon: '📚', name: 'Bibliothèque Roi Fahd' },
                      { icon: '📖', name: 'Musée du Coran' },
                      { icon: '🏛️', name: 'Musée national Arabie Saoudite' },
                    ],
                  },
                  {
                    cat: 'Autres villes',
                    color: '#2D4A1A',
                    bg: '#EBF3E0',
                    border: 'rgba(45,74,26,0.2)',
                    lieux: [
                      { icon: '🌿', name: 'Taïf / Mosquée Addas' },
                      { icon: '⚓', name: 'Yanbu' },
                      { icon: '🏙️', name: 'Jeddah historique' },
                    ],
                  },
                ].map(group => (
                  <div key={group.cat} style={{ marginBottom: '1.75rem' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em',
                      textTransform: 'uppercase', color: group.color,
                      background: group.bg, border: `1px solid ${group.border}`,
                      padding: '0.25rem 0.75rem', borderRadius: 50, marginBottom: '0.75rem',
                    }}>
                      {group.cat}
                    </div>
                    <div className="ins-grid-places" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                      {group.lieux.map(l => (
                        <label key={l.name} className="ins-place-label" style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.65rem 0.85rem', border: '1.5px solid #E8DFC8',
                          borderRadius: 8, cursor: 'pointer', background: 'white',
                          fontSize: '0.8rem', fontWeight: 500, color: '#1A1209',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}>
                          <input type="checkbox" style={{ accentColor: '#C9A84C', width: 14, height: 14, flexShrink: 0 }} />
                          <span style={{ fontSize: '1rem' }}>{l.icon}</span>
                          {l.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Transport */}
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>
                    Transport proposé
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {[
                      { id: 'none', icon: '🚶', title: 'Aucun transport',          sub: 'Le pèlerin gère ses propres déplacements.' },
                      { id: 'car',  icon: '🚗', title: 'Voiture standard (4 pl.)',  sub: 'Je conduis les pèlerins dans mon véhicule.' },
                      { id: 'van',  icon: '🚌', title: 'Van familial (7–9 pl.)',    sub: 'Idéal pour les grandes familles ou groupes.' },
                    ].map(opt => (
                      <label key={opt.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.85rem 1.1rem', border: '1.5px solid #E8DFC8',
                        borderRadius: 12, cursor: 'pointer', background: 'white',
                      }}>
                        <input type="radio" name="transport" style={{ accentColor: '#C9A84C', width: 16, height: 16, flexShrink: 0 }} defaultChecked={opt.id === 'none'} />
                        <span style={{ fontSize: '1.1rem' }}>{opt.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.83rem', color: '#1A1209' }}>{opt.title}</div>
                          <div style={{ fontSize: '0.7rem', color: '#7A6D5A' }}>{opt.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4 ── */}
            {currentStep === 4 && (
              <div>
                <h2 className="ins-h2" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', fontWeight: 300, color: '#1A1209', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                  {STEPS[currentStep - 1].label}
                </h2>
                <div style={{ background: '#1A1209', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.5rem' }}>💡</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(240,216,151,0.8)', lineHeight: 1.6 }}>
                    SAFARUMA prélève <strong style={{ color: '#F0D897' }}>12% de commission</strong> sur chaque réservation. Les montants ci-dessous sont ce que vous recevrez de la plateforme.
                  </div>
                </div>

                {[
                  { name: 'Omra Essentielle (3h–5h)', tag: 'Obligatoire', required: true },
                  { name: 'Ziyara Histoire (journée 8h)', tag: 'Optionnel' },
                  { name: 'Séjour complet 5 jours',     tag: 'Optionnel' },
                ].map((pkg, i) => (
                  <div key={i} style={{
                    padding: '1.25rem', border: '1.5px solid #E8DFC8', borderRadius: 16,
                    marginBottom: '1rem', background: 'white',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1209' }}>{pkg.name}</div>
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        background: pkg.required ? 'linear-gradient(135deg, #F0D897, #C9A84C)' : '#FAF3E0',
                        color: '#1A1209', padding: '0.2rem 0.6rem', borderRadius: 50,
                      }}>{pkg.tag}</span>
                    </div>
                    <div className="ins-pkg-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Field label="Prix par personne (€)">
                        <input type="number" className="ins-input" style={inputStyle} placeholder="ex : 120" required={pkg.required} />
                      </Field>
                      <Field label="Prix de groupe max (€)">
                        <input type="number" className="ins-input" style={inputStyle} placeholder="ex : 400" />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 5 ── */}
            {currentStep === 5 && (
              <div>
                <h2 className="ins-h2" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', fontWeight: 300, color: '#1A1209', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                  {STEPS[currentStep - 1].label}
                </h2>
                <p style={{ color: '#7A6D5A', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                  Ces documents sont obligatoires pour la vérification KYC. Ils ne seront jamais rendus publics.
                </p>

                {[
                  { icon: '🪪', title: "Pièce d'identité",       sub: 'Passeport ou CNI · JPG, PNG ou PDF · Max 5 Mo', required: true },
                  { icon: '🎓', title: 'Diplôme ou Certificat Islamique', sub: 'Fortement recommandé', required: false },
                ].map(doc => (
                  <label key={doc.title} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '0.75rem', padding: '2rem', border: '2px dashed #E8DFC8',
                    borderRadius: 16, cursor: 'pointer', background: 'white',
                    textAlign: 'center', marginBottom: '1rem', transition: 'border-color 0.2s',
                  }}>
                    <div style={{ fontSize: '2rem' }}>{doc.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A1209' }}>{doc.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#7A6D5A' }}>{doc.sub}</div>
                    <span style={{ display: 'inline-block', background: '#1A1209', color: '#F0D897', padding: '0.5rem 1.25rem', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700 }}>
                      Parcourir…
                    </span>
                    <input type="file" style={{ display: 'none' }} accept=".jpg,.jpeg,.png,.pdf" />
                  </label>
                ))}

                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #E8DFC8' }}>
                  <label style={labelStyle}>Coordonnées bancaires (IBAN)</label>
                  <p style={{ fontSize: '0.72rem', color: '#7A6D5A', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    Pour recevoir vos virements mensuels. Données chiffrées AES-256.
                  </p>
                  <input
                    type="text"
                    className="ins-input"
                    style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    placeholder="FR76 0000 0000 0000 0000 0000 000"
                    required
                    value={iban}
                    onChange={e => setIban(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ── STEP 6 ── */}
            {currentStep === 6 && (
              <div>
                <h2 className="ins-h2" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', fontWeight: 300, color: '#1A1209', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                  {STEPS[currentStep - 1].label}
                </h2>
                {/* Verset */}
                <div style={{ background: '#1A1209', borderRadius: 20, padding: '2rem', textAlign: 'center', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '1rem', top: 0, fontSize: '6rem', color: 'rgba(201,168,76,0.08)', fontFamily: 'serif', lineHeight: 1, userSelect: 'none' }}>"</div>
                  <p style={{ fontFamily: 'var(--font-cormorant, serif)', fontStyle: 'italic', fontSize: '1.3rem', color: '#F0D897', lineHeight: 1.6, marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>
                    &ldquo;Et remplissez l&apos;engagement, car on sera interrogé au sujet des engagements.&rdquo;
                  </p>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
                    Sourate Al-Isra (17:34)
                  </div>
                </div>

                {/* Engagements */}
                <div style={{ background: 'white', border: '1.5px solid #E8DFC8', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ ...labelStyle, marginBottom: '1rem' }}>Je m&apos;engage devant Allah à :</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    {[
                      "N'enseigner que ce qui est authentique selon le Coran et la Sunnah.",
                      "Ne pas percevoir de commissions cachées des commerçants ou hôtels.",
                      "Respecter la clause de non-contournement de SAFARUMA pour toute transaction avec les pèlerins rencontrés via la plateforme.",
                      "Être ponctuel, patient et bienveillant envers les pèlerins.",
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#1A1209', flexShrink: 0, marginTop: 1 }}>✓</div>
                        <span style={{ fontSize: '0.85rem', color: '#2D1F08', lineHeight: 1.6 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkbox */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  padding: '1.25rem 1.5rem',
                  background: acceptedCharte ? 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(240,216,151,0.12))' : 'white',
                  border: `2px solid ${acceptedCharte ? '#C9A84C' : '#E8DFC8'}`,
                  borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <input
                    type="checkbox"
                    style={{ width: 18, height: 18, accentColor: '#C9A84C', marginTop: 2, flexShrink: 0 }}
                    checked={acceptedCharte}
                    onChange={e => setAcceptedCharte(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: acceptedCharte ? '#8B6914' : '#7A6D5A', lineHeight: 1.6 }}>
                    Je prends Allah à témoin que j&apos;ai lu et j&apos;accepte sans réserve les termes de cette charte islamique et les CGU de SAFARUMA.
                  </span>
                </label>
              </div>
            )}

            {/* ── NAV BUTTONS ── */}
            {submitError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.83rem', color: '#DC2626', marginTop: '1rem' }}>{submitError}</div>
            )}
            <div className="ins-nav-btns" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #E8DFC8' }}>
              {currentStep > 1 ? (
                <button
                  type="button" onClick={handlePrev}
                  style={{ padding: '0.75rem 1.75rem', borderRadius: 50, border: '1.5px solid #E8DFC8', background: 'white', fontWeight: 600, fontSize: '0.85rem', color: '#7A6D5A', cursor: 'pointer' }}
                >
                  ← Précédent
                </button>
              ) : <div />}

              {currentStep < 6 ? (
                <button
                  type="button" onClick={handleNext}
                  style={{ padding: '0.85rem 2.25rem', borderRadius: 50, background: '#1A1209', color: '#F0D897', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(26,18,9,0.25)', letterSpacing: '0.03em' }}
                >
                  Continuer →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!acceptedCharte || submitting}
                  style={{
                    padding: '0.85rem 2.25rem', borderRadius: 50, border: 'none', fontWeight: 700, fontSize: '0.875rem',
                    cursor: (acceptedCharte && !submitting) ? 'pointer' : 'not-allowed',
                    background: (acceptedCharte && !submitting) ? 'linear-gradient(135deg, #F0D897, #C9A84C)' : '#E8DFC8',
                    color: (acceptedCharte && !submitting) ? '#1A1209' : '#7A6D5A',
                    boxShadow: (acceptedCharte && !submitting) ? '0 8px 24px rgba(201,168,76,0.35)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {submitting ? 'Envoi en cours…' : 'Soumettre mon dossier ✓'}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
