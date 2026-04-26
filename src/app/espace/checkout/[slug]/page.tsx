'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, differenceInDays } from 'date-fns'
import { fr as frLocale } from 'date-fns/locale'
import 'react-day-picker/style.css'
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
      {title && (
        <div style={{
          fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.75rem',
        }}>
          {title}
        </div>
      )}
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
                <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>{place.tagline}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#C9A84C' }}>
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

const LANGUES = [
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'Arabe' },
  { code: 'en', label: 'English' },
  { code: 'wo', label: 'Wolof' },
  { code: 'dz', label: 'Darija (Maroc)' },
  { code: 'bm', label: 'Bambara' },
  { code: 'dja', label: 'Algérien' },
  { code: 'tn', label: 'Tunisien' },
  { code: 'ur', label: 'Urdu' },
  { code: 'ha', label: 'Haoussa' },
  { code: 'id', label: 'Indonésien' },
  { code: 'tr', label: 'Turc' },
  { code: 'ber', label: 'Tamazight' },
  { code: 'so', label: 'Somali' },
  { code: 'ff', label: 'Peul' },
  { code: 'bn', label: 'Bengali' },
  { code: 'sw', label: 'Swahili' },
]

// ── Lieux historiques → assignés à une ville ──────
const MAKKAH_HISTORIQUE = ['hunayn']
const MADINAH_HISTORIQUE = ['badr', 'khandaq', 'bir-aris', 'masjid-ghamamah']

// Durée de visite en heures par lieu
const PLACE_HOURS: Record<string, number> = {
  // Makkah
  'jabal-nour':  2.5,
  'hira':        2.5,   // même montagne → bonus combo -1h
  'jabal-thawr': 3.0,
  'arafat':      2.0,
  'muzdalifah':  1.0,
  'mina':        1.0,
  'hunayn':      2.0,   // historique Makkah
  // Madinah
  'masjid-quba':     1.0,
  'qiblatayn':       1.0,  // combo avec Quba → -0.5h
  'baqi':            1.0,
  'ohoud':           2.5,
  'masjid-fateh':    1.0,  // combo avec Ohoud → -0.5h
  'marche-dattes':   1.0,
  'badr':            4.0,  // loin de Madinah (2h de route)
  'khandaq':         1.5,
  'bir-aris':        1.0,
  'masjid-ghamamah': 1.0,
}

const HOURS_PER_DAY = 6

