'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DayPicker } from 'react-day-picker';
import { fr as frLocale } from 'date-fns/locale';
import 'react-day-picker/style.css';
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
type TransportMode = 'CAR' | 'VAN' | 'OTHER';

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

function BirthDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const selected = value ? new Date(`${value}T12:00:00`) : null;
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" className="ins-input" onClick={() => setOpen(current => !current)} aria-expanded={open} style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', cursor: 'pointer' }}>
        <span style={{ color: selected ? '#1A1209' : '#8A8072' }}>{selected ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(selected) : 'Choisir une date'}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
      </button>
      {open && <div className="birth-calendar" style={{ position: 'absolute', zIndex: 30, top: 'calc(100% + 8px)', left: 0, width: 'min(340px, calc(100vw - 2rem))', padding: '1rem', background: 'white', border: '1px solid #E8DFC8', borderRadius: 16, boxShadow: '0 18px 50px rgba(26,18,9,.16)' }}>
        <DayPicker
          mode="single"
          locale={frLocale}
          selected={selected || undefined}
          defaultMonth={selected || new Date()}
          captionLayout="dropdown"
          startMonth={new Date(1900, 0, 1)}
          endMonth={new Date()}
          disabled={{ after: new Date() }}
          onSelect={date => {
            if (!date) return;
            onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
            setOpen(false);
          }}
          showOutsideDays={false}
          modifiersStyles={{ selected: { backgroundColor: '#C9A84C', color: '#1A1209', fontWeight: 800 } }}
          styles={{ root: { width: '100%', margin: 0, fontFamily: 'inherit' }, month: { width: '100%' }, month_grid: { width: '100%' }, dropdowns: { justifyContent: 'center' } }}
        />
      </div>}
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
  const [otherLanguages, setOtherLanguages] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [education, setEducation] = useState('');
  const [educationDetails, setEducationDetails] = useState('');
  const [bio, setBio]                         = useState('');

  // Step 3
  const [masteredPlaces, setMasteredPlaces] = useState<string[]>([]);
  const [otherPlaces, setOtherPlaces] = useState('');
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);
  const [transportDetails, setTransportDetails] = useState('');

  // Step 4
  const [proposedOmraPrice, setProposedOmraPrice] = useState('');
  const [proposedMadinahPackagePrice, setProposedMadinahPackagePrice] = useState('');
  const [proposedMadinahPlacePrice, setProposedMadinahPlacePrice] = useState('');
  const [proposedMakkahPlacePrice, setProposedMakkahPlacePrice] = useState('');
  const [pricingDetails, setPricingDetails] = useState('');
  const [makkahIncludedDetails, setMakkahIncludedDetails] = useState('');
  const [makkahOtherDetails, setMakkahOtherDetails] = useState('');
  const [madinahIncludedDetails, setMadinahIncludedDetails] = useState('');
  const [madinahOtherDetails, setMadinahOtherDetails] = useState('');
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
      if (selectedLangues.length === 0 && !otherLanguages.trim()) return 'Choisissez au moins une langue parlée.';
      if (!education) return 'Choisissez votre formation.';
      if (education === 'other' && !educationDetails.trim()) return 'Précisez votre formation.';
      if (!experienceYears) return 'Indiquez vos années d’expérience.';
      if (!bio.trim()) return 'Présentez brièvement votre expérience et votre approche.';
    }
    if (step === 3 && transportModes.includes('OTHER') && !transportDetails.trim()) {
      return 'Décrivez le transport que vous proposez.';
    }
    if (step === 4) {
      if (!bankAccountFirstName.trim() || !bankAccountLastName.trim() || !bankName.trim() || !bankCountry.trim() || !iban.trim()) {
        return 'Renseignez les coordonnées bancaires obligatoires.';
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
          educationDetails: educationDetails || undefined,
          languages: selectedLangues,
          otherLanguages: otherLanguages || undefined,
          masteredPlaces,
          otherPlaces: otherPlaces || undefined,
          transportModes,
          transportDetails: transportDetails || undefined,
          proposedOmraPrice: proposedOmraPrice ? Number(proposedOmraPrice) : undefined,
          proposedMadinahPackagePrice: proposedMadinahPackagePrice ? Number(proposedMadinahPackagePrice) : undefined,
          proposedMadinahPlacePrice: proposedMadinahPlacePrice ? Number(proposedMadinahPlacePrice) : undefined,
          proposedMakkahPlacePrice: proposedMakkahPlacePrice ? Number(proposedMakkahPlacePrice) : undefined,
          makkahIncludedDetails: makkahIncludedDetails || undefined,
          makkahOtherDetails: makkahOtherDetails || undefined,
          madinahIncludedDetails: madinahIncludedDetails || undefined,
          madinahOtherDetails: madinahOtherDetails || undefined,
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
          <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', color: '#1A1209', marginBottom: '1rem', fontWeight: 400 }}>Candidature envoyée</h1>
          <p lang="ar" dir="rtl" style={{ color: '#8B6914', fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.75rem' }}>بارك الله فيك</p>
          <p style={{ color: '#7A6D5A', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.9rem' }}>
            Votre candidature a bien été reçue. Notre équipe reviendra vers vous dans un délai de 72 h.
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
          .birth-calendar .rdp-root { --rdp-accent-color: #8B6914; color: #1A1209; }
          .birth-calendar .rdp-dropdowns { gap: 0.4rem; }
          .birth-calendar .rdp-dropdown_root {
            min-height: 2.25rem;
            padding: 0.45rem 0.55rem;
            border: 1px solid #D9CCAA;
            border-radius: 9px;
            background: #FAF7F0;
            color: #1A1209;
          }
          .birth-calendar .rdp-caption_label {
            color: #1A1209 !important;
            font-size: 0.8rem !important;
            font-weight: 800 !important;
            line-height: 1.2;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .birth-calendar .rdp-nav {
            background: transparent !important;
            backdrop-filter: none !important;
          }
          .birth-calendar .rdp-chevron { fill: #8B6914; }
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
                    <BirthDatePicker value={dateOfBirth} onChange={setDateOfBirth} />
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
                  <Field label="Villes proposées">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      {(['MAKKAH', 'MADINAH'] as ServiceCity[]).map(serviceCity => {
                        const isPrimary = primaryCity === serviceCity;
                        const checked = serviceCities.includes(serviceCity);
                        return <label key={serviceCity} style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', padding: '0.7rem', border: checked ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 10, background: 'white', cursor: !primaryCity || isPrimary ? 'default' : 'pointer', fontSize: '0.8rem', fontWeight: 700, opacity: primaryCity ? 1 : 0.55 }}>
                          <input type="checkbox" disabled={!primaryCity || isPrimary} checked={checked} onChange={event => setOffersSecondaryCity(event.target.checked)} style={{ margin: 0, accentColor: '#C9A84C' }} />
                          {serviceCity === 'MAKKAH' ? 'Makkah' : 'Médine'}{isPrimary ? ' · principale' : ''}
                        </label>;
                      })}
                    </div>
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
                  <div style={{ marginTop: '0.85rem' }}>
                    <Field label="Autre langue">
                      <input type="text" className="ins-input" style={inputStyle} value={otherLanguages} onChange={event => setOtherLanguages(event.target.value)} placeholder="Indiquez une langue absente de la liste" />
                    </Field>
                  </div>
                </div>
                <div className="ins-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <Field label="Formation">
                    <select className="ins-input" style={inputStyle} required value={education} onChange={e => setEducation(e.target.value)}>
                      <option value="">Niveau d&apos;études</option>
                      <option value="uni">Université Islamique (Madinah / Umm Al-Qura…)</option>
                      <option value="institut">Institut spécialisé</option>
                      <option value="autodidacte">Autodidacte confirmé</option>
                      <option value="other">Autre</option>
                    </select>
                    {education === 'other' && <input type="text" className="ins-input" style={{ ...inputStyle, marginTop: '0.65rem' }} value={educationDetails} onChange={event => setEducationDetails(event.target.value)} placeholder="Précisez votre formation" />}
                  </Field>
                  <Field label="Années d'expérience">
                    <input type="number" min="0" max="40" className="ins-input" style={inputStyle} placeholder="ex : 8" required value={experienceYears} onChange={e => setExperienceYears(e.target.value)} />
                  </Field>
                </div>
                <Field label="Biographie (visible par les pèlerins)">
                  <textarea className="ins-input" style={{ ...inputStyle, height: 120, resize: 'vertical' }} placeholder="Présentez-vous, votre approche et votre connaissance des lieux historiques…" required value={bio} onChange={e => setBio(e.target.value)} />
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em',
                        textTransform: 'uppercase', color: group.color,
                        background: group.bg, border: `1px solid ${group.border}`,
                        padding: '0.25rem 0.75rem', borderRadius: 50,
                      }}>
                        {group.cat}
                      </div>
                      {group.cat !== 'Sites historiques' && <button type="button" onClick={() => {
                        const keys = group.lieux.map(place => place.key);
                        const allSelected = keys.every(key => masteredPlaces.includes(key));
                        setMasteredPlaces(previous => allSelected ? previous.filter(key => !keys.includes(key)) : [...new Set([...previous, ...keys])]);
                      }} style={{ border: '1px solid #D9CCAA', background: 'white', color: '#6B5218', borderRadius: 50, padding: '0.35rem 0.75rem', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}>
                        {group.lieux.every(place => masteredPlaces.includes(place.key)) ? 'Tout désélectionner' : 'Tout sélectionner'}
                      </button>}
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

                <div style={{ marginBottom: '1.75rem' }}>
                  <Field label="Autre lieu historique">
                    <textarea className="ins-input" style={{ ...inputStyle, minHeight: 86, resize: 'vertical' }} value={otherPlaces} onChange={event => setOtherPlaces(event.target.value)} placeholder="Indiquez un ou plusieurs lieux absents de la liste" />
                  </Field>
                </div>

                {/* Transport */}
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>
                    Transport proposé
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {[
                      { id: 'CAR' as const, icon: '🚗', title: 'Voiture standard — jusqu’à 6 pèlerins', sub: 'Je conduis les pèlerins pendant les visites.' },
                      { id: 'VAN' as const, icon: '🚌', title: 'Van', sub: 'Je peux proposer un van pour les groupes.' },
                      { id: 'OTHER' as const, icon: '＋', title: 'Autre', sub: 'Je précise ma solution de transport.' },
                    ].map(opt => (
                      <label key={opt.id} style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.85rem 1.1rem', border: transportModes.includes(opt.id) ? '2px solid #C9A84C' : '1.5px solid #E8DFC8',
                        borderRadius: 12, cursor: 'pointer', background: 'white',
                      }}>
                        <input type="checkbox" style={{ accentColor: '#C9A84C', width: 16, height: 16, flexShrink: 0 }} checked={transportModes.includes(opt.id)} onChange={() => setTransportModes(previous => previous.includes(opt.id) ? previous.filter(item => item !== opt.id) : [...previous, opt.id])} />
                        <span style={{ fontSize: '1.1rem' }}>{opt.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.83rem', color: '#1A1209' }}>{opt.title}</div>
                          <div style={{ fontSize: '0.7rem', color: '#7A6D5A' }}>{opt.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {transportModes.length === 0 && <p style={{ margin: '0.7rem 0 0', color: '#7A6D5A', fontSize: '0.72rem' }}>Aucun transport sélectionné.</p>}
                  {transportModes.includes('OTHER') && <div style={{ marginTop: '0.85rem' }}>
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
                  Les tarifs et précisions de services ci-dessous sont facultatifs et servent uniquement à étudier votre candidature. Aucun tarif n&apos;est publié automatiquement.
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {serviceCities.includes('MAKKAH') && <div style={{ padding: '1.25rem', border: '1.5px solid #E8DFC8', borderRadius: 16, background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: '1rem' }}>
                      <strong style={{ color: '#1A1209' }}>Services à Makkah</strong>
                      <span style={{ background: '#EAF1FB', color: '#1D4ED8', padding: '0.25rem 0.65rem', borderRadius: 50, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Facultatif</span>
                    </div>
                    <div className="ins-pkg-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Field label="Accompagnement Omra — prix (€)"><input type="number" min="0" step="0.01" className="ins-input" style={inputStyle} value={proposedOmraPrice} onChange={event => setProposedOmraPrice(event.target.value)} /></Field>
                      <Field label="Ce qui est inclus"><textarea className="ins-input" style={{ ...inputStyle, minHeight: 82, resize: 'vertical' }} value={makkahIncludedDetails} onChange={event => setMakkahIncludedDetails(event.target.value)} placeholder="Précisez ce qui est inclus dans cet accompagnement" /></Field>
                      <Field label="Visite supplémentaire d’un lieu historique — prix (€)"><input type="number" min="0" step="0.01" className="ins-input" style={inputStyle} value={proposedMakkahPlacePrice} onChange={event => setProposedMakkahPlacePrice(event.target.value)} /></Field>
                      <Field label="Autre précision"><textarea className="ins-input" style={{ ...inputStyle, minHeight: 82, resize: 'vertical' }} value={makkahOtherDetails} onChange={event => setMakkahOtherDetails(event.target.value)} placeholder="Toute autre précision utile pour Makkah" /></Field>
                    </div>
                  </div>}

                  {serviceCities.includes('MADINAH') && <div style={{ padding: '1.25rem', border: '1.5px solid #E8DFC8', borderRadius: 16, background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: '1rem' }}>
                      <strong style={{ color: '#1A1209' }}>Services à Médine</strong>
                      <span style={{ background: '#EAF1FB', color: '#1D4ED8', padding: '0.25rem 0.65rem', borderRadius: 50, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Facultatif</span>
                    </div>
                    <div className="ins-pkg-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Field label="Accompagnement Médine — prix (€)"><input type="number" min="0" step="0.01" className="ins-input" style={inputStyle} value={proposedMadinahPackagePrice} onChange={event => setProposedMadinahPackagePrice(event.target.value)} /></Field>
                      <Field label="Ce qui est inclus"><textarea className="ins-input" style={{ ...inputStyle, minHeight: 82, resize: 'vertical' }} value={madinahIncludedDetails} onChange={event => setMadinahIncludedDetails(event.target.value)} placeholder="Précisez ce qui est inclus dans cet accompagnement" /></Field>
                      <Field label="Visite supplémentaire d’un lieu historique — prix (€)"><input type="number" min="0" step="0.01" className="ins-input" style={inputStyle} value={proposedMadinahPlacePrice} onChange={event => setProposedMadinahPlacePrice(event.target.value)} /></Field>
                      <Field label="Autre précision"><textarea className="ins-input" style={{ ...inputStyle, minHeight: 82, resize: 'vertical' }} value={madinahOtherDetails} onChange={event => setMadinahOtherDetails(event.target.value)} placeholder="Toute autre précision utile pour Médine" /></Field>
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
                  <p style={{ fontSize: '0.72rem', color: '#7A6D5A', marginBottom: '1rem', lineHeight: 1.5 }}>L&apos;IBAN et le BIC sont chiffrés. Aucune coordonnée bancaire n&apos;est publiée sur votre profil. Le BIC est facultatif.</p>
                  <div className="ins-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Prénom du titulaire"><input type="text" className="ins-input" style={inputStyle} required value={bankAccountFirstName} onChange={event => setBankAccountFirstName(event.target.value)} /></Field>
                    <Field label="Nom du titulaire"><input type="text" className="ins-input" style={inputStyle} required value={bankAccountLastName} onChange={event => setBankAccountLastName(event.target.value)} /></Field>
                    <Field label="Nom de la banque"><input type="text" className="ins-input" style={inputStyle} required value={bankName} onChange={event => setBankName(event.target.value)} /></Field>
                    <Field label="Pays de la banque"><input type="text" className="ins-input" style={inputStyle} required value={bankCountry} onChange={event => setBankCountry(event.target.value)} /></Field>
                    <Field label="IBAN"><input type="text" className="ins-input" style={{ ...inputStyle, fontFamily: 'monospace', textTransform: 'uppercase' }} required value={iban} onChange={event => setIban(event.target.value)} placeholder="FR76…" /></Field>
                    <Field label="SWIFT / BIC (facultatif)"><input type="text" className="ins-input" style={{ ...inputStyle, fontFamily: 'monospace', textTransform: 'uppercase' }} value={bic} onChange={event => setBic(event.target.value)} placeholder="ABCDEFGH" /></Field>
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
                      "Respecter les règles islamiques de mixité, de pudeur et de comportement.",
                      "Transmettre le savoir religieux avec sincérité, sans déformation ni invention en cas de doute.",
                      "Respecter une honnêteté financière absolue ; toute facturation passe exclusivement par SAFARUMA.",
                      "Prendre soin des pèlerins qui me sont confiés comme une amana, et assurer avec attention la prise en charge des personnes âgées, des PMR, des femmes seules et des familles.",
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
