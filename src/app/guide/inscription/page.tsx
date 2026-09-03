'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trackAnalyticsEvent } from '@/lib/analytics-client';
import { PLACES } from '@/lib/places';
import { GUIDE_LANGUAGES } from '@/lib/languages';

const STEPS = [
  { num: 1, label: "Informations personnelles", icon: "👤" },
  { num: 2, label: "Langues & formation",        icon: "📚" },
  { num: 3, label: "Lieux & services",           icon: "🕌" },
  { num: 4, label: "Tarifs & coordonnées bancaires", icon: "💳" },
  { num: 5, label: "Charte islamique",           icon: "🤝" },
];

type ServiceCity = 'MAKKAH' | 'MADINAH';
type TransportMode = 'NONE' | 'CAR' | 'VAN' | 'OTHER';

const PLACE_GROUPS = [
  { cat: 'Makkah', color: '#8B6914', bg: '#FAF3E0', border: 'rgba(201,168,76,0.3)', lieux: PLACES.filter(place => place.category === 'MAKKAH') },
  { cat: 'Médine', color: '#1A4A8A', bg: '#EAF1FB', border: 'rgba(26,74,138,0.2)', lieux: PLACES.filter(place => place.category === 'MADINAH') },
  { cat: 'Sites historiques', color: '#8B3A0A', bg: '#FEF0E6', border: 'rgba(192,90,16,0.2)', lieux: PLACES.filter(place => place.category === 'HISTORIQUE') },
];
const SIGNUP_LANGUAGE_CODES = new Set(['fr', 'ar', 'darija', 'en', 'turk', 'wolof', 'bahasa_id']);
const SIGNUP_LANGUAGES = GUIDE_LANGUAGES.filter(language => SIGNUP_LANGUAGE_CODES.has(language.code));

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
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Step 1
  const [prenom, setPrenom]           = useState('');
  const [nom, setNom]                 = useState('');
  const [guideEmail, setGuideEmail]   = useState('');
  const [whatsapp, setWhatsapp]       = useState('');
  const [primaryCity, setPrimaryCity] = useState<ServiceCity | ''>('');
  const [gender, setGender]           = useState<'HOMME' | 'FEMME' | ''>('');
  const [offersSecondaryCity, setOffersSecondaryCity] = useState(false);
  const [nationality, setNationality] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Step 2
  const [selectedLangues, setSelectedLangues] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState('');
  const [education, setEducation] = useState('');
  const [bio, setBio]                         = useState('');

  // Step 3
  const [masteredPlaces, setMasteredPlaces] = useState<string[]>([]);
  const [transportMode, setTransportMode] = useState<TransportMode>('NONE');
  const [transportDetails, setTransportDetails] = useState('');

  // Step 4
  const [proposedOmraPrice, setProposedOmraPrice] = useState('');
  const [proposedMadinahPackagePrice, setProposedMadinahPackagePrice] = useState('');
  const [proposedMadinahPlacePrice, setProposedMadinahPlacePrice] = useState('');
  const [proposedMakkahPackagePrice, setProposedMakkahPackagePrice] = useState('');
  const [proposedMakkahPlacePrice, setProposedMakkahPlacePrice] = useState('');
  const [pricingDetails, setPricingDetails] = useState('');
  const [bankAccountFirstName, setBankAccountFirstName] = useState('');
  const [bankAccountLastName, setBankAccountLastName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCountry, setBankCountry] = useState('');
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');

  const secondaryCity: ServiceCity | null = primaryCity === 'MAKKAH'
    ? 'MADINAH'
    : primaryCity === 'MADINAH'
      ? 'MAKKAH'
      : null;
  const serviceCities: ServiceCity[] = primaryCity
    ? offersSecondaryCity && secondaryCity ? [primaryCity, secondaryCity] : [primaryCity]
    : [];

  const toggleLangue = (name: string) =>
    setSelectedLangues(prev => prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]);

  useEffect(() => {
    trackAnalyticsEvent('guide_application_started');
  }, []);

  const advanceToNextStep = () => setCurrentStep(p => {
    const nextStep = Math.min(p + 1, STEPS.length);
    trackAnalyticsEvent('guide_application_step', { step: nextStep });
    return nextStep;
  });

  const stepError = (step: number): string => {
    if (step === 1) {
      if (!prenom.trim() || !nom.trim() || !guideEmail.trim() || !whatsapp.trim()) return 'Renseignez votre prénom, votre nom, votre email et votre numéro WhatsApp.';
    }
    if (step === 2) {
      if (!dateOfBirth) return 'Indiquez votre date de naissance.';
      if (!gender) return 'Choisissez le genre du guide.';
      if (!primaryCity) return 'Choisissez votre ville principale.';
      if (selectedLangues.length === 0) return 'Choisissez au moins une langue parlée.';
      if (!education) return 'Choisissez votre formation islamique.';
      if (!experienceYears) return 'Indiquez vos années d’expérience.';
      if (!bio.trim()) return 'Présentez brièvement votre expérience et votre approche.';
    }
    if (step === 3 && transportMode === 'OTHER' && !transportDetails.trim()) {
      return 'Décrivez le transport que vous proposez.';
    }
    if (step === 4) {
      const isPositivePrice = (value: string) => Number.isFinite(Number(value)) && Number(value) > 0;
      if (serviceCities.includes('MAKKAH') && ![proposedOmraPrice, proposedMakkahPackagePrice, proposedMakkahPlacePrice].every(isPositivePrice)) {
        return 'Renseignez les trois tarifs demandés pour Makkah.';
      }
      if (serviceCities.includes('MADINAH') && ![proposedMadinahPackagePrice, proposedMadinahPlacePrice].every(isPositivePrice)) {
        return 'Renseignez les deux tarifs demandés pour Médine.';
      }
      if (!bankAccountFirstName.trim() || !bankAccountLastName.trim() || !bankName.trim() || !bankCountry.trim() || !iban.trim() || !bic.trim()) {
        return 'Toutes les coordonnées bancaires sont obligatoires.';
      }
    }
    return '';
  };

  const handleNext = async () => {
    setSubmitError('');
    const validationError = stepError(currentStep);
    if (validationError) {
      if (currentStep === 1) setEmailError(validationError);
      else setSubmitError(validationError);
      return;
    }
    if (currentStep !== 1) {
      advanceToNextStep();
      return;
    }

    setCheckingEmail(true);
    setEmailError('');
    try {
      const response = await fetch('/api/guide/inscription/email-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: prenom, lastName: nom, email: guideEmail, whatsapp }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setEmailError(payload.error || 'Vérifiez les informations saisies.');
        return;
      }
      advanceToNextStep();
    } catch {
      setEmailError('Vérification impossible. Réessayez dans quelques instants.');
    } finally {
      setCheckingEmail(false);
    }
  };
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
          whatsapp, city: primaryCity, gender, serviceCities, nationality, dateOfBirth, bio,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
          education,
          languages: selectedLangues,
          masteredPlaces,
          transportMode,
          transportDetails: transportDetails || undefined,
          proposedOmraPrice: Number(proposedOmraPrice || 0),
          proposedMadinahPackagePrice: Number(proposedMadinahPackagePrice || 0),
          proposedMadinahPlacePrice: Number(proposedMadinahPlacePrice || 0),
          proposedMakkahPackagePrice: Number(proposedMakkahPackagePrice || 0),
          proposedMakkahPlacePrice: Number(proposedMakkahPlacePrice || 0),
          pricingDetails: pricingDetails || undefined,
          bankAccountFirstName, bankAccountLastName, bankName, bankCountry,
          iban,
          bic,
          acceptedCharte,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        if (res.status === 409) {
          setCurrentStep(1);
          setEmailError(d.error || 'Adresse e-mail déjà utilisée. Veuillez en utiliser une autre.');
          return;
        }
        if (typeof d.step === 'number') setCurrentStep(d.step);
        throw new Error(d.error || 'Erreur');
      }
      await res.json();
      setIsSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Envoi impossible. Réessayez dans quelques instants.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#1A1209', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: 24, padding: '3rem', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', color: '#1A1209', marginBottom: '1rem', fontWeight: 400 }}>Dossier soumis</h1>
          <p style={{ color: '#7A6D5A', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9rem' }}>
            Barak Allahu fik. L&apos;équipe SAFARUMA a bien reçu votre candidature. Votre demande est en cours d&apos;étude et nous reviendrons vers vous prochainement si nous avons besoin d&apos;informations complémentaires.
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
            Vos coordonnées bancaires sensibles sont chiffrées. Seule l&apos;équipe SAFARUMA y accède pour la vérification.
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
                    <input type="email" className="ins-input" style={inputStyle} placeholder="youssouf@exemple.com" required value={guideEmail} onChange={e => { setGuideEmail(e.target.value); setEmailError(''); }} />
                    {emailError && <p role="alert" aria-live="polite" style={{ color: '#DC2626', fontSize: '0.78rem', margin: '0.5rem 0 0' }}>{emailError}</p>}
                  </Field>
                </div>
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
                <div className="ins-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                  <Field label="Date de naissance">
                    <input type="date" className="ins-input" style={inputStyle} required value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                  </Field>
                  <Field label="Genre du guide">
                    <select className="ins-input" style={inputStyle} required value={gender} onChange={e => setGender(e.target.value as 'HOMME' | 'FEMME' | '')}>
                      <option value="">Sélectionner</option>
                      <option value="HOMME">Homme</option>
                      <option value="FEMME">Femme</option>
                    </select>
                  </Field>
                  <Field label="Ville principale">
                    <select className="ins-input" style={inputStyle} required value={primaryCity} onChange={e => setPrimaryCity(e.target.value as ServiceCity | '')}>
                      <option value="">Sélectionner</option>
                      <option value="MAKKAH">Makkah</option>
                      <option value="MADINAH">Médine</option>
                    </select>
                    <p style={{ fontSize: '0.7rem', color: '#7A6D5A', margin: '0.45rem 0 0', lineHeight: 1.5 }}>Cette ville détermine les éventuels frais de déplacement et d&apos;hébergement.</p>
                  </Field>
                  <Field label="Nationalité">
                    <input type="text" className="ins-input" style={inputStyle} placeholder="Sénégalaise" value={nationality} onChange={e => setNationality(e.target.value)} />
                  </Field>
                  <Field label="Ville secondaire proposée">
                    <label style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', padding: '0.7rem', border: offersSecondaryCity ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 10, background: 'white', cursor: primaryCity ? 'pointer' : 'not-allowed', fontSize: '0.8rem', fontWeight: 600, opacity: primaryCity ? 1 : 0.55 }}>
                      <input type="checkbox" disabled={!primaryCity} checked={offersSecondaryCity} onChange={event => setOffersSecondaryCity(event.target.checked)} style={{ margin: 0 }} />
                      {secondaryCity ? `Je peux également guider à ${secondaryCity === 'MAKKAH' ? 'Makkah' : 'Médine'}` : 'Choisissez d’abord votre ville principale'}
                    </label>
                  </Field>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={labelStyle}>Langues parlées</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {SIGNUP_LANGUAGES.map(language => (
                      <label key={language.code} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', border: '1.5px solid #E8DFC8',
                        borderRadius: 50, cursor: 'pointer', background: 'white',
                        fontSize: '0.8rem', fontWeight: 500, color: '#1A1209',
                        transition: 'all 0.15s',
                      }}>
                        <input type="checkbox" style={{ accentColor: '#C9A84C' }} checked={selectedLangues.includes(language.code)} onChange={() => toggleLangue(language.code)} />
                        {language.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="ins-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <Field label="Formation islamique">
                    <select className="ins-input" style={inputStyle} required value={education} onChange={e => setEducation(e.target.value)}>
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

                {/* Catalogue réellement utilisé par les profils et la réservation */}
                {PLACE_GROUPS.map(group => (
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
                        <label key={l.key} className="ins-place-label" style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.65rem 0.85rem', border: masteredPlaces.includes(l.key) ? '1.5px solid #C9A84C' : '1.5px solid #E8DFC8',
                          borderRadius: 8, cursor: 'pointer', background: 'white',
                          fontSize: '0.8rem', fontWeight: 500, color: '#1A1209',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}>
                          <input
                            type="checkbox"
                            checked={masteredPlaces.includes(l.key)}
                            onChange={() => setMasteredPlaces(previous => previous.includes(l.key) ? previous.filter(item => item !== l.key) : [...previous, l.key])}
                            style={{ accentColor: '#C9A84C', width: 14, height: 14, flexShrink: 0 }}
                          />
                          <span style={{ fontSize: '1rem' }}>{l.emoji}</span>
                          {l.nameFr}
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
                      { id: 'NONE' as const, icon: '🚶', title: 'Aucun transport', sub: 'Je ne propose pas de véhicule.' },
                      { id: 'CAR' as const, icon: '🚗', title: 'Voiture standard — jusqu’à 6 pèlerins', sub: 'Je conduis les pèlerins pendant les visites.' },
                      { id: 'VAN' as const, icon: '🚌', title: 'Van', sub: 'Je peux proposer un van pour les groupes.' },
                      { id: 'OTHER' as const, icon: '＋', title: 'Autre', sub: 'Je précise ma solution de transport.' },
                    ].map(opt => (
                      <label key={opt.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.85rem 1.1rem', border: transportMode === opt.id ? '2px solid #C9A84C' : '1.5px solid #E8DFC8',
                        borderRadius: 12, cursor: 'pointer', background: 'white',
                      }}>
                        <input type="radio" name="transport" style={{ accentColor: '#C9A84C', width: 16, height: 16, flexShrink: 0 }} checked={transportMode === opt.id} onChange={() => setTransportMode(opt.id)} />
                        <span style={{ fontSize: '1.1rem' }}>{opt.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.83rem', color: '#1A1209' }}>{opt.title}</div>
                          <div style={{ fontSize: '0.7rem', color: '#7A6D5A' }}>{opt.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {transportMode === 'OTHER' && <div style={{ marginTop: '0.85rem' }}>
                    <Field label="Détails du transport proposé">
                      <textarea className="ins-input" style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} required value={transportDetails} onChange={event => setTransportDetails(event.target.value)} placeholder="Type de véhicule, capacité, chauffeur, conditions…" />
                    </Field>
                  </div>}
                </div>
              </div>
            )}

            {/* ── STEP 4 ── */}
            {currentStep === 4 && (
              <div>
                <h2 className="ins-h2" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', fontWeight: 300, color: '#1A1209', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                  {STEPS[currentStep - 1].label}
                </h2>
                <p style={{ color: '#7A6D5A', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.7 }}>
                  Indiquez vos tarifs habituels pour un groupe jusqu&apos;à 6 pèlerins. Ils servent uniquement à étudier votre candidature : aucun tarif n&apos;est publié automatiquement.
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {serviceCities.includes('MAKKAH') && <div style={{ padding: '1.25rem', border: '1.5px solid #E8DFC8', borderRadius: 16, background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: '1rem' }}>
                      <strong style={{ color: '#1A1209' }}>Services à Makkah</strong>
                      <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.25rem 0.65rem', borderRadius: 50, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Obligatoire</span>
                    </div>
                    <div className="ins-pkg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <Field label="Accompagnement Omra (€)"><input type="number" min="0" step="0.01" className="ins-input" style={inputStyle} required value={proposedOmraPrice} onChange={event => setProposedOmraPrice(event.target.value)} /></Field>
                      <Field label="Pack Makkah (€)"><input type="number" min="0" step="0.01" className="ins-input" style={inputStyle} required value={proposedMakkahPackagePrice} onChange={event => setProposedMakkahPackagePrice(event.target.value)} /></Field>
                      <Field label="Une visite à Makkah (€)"><input type="number" min="0" step="0.01" className="ins-input" style={inputStyle} required value={proposedMakkahPlacePrice} onChange={event => setProposedMakkahPlacePrice(event.target.value)} /></Field>
                    </div>
                  </div>}

                  {serviceCities.includes('MADINAH') && <div style={{ padding: '1.25rem', border: '1.5px solid #E8DFC8', borderRadius: 16, background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: '1rem' }}>
                      <strong style={{ color: '#1A1209' }}>Services à Médine</strong>
                      <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.25rem 0.65rem', borderRadius: 50, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Obligatoire</span>
                    </div>
                    <div className="ins-pkg-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Field label="Pack Médine (€)"><input type="number" min="0" step="0.01" className="ins-input" style={inputStyle} required value={proposedMadinahPackagePrice} onChange={event => setProposedMadinahPackagePrice(event.target.value)} /></Field>
                      <Field label="Une visite à Médine (€)"><input type="number" min="0" step="0.01" className="ins-input" style={inputStyle} required value={proposedMadinahPlacePrice} onChange={event => setProposedMadinahPlacePrice(event.target.value)} /></Field>
                    </div>
                  </div>}

                  <div style={{ padding: '1.25rem', border: '1.5px solid #E8DFC8', borderRadius: 16, background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: '1rem' }}>
                      <strong style={{ color: '#1A1209' }}>Précisions tarifaires</strong>
                      <span style={{ background: '#EAF1FB', color: '#1D4ED8', padding: '0.25rem 0.65rem', borderRadius: 50, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Optionnel</span>
                    </div>
                    <textarea className="ins-input" style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={pricingDetails} onChange={event => setPricingDetails(event.target.value)} placeholder="Ajoutez ici toute précision utile sur vos tarifs ou une autre prestation." />
                  </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E8DFC8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#1A1209' }}>Coordonnées bancaires</strong>
                    <span style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.25rem 0.65rem', borderRadius: 50, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Obligatoire</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#7A6D5A', marginBottom: '1rem', lineHeight: 1.5 }}>L&apos;IBAN et le BIC sont chiffrés. Aucune coordonnée bancaire n&apos;est publiée sur votre profil.</p>
                  <div className="ins-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Prénom du titulaire"><input type="text" className="ins-input" style={inputStyle} required value={bankAccountFirstName} onChange={event => setBankAccountFirstName(event.target.value)} /></Field>
                    <Field label="Nom du titulaire"><input type="text" className="ins-input" style={inputStyle} required value={bankAccountLastName} onChange={event => setBankAccountLastName(event.target.value)} /></Field>
                    <Field label="Nom de la banque"><input type="text" className="ins-input" style={inputStyle} required value={bankName} onChange={event => setBankName(event.target.value)} /></Field>
                    <Field label="Pays de la banque"><input type="text" className="ins-input" style={inputStyle} required value={bankCountry} onChange={event => setBankCountry(event.target.value)} /></Field>
                    <Field label="IBAN"><input type="text" className="ins-input" style={{ ...inputStyle, fontFamily: 'monospace', textTransform: 'uppercase' }} required value={iban} onChange={event => setIban(event.target.value)} placeholder="FR76…" /></Field>
                    <Field label="SWIFT / BIC"><input type="text" className="ins-input" style={{ ...inputStyle, fontFamily: 'monospace', textTransform: 'uppercase' }} required value={bic} onChange={event => setBic(event.target.value)} placeholder="ABCDEFGH" /></Field>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5 ── */}
            {currentStep === 5 && (
              <div>
                <h2 className="ins-h2" style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2.5rem', fontWeight: 300, color: '#1A1209', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                  {STEPS[currentStep - 1].label}
                </h2>
                {/* Verset */}
                <div style={{ background: '#1A1209', borderRadius: 20, padding: '2rem', textAlign: 'center', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '1rem', top: 0, fontSize: '6rem', color: 'rgba(201,168,76,0.08)', fontFamily: 'serif', lineHeight: 1, userSelect: 'none' }}>&quot;</div>
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
                      "Être totalement honnête sur mes compétences, mon expérience et ma connaissance des lieux.",
                      "Ne guider que dans les lieux que je maîtrise et transmettre des informations exactes avec humilité.",
                      "Respecter la dignité de chaque pèlerin, sans distinction d’origine, de connaissance ou de condition physique.",
                      "Respecter les règles islamiques de mixité, de pudeur et de comportement dans les Lieux Saints.",
                      "Transmettre le savoir religieux avec sincérité, sans déformation ni invention en cas de doute.",
                      "Respecter une honnêteté financière absolue, sans surfacturation, commission cachée ni pot-de-vin.",
                      "Protéger et accompagner avec attention les personnes âgées, les PMR, les femmes seules et les familles.",
                      "Préserver strictement la confidentialité des informations personnelles confiées par les pèlerins.",
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#1A1209', flexShrink: 0, marginTop: 1 }}>✓</div>
                        <span style={{ fontSize: '0.85rem', color: '#2D1F08', lineHeight: 1.6 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#FAF3E0', border: '1px solid #E8D08A', borderRadius: 12, padding: '1rem 1.1rem', marginBottom: '1.25rem', color: '#5F4B1D', fontSize: '0.78rem', lineHeight: 1.65 }}>
                  SAFARUMA peut faire évoluer cette Charte afin de maintenir ses exigences de qualité, de sécurité et de conformité. La version applicable est celle communiquée au Guide à sa date d&apos;entrée en vigueur.
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
                    Je prends Allah à témoin que j&apos;ai lu et j&apos;accepte sans réserve la <Link href="/charte-islamique" target="_blank" style={{ color: 'inherit', textDecoration: 'underline' }}>Charte islamique</Link> et les <Link href="/conditions-guides" target="_blank" style={{ color: 'inherit', textDecoration: 'underline' }}>Conditions Guides</Link> de SAFARUMA.
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

              {currentStep < STEPS.length ? (
                <button
                  type="button" onClick={handleNext} disabled={checkingEmail}
                  style={{ padding: '0.85rem 2.25rem', borderRadius: 50, background: '#1A1209', color: '#F0D897', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: checkingEmail ? 'wait' : 'pointer', opacity: checkingEmail ? 0.65 : 1, boxShadow: '0 4px 20px rgba(26,18,9,0.25)', letterSpacing: '0.03em' }}
                >
                  {checkingEmail ? 'Vérification…' : 'Suivant →'}
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