function calcCarDays(selectedPlaces: string[], city: 'MAKKAH' | 'MADINAH'): number {
  const cityKeys = city === 'MAKKAH'
    ? [...PLACES.filter(p => p.category === 'MAKKAH' && !p.includedInBase).map(p => p.key), ...MAKKAH_HISTORIQUE]
    : [...PLACES.filter(p => p.category === 'MADINAH' && !p.includedInBase).map(p => p.key), ...MADINAH_HISTORIQUE]
  const selected = selectedPlaces.filter(k => cityKeys.includes(k))
  if (selected.length === 0) return 1
  let h = selected.reduce((sum, k) => sum + (PLACE_HOURS[k] ?? 1.5), 0)
  // Bonuses de proximité
  if (city === 'MAKKAH' && selected.includes('jabal-nour') && selected.includes('hira')) h -= 1.0
  if (city === 'MADINAH' && selected.includes('masjid-quba') && selected.includes('qiblatayn')) h -= 0.5
  if (city === 'MADINAH' && selected.includes('ohoud') && selected.includes('masjid-fateh')) h -= 0.5
  return Math.max(1, Math.ceil(h / HOURS_PER_DAY))
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
  const [guideDataMadinah, setGuideDataMadinah] = useState<any>(null)

  // Étape 4 — Choix du guide
  const [selectedGuideSlug, setSelectedGuideSlug] = useState<string | null>(null)
  const [selectedGuideSlugMadinah, setSelectedGuideSlugMadinah] = useState<string | null>(null)
  const [guideSubStep, setGuideSubStep] = useState<1 | 2>(1)
  const [availableGuides, setAvailableGuides] = useState<any[]>([])
  const [loadingGuides, setLoadingGuides] = useState(false)
  const guideFetchKey = useRef('')

  // Étape 1
  const [cityChoice, setCityChoice] = useState<CityChoice | null>(null)

  // Étape 2
  const [range, setRange] = useState<DateRange | undefined>()
  const [nbPersonnes, setNbPersonnes] = useState(1)
  const [gender, setGender] = useState<Gender>('MIXTE')
  const [langue, setLangue] = useState('fr')
  const [showAllLangues, setShowAllLangues] = useState(false)

  // Étape 3
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([])
  const [transportOption, setTransportOption] = useState<TransportOption>('NONE')
  const [localTransportMakkah, setLocalTransportMakkah] = useState<'NONE' | 'TAXI' | 'CAR'>('NONE')
  const [localTransportMadinah, setLocalTransportMadinah] = useState<'NONE' | 'TAXI' | 'CAR'>('NONE')
  const [visitSubStep, setVisitSubStep] = useState<'MAKKAH' | 'MADINAH' | 'TRANSPORT'>('MAKKAH')
  const [localTransportTab, setLocalTransportTab] = useState<'MAKKAH' | 'MADINAH'>('MAKKAH')
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

  // Restaurer l'état depuis localStorage (survit aux rafraîchissements Safari)
  useEffect(() => {
    if (!slug) return
    try {
      const raw = localStorage.getItem(`safaruna_checkout_${slug}`)
      if (!raw) return
      const s = JSON.parse(raw)
      // Expiration : 2h
      if (!s._ts || Date.now() - s._ts > 2 * 60 * 60 * 1000) {
        localStorage.removeItem(`safaruna_checkout_${slug}`)
        return
      }
      if (s.step) setStep(s.step)
      if (s.cityChoice) setCityChoice(s.cityChoice)
      if (s.range) setRange({
        from: s.range.from ? new Date(s.range.from) : undefined,
        to: s.range.to ? new Date(s.range.to) : undefined,
      })
      if (s.nbPersonnes) setNbPersonnes(s.nbPersonnes)
      if (s.gender) setGender(s.gender)
      if (s.langue) setLangue(s.langue)
      if (s.selectedPlaces) setSelectedPlaces(s.selectedPlaces)
      if (s.transportOption) setTransportOption(s.transportOption)
      if (s.localTransportMakkah) setLocalTransportMakkah(s.localTransportMakkah)
      if (s.localTransportMadinah) setLocalTransportMadinah(s.localTransportMadinah)
      if (s.visitSubStep) setVisitSubStep(s.visitSubStep)
      if (s.selectedGuideSlug) setSelectedGuideSlug(s.selectedGuideSlug)
      if (s.selectedGuideSlugMadinah) setSelectedGuideSlugMadinah(s.selectedGuideSlugMadinah)
    } catch { /* ignore */ }
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sauvegarder l'état dans localStorage (survit aux rafraîchissements Safari)
  useEffect(() => {
    if (!slug) return
    try {
      localStorage.setItem(`safaruna_checkout_${slug}`, JSON.stringify({
        _ts: Date.now(),
        step, cityChoice,
        range: range ? { from: range.from?.toISOString(), to: range.to?.toISOString() } : undefined,
        nbPersonnes, gender, langue, selectedPlaces, transportOption,
        localTransportMakkah, localTransportMadinah, visitSubStep,
        selectedGuideSlug, selectedGuideSlugMadinah,
      }))
    } catch { /* ignore */ }
  }, [slug, step, cityChoice, range, nbPersonnes, gender, langue, selectedPlaces, transportOption, localTransportMakkah, localTransportMadinah, visitSubStep, selectedGuideSlug, selectedGuideSlugMadinah])

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
    const controller = new AbortController()
    const target = selectedGuideSlug || slug
    if (!target) return
    setLoadingGuide(true)
    fetch(`/api/guide/public/${target}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error('Guide introuvable'); return r.json() })
      .then(data => {
        setGuide(data.guide)
        setActivePlaces(data.activePlaces || [])
        setPlacePrices(data.placePrices || {})
      })
      .catch(e => { if (e.name !== 'AbortError') { setGuide(null) } })
      .finally(() => setLoadingGuide(false))
    return () => controller.abort()
  }, [selectedGuideSlug, slug])

  // Fetch données du guide Madinah quand sélectionné
  useEffect(() => {
    if (!selectedGuideSlugMadinah) return
    fetch(`/api/guide/public/${selectedGuideSlugMadinah}`)
      .then(r => r.json())
      .then(data => setGuideDataMadinah(data.guide ?? null))
  }, [selectedGuideSlugMadinah])

  // Fetch guides disponibles à l'entrée de l'étape 4
  useEffect(() => {
    const fetchKey = [step, cityChoice, langue, gender].join('-')
    if (step !== 4 || fetchKey === guideFetchKey.current) return
    guideFetchKey.current = fetchKey
    setLoadingGuides(true)
    fetch('/api/guides/available?' + new URLSearchParams({
      city: cityChoice || '',
      langue,
      gender,
    }))
      .then(r => r.json())
      .then(d => setAvailableGuides(d.guides || []))
      .finally(() => setLoadingGuides(false))
  }, [step, cityChoice, langue, gender])

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
  const daysMakkah   = calcCarDays(selectedPlaces, 'MAKKAH')
  const daysMadinah  = calcCarDays(selectedPlaces, 'MADINAH')
  const prixVoitureMakkah  = localTransportMakkah  === 'CAR' ? daysMakkah  * 45 : 0
  const prixVoitureMadinah = localTransportMadinah === 'CAR' ? daysMadinah * 45 : 0
  const prixVoiture = prixVoitureMakkah + prixVoitureMadinah
  const TARIF_GROUPE = 200
  const prixGroupe = nbPersonnes > 7 ? TARIF_GROUPE : 0
  const total = prixBase + prixLieux + prixTransport + prixVoiture + prixGroupe

  // Lieux supplémentaires par ville — historiques fusionnés dans la bonne ville
  const getAvailablePlacesByCity = (city: 'MAKKAH' | 'MADINAH'): Place[] => {
    const historique = city === 'MAKKAH' ? MAKKAH_HISTORIQUE : MADINAH_HISTORIQUE
    return PLACES.filter(p => {
      if (p.includedInBase) return false
      if (activePlaces.length > 0 && !activePlaces.includes(p.key)) return false
      if (p.category === city) return true
      if (p.category === 'HISTORIQUE' && historique.includes(p.key)) return true
      return false
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
          departDate: range?.from,
          returnDate: range?.to,
          nbPersonnes,
          gender,
          langue,
          selectedPlaces,
          transportOption,
          localTransportMakkah,
          localTransportMadinah,
          totalPrice: total,
          packageName: basePackage?.name,
          selectedGuideSlug,
          selectedGuideSlugMadinah,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      try { localStorage.removeItem(`safaruna_checkout_${slug}`) } catch { /* ignore */ }
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
              color: (done || active) ? 'white' : '#7A6D5A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, flexShrink: 0,
            }}
          >
            {done ? '✓' : n}
          </div>
          <span
            className={active ? 'ck-lbl-on' : 'ck-lbl-off'}
            style={{ fontWeight: active ? 700 : 500, color: active ? '#1A1209' : '#7A6D5A', textAlign: 'center' }}
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
        color: disabled ? '#7A6D5A' : '#F0D897',
        border: 'none', borderRadius: 50,
        fontFamily: 'inherit', fontWeight: 700, fontSize: '0.95rem',
        cursor: disabled ? 'not-allowed' : 'pointer', marginTop: '2rem',
      }}
    >
      {label}
    </button>
  )

  // ── Rendu ─────────────────────────────────────
  return (
    <div style={{ height: '100vh', background: '#FAF7F0', fontFamily: 'var(--font-manrope, sans-serif)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ProgressBar />

      <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

        {/* ── ÉTAPE 1 — DESTINATION ── */}
        {step === 1 && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.5rem' }}>
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
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.3rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.4rem' }}>
                    {pkg.name}
                  </div>
                  <p style={{ fontSize: '0.83rem', color: '#7A6D5A', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                    {pkg.description}
                  </p>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#C9A84C' }}>
                    À partir de {pkg.basePrice}€
                    <span style={{ fontSize: '0.75rem', color: '#7A6D5A', fontFamily: 'inherit', fontWeight: 400, marginLeft: 4 }}>/ groupe (1-7 pers.)</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#FAF8F0', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#8B6914', fontWeight: 600, marginBottom: '0.3rem' }}>
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
            <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '2rem' }}>
              Votre voyage
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Range picker dates */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.75rem' }}>
                  Dates du séjour *
                </label>

                {/* Affichage de la sélection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  <div style={{ background: '#FAF7F0', border: range?.from ? '1.5px solid #C9A84C' : '1px solid #E8DFC8', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 3 }}>Arrivée</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: range?.from ? '#1A1209' : '#7A6D5A' }}>
                      {range?.from ? format(range.from, 'd MMM yyyy', { locale: frLocale }) : 'Choisir'}
                    </div>
                  </div>
                  <div style={{ background: '#FAF7F0', border: range?.to ? '1.5px solid #C9A84C' : '1px solid #E8DFC8', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 3 }}>Départ</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: range?.to ? '#1A1209' : '#7A6D5A' }}>
                      {range?.to ? format(range.to, 'd MMM yyyy', { locale: frLocale }) : 'Choisir'}
                    </div>
                  </div>
                </div>

                {/* Durée calculée */}
                {range?.from && range?.to && (
                  <div style={{ textAlign: 'center', fontSize: 11, color: '#8B6914', background: 'rgba(201,168,76,.1)', borderRadius: 50, padding: '4px 12px', display: 'inline-block', marginBottom: 12 }}>
                    {differenceInDays(range.to, range.from)} nuits
                  </div>
                )}

                {/* Calendrier range picker */}
                <div style={{ border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    locale={frLocale}
                    disabled={{ before: new Date() }}
                    numberOfMonths={1}
                    showOutsideDays={false}
                    modifiersStyles={{
                      selected: { backgroundColor: '#C9A84C', color: '#1A1209', fontWeight: 700 },
                      range_middle: { backgroundColor: 'rgba(201,168,76,.15)', color: '#1A1209' },
                      range_start: { backgroundColor: '#C9A84C', borderRadius: '50%', color: '#1A1209' },
                      range_end: { backgroundColor: '#C9A84C', borderRadius: '50%', color: '#1A1209' },
                    }}
                    styles={{
                      root: { width: '100%', fontFamily: 'inherit' },
                      month: { width: '100%' },
                      table: { width: '100%' },
                      head_cell: { fontSize: 11, color: '#7A6D5A', fontWeight: 600 },
                      day: { fontSize: 13, width: 36, height: 36, borderRadius: '50%' },
                      caption_label: { fontSize: 14, fontWeight: 700, color: '#1A1209' },
                      nav_button: { color: '#C9A84C', border: '1px solid #E8DFC8', borderRadius: 8 },
                    }}
                  />
                </div>
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
                  {LANGUES.slice(0, 4).map(l => (
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
                <button
                  type="button"
                  onClick={() => setShowAllLangues(true)}
                  style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 50, padding: '6px 14px', fontSize: 11, color: '#7A6D5A', cursor: 'pointer', fontFamily: 'inherit', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
                  </svg>
                  {langue && !['fr', 'ar', 'en', 'wo'].includes(langue)
                    ? `✓ ${LANGUES.find(l => l.code === langue)?.label}`
                    : 'Voir toutes les langues'}
                </button>
              </div>
            </div>

            {nextBtn('Continuer', () => setStep(3), !range?.from || !range?.to)}
          </div>
        )}

        {/* ── ÉTAPE 3 — LIEUX DE VISITE ── */}
        {step === 3 && (() => {
          // Sous-étape Makkah ou Madinah : back logic
          const handleBack3 = () => {
            if (visitSubStep === 'MAKKAH') return setStep(2)
            if (visitSubStep === 'MADINAH') return cityChoice === 'BOTH' ? setVisitSubStep('MAKKAH') : setStep(2)
            if (visitSubStep === 'TRANSPORT') return setVisitSubStep('MADINAH')
          }
          const handleNext3 = () => {
            if (visitSubStep === 'MAKKAH' && cityChoice === 'BOTH') return setVisitSubStep('MADINAH')
            if (visitSubStep === 'MAKKAH') return setStep(4)
            if (visitSubStep === 'MADINAH' && cityChoice === 'BOTH') return setVisitSubStep('TRANSPORT')
            if (visitSubStep === 'MADINAH') return setStep(4)
            if (visitSubStep === 'TRANSPORT') return setStep(4)
          }

          // Sous-étape progress pills (BOTH uniquement)
          const SubPills = () => cityChoice !== 'BOTH' ? null : (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {(['MAKKAH', 'MADINAH', 'TRANSPORT'] as const).map((s, i) => {
                const done = (visitSubStep === 'MADINAH' && i === 0) || (visitSubStep === 'TRANSPORT' && i < 2)
                const active = visitSubStep === s
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: 50, background: done ? '#D1FAE5' : active ? '#1A1209' : '#F0EBD8', border: done ? '1px solid #6EE7B7' : active ? 'none' : '1px solid #E8DFC8' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: done ? '#1D5C3A' : active ? '#F0D897' : '#7A6D5A' }}>
                        {done ? '✓' : s === 'MAKKAH' ? '🕋 Makkah' : s === 'MADINAH' ? '🌿 Madinah' : '🚗 Transport'}
                      </span>
                    </div>
                    {i < 2 && <div style={{ width: 16, height: 1.5, background: done ? '#6EE7B7' : '#E8DFC8' }} />}
                  </div>
                )
              })}
            </div>
          )

          // Sélecteur voiture avec prix dynamique
          const CarSelector = ({ city, value, onChange }: { city: 'MAKKAH' | 'MADINAH', value: 'NONE' | 'TAXI' | 'CAR', onChange: (v: 'NONE' | 'TAXI' | 'CAR') => void }) => {
            const days = calcCarDays(selectedPlaces, city)
            const carPrice = days * 45
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {/* Taxi */}
                <div onClick={() => onChange('TAXI')} style={{ background: value === 'TAXI' ? 'rgba(201,168,76,0.06)' : 'white', border: value === 'TAXI' ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #C9A84C', flexShrink: 0, background: value === 'TAXI' ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {value === 'TAXI' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>🚕 Taxi à la course</div>
                    <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>Paiement directement au chauffeur · Transport du guide inclus</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#7A6D5A' }}>0€</div>
                </div>
                {/* Voiture privée */}
                <div onClick={() => onChange('CAR')} style={{ background: value === 'CAR' ? 'rgba(201,168,76,0.06)' : 'white', border: value === 'CAR' ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #C9A84C', flexShrink: 0, background: value === 'CAR' ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {value === 'CAR' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>🚗 Voiture privée</div>
                    <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>
                      {days} jour{days > 1 ? 's' : ''} estimé{days > 1 ? 's' : ''} selon vos visites
                      <span style={{ color: '#C9A84C', fontWeight: 600 }}> · 45€/jour</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#C9A84C' }}>+{carPrice}€</div>
                </div>
              </div>
            )
          }

          return (
            <div>
              <button onClick={handleBack3} style={{ background: 'none', border: 'none', color: '#7A6D5A', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                ← Retour
              </button>
              <SubPills />

              {/* ── 3a : Visites Makkah ── */}
              {(visitSubStep === 'MAKKAH') && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.5rem' }}>
                    🕋 Visites à Makkah
                  </h2>
                  <p style={{ color: '#7A6D5A', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    Votre package inclut les essentiels. Ajoutez des visites supplémentaires.
                  </p>

                  {/* Inclus */}
                  <div style={{ background: '#FAF8F0', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B6914', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>✓ Inclus dans votre package</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {basePackage?.includedPlaces.filter(pk => PLACES.find(p => p.key === pk && p.category === 'MAKKAH')).map(pk => {
                        const place = PLACES.find(p => p.key === pk)
                        return place ? <span key={pk} style={{ background: 'rgba(201,168,76,0.12)', color: '#8B6914', fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: 50, border: '1px solid rgba(201,168,76,0.25)' }}>{place.emoji} {place.nameFr}</span> : null
                      })}
                    </div>
                  </div>

                  {/* Header section Visites supplémentaires Makkah */}
                  {getAvailablePlacesByCity('MAKKAH').length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                      <div style={{ width: 3, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #C9A84C, #8B6914)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B6914' }}>À la carte</div>
                        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 600, color: '#1A1209' }}>Visites supplémentaires · La Mecque</div>
                      </div>
                    </div>
                  )}
                  <PlaceSelector
                    title=""
                    places={getAvailablePlacesByCity('MAKKAH')}
                    selected={selectedPlaces}
                    onToggle={togglePlace}
                    prices={placePrices}
                    onDetail={setDetailPlace}
                  />
                </div>
              )}

              {/* ── 3b : Visites Madinah ── */}
              {(visitSubStep === 'MADINAH') && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.5rem' }}>
                    🌿 Visites à Madinah
                  </h2>
                  <p style={{ color: '#7A6D5A', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    Ajoutez des ziyarat supplémentaires à Madinah.
                  </p>

                  {/* Inclus (si MADINAH ou BOTH) */}
                  {basePackage?.includedPlaces.some(pk => PLACES.find(p => p.key === pk && p.category === 'MADINAH')) && (
                    <div style={{ background: '#FAF8F0', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B6914', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>✓ Inclus dans votre package</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {basePackage.includedPlaces.filter(pk => PLACES.find(p => p.key === pk && p.category === 'MADINAH')).map(pk => {
                          const place = PLACES.find(p => p.key === pk)
                          return place ? <span key={pk} style={{ background: 'rgba(201,168,76,0.12)', color: '#8B6914', fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: 50, border: '1px solid rgba(201,168,76,0.25)' }}>{place.emoji} {place.nameFr}</span> : null
                        })}
                      </div>
                    </div>
                  )}

                  {/* Header section Visites supplémentaires Médine */}
                  {getAvailablePlacesByCity('MADINAH').length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                      <div style={{ width: 3, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #27AE60, #1D5C3A)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1D5C3A' }}>À la carte</div>
                        <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 600, color: '#1A1209' }}>Visites supplémentaires · Médine</div>
                      </div>
                    </div>
                  )}
                  <PlaceSelector
                    title=""
                    places={getAvailablePlacesByCity('MADINAH')}
                    selected={selectedPlaces}
                    onToggle={togglePlace}
                    prices={placePrices}
                    onDetail={setDetailPlace}
                  />
                </div>
              )}

              {/* ── 3c : Transport (BOTH uniquement) ── */}
              {visitSubStep === 'TRANSPORT' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.5rem' }}>
                    🚗 Transport
                  </h2>
                  <p style={{ color: '#7A6D5A', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: 1.7 }}>
                    Choisissez votre transport entre les villes et pour vos visites locales.
                  </p>

                  {/* Transport intercité */}
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.75rem' }}>
                    Transport Makkah ↔ Madinah
                  </div>
                  {([
                    { key: 'NONE' as TransportOption, title: 'Sans transport', desc: 'Je gère mes déplacements moi-même', price: 'Gratuit' },
                    { key: 'TRAIN' as TransportOption, title: '🚄 Train Haramayn', desc: 'Aller-retour Makkah ↔ Madinah · Rapide et confortable', price: `+${80 * nbPersonnes}€`, perPerson: '80€/pers' },
                    { key: 'TAXI_RT' as TransportOption, title: '🚕 Taxi privé — Aller-retour', desc: 'Makkah ↔ Madinah · Véhicule privatisé pour votre groupe', price: '+240€', perPerson: 'forfait groupe' },
                    { key: 'TAXI_ONE' as TransportOption, title: '🚕 Taxi privé — Aller simple', desc: 'Makkah → Madinah OU Madinah → Makkah', price: '+240€', perPerson: 'forfait groupe' },
                  ] as { key: TransportOption; title: string; desc: string; price: string; perPerson?: string }[]).map(opt => (
                    <div key={opt.key} onClick={() => setTransportOption(opt.key)} style={{ background: transportOption === opt.key ? 'rgba(201,168,76,0.06)' : 'white', border: transportOption === opt.key ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #C9A84C', flexShrink: 0, background: transportOption === opt.key ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {transportOption === opt.key && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>{opt.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>
                          {opt.desc}{opt.perPerson && <span style={{ color: '#C9A84C', fontWeight: 600 }}> · {opt.perPerson}</span>}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: opt.key === 'NONE' ? '#7A6D5A' : '#C9A84C' }}>{opt.price}</div>
                    </div>
                  ))}

                  {/* Transport local — toggle Makkah / Madinah */}
                  <div style={{ marginTop: '2rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.875rem' }}>
                      Transport pour les visites locales
                    </div>
                    {/* Toggle */}
                    <div style={{ display: 'inline-flex', background: '#F5F2EC', borderRadius: 50, padding: '0.25rem', gap: '0.25rem', marginBottom: '1rem' }}>
                      {(['MAKKAH', 'MADINAH'] as const).map(city => (
                        <button
                          key={city}
                          onClick={() => setLocalTransportTab(city)}
                          style={{ padding: '0.45rem 1.25rem', borderRadius: 50, border: 'none', background: localTransportTab === city ? '#1A1209' : 'transparent', color: localTransportTab === city ? '#F0D897' : '#7A6D5A', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                        >
                          {city === 'MAKKAH' ? '🕋 Makkah' : '🌿 Madinah'}
                        </button>
                      ))}
                    </div>

                    {/* Choix voiture selon ville active */}
                    {localTransportTab === 'MAKKAH'
                      ? <CarSelector city="MAKKAH" value={localTransportMakkah} onChange={setLocalTransportMakkah} />
                      : <CarSelector city="MADINAH" value={localTransportMadinah} onChange={setLocalTransportMadinah} />
                    }

                    {/* Récap sélections */}
                    {(localTransportMakkah !== 'NONE' || localTransportMadinah !== 'NONE') && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#FAF8F0', border: '1px solid #E8DFC8', borderRadius: 10, fontSize: '0.75rem', color: '#4A3F30' }}>
                        {localTransportMakkah !== 'NONE' && (
                          <div>🕋 Makkah : {localTransportMakkah === 'TAXI' ? 'Taxi à la course (0€)' : `Voiture privée — ${calcCarDays(selectedPlaces, 'MAKKAH')} jour(s) · +${calcCarDays(selectedPlaces, 'MAKKAH') * 45}€`}</div>
                        )}
                        {localTransportMadinah !== 'NONE' && (
                          <div style={{ marginTop: localTransportMakkah !== 'NONE' ? '0.35rem' : 0 }}>🌿 Madinah : {localTransportMadinah === 'TAXI' ? 'Taxi à la course (0€)' : `Voiture privée — ${calcCarDays(selectedPlaces, 'MADINAH')} jour(s) · +${calcCarDays(selectedPlaces, 'MADINAH') * 45}€`}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Drawer détail lieu */}
              {detailPlace && (() => {
                const place = PLACES.find(p => p.key === detailPlace)
                const isSelected = selectedPlaces.includes(detailPlace)
                const prix = place ? (placePrices[place.key] ?? 50) : 0
                // Couleur de fond illustrative selon catégorie
                const bgGradient = place?.category === 'MAKKAH' || place?.key === 'hunayn'
                  ? 'linear-gradient(135deg, #2C1A06 0%, #8B4513 40%, #C9A84C 100%)'
                  : place?.category === 'MADINAH' || ['badr','khandaq','bir-aris','masjid-ghamamah'].includes(place?.key ?? '')
                  ? 'linear-gradient(135deg, #0A2A1A 0%, #1D5C3A 40%, #6FCF97 100%)'
                  : 'linear-gradient(135deg, #1A1209 0%, #4A3F30 100%)'
                return place ? (
                  <>
                    {/* Overlay semi-transparent */}
                    <div
                      onClick={() => setDetailPlace(null)}
                      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99 }}
                    />
                    {/* Drawer */}
                    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxHeight: '92vh', background: 'white', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', zIndex: 100, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                      {/* Visuel illustratif */}
                      <div style={{ position: 'relative', height: 200, background: bgGradient, flexShrink: 0, borderRadius: '20px 20px 0 0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Motif décoratif */}
                        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
                        <div style={{ fontSize: '5.5rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>{place.emoji}</div>
                        {/* Bouton fermer */}
                        <button
                          onClick={() => setDetailPlace(null)}
                          style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', border: 'none', color: 'white', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                        >✕</button>
                        {/* Nom arabe en bas de l'image */}
                        <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontFamily: 'serif', fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)', direction: 'rtl' }}>{place.nameAr}</div>
                      </div>

                      {/* Contenu */}
                      <div style={{ padding: '1.5rem 1.5rem 2rem' }}>
                        <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.7rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.75rem', lineHeight: 1.2 }}>{place.nameFr}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#4A3F30', lineHeight: 1.8, marginBottom: '1.5rem' }}>{place.desc}</p>

                        {/* Prix + toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAF8F0', border: '1px solid #E8DFC8', borderRadius: 12, padding: '0.875rem 1.25rem', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B6914', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tarif</div>
                            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#C9A84C' }}>+{prix}€ <span style={{ fontSize: '0.75rem', color: '#7A6D5A', fontFamily: 'inherit', fontWeight: 400 }}>/ personne</span></div>
                          </div>
                          <button
                            onClick={() => { togglePlace(place.key); setDetailPlace(null) }}
                            style={{ padding: '0.6rem 1.4rem', borderRadius: 50, border: 'none', background: isSelected ? '#DC2626' : 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)', color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', boxShadow: isSelected ? 'none' : '0 4px 12px rgba(201,168,76,0.4)' }}
                          >
                            {isSelected ? '✕ Retirer' : '+ Ajouter'}
                          </button>
                        </div>

                        {/* En savoir plus */}
                        <a
                          href={`/lieux-saints/${place.key}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '100%', padding: '0.75rem', borderRadius: 50, border: '1.5px solid #E8DFC8', background: 'white', color: '#4A3F30', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}
                        >
                          En savoir plus →
                        </a>
                      </div>
                    </div>
                  </>
                ) : null
              })()}

              {nextBtn('Continuer', handleNext3)}
            </div>
          )
        })()}

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

              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.5rem' }}>
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
                <div style={{ background: '#FAF8F0', border: '1px solid #E8DFC8', borderRadius: 16, padding: '2rem 1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🕌</div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.5rem' }}>
                    Votre guide sera confirmé
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#7A6D5A', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    Aucun guide disponible pour vos critères actuels. Notre équipe sélectionnera le guide le plus adapté à votre profil sous 24h.
                  </div>
                  <a
                    href="https://wa.me/33600000000"
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#25D366', color: 'white', fontSize: '0.78rem', fontWeight: 700, padding: '0.6rem 1.25rem', borderRadius: 50, textDecoration: 'none' }}
                  >
                    📱 Être conseillé sur WhatsApp
                  </a>
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
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
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
                      style={{ background: 'none', border: 'none', color: '#7A6D5A', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.75rem', textDecoration: 'underline', fontFamily: 'inherit' }}
                    >
                      Choisir un autre guide
                    </button>
                  )}
                </div>
              )}

              {cityChoice === 'BOTH' && guideSubStep === 1
                ? nextBtn('Continuer', () => { setSelectedGuideSlugMadinah(selectedGuideSlug); setGuideSubStep(2) }, !selectedGuideSlug)
                : nextBtn('Voir le récapitulatif', () => setStep(5), !currentSlug)
              }
            </div>
          )
        })()}

        {/* ── ÉTAPE 5 — RÉCAP & PAIEMENT ── */}
        {step === 5 && (
          <div>
            {backBtn(4)}
            <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '2rem' }}>
              Récapitulatif de votre voyage
            </h2>

            {/* Guide card(s) */}
            {guide && cityChoice === 'BOTH' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                {/* Guide Makkah — fond sombre doré */}
                <div style={{ background: 'linear-gradient(135deg, #1A1209 0%, #2C1F10 100%)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(201,168,76,0.3)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '0.95rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
                    {guide.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#C9A84C', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>🕋 Guide La Mecque</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white' }}>{guide.name}</div>
                  </div>
                </div>
                {/* Guide Madinah — fond vert émeraude */}
                {guideDataMadinah && (
                  <div style={{ background: 'linear-gradient(135deg, #0F3320 0%, #1D5C3A 100%)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(29,92,58,0.6)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6FCF97, #27AE60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '0.95rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {guideDataMadinah.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#6FCF97', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>🕌 Guide Médine</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'white' }}>{guideDataMadinah.name}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : guide ? (
              <div style={{ background: 'linear-gradient(135deg, #1A1209 0%, #2C1F10 100%)', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(201,168,76,0.3)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
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
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>{prixBase}€</div>
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
                    <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prix}€</div>
                  </div>
                ) : null
              })}

              {transportOption !== 'NONE' && cityChoice === 'BOTH' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>
                    {transportOption === 'TRAIN' ? '🚄 Train Haramayn A/R' : transportOption === 'TAXI_RT' ? '🚕 Taxi privé A/R' : '🚕 Taxi privé aller simple'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prixTransport}€</div>
                </div>
              )}

              {localTransportMakkah === 'CAR' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>🚗 Voiture privée — La Mecque ({daysMakkah} j.)</div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prixVoitureMakkah}€</div>
                </div>
              )}
              {localTransportMadinah === 'CAR' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>🚗 Voiture privée — Médine ({daysMadinah} j.)</div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prixVoitureMadinah}€</div>
                </div>
              )}

              {nbPersonnes > 7 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>Supplément groupe (8+ personnes)</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>Forfait groupe</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{TARIF_GROUPE}€</div>
                </div>
              )}

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#FAF7F0' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1A1209' }}>TOTAL</div>
                  <div style={{ fontSize: '0.7rem', color: '#7A6D5A' }}>Pour {nbPersonnes} personne{nbPersonnes > 1 ? 's' : ''}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#C9A84C' }}>
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
                ['Date de départ', range?.from ? format(range.from, 'd MMMM yyyy', { locale: frLocale }) : '—'],
                ['Date de retour', range?.to ? format(range.to, 'd MMMM yyyy', { locale: frLocale }) : '—'],
                ['Personnes', `${nbPersonnes} personne${nbPersonnes > 1 ? 's' : ''}`],
                ['Profil', gender],
                ['Langue', LANGUES.find(l => l.code === langue)?.label ?? langue],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #F5F0E8', fontSize: '0.83rem' }}>
                  <span style={{ color: '#7A6D5A' }}>{k}</span>
                  <span style={{ color: '#1A1209', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem 1rem', background: '#FAF8F0', borderRadius: 10, border: '1px solid #E8DFC8', marginBottom: '1.5rem' }}>
              {['✓ Guide Certifié SAFARUMA', '✓ Annulation gratuite sous 48h', '✓ Paiement 100% sécurisé', '✓ Confirmation sous 24h'].map(t => (
                <div key={t} style={{ fontSize: '0.78rem', color: '#8B6914', fontWeight: 600 }}>{t}</div>
              ))}
            </div>

            {error && (
              <div style={{ background: '#FDECEA', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#C0392B', marginBottom: '1rem', fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ width: '100%', padding: '1.1rem', background: submitting ? '#7A6D5A' : 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)', color: '#FAF7F0', border: 'none', borderRadius: 50, fontFamily: 'var(--font-cormorant, serif)', fontWeight: 700, fontSize: '1.1rem', cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: '0.06em', boxShadow: submitting ? 'none' : '0 4px 20px rgba(201,168,76,0.4)' }}
            >
              {submitting ? 'Envoi en cours…' : `Payer ${total.toLocaleString('fr-FR')}€`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.72rem', color: '#7A6D5A' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A6D5A" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Paiement 100% sécurisé · Powered by Stripe
            </div>
          </div>
        )}
      </div>
      </div>

      {/* ── Bottom sheet — Toutes les langues ── */}
      {showAllLangues && (
        <>
          <div
            onClick={() => setShowAllLangues(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }}
          />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'white', borderRadius: '20px 20px 0 0', padding: '1.25rem 1.25rem 2.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.1)', margin: '0 auto 1.25rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1209', textTransform: 'uppercase', letterSpacing: '.06em' }}>Langue préférée</span>
              <button
                type="button"
                onClick={() => setShowAllLangues(false)}
                style={{ background: '#F5F0E8', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: '#7A6D5A' }}
              >✕</button>
            </div>
            {LANGUES.map(l => (
              <div
                key={l.code}
                onClick={() => { setLangue(l.code); setShowAllLangues(false) }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F0EBD8', cursor: 'pointer', fontSize: 14, color: langue === l.code ? '#C9A84C' : '#1A1209', fontWeight: langue === l.code ? 700 : 400 }}
              >
                <span>{l.label}</span>
                {langue === l.code && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
