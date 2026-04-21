'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PLACES, type Place } from '@/lib/places'
import { BASE_PACKAGES, getPackageForCity, type CityChoice } from '@/lib/packages'

// ── Types ─────────────────────────────────────────
type Gender = 'HOMME' | 'FEMME' | 'MIXTE'
type TransportOption = 'NONE' | 'TRAIN' | 'TAXI_RT' | 'TAXI_ONE'

const STEPS = ['Destination', 'Dates & Profil', 'Visites', 'Votre guide', 'Récap']

// ── Composant PlaceSelector ───────────────────────
function PlaceSelector({
  title, places, selected, onToggle, prices, onDetail,
}: {
  title: string
  places: Place[]
  selected: string[]
  onToggle: (key: string) => void
  prices: Record<string, number>
  onDetail: (key: string) => void
}) {
  if (places.length === 0) return null
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.75rem',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {places.map(place => {
          const isSelected = selected.includes(place.key)
          const prix = prices[place.key] ?? 50
          return (
            <div key={place.key} style={{
              background: isSelected ? 'rgba(201,168,76,0.06)' : 'white',
              border: isSelected ? '2px solid #C9A84C' : '1.5px solid #E8DFC8',
              borderRadius: 12, padding: '0.875rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.875rem',
            }}>
              <div
                onClick={() => onToggle(place.key)}
                style={{
                  width: 20, height: 20, borderRadius: 4,
                  border: '2px solid #C9A84C', flexShrink: 0,
                  background: isSelected ? '#C9A84C' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isSelected && <span style={{ color: 'white', fontSize: '0.72rem', fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ fontSize: '1.3rem', flexShrink: 0 }}>{place.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>{place.nameFr}</div>
                <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>{place.desc}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#C9A84C' }}>
                  +{prix}€
                </div>
                <button
                  onClick={() => onDetail(place.key)}
                  style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  Voir détail
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Icônes Genre ──────────────────────────────────
const GenderIcon = ({ type }: { type: Gender }) => {
  if (type === 'HOMME') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M8 20v-4a4 4 0 018 0v4"/>
    </svg>
  )
  if (type === 'FEMME') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M8 20v-4a4 4 0 018 0v4"/>
      <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  )
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="8" r="3"/>
      <circle cx="15" cy="8" r="3"/>
      <path d="M6 20v-3a3 3 0 016 0v3"/>
      <path d="M12 20v-3a3 3 0 016 0v3"/>
    </svg>
  )
}

// ── Icônes Drapeaux ───────────────────────────────
const FlagIcon = ({ code }: { code: string }) => {
  const colors: Record<string, string[]> = {
    fr: ['#002395', '#FFFFFF', '#ED2939'],
    ar: ['#006C35', '#006C35', '#FFFFFF'],
    en: ['#012169', '#FFFFFF', '#C8102E'],
    wo: ['#00853F', '#FDEF42', '#E31B23'],
  }
  const [c1, c2, c3] = colors[code] || ['#666', '#999', '#CCC']
  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="10" fill={c1}/>
      <rect x="6.5" y="0" width="7" height="20" fill={c2}/>
      <rect x="13" y="0" width="7" height="20" fill={c3}/>
      <circle cx="10" cy="10" r="10" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
    </svg>
  )
}

// ── Page principale ───────────────────────────────
export default function CheckoutPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const router = useRouter()
  const { data: session, status } = useSession()

  const [step, setStep] = useState(1)
  const [guide, setGuide] = useState<any>(null)
  const [activePlaces, setActivePlaces] = useState<string[]>([])
  const [placePrices, setPlacePrices] = useState<Record<string, number>>({})
  const [loadingGuide, setLoadingGuide] = useState(true)

  // Étape 4 — Choix du guide
  const [selectedGuideSlug, setSelectedGuideSlug] = useState<string | null>(null)
  const [selectedGuideSlugMadinah, setSelectedGuideSlugMadinah] = useState<string | null>(null)
  const [guideSubStep, setGuideSubStep] = useState<1 | 2>(1)
  const [availableGuides, setAvailableGuides] = useState<any[]>([])
  const [loadingGuides, setLoadingGuides] = useState(false)

  // Étape 1
  const [cityChoice, setCityChoice] = useState<CityChoice | null>(null)

  // Étape 2
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [nbPersonnes, setNbPersonnes] = useState(1)
  const [gender, setGender] = useState<Gender>('MIXTE')
  const [langue, setLangue] = useState('fr')

  // Étape 3
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([])
  const [transportOption, setTransportOption] = useState<TransportOption>('NONE')
  const [withCar, setWithCar] = useState(false)
  const [detailPlace, setDetailPlace] = useState<string | null>(null)

  // Étape 4
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Redirect si non connecté
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/connexion?redirect=/espace/checkout/${slug}`)
    }
  }, [status, slug, router])

  // Initialise selectedGuideSlug depuis l'URL
  useEffect(() => {
    if (slug && selectedGuideSlug === null) setSelectedGuideSlug(slug)
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset sous-étape guide si cityChoice change
  useEffect(() => {
    setGuideSubStep(1)
    setSelectedGuideSlugMadinah(null)
  }, [cityChoice])

  // Fetch données du guide sélectionné
  useEffect(() => {
    const target = selectedGuideSlug || slug
    if (!target) return
    setLoadingGuide(true)
    fetch(`/api/guide/public/${target}`)
      .then(r => r.json())
      .then(data => {
        setGuide(data.guide)
        setActivePlaces(data.activePlaces || [])
        setPlacePrices(data.placePrices || {})
      })
      .finally(() => setLoadingGuide(false))
  }, [selectedGuideSlug, slug])

  // Fetch guides disponibles à l'entrée de l'étape 4
  useEffect(() => {
    if (step !== 4 || availableGuides.length > 0) return
    setLoadingGuides(true)
    fetch('/api/guides/available?' + new URLSearchParams({
      city: cityChoice || '',
      langue,
      gender,
    }))
      .then(r => r.json())
      .then(d => setAvailableGuides(d.guides || []))
      .finally(() => setLoadingGuides(false))
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  // Package de base
  const basePackage = cityChoice ? getPackageForCity(cityChoice) : null

  // Calcul prix — forfait flat 1-7 personnes
  const prixBase = basePackage?.basePrice ?? 0
  const extraPlaces = selectedPlaces.filter(pk => !basePackage?.includedPlaces.includes(pk))
  const prixLieux = extraPlaces.reduce((sum, pk) => sum + (placePrices[pk] ?? 50), 0)
  const prixTransport = cityChoice === 'BOTH'
    ? transportOption === 'TRAIN' ? 80 * nbPersonnes
    : transportOption === 'TAXI_RT' ? 240
    : transportOption === 'TAXI_ONE' ? 240
    : 0
    : 0
  const prixVoiture = withCar ? 280 : 0
  const TARIF_GROUPE = 200
  const prixGroupe = nbPersonnes > 7 ? TARIF_GROUPE : 0
  const total = prixBase + prixLieux + prixTransport + prixVoiture + prixGroupe

  // Lieux supplémentaires disponibles par catégorie
  const getAvailablePlaces = (category: 'MAKKAH' | 'MADINAH' | 'HISTORIQUE'): Place[] => {
    return PLACES.filter(p => {
      if (p.category !== category) return false
      if (p.includedInBase) return false
      if (cityChoice === 'MAKKAH' && category === 'MADINAH') return false
      if (cityChoice === 'MADINAH' && category === 'MAKKAH') return false
      if (activePlaces.length > 0 && !activePlaces.includes(p.key)) return false
      return true
    })
  }

  const togglePlace = (pk: string) =>
    setSelectedPlaces(prev =>
      prev.includes(pk) ? prev.filter(p => p !== pk) : [...prev, pk]
    )

  // Soumission — redirige vers Stripe Checkout
  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideSlug: slug,
          cityChoice,
          departDate,
          returnDate,
          nbPersonnes,
          gender,
          langue,
          selectedPlaces,
          transportOption,
          withCar,
          totalPrice: total,
          packageName: basePackage?.name,
          selectedGuideSlug,
          selectedGuideSlugMadinah,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      window.location.href = data.sessionUrl
    } catch (e: any) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  // ── Barre de progression ──────────────────────
  const ProgressBar = () => {
    const items: React.ReactNode[] = []
    STEPS.forEach((s, i) => {
      const n = i + 1
      const done = step > n
      const active = step === n
      items.push(
        <div key={`step-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            className="ck-circle"
            style={{
              borderRadius: '50%',
              background: done ? '#1D5C3A' : active ? '#C9A84C' : '#E8DFC8',
              color: (done || active) ? 'white' : '#9CA3AF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, flexShrink: 0,
            }}
          >
            {done ? '✓' : n}
          </div>
          <span
            className={active ? 'ck-lbl-on' : 'ck-lbl-off'}
            style={{ fontWeight: active ? 700 : 500, color: active ? '#1A1209' : '#9CA3AF', textAlign: 'center' }}
          >
            {s}
          </span>
        </div>
      )
      if (i < STEPS.length - 1) {
        items.push(
          <div
            key={`ck-c-${i}`}
            className="ck-con"
            style={{ background: done ? '#1D5C3A' : '#E8DFC8', borderRadius: 1, alignSelf: 'flex-start', marginTop: 14 }}
          />
        )
      }
    })
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
          .ck-bar { padding: 1rem 2rem; }
          .ck-circle { width: 28px; height: 28px; font-size: 0.75rem; }
          .ck-lbl-on, .ck-lbl-off { font-size: 0.72rem; }
          .ck-con { width: 24px; height: 2px; flex-shrink: 0; }
          @media (max-width: 640px) {
            .ck-bar { padding: 10px 12px; }
            .ck-circle { width: 28px; height: 28px; font-size: 11px; }
            .ck-lbl-off { display: none; }
            .ck-lbl-on { font-size: 10px; font-weight: 700; }
            .ck-con { width: auto; flex: 1; height: 1px; min-width: 8px; }
          }
        `}} />
        <div
          className="ck-bar"
          style={{
            position: 'sticky', top: 0, zIndex: 40, background: 'white',
            borderBottom: '1px solid #E8DFC8',
            display: 'flex', gap: 0, alignItems: 'flex-start', justifyContent: 'center',
          }}
        >
          {items}
        </div>
      </>
    )
  }

  // ── Loading ───────────────────────────────────
  if (loadingGuide || status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF7F0' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E8DFC8', borderTopColor: '#C9A84C', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const backBtn = (toStep: number) => (
    <button
      onClick={() => setStep(toStep)}
      style={{ background: 'none', border: 'none', color: '#7A6D5A', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.5rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
    >
      ← Retour
    </button>
  )

  const nextBtn = (label: string, onClick: () => void, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '1rem',
        background: disabled ? '#E8DFC8' : '#1A1209',
        color: disabled ? '#9CA3AF' : '#F0D897',
        border: 'none', borderRadius: 12,
        fontFamily: 'inherit', fontWeight: 700, fontSize: '0.95rem',
        cursor: disabled ? 'not-allowed' : 'pointer', marginTop: '2rem',
      }}
    >
      {label}
    </button>
  )

  // ── Rendu ─────────────────────────────────────
  return (
    <div style={{ height: '100vh', background: '#FAF7F0', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ProgressBar />

      <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

        {/* ── ÉTAPE 1 — DESTINATION ── */}
        {step === 1 && (
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.5rem' }}>
              Où souhaitez-vous vous rendre ?
            </h1>
            <p style={{ color: '#7A6D5A', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              Choisissez une ou deux villes pour votre voyage spirituel.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {BASE_PACKAGES.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setCityChoice(pkg.cities)}
                  style={{
                    background: cityChoice === pkg.cities ? 'rgba(201,168,76,0.06)' : 'white',
                    border: cityChoice === pkg.cities ? '2px solid #C9A84C' : '1.5px solid #E8DFC8',
                    borderRadius: 16, padding: '1.5rem', cursor: 'pointer',
                    position: 'relative', transition: 'all 0.15s',
                  }}
                >
                  {pkg.recommended && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: '#C9A84C', color: '#1A1209', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', padding: '0.2rem 0.6rem', borderRadius: 50 }}>
                      RECOMMANDÉ
                    </div>
                  )}
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{pkg.emoji}</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.4rem' }}>
                    {pkg.name}
                  </div>
                  <p style={{ fontSize: '0.83rem', color: '#7A6D5A', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                    {pkg.description}
                  </p>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 700, color: '#C9A84C' }}>
                    À partir de {pkg.basePrice}€
                    <span style={{ fontSize: '0.75rem', color: '#7A6D5A', fontFamily: 'Arial, sans-serif', fontWeight: 400, marginLeft: 4 }}>/ groupe (1-7 pers.)</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#1D5C3A', fontWeight: 600, marginBottom: '0.3rem' }}>
                💡 Vous ne savez pas quoi choisir ?
              </div>
              <div style={{ fontSize: '0.78rem', color: '#4A3F30', lineHeight: 1.7 }}>
                La Omra se fait uniquement à Makkah. Madinah est une visite spirituelle séparée — non obligatoire mais très recommandée. Contactez-nous gratuitement pour être conseillé.
              </div>
              <a
                href="https://wa.me/33600000000"
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', background: '#25D366', color: 'white', fontSize: '0.78rem', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: 50, textDecoration: 'none' }}
              >
                📱 Nous contacter sur WhatsApp
              </a>
            </div>

            {nextBtn('Continuer', () => setStep(2), !cityChoice)}
          </div>
        )}

        {/* ── ÉTAPE 2 — DATES & PROFIL ── */}
        {step === 2 && (
          <div>
            {backBtn(1)}
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '2rem' }}>
              Votre voyage
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>
                  Date de départ *
                </label>
                <input
                  type="date"
                  value={departDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDepartDate(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #E8DFC8', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', color: '#1A1209', background: 'white', boxSizing: 'border-box' }}
                />
              </div>

              {/* Date retour */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>
                  Date de retour *
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={departDate || new Date().toISOString().split('T')[0]}
                  onChange={e => setReturnDate(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #E8DFC8', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', color: '#1A1209', background: 'white', boxSizing: 'border-box' }}
                />
              </div>

              {/* Nb personnes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>
                  Nombre de personnes *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E8DFC8', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
                  <button onClick={() => setNbPersonnes(n => Math.max(1, n - 1))} style={{ width: 48, height: 48, border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#1A1209', fontFamily: 'inherit' }}>−</button>
                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '1rem', color: '#1A1209', borderLeft: '1px solid #E8DFC8', borderRight: '1px solid #E8DFC8', padding: '0.75rem 0' }}>
                    {nbPersonnes} {nbPersonnes === 1 ? 'personne' : 'personnes'}
                  </div>
                  <button onClick={() => setNbPersonnes(n => Math.min(20, n + 1))} style={{ width: 48, height: 48, border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#1A1209', fontFamily: 'inherit' }}>+</button>
                </div>
              </div>

              {/* Genre */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>
                  Profil du groupe
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['HOMME', 'FEMME', 'MIXTE'] as Gender[]).map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      style={{ flex: 1, padding: '0.75rem 0.5rem', border: gender === g ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 10, background: gender === g ? 'rgba(201,168,76,0.08)' : 'white', color: gender === g ? '#8B6914' : '#7A6D5A', fontWeight: gender === g ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <GenderIcon type={g} />
                      {g === 'HOMME' ? 'Homme' : g === 'FEMME' ? 'Femme' : 'Mixte'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Langue */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>
                  Langue préférée
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { code: 'fr', label: 'Français' },
                    { code: 'ar', label: 'Arabe' },
                    { code: 'en', label: 'English' },
                    { code: 'wo', label: 'Wolof' },
                  ].map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLangue(l.code)}
                      style={{ padding: '0.5rem 1rem', border: langue === l.code ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 50, background: langue === l.code ? 'rgba(201,168,76,0.08)' : 'white', color: langue === l.code ? '#8B6914' : '#7A6D5A', fontWeight: langue === l.code ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <FlagIcon code={l.code} />
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {nextBtn('Continuer', () => setStep(3), !departDate || !returnDate)}
          </div>
        )}

        {/* ── ÉTAPE 3 — LIEUX DE VISITE ── */}
        {step === 3 && (
          <div>
            {backBtn(2)}
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.5rem' }}>
              Personnalisez votre voyage
            </h2>
            <p style={{ color: '#7A6D5A', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              Votre package inclut les lieux essentiels. Ajoutez des visites supplémentaires à votre convenance.
            </p>

            {/* Lieux inclus */}
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1D5C3A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                ✓ Inclus dans votre package
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {basePackage?.includedPlaces.map(pk => {
                  const place = PLACES.find(p => p.key === pk)
                  return place ? (
                    <span key={pk} style={{ background: '#D1FAE5', color: '#1D5C3A', fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: 50 }}>
                      {place.emoji} {place.nameFr}
                    </span>
                  ) : null
                })}
              </div>
            </div>

            {/* Lieux supplémentaires */}
            {(cityChoice === 'MAKKAH' || cityChoice === 'BOTH') && (
              <PlaceSelector
                title="🕋 Visites supplémentaires — Makkah"
                places={getAvailablePlaces('MAKKAH')}
                selected={selectedPlaces}
                onToggle={togglePlace}
                prices={placePrices}
                onDetail={setDetailPlace}
              />
            )}
            {(cityChoice === 'MADINAH' || cityChoice === 'BOTH') && (
              <PlaceSelector
                title="🌿 Visites supplémentaires — Madinah"
                places={getAvailablePlaces('MADINAH')}
                selected={selectedPlaces}
                onToggle={togglePlace}
                prices={placePrices}
                onDetail={setDetailPlace}
              />
            )}
            {cityChoice === 'BOTH' && (
              <PlaceSelector
                title="⚔️ Sites historiques"
                places={getAvailablePlaces('HISTORIQUE')}
                selected={selectedPlaces}
                onToggle={togglePlace}
                prices={placePrices}
                onDetail={setDetailPlace}
              />
            )}

            {/* Transport Makkah ↔ Madinah */}
            {cityChoice === 'BOTH' && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.75rem' }}>
                  Transport Makkah ↔ Madinah
                </div>
                {([
                  { key: 'NONE' as TransportOption, title: 'Sans transport', desc: 'Je gère mes déplacements moi-même', price: 'Gratuit' },
                  { key: 'TRAIN' as TransportOption, title: '🚄 Train Haramayn', desc: 'Aller-retour Makkah ↔ Madinah · Rapide et confortable', price: `+${80 * nbPersonnes}€`, perPerson: '80€/pers' },
                  { key: 'TAXI_RT' as TransportOption, title: '🚕 Taxi privé — Aller-retour', desc: 'Makkah ↔ Madinah · Véhicule privatisé pour votre groupe', price: '+240€', perPerson: 'forfait groupe' },
                  { key: 'TAXI_ONE' as TransportOption, title: '🚕 Taxi privé — Aller simple', desc: 'Makkah → Madinah OU Madinah → Makkah', price: '+240€', perPerson: 'forfait groupe' },
                ] as { key: TransportOption; title: string; desc: string; price: string; perPerson?: string }[]).map(opt => (
                  <div
                    key={opt.key}
                    onClick={() => setTransportOption(opt.key)}
                    style={{ background: transportOption === opt.key ? 'rgba(201,168,76,0.06)' : 'white', border: transportOption === opt.key ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #C9A84C', flexShrink: 0, background: transportOption === opt.key ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {transportOption === opt.key && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>{opt.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>
                        {opt.desc}
                        {opt.perPerson && <span style={{ color: '#C9A84C', fontWeight: 600 }}> · {opt.perPerson}</span>}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: opt.key === 'NONE' ? '#9CA3AF' : '#C9A84C' }}>{opt.price}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Voiture */}
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
              Véhicule pour les visites
            </div>
            <div
              onClick={() => setWithCar(c => !c)}
              style={{ background: withCar ? 'rgba(201,168,76,0.06)' : 'white', border: withCar ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid #C9A84C', flexShrink: 0, background: withCar ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {withCar && <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>Voiture privée — visites locales</div>
                <div style={{ fontSize: '0.75rem', color: '#7A6D5A', marginTop: 2 }}>Recommandé pour Jabal Nour, Arafat, Badr · +280€/jour</div>
              </div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#C9A84C' }}>+45€</div>
            </div>

            {/* Drawer détail lieu */}
            {detailPlace && (() => {
              const place = PLACES.find(p => p.key === detailPlace)
              return place ? (
                <div style={{ position: 'fixed', top: 0, right: 0, width: 320, height: '100vh', background: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', zIndex: 100, padding: '2rem 1.5rem', overflowY: 'auto' }}>
                  <button onClick={() => setDetailPlace(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', marginBottom: '1rem', color: '#7A6D5A' }}>✕</button>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{place.emoji}</div>
                  <div style={{ fontFamily: 'serif', fontSize: '1rem', color: '#9CA3AF', direction: 'rtl', marginBottom: '0.5rem' }}>{place.nameAr}</div>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#1A1209', marginBottom: '0.75rem' }}>{place.nameFr}</h3>
                  <p style={{ fontSize: '0.88rem', color: '#4A3F30', lineHeight: 1.8 }}>{place.desc}</p>
                  <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: '#FEF9EC', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, color: '#8B6914' }}>
                    Tarif : {placePrices[place.key] ?? 50}€ / personne
                  </div>
                </div>
              ) : null
            })()}

            {nextBtn('Voir le récapitulatif', () => setStep(4))}
          </div>
        )}

        {/* ── ÉTAPE 4 — VOTRE GUIDE ── */}
        {step === 4 && (() => {
          const isMadinahSub = cityChoice === 'BOTH' && guideSubStep === 2
          const currentSlug = isMadinahSub ? selectedGuideSlugMadinah : selectedGuideSlug
          const setCurrentSlug = isMadinahSub ? setSelectedGuideSlugMadinah : setSelectedGuideSlug

          return (
            <div>
              {guideSubStep === 2
                ? (
                  <button
                    onClick={() => setGuideSubStep(1)}
                    style={{ background: 'none', border: 'none', color: '#7A6D5A', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.5rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    ← Retour
                  </button>
                )
                : backBtn(3)
              }

              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.5rem' }}>
                {cityChoice === 'BOTH'
                  ? guideSubStep === 1 ? 'Choisissez votre guide pour Makkah' : 'Choisissez votre guide pour Madinah'
                  : 'Choisissez votre guide'}
              </h2>
              <p style={{ color: '#7A6D5A', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                {isMadinahSub
                  ? 'Vous pouvez choisir le même guide ou un guide différent'
                  : cityChoice !== 'BOTH' ? 'Guide pour votre séjour' : ''}
              </p>

              {loadingGuides ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ background: '#E8DFC8', borderRadius: 12, padding: '1.25rem', height: 88, opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))}
                  <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:0.8} }`}</style>
                </div>
              ) : availableGuides.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#7A6D5A', fontSize: '0.88rem' }}>
                  Aucun guide disponible pour vos critères. Votre guide actuel sera confirmé.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {availableGuides.map(g => {
                    const isSelected = currentSlug === g.slug
                    return (
                      <div
                        key={g.slug}
                        onClick={() => setCurrentSlug(g.slug)}
                        style={{ background: isSelected ? 'rgba(201,168,76,0.06)' : 'white', border: isSelected ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
                          {g.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1A1209' }}>{g.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>
                            Guide SAFARUMA · {g.city}
                            {g.languages && g.languages.length > 0 && (
                              <span> · {g.languages.slice(0, 2).join(', ')}</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#C9A84C', marginTop: 2, fontWeight: 600 }}>★ {g.rating}</div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setCurrentSlug(g.slug) }}
                          style={{ padding: '0.45rem 1rem', borderRadius: 50, border: 'none', background: isSelected ? '#1D5C3A' : '#E8DFC8', color: isSelected ? 'white' : '#4A3F30', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                          {isSelected ? 'Sélectionné ✓' : 'Choisir'}
                        </button>
                      </div>
                    )
                  })}

                  {currentSlug && (
                    <button
                      onClick={() => setCurrentSlug(null)}
                      style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.75rem', textDecoration: 'underline', fontFamily: 'inherit' }}
                    >
                      Choisir un autre guide
                    </button>
                  )}
                </div>
              )}

              {cityChoice === 'BOTH' && guideSubStep === 1
                ? nextBtn('Continuer', () => setGuideSubStep(2), !selectedGuideSlug)
                : nextBtn('Voir le récapitulatif', () => setStep(5), !currentSlug)
              }
            </div>
          )
        })()}

        {/* ── ÉTAPE 5 — RÉCAP & PAIEMENT ── */}
        {step === 5 && (
          <div>
            {backBtn(4)}
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '2rem' }}>
              Récapitulatif de votre voyage
            </h2>

            {/* Guide card(s) */}
            {guide && cityChoice === 'BOTH' ? (
              <div style={{ background: '#1A1209', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
                    {guide.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(201,168,76,0.6)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Guide Makkah</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white' }}>{guide.name}</div>
                  </div>
                </div>
                {selectedGuideSlugMadinah && (() => {
                  const gM = availableGuides.find(g => g.slug === selectedGuideSlugMadinah)
                  return gM ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
                        {gM.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(201,168,76,0.6)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Guide Madinah</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white' }}>{gM.name}</div>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            ) : guide ? (
              <div style={{ background: '#1A1209', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
                  {guide.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{guide.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>Guide SAFARUMA · {guide.city}</div>
                </div>
              </div>
            ) : null}

            {/* Stepper personnes */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              background: 'white',
              border: '1px solid #E8DFC8',
              borderRadius: 12,
              padding: '0.875rem 1.25rem',
              marginBottom: '1rem',
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1A1209' }}>
                Nombre de personnes
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => setNbPersonnes(n => Math.max(1, n - 1))}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: '1.5px solid #E8DFC8', background: 'white',
                    fontSize: '1.1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1A1209', fontFamily: 'inherit',
                  }}
                >−</button>
                <span style={{
                  fontSize: '0.95rem', fontWeight: 700,
                  color: '#1A1209', minWidth: 80, textAlign: 'center',
                }}>
                  {nbPersonnes} {nbPersonnes === 1 ? 'personne' : 'personnes'}
                </span>
                <button
                  onClick={() => setNbPersonnes(n => Math.min(20, n + 1))}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: '1.5px solid #E8DFC8', background: 'white',
                    fontSize: '1.1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1A1209', fontFamily: 'inherit',
                  }}
                >+</button>
              </div>
            </div>

            {/* Tableau prix */}
            <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem' }}>
              {/* Package de base */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>{basePackage?.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>Forfait 1-7 personnes</div>
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>{prixBase}€</div>
              </div>

              {/* Visites supp */}
              {extraPlaces.map(pk => {
                const place = PLACES.find(p => p.key === pk)
                const prix = placePrices[pk] ?? 50
                return place ? (
                  <div key={pk} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>{place.emoji} {place.nameFr}</div>
                      <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>Visite supplémentaire</div>
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prix}€</div>
                  </div>
                ) : null
              })}

              {transportOption !== 'NONE' && cityChoice === 'BOTH' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>
                    {transportOption === 'TRAIN' ? '🚄 Train Haramayn A/R' : transportOption === 'TAXI_RT' ? '🚕 Taxi privé A/R' : '🚕 Taxi privé aller simple'}
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prixTransport}€</div>
                </div>
              )}

              {withCar && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>🚗 Voiture du guide</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>280€</div>
                </div>
              )}

              {nbPersonnes > 6 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>Supplément groupe (+6 personnes)</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>Forfait groupe</div>
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{TARIF_GROUPE}€</div>
                </div>
              )}

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#FAF7F0' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1A1209' }}>TOTAL</div>
                  <div style={{ fontSize: '0.7rem', color: '#7A6D5A' }}>Pour {nbPersonnes} personne{nbPersonnes > 1 ? 's' : ''}</div>
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 700, color: '#C9A84C' }}>
                  {total.toLocaleString('fr-FR')}€
                </div>
              </div>
            </div>

            {/* Infos voyage */}
            <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.75rem' }}>
                Détails du voyage
              </div>
              {[
                ['Destination', cityChoice === 'BOTH' ? 'Makkah + Madinah' : cityChoice === 'MAKKAH' ? 'Makkah' : 'Madinah'],
                ['Date de départ', new Date(departDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['Date de retour', new Date(returnDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['Personnes', `${nbPersonnes} personne${nbPersonnes > 1 ? 's' : ''}`],
                ['Profil', gender],
                ['Langue', langue === 'fr' ? 'Français' : langue === 'ar' ? 'Arabe' : langue === 'en' ? 'English' : 'Wolof'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #F5F0E8', fontSize: '0.83rem' }}>
                  <span style={{ color: '#7A6D5A' }}>{k}</span>
                  <span style={{ color: '#1A1209', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem 1rem', background: '#F0FDF4', borderRadius: 10, border: '1px solid #BBF7D0', marginBottom: '1.5rem' }}>
              {['✓ Guide Certifié SAFARUMA', '✓ Annulation gratuite sous 48h', '✓ Paiement 100% sécurisé', '✓ Confirmation sous 24h'].map(t => (
                <div key={t} style={{ fontSize: '0.78rem', color: '#1D5C3A', fontWeight: 600 }}>{t}</div>
              ))}
            </div>

            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#DC2626', marginBottom: '1rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ width: '100%', padding: '1.1rem', background: submitting ? '#9CA3AF' : 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)', color: '#FAF7F0', border: 'none', borderRadius: 12, fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700, fontSize: '1.1rem', cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: '0.06em', boxShadow: submitting ? 'none' : '0 4px 20px rgba(201,168,76,0.4)' }}
            >
              {submitting ? 'Envoi en cours…' : 'Confirmer mon voyage'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.72rem', color: '#9CA3AF' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Paiement 100% sécurisé · Powered by Stripe
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
