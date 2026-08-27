'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DayPicker, DateRange } from 'react-day-picker'
import { addDays, format, differenceInDays } from 'date-fns'
import { fr as frLocale } from 'date-fns/locale'
import 'react-day-picker/style.css'
import { PLACES, type Place } from '@/lib/places'
import { getPackageForCity, type CityChoice } from '@/lib/packages'
import {
  BOOKING_PRICES,
  calculateBookingTransportPrice,
  calculateLocalCarDays,
  getBookingPrices,
  type LocalTransportOption,
  type TransportOption,
} from '@/lib/booking-pricing'
import {
  centsToEuros,
  DEFAULT_GUIDE_NET_RATES,
  guideServiceRetailCents,
  GUIDE_SERVICE_MARKUP_BPS,
  TRAVEL_MARKUP_BPS,
} from '@/lib/guide-pricing'
import { getAnalyticsSessionId, trackAnalyticsEvent } from '@/lib/analytics-client'

// ── Types ─────────────────────────────────────────
type Gender = 'HOMME' | 'FEMME' | 'MIXTE'

type PublicGuide = {
  id?: string
  slug: string
  name: string
  city: string
  rating?: number | null
  languages?: string[]
  serviceCities?: string[]
  servesMakkah?: boolean
  servesMadinah?: boolean
  prices?: {
    makkah?: { upTo6?: number; upTo15?: number; upTo32?: number }
    madinah?: { upTo6?: number; upTo15?: number; upTo32?: number }
  }
}

const STEPS_SINGLE = ['Destination', 'Dates & Profil', 'Visites', 'Votre guide', 'Récap']
const STEPS_BOTH   = ['Destination', 'Vos guides', 'Dates & Profil', 'Visites', 'Récap']
type CheckoutPlace = Place & {
  isActive: boolean
  retailCents: { upTo6: number; upTo15: number; upTo32: number }
}

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
          const prix = prices[place.key] ?? BOOKING_PRICES.defaultPlace
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

// ── Correspondance places.ts key → slug page lieux-saints ──
const PLACE_PAGE_SLUG: Record<string, string> = {
  'jabal-nour':  'jabal-al-nour',
  'baqi':        'al-baqi',
  'qiblatayn':   'masjid-al-qiblatayn',
  'ohoud':       'jabal-uhud',
}

function formatGuideCity(city: string): string {
  if (city === 'MAKKAH') return 'La Mecque'
  if (city === 'MADINAH') return 'Médine'
  return city
}

function guideRetailPrice(guideData: PublicGuide | null, city: 'MAKKAH' | 'MADINAH', nbPeople: number): number {
  const tier = nbPeople <= 6 ? 'upTo6' : nbPeople <= 15 ? 'upTo15' : 'upTo32'
  const cityPrices = city === 'MAKKAH' ? guideData?.prices?.makkah : guideData?.prices?.madinah
  const price = cityPrices?.[tier]
  return typeof price === 'number' ? price : 0
}

// ── Lieux historiques → assignés à une ville ──────
const MAKKAH_HISTORIQUE = ['hunayn']
const MADINAH_HISTORIQUE = ['badr', 'khandaq', 'bir-aris', 'masjid-ghamamah']

function placeBelongsToCity(place: Place, city: 'MAKKAH' | 'MADINAH'): boolean {
  if (place.category === city) return true
  if (place.category !== 'HISTORIQUE') return false
  return (city === 'MAKKAH' ? MAKKAH_HISTORIQUE : MADINAH_HISTORIQUE).includes(place.key)
}

// ── Page principale ───────────────────────────────
export default function CheckoutPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()

  const [step, setStep] = useState(1)
  const [guide, setGuide] = useState<PublicGuide | null>(null)
  const [activePlaces, setActivePlaces] = useState<string[]>([])
  const [placeCatalog, setPlaceCatalog] = useState<CheckoutPlace[]>(PLACES.map(place => ({
    ...place,
    isActive: true,
    retailCents: { upTo6: 6_500, upTo15: 9_100, upTo32: 11_700 },
  })))
  const [pricingSettings, setPricingSettings] = useState({
    guideServiceMarkupBps: GUIDE_SERVICE_MARKUP_BPS,
    travelMarkupBps: TRAVEL_MARKUP_BPS,
  })
  const [loadingGuide, setLoadingGuide] = useState(true)
  const [guideDataMadinah, setGuideDataMadinah] = useState<PublicGuide | null>(null)

  // Étape 4 — Choix du guide
  const [selectedGuideSlug, setSelectedGuideSlug] = useState<string | null>(null)
  const [selectedGuideSlugMadinah, setSelectedGuideSlugMadinah] = useState<string | null>(null)
  const [, setGuideSubStep] = useState<1 | 2>(1)
  const [availableGuides, setAvailableGuides] = useState<PublicGuide[]>([])
  const [loadingGuides, setLoadingGuides] = useState(false)
  const [guideDetailSlug, setGuideDetailSlug] = useState<string | null>(null)
  const [guidePickerMode, setGuidePickerMode] = useState(false)
  const guideFetchKey = useRef('')
  const bookingStartedSlug = useRef<string | null>(null)

  // Étape 1
  const [cityChoice, setCityChoice] = useState<CityChoice | null>(null)

  // Étape 2
  const [range, setRange] = useState<DateRange | undefined>()
  const [nbPersonnes, setNbPersonnes] = useState(1)
  const [gender, setGender] = useState<Gender>('MIXTE')
  const [langue, setLangue] = useState('fr')
  const [showAllLangues, setShowAllLangues] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [arrivalPoint, setArrivalPoint] = useState<'JEDDAH' | 'MADINAH' | 'MAKKAH' | ''>('')

  // Étape 3
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([])
  const [transportOption, setTransportOption] = useState<TransportOption>('NONE')
  const [taxiDirection, setTaxiDirection] = useState<'MAKKAH' | 'MADINAH' | null>(null)
  const [localTransportMakkah, setLocalTransportMakkah] = useState<LocalTransportOption>('NONE')
  const [localTransportMadinah, setLocalTransportMadinah] = useState<LocalTransportOption>('NONE')
  const [guideBedProvided, setGuideBedProvided] = useState(false)
  const [visitSubStep, setVisitSubStep] = useState<'MAKKAH' | 'MADINAH' | 'TRANSPORT'>('MAKKAH')
  const [localTransportTab, setLocalTransportTab] = useState<'MAKKAH' | 'MADINAH'>('MAKKAH')
  const [localTransportMadinahSeen, setLocalTransportMadinahSeen] = useState(false)
  const [detailPlace, setDetailPlace] = useState<string | null>(null)

  // Étape 4
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Redirect si non connecté — on préserve l'URL complète (forfait, dates, pair…)
  // pour que le retour post-connexion reprenne exactement où l'utilisateur était.
  useEffect(() => {
    if (status === 'unauthenticated') {
      const qs = searchParams.toString()
      const current = `/espace/checkout/${slug}${qs ? `?${qs}` : ''}`
      router.push(`/connexion?redirect=${encodeURIComponent(current)}`)
    }
  }, [status, slug, router, searchParams])

  useEffect(() => {
    if (!slug || bookingStartedSlug.current === slug) return
    bookingStartedSlug.current = slug
    trackAnalyticsEvent('booking_started', { guideSlug: slug })
  }, [slug])

  useEffect(() => {
    trackAnalyticsEvent('booking_step', {
      guideSlug: slug,
      step,
      cityChoice: cityChoice ?? 'UNSET',
    })
  }, [slug, step, cityChoice])

  useEffect(() => {
    if (searchParams.get('cancelled') === '1') {
      trackAnalyticsEvent('payment_cancelled', { guideSlug: slug })
    }
  }, [searchParams, slug])

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
      if (s.arrivalPoint) setArrivalPoint(s.arrivalPoint)
      if (s.selectedPlaces) setSelectedPlaces(s.selectedPlaces)
      if (s.transportOption) setTransportOption(s.transportOption)
      if (s.taxiDirection) setTaxiDirection(s.taxiDirection)
      if (s.localTransportMakkah) setLocalTransportMakkah(s.localTransportMakkah)
      if (s.localTransportMadinah) setLocalTransportMadinah(s.localTransportMadinah)
      if (typeof s.guideBedProvided === 'boolean') setGuideBedProvided(s.guideBedProvided)
      if (s.localTransportMadinahSeen) setLocalTransportMadinahSeen(true)
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
        nbPersonnes, gender, langue, arrivalPoint, selectedPlaces, transportOption, taxiDirection,
        localTransportMakkah, localTransportMadinah, guideBedProvided, localTransportMadinahSeen, visitSubStep,
        selectedGuideSlug, selectedGuideSlugMadinah,
      }))
    } catch { /* ignore */ }
  }, [slug, step, cityChoice, range, nbPersonnes, gender, langue, arrivalPoint, selectedPlaces, transportOption, taxiDirection, localTransportMakkah, localTransportMadinah, guideBedProvided, localTransportMadinahSeen, visitSubStep, selectedGuideSlug, selectedGuideSlugMadinah])

  // Initialise selectedGuideSlug depuis l'URL
  useEffect(() => {
    if (slug && selectedGuideSlug === null) setSelectedGuideSlug(slug)
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  // Initialise selectedGuideSlugMadinah depuis ?pair= (vient du profil guide)
  useEffect(() => {
    const pairSlug = searchParams.get('pair')
    if (pairSlug && selectedGuideSlugMadinah === null) {
      setSelectedGuideSlugMadinah(pairSlug)
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset sous-étape guide si cityChoice change (sauf si on revient avec ?pair=)
  useEffect(() => {
    setGuideSubStep(1)
    if (!searchParams.get('pair')) setSelectedGuideSlugMadinah(null)
  }, [cityChoice]) // eslint-disable-line react-hooks/exhaustive-deps

  // Place le guide d'origine uniquement dans une ville qu'il dessert réellement.
  useEffect(() => {
    if (!guide || !cityChoice || guide.slug !== slug) return
    if (cityChoice === 'MAKKAH' && guide.servesMakkah === false) {
      setSelectedGuideSlug(null)
    }
    if (cityChoice === 'MADINAH' && guide.servesMadinah === false) {
      setSelectedGuideSlug(null)
    }
    if (cityChoice === 'BOTH' && guide.servesMadinah && !guide.servesMakkah) {
      setSelectedGuideSlug(null)
      setSelectedGuideSlugMadinah(guide.slug)
    }
  }, [cityChoice, guide, slug])

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
        if (Array.isArray(data.placeCatalog)) setPlaceCatalog(data.placeCatalog)
        if (data.pricing) setPricingSettings(data.pricing)
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

  // Fetch guides disponibles à l'entrée de l'étape guide (2 pour BOTH, 4 pour single)
  useEffect(() => {
    const guideStep = cityChoice === 'BOTH' ? 2 : 4
    const fetchKey = [
      step,
      cityChoice,
      langue,
      gender,
      range?.from ? format(range.from, 'yyyy-MM-dd') : '',
      range?.to ? format(range.to, 'yyyy-MM-dd') : '',
      [...selectedPlaces].sort().join(','),
    ].join('-')
    if (step !== guideStep || fetchKey === guideFetchKey.current) return
    guideFetchKey.current = fetchKey
    setLoadingGuides(true)
    const query = new URLSearchParams({
      city: cityChoice || '',
      langue,
      gender,
    })
    if (cityChoice && cityChoice !== 'BOTH' && range?.from) {
      const includedPlaces = placeCatalog.filter(place => place.isActive && place.includedInBase && placeBelongsToCity(place, cityChoice)).map(place => place.key)
      const visitPlaces = [...new Set([...includedPlaces, ...selectedPlaces])]
      const days = calculateLocalCarDays(visitPlaces, cityChoice)
      query.set('startDate', format(range.from, 'yyyy-MM-dd'))
      query.set('endDate', format(addDays(range.from, days - 1), 'yyyy-MM-dd'))
    }
    fetch('/api/guides/available?' + query)
      .then(r => r.json())
      .then(d => setAvailableGuides(d.guides || []))
      .finally(() => setLoadingGuides(false))
  }, [step, cityChoice, langue, gender, range, selectedPlaces, placeCatalog])

  // Auto-switch vers onglet Madinah dès que Makkah local transport est choisi
  useEffect(() => {
    if (localTransportMakkah !== 'NONE' && cityChoice === 'BOTH') {
      setLocalTransportTab('MADINAH')
      setLocalTransportMadinahSeen(true)
    }
  }, [localTransportMakkah, cityChoice])

  useEffect(() => {
    if (cityChoice === 'BOTH' && selectedGuideSlug && selectedGuideSlugMadinah) {
      if (selectedGuideSlug !== selectedGuideSlugMadinah) {
        setTransportOption('NONE')
        setGuideBedProvided(false)
      } else if (transportOption === 'TAXI_ONE') {
        // Une ancienne réservation sauvegardée peut encore contenir l'option
        // aller simple, désormais interdite lorsque le même guide fait les 2 villes.
        setTransportOption('TAXI_RT')
      }
    }
  }, [cityChoice, selectedGuideSlug, selectedGuideSlugMadinah, transportOption])

  // Package de base
  const basePackage = cityChoice ? getPackageForCity(cityChoice) : null
  const baseIncludedPlaces = cityChoice
    ? placeCatalog.filter(place => place.isActive && place.includedInBase && (
        cityChoice === 'BOTH' ? placeBelongsToCity(place, 'MAKKAH') || placeBelongsToCity(place, 'MADINAH') : placeBelongsToCity(place, cityChoice)
      )).map(place => place.key)
    : []
  const bookingPrices = getBookingPrices(pricingSettings.travelMarkupBps)
  const defaultGuidePrice = {
    MAKKAH: centsToEuros(guideServiceRetailCents(DEFAULT_GUIDE_NET_RATES, 'MAKKAH', 6, pricingSettings.guideServiceMarkupBps)),
    MADINAH: centsToEuros(guideServiceRetailCents(DEFAULT_GUIDE_NET_RATES, 'MADINAH', 6, pricingSettings.guideServiceMarkupBps)),
  }

  // Calcul prix — tarif du ou des guides selon la taille du groupe.
  const prixGuideMakkah = cityChoice !== 'MADINAH'
    ? guideRetailPrice(guide, 'MAKKAH', nbPersonnes)
    : 0
  const prixGuideMadinah = cityChoice !== 'MAKKAH'
    ? guideRetailPrice(cityChoice === 'BOTH' ? guideDataMadinah : guide, 'MADINAH', nbPersonnes)
    : 0
  const prixBase = prixGuideMakkah + prixGuideMadinah || (
    cityChoice === 'BOTH' ? defaultGuidePrice.MAKKAH + defaultGuidePrice.MADINAH
      : cityChoice ? defaultGuidePrice[cityChoice] : 0
  )
  const extraPlaces = selectedPlaces.filter(pk => !baseIncludedPlaces.includes(pk))
  const placeTier = nbPersonnes <= 6 ? 'upTo6' : nbPersonnes <= 15 ? 'upTo15' : 'upTo32'
  const displayPlacePrices = Object.fromEntries(placeCatalog.map(place => [place.key, centsToEuros(place.retailCents[placeTier])]))
  const prixLieux = extraPlaces.reduce((sum, key) => sum + (displayPlacePrices[key] ?? 0), 0)
  const allVisitPlaces = [...new Set([...baseIncludedPlaces, ...selectedPlaces])]
  const sameGuideForBothCities = cityChoice === 'BOTH' && !!selectedGuideSlug && selectedGuideSlug === selectedGuideSlugMadinah
  const primaryCityRaw = sameGuideForBothCities ? String(guide?.city || '').toUpperCase() : ''
  const sameGuidePrimaryCity = primaryCityRaw.includes('MADINAH') || primaryCityRaw.includes('MEDINE') || primaryCityRaw.includes('MÉDINE')
    ? 'MADINAH' as const
    : primaryCityRaw.includes('MAKKAH') || primaryCityRaw.includes('MECQUE')
      ? 'MAKKAH' as const
      : null
  const transportPricing = cityChoice
    ? calculateBookingTransportPrice({
        cityChoice,
        nbPeople: nbPersonnes,
        selectedPlaces: allVisitPlaces,
        transportOption,
        localTransportMakkah,
        localTransportMadinah,
        sameGuideForBothCities,
        sameGuidePrimaryCity,
        guideBedProvided,
        travelMarkupBps: pricingSettings.travelMarkupBps,
      })
    : {
        intercity: 0,
        localCarMakkah: 0,
        localCarMadinah: 0,
        localCar: 0,
        intercityNet: 0,
        localCarNetMakkah: 0,
        localCarNetMadinah: 0,
        localCarNet: 0,
        makkahDays: calculateLocalCarDays(allVisitPlaces, 'MAKKAH'),
        madinahDays: calculateLocalCarDays(allVisitPlaces, 'MADINAH'),
        localVehicle: { dailyRate: bookingPrices.localCarPerDay, netDailyRate: 45, vehicle: 'CAR' as const, label: 'Voiture privée' },
        guideHotelNights: 0,
        guideHotel: 0,
        guideHotelNet: 0,
      }
  const prixTransport = transportPricing.intercity
  const daysMakkah = transportPricing.makkahDays
  const daysMadinah = transportPricing.madinahDays
  const prixVoitureMakkah = transportPricing.localCarMakkah
  const prixVoitureMadinah = transportPricing.localCarMadinah
  const prixVoiture = transportPricing.localCar
  const prixHotelGuide = transportPricing.guideHotel
  const total = prixBase + prixLieux + prixTransport + prixVoiture + prixHotelGuide

  // Lieux supplémentaires par ville — historiques fusionnés dans la bonne ville
  const getAvailablePlacesByCity = (city: 'MAKKAH' | 'MADINAH'): Place[] => {
    return placeCatalog.filter(p => {
      if (!p.isActive) return false
      if (p.includedInBase) return false
      if (activePlaces.length > 0 && !activePlaces.includes(p.key)) return false
      return placeBelongsToCity(p, city)
    })
  }

  const togglePlace = (pk: string) =>
    setSelectedPlaces(prev =>
      prev.includes(pk) ? prev.filter(p => p !== pk) : [...prev, pk]
    )

  const validateBothGuideAvailability = async (): Promise<boolean> => {
    if (
      cityChoice !== 'BOTH' ||
      !range?.from ||
      !selectedGuideSlug ||
      !selectedGuideSlugMadinah
    ) return false

    const cityOrder: Array<'MAKKAH' | 'MADINAH'> = arrivalPoint === 'MAKKAH'
      ? ['MAKKAH', 'MADINAH']
      : ['MADINAH', 'MAKKAH']
    let missionStart = range.from
    const missions = cityOrder.map(city => {
      const days = city === 'MAKKAH' ? daysMakkah : daysMadinah
      const mission = {
        city,
        slug: city === 'MAKKAH' ? selectedGuideSlug : selectedGuideSlugMadinah,
        startDate: missionStart,
        endDate: addDays(missionStart, days - 1),
      }
      missionStart = addDays(mission.endDate, 1)
      return mission
    })

    if (range.to && missions.at(-1)!.endDate > range.to) {
      setError('La durée du séjour est trop courte pour les visites sélectionnées.')
      return false
    }

    setCheckingAvailability(true)
    setError('')
    try {
      const results = await Promise.all(missions.map(async mission => {
        const response = await fetch('/api/guides/available?' + new URLSearchParams({
          city: mission.city,
          langue,
          gender,
          startDate: format(mission.startDate, 'yyyy-MM-dd'),
          endDate: format(mission.endDate, 'yyyy-MM-dd'),
        }))
        if (!response.ok) return false
        const data = await response.json()
        return Array.isArray(data.guides) && data.guides.some((item: { slug?: string }) => item.slug === mission.slug)
      }))

      if (results.every(Boolean)) return true
      setError('Un guide n’est plus disponible sur les dates de visite. Choisissez à nouveau votre ou vos guides.')
      setGuideSubStep(1)
      setStep(2)
      return false
    } catch {
      setError('Impossible de vérifier les disponibilités. Réessayez dans un instant.')
      return false
    } finally {
      setCheckingAvailability(false)
    }
  }

  // Soumission — redirige vers Stripe Checkout
  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    trackAnalyticsEvent('begin_checkout', {
      guideSlug: selectedGuideSlug || slug,
      cityChoice: cityChoice ?? 'UNSET',
      amountCents: Math.round(total * 100),
    })
    try {
      const res = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideSlug: slug,
          cityChoice,
          departDate: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
          returnDate: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
          nbPersonnes,
          gender,
          langue,
          arrivalPoint,
          selectedPlaces,
          transportOption,
          taxiDirection,
          localTransportMakkah,
          localTransportMadinah,
          guideBedProvided,
          totalPrice: total,
          packageName: basePackage?.name,
          selectedGuideSlug,
          selectedGuideSlugMadinah,
          analyticsSessionId: getAnalyticsSessionId(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      try { localStorage.removeItem(`safaruna_checkout_${slug}`) } catch { /* ignore */ }
      window.location.href = data.sessionUrl
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur lors de la préparation du paiement'
      trackAnalyticsEvent('checkout_error', {
        guideSlug: selectedGuideSlug || slug,
        message: message.slice(0, 160),
      })
      setError(message)
      setSubmitting(false)
    }
  }

  // ── Barre de progression ──────────────────────
  const STEPS = cityChoice === 'BOTH' ? STEPS_BOTH : STEPS_SINGLE
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
    <>
      <style>{`
        .safaruna-next-btn {
          position: relative; overflow: hidden;
          transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
        }
        .safaruna-next-btn:not(:disabled):hover {
          background: #2D1F08 !important;
          box-shadow: 0 6px 24px rgba(26,18,9,0.35);
          transform: translateY(-1px);
        }
        .safaruna-next-btn:not(:disabled):active {
          transform: scale(0.97) translateY(0);
          box-shadow: 0 2px 8px rgba(26,18,9,0.2);
        }
        .safaruna-next-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -75%;
          width: 50%; height: 100%;
          background: linear-gradient(120deg, transparent 0%, rgba(240,216,151,0.18) 50%, transparent 100%);
          transform: skewX(-20deg);
          transition: none;
        }
        .safaruna-next-btn:not(:disabled):hover::after {
          left: 125%;
          transition: left 0.55s ease;
        }
      `}</style>
      <button
        onClick={onClick}
        disabled={disabled}
        className="safaruna-next-btn"
        style={{
          width: '100%', padding: '1rem',
          background: disabled ? '#E8DFC8' : '#1A1209',
          color: disabled ? '#7A6D5A' : '#F0D897',
          border: 'none', borderRadius: 50,
          fontFamily: 'inherit', fontWeight: 700, fontSize: '0.95rem',
          cursor: disabled ? 'not-allowed' : 'pointer', marginTop: '2rem',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </button>
    </>
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
            <button
              onClick={() => router.back()}
              style={{ background: 'none', border: 'none', color: '#7A6D5A', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.25rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              ← Retour
            </button>
            {/* Header compact */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 600, color: '#1A1209', marginBottom: '0.25rem', lineHeight: 1.2 }}>
                Planifier votre voyage
              </h1>
              <p style={{ color: '#9A8A7A', fontSize: '0.82rem', margin: 0 }}>
                Sélectionnez votre destination spirituelle
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1rem' }}>

              {/* ── CARTE MAKKAH ── */}
              <div
                onClick={() => setCityChoice('MAKKAH')}
                style={{
                  background: cityChoice === 'MAKKAH'
                    ? 'linear-gradient(135deg, #FFF8E7 0%, #FEF3C7 100%)'
                    : 'white',
                  border: cityChoice === 'MAKKAH' ? '2px solid #C9A84C' : '1.5px solid #E8DFC8',
                  borderRadius: 14, padding: '0.875rem 1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  transition: 'all 0.15s',
                  boxShadow: cityChoice === 'MAKKAH' ? '0 4px 16px rgba(201,168,76,0.2)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Accent bar */}
                <div style={{ width: 4, height: 44, borderRadius: 2, background: 'linear-gradient(180deg, #C9A84C, #8B6914)', flexShrink: 0 }} />
                {/* Emoji */}
                <div style={{ fontSize: '1.75rem', flexShrink: 0, lineHeight: 1 }}>🕋</div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 700, color: '#8B6914', lineHeight: 1.2 }}>
                    Omra — Makkah
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: '0.15rem', lineHeight: 1.4 }}>
                    Ihram · Tawaf · Sa&apos;i · Lieux saints
                  </div>
                </div>
                {/* Price + radio */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#C9A84C' }}>{defaultGuidePrice.MAKKAH}€</div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${cityChoice === 'MAKKAH' ? '#C9A84C' : '#D4C5A5'}`, background: cityChoice === 'MAKKAH' ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cityChoice === 'MAKKAH' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                </div>
              </div>

              {/* ── CARTE MADINAH ── */}
              <div
                onClick={() => setCityChoice('MADINAH')}
                style={{
                  background: cityChoice === 'MADINAH'
                    ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)'
                    : 'white',
                  border: cityChoice === 'MADINAH' ? '2px solid #27AE60' : '1.5px solid #E8DFC8',
                  borderRadius: 14, padding: '0.875rem 1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  transition: 'all 0.15s',
                  boxShadow: cityChoice === 'MADINAH' ? '0 4px 16px rgba(29,92,58,0.18)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ width: 4, height: 44, borderRadius: 2, background: 'linear-gradient(180deg, #27AE60, #1D5C3A)', flexShrink: 0 }} />
                <div style={{ fontSize: '1.75rem', flexShrink: 0, lineHeight: 1 }}>🌿</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 700, color: '#1D5C3A', lineHeight: 1.2 }}>
                    Découverte — Madinah
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: '0.15rem', lineHeight: 1.4 }}>
                    Masjid An-Nabawi · La Rawdah · Sites historiques
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#27AE60' }}>{defaultGuidePrice.MADINAH}€</div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${cityChoice === 'MADINAH' ? '#27AE60' : '#D4C5A5'}`, background: cityChoice === 'MADINAH' ? '#27AE60' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cityChoice === 'MADINAH' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                </div>
              </div>

              {/* ── CARTE BOTH ── */}
              <div
                onClick={() => setCityChoice('BOTH')}
                style={{
                  background: cityChoice === 'BOTH'
                    ? 'linear-gradient(135deg, #FFF8E7 0%, #F0FDF4 100%)'
                    : 'linear-gradient(135deg, #FFFDF7 0%, #F8FDF9 100%)',
                  border: cityChoice === 'BOTH'
                    ? '2px solid transparent'
                    : '1.5px solid #E8DFC8',
                  backgroundClip: 'padding-box',
                  borderRadius: 14, padding: '0.875rem 1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
                  boxShadow: cityChoice === 'BOTH'
                    ? '0 0 0 2px transparent, 0 4px 16px rgba(201,168,76,0.15), 0 4px 16px rgba(29,92,58,0.1)'
                    : '0 1px 4px rgba(0,0,0,0.04)',
                  outline: cityChoice === 'BOTH' ? '2px solid #C9A84C' : 'none',
                }}
              >
                {/* Dual accent bars */}
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <div style={{ width: 3, height: 44, borderRadius: 2, background: 'linear-gradient(180deg, #C9A84C, #8B6914)' }} />
                  <div style={{ width: 3, height: 44, borderRadius: 2, background: 'linear-gradient(180deg, #27AE60, #1D5C3A)' }} />
                </div>

                {/* Emojis */}
                <div style={{ display: 'flex', gap: '0.1rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>🕋</span>
                  <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>🌿</span>
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                    <span style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 700, color: '#1A1209', lineHeight: 1.2 }}>
                      Les deux villes
                    </span>
                    <span style={{ fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.1em', background: 'linear-gradient(135deg, #C9A84C, #8B6914)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: 50, textTransform: 'uppercase' }}>★ Recommandé</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 50, background: 'rgba(201,168,76,0.12)', color: '#8B6914', border: '1px solid rgba(201,168,76,0.25)' }}>🕋 Omra Makkah</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: 50, background: 'rgba(29,92,58,0.09)', color: '#1D5C3A', border: '1px solid rgba(29,92,58,0.2)' }}>🌿 Al-Madinah</span>
                  </div>
                </div>

                {/* Price + radio */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#8B6914', lineHeight: 1 }}>{defaultGuidePrice.MAKKAH + defaultGuidePrice.MADINAH}€</div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${cityChoice === 'BOTH' ? '#C9A84C' : '#D4C5A5'}`, background: cityChoice === 'BOTH' ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cityChoice === 'BOTH' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                </div>
              </div>

            </div>

            {/* Compact tip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FAF8F0', borderRadius: 10, padding: '0.6rem 0.875rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>💡</span>
              <span style={{ fontSize: '0.72rem', color: '#7A6D5A', lineHeight: 1.5 }}>
                Besoin de conseil ?{' '}
                <a href="https://wa.me/message/3LAXCIZV7FFEK1" target="_blank" rel="noreferrer" style={{ color: '#25D366', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', verticalAlign: 'middle' }}>
                  Contactez-nous
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L0 24l6.335-1.54C8.03 23.447 9.977 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.897 0-3.67-.515-5.188-1.408l-.372-.22-3.76.914.952-3.659-.242-.376C2.521 15.67 2 13.9 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </a>
              </span>
            </div>

            {nextBtn('Continuer', () => setStep(2), !cityChoice)}
          </div>
        )}

        {/* ── ÉTAPE 2 (single) / 3 (BOTH) — DATES & PROFIL ── */}
        {((step === 2 && cityChoice !== 'BOTH') || (step === 3 && cityChoice === 'BOTH')) && (
          <div>
            {backBtn(step - 1)}
            <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 400, color: '#1A1209', marginBottom: '1rem' }}>
              Votre voyage
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Range picker dates */}
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>
                  Dates du séjour *
                </label>

                {/* Affichage de la sélection — clic pour ouvrir/fermer le calendrier */}
                <div
                  onClick={() => setShowCalendar(c => !c)}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: showCalendar ? 10 : 0, cursor: 'pointer' }}
                >
                  <div style={{ background: '#FAF7F0', border: range?.from ? '1.5px solid #C9A84C' : '1px solid #E8DFC8', borderRadius: 10, padding: '8px 12px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 2 }}>Arrivée</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: range?.from ? '#1A1209' : '#C9A84C' }}>
                      {range?.from ? format(range.from, 'd MMM yyyy', { locale: frLocale }) : 'Choisir'}
                    </div>
                  </div>
                  <div style={{ background: '#FAF7F0', border: range?.to ? '1.5px solid #C9A84C' : '1px solid #E8DFC8', borderRadius: 10, padding: '8px 12px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: 2 }}>Départ</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: range?.to ? '#1A1209' : '#C9A84C' }}>
                      {range?.to ? format(range.to, 'd MMM yyyy', { locale: frLocale }) : 'Choisir'}
                    </div>
                  </div>
                </div>

                {/* Durée calculée */}
                {range?.from && range?.to && !showCalendar && (
                  <div style={{ fontSize: 11, color: '#8B6914', background: 'rgba(201,168,76,.1)', borderRadius: 50, padding: '3px 10px', display: 'inline-block', marginTop: 6 }}>
                    {differenceInDays(range.to, range.from)} nuits · <span style={{ color: '#7A6D5A' }}>Modifier</span>
                  </div>
                )}

                {/* Calendrier — affiché uniquement si showCalendar */}
                {showCalendar && (
                  <div style={{ border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden' }}>
                    <DayPicker
                      mode="range"
                      selected={range}
                      onSelect={(r) => { setRange(r); if (r?.from && r?.to) setShowCalendar(false) }}
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
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>
                  Point d’arrivée *
                </label>
                <select value={arrivalPoint} onChange={event => setArrivalPoint(event.target.value as typeof arrivalPoint)} style={{ width: '100%', padding: '0.7rem 0.875rem', border: '1.5px solid #E8DFC8', borderRadius: 10, background: 'white', color: '#1A1209', fontFamily: 'inherit', fontSize: '0.85rem' }}>
                  <option value="">Rechercher ou sélectionner</option>
                  <option value="JEDDAH">Aéroport de Jeddah</option>
                  <option value="MADINAH">Médine</option>
                  <option value="MAKKAH">Makkah</option>
                </select>
                {cityChoice === 'BOTH' && (arrivalPoint === 'JEDDAH' || arrivalPoint === 'MADINAH') && (
                  <div style={{ marginTop: '0.5rem', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#166534', borderRadius: 8, padding: '0.6rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    Votre accompagnement commencera à Médine, puis à Makkah.
                  </div>
                )}
                {(arrivalPoint === 'MAKKAH' || (arrivalPoint === 'JEDDAH' && cityChoice === 'MAKKAH')) && (
                  <div style={{ marginTop: '0.5rem', background: '#FEE2E2', border: '1px solid #DC2626', color: '#991B1B', borderRadius: 8, padding: '0.65rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    Attention : mettez votre Ihram dans l’avion ou rendez-vous au Miqat le plus proche avant la Omra.
                  </div>
                )}
              </div>

              {/* Nb personnes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>
                  Nombre de personnes *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E8DFC8', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
                  <button onClick={() => setNbPersonnes(n => Math.max(1, n - 1))} style={{ width: 44, height: 44, border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#1A1209', fontFamily: 'inherit' }}>−</button>
                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', color: '#1A1209', borderLeft: '1px solid #E8DFC8', borderRight: '1px solid #E8DFC8', padding: '0.6rem 0' }}>
                    {nbPersonnes} {nbPersonnes === 1 ? 'personne' : 'personnes'}
                  </div>
                  <button onClick={() => setNbPersonnes(n => Math.min(32, n + 1))} style={{ width: 44, height: 44, border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#1A1209', fontFamily: 'inherit' }}>+</button>
                </div>
              </div>

              {/* Genre */}
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>
                  Profil du groupe
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['HOMME', 'FEMME', 'MIXTE'] as Gender[]).map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      style={{ flex: 1, padding: '0.6rem 0.5rem', border: gender === g ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 10, background: gender === g ? 'rgba(201,168,76,0.08)' : 'white', color: gender === g ? '#8B6914' : '#7A6D5A', fontWeight: gender === g ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <GenderIcon type={g} />
                      {g === 'HOMME' ? 'Homme' : g === 'FEMME' ? 'Femme' : 'Mixte'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Langue */}
              <div>
                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.4rem' }}>
                  Langue préférée
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {LANGUES.slice(0, 2).map(l => (
                    <button
                      key={l.code}
                      onClick={() => setLangue(l.code)}
                      style={{ padding: '0.45rem 0.875rem', border: langue === l.code ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 50, background: langue === l.code ? 'rgba(201,168,76,0.08)' : 'white', color: langue === l.code ? '#8B6914' : '#7A6D5A', fontWeight: langue === l.code ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <FlagIcon code={l.code} />
                      {l.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowAllLangues(true)}
                    style={{ padding: '0.45rem 0.875rem', border: !['fr', 'ar'].includes(langue) ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 50, background: !['fr', 'ar'].includes(langue) ? 'rgba(201,168,76,0.08)' : 'white', color: !['fr', 'ar'].includes(langue) ? '#8B6914' : '#7A6D5A', fontWeight: !['fr', 'ar'].includes(langue) ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    {!['fr', 'ar'].includes(langue)
                      ? `✓ ${LANGUES.find(l => l.code === langue)?.label ?? langue}`
                      : 'Langues ▾'}
                  </button>
                </div>
              </div>
            </div>

            {nextBtn('Continuer', () => setStep(step + 1), !range?.from || !range?.to || !arrivalPoint)}
          </div>
        )}

        {/* ── ÉTAPE 3 (single) / 4 (BOTH) — LIEUX DE VISITE ── */}
        {((step === 3 && cityChoice !== 'BOTH') || (step === 4 && cityChoice === 'BOTH')) && (() => {
          // Sous-étape Makkah ou Madinah : back logic
          const handleBack3 = () => {
            if (visitSubStep === 'MAKKAH') return setStep(step - 1)
            if (visitSubStep === 'MADINAH') return cityChoice === 'BOTH' ? setVisitSubStep('MAKKAH') : setStep(step - 1)
            if (visitSubStep === 'TRANSPORT') return setVisitSubStep('MADINAH')
          }
          const handleNext3 = async () => {
            if (visitSubStep === 'MAKKAH' && cityChoice === 'BOTH') return setVisitSubStep('MADINAH')
            if (visitSubStep === 'MAKKAH') return setStep(step + 1)
            if (visitSubStep === 'MADINAH' && cityChoice === 'BOTH') return setVisitSubStep('TRANSPORT')
            if (visitSubStep === 'MADINAH') return setStep(step + 1)
            if (visitSubStep === 'TRANSPORT') {
              if (await validateBothGuideAvailability()) setStep(step + 1)
            }
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
          const CarSelector = ({ city, value, onChange }: { city: 'MAKKAH' | 'MADINAH', value: LocalTransportOption, onChange: (v: LocalTransportOption) => void }) => {
            const days = calculateLocalCarDays(allVisitPlaces, city)
            const carPrice = days * transportPricing.localVehicle.dailyRate
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {/* Taxi */}
                <div onClick={() => onChange('TAXI')} style={{ background: value === 'TAXI' ? 'rgba(201,168,76,0.06)' : 'white', border: value === 'TAXI' ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #C9A84C', flexShrink: 0, background: value === 'TAXI' ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {value === 'TAXI' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>🚕 Taxi à la course</div>
                    <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>Les courses du guide pendant les visites sont à votre charge et se règlent sur place.</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#7A6D5A' }}>0€</div>
                </div>
                {/* Voiture privée */}
                <div onClick={() => onChange('CAR')} style={{ background: value === 'CAR' ? 'rgba(201,168,76,0.06)' : 'white', border: value === 'CAR' ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #C9A84C', flexShrink: 0, background: value === 'CAR' ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {value === 'CAR' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>🚗 {transportPricing.localVehicle.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>
                      {days} jour{days > 1 ? 's' : ''} estimé{days > 1 ? 's' : ''} selon vos visites
                      <span style={{ color: '#C9A84C', fontWeight: 600 }}> · {transportPricing.localVehicle.dailyRate}€/jour</span>
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
                  <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.9rem', fontWeight: 600, color: '#8B6914', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🕋 Visites à Makkah
                  </h2>
                  <p style={{ color: '#7A6D5A', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    Votre package inclut les essentiels. Ajoutez des visites supplémentaires.
                  </p>

                  {/* Inclus */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(255,251,235,0.95), rgba(255,248,220,0.9))', border: '1.5px solid rgba(201,168,76,0.35)', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(201,168,76,0.1)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B6914', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>✓ Inclus dans votre package</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {baseIncludedPlaces.filter(pk => placeCatalog.find(p => p.key === pk && placeBelongsToCity(p, 'MAKKAH'))).map(pk => {
                        const place = placeCatalog.find(p => p.key === pk)
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
                    prices={displayPlacePrices}
                    onDetail={setDetailPlace}
                  />
                </div>
              )}

              {/* ── 3b : Visites Madinah ── */}
              {(visitSubStep === 'MADINAH') && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.9rem', fontWeight: 600, color: '#1D5C3A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🌿 Visites à Madinah
                  </h2>
                  <p style={{ color: '#7A6D5A', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                    Ajoutez des ziyarat supplémentaires à Madinah.
                  </p>

                  {/* Inclus (si MADINAH ou BOTH) */}
                  {baseIncludedPlaces.some(pk => placeCatalog.find(p => p.key === pk && placeBelongsToCity(p, 'MADINAH'))) && (
                    <div style={{ background: 'linear-gradient(135deg, rgba(236,253,245,0.95), rgba(220,252,231,0.9))', border: '1.5px solid rgba(29,92,58,0.25)', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(29,92,58,0.08)' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1D5C3A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>✓ Inclus dans votre package</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {baseIncludedPlaces.filter(pk => placeCatalog.find(p => p.key === pk && placeBelongsToCity(p, 'MADINAH'))).map(pk => {
                          const place = placeCatalog.find(p => p.key === pk)
                          return place ? <span key={pk} style={{ background: 'rgba(29,92,58,0.1)', color: '#1D5C3A', fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: 50, border: '1px solid rgba(29,92,58,0.2)' }}>{place.emoji} {place.nameFr}</span> : null
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
                    prices={displayPlacePrices}
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

                  {/* Header transport intercité */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: 3, height: 28, borderRadius: 2, background: 'linear-gradient(180deg, #C9A84C, #8B6914)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B6914' }}>Intercité</div>
                      <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 600, color: '#1A1209' }}>Transport La Mecque · Médine</div>
                    </div>
                  </div>

                  {/* Options principale */}
                  {!sameGuideForBothCities ? (
                    <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '1rem 1.25rem', color: '#166534', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                      Vous avez choisi un guide différent dans chaque ville : aucun transport ni hôtel de guide supplémentaire n’est facturé.
                    </div>
                  ) : ([
                    { key: 'TRAIN' as TransportOption, title: '🚄 Train Haramayn', desc: 'Billet aller-retour du guide uniquement · Vous prenez vos propres billets sur place', price: `+${bookingPrices.trainRoundTrip}€` },
                    { key: 'TAXI_RT' as TransportOption, title: '🚗 Voiture privée', desc: 'Aller-retour obligatoire du guide entre Makkah et Médine', price: '', perPerson: '' },
                  ] as { key: TransportOption; title: string; desc: string; price: string; perPerson?: string }[]).map(opt => {
                    const isTaxi = opt.key === 'TAXI_RT'
                    const taxiActive = isTaxi && transportOption === 'TAXI_RT'
                    const isActive = taxiActive || transportOption === opt.key
                    return (
                      <div key={opt.key}>
                        <div
                          onClick={() => {
                            if (isTaxi) { setTransportOption('TAXI_RT'); setTaxiDirection(null) }
                            else setTransportOption(opt.key)
                          }}
                          style={{ background: isActive ? 'rgba(201,168,76,0.06)' : 'white', border: isActive ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: taxiActive ? '12px 12px 0 0' : 12, padding: '1rem 1.25rem', cursor: 'pointer', marginBottom: taxiActive ? 0 : '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                        >
                          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #C9A84C', flexShrink: 0, background: isActive ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>{opt.title}</div>
                            <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>{opt.desc}</div>
                          </div>
                          {!isTaxi && (
                            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: opt.key === 'NONE' ? '#7A6D5A' : '#C9A84C' }}>{opt.price}</div>
                          )}
                        </div>

                        {/* Sous-flow taxi : aller-retour / aller simple */}
                        {taxiActive && (
                          <div style={{ border: '2px solid #C9A84C', borderTop: 'none', borderRadius: '0 0 12px 12px', background: 'rgba(201,168,76,0.03)', padding: '1rem 1.25rem', marginBottom: '0.5rem' }}>
                            {/* Aller-retour */}
                            <div
                              onClick={() => { setTransportOption('TAXI_RT'); setTaxiDirection(null) }}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 8, cursor: 'pointer', background: transportOption === 'TAXI_RT' ? 'rgba(201,168,76,0.08)' : 'transparent', marginBottom: '0.35rem' }}
                            >
                              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #C9A84C', flexShrink: 0, background: transportOption === 'TAXI_RT' ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {transportOption === 'TAXI_RT' && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white' }} />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1A1209' }}>Aller-retour</div>
                                <div style={{ fontSize: '0.68rem', color: '#7A6D5A' }}>Makkah ↔ Madinah · forfait groupe</div>
                              </div>
                              <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#C9A84C' }}>+{bookingPrices.taxiRoundTrip}€</div>
                            </div>

                          </div>
                        )}
                      </div>
                    )
                  })}

                  {sameGuideForBothCities && (
                    <div style={{ marginTop: '1rem', background: '#FAF8F0', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1A1209' }}>Hébergement du guide hors de sa ville principale</div>
                      <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 3 }}>
                        {transportPricing.guideHotelNights} nuit(s) estimée(s) · {bookingPrices.guideHotelPerNight} €/nuit
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.8rem', cursor: 'pointer', fontSize: '0.78rem', color: '#4A3F30' }}>
                        <input type="checkbox" checked={guideBedProvided} onChange={event => setGuideBedProvided(event.target.checked)} />
                        J’ajoute un lit pour le guide à ma réservation d’hôtel
                      </label>
                      <div style={{ marginTop: '0.65rem', fontWeight: 700, color: '#C9A84C', fontSize: '0.85rem' }}>
                        {guideBedProvided ? '0 € — lit fourni' : `${prixHotelGuide} €`}
                      </div>
                    </div>
                  )}

                  {/* Transport local — toggle Makkah / Madinah */}
                  <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ width: 3, height: 24, borderRadius: 2, background: 'linear-gradient(180deg, #C9A84C, #8B6914)', flexShrink: 0 }} />
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B6914' }}>
                        Transport pour les visites locales
                      </div>
                    </div>

                    {/* Toggle avec indicateurs visuels */}
                    {cityChoice === 'BOTH' ? (
                      <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem' }}>
                        {/* Tab Makkah */}
                        <button
                          onClick={() => setLocalTransportTab('MAKKAH')}
                          style={{
                            flex: 1, padding: '0.65rem 0.75rem', borderRadius: 10, border: localTransportTab === 'MAKKAH' ? '2px solid #C9A84C' : '1.5px solid #E8DFC8',
                            background: localTransportTab === 'MAKKAH' ? 'rgba(201,168,76,0.07)' : 'white',
                            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: localTransportTab === 'MAKKAH' ? '#1A1209' : '#7A6D5A' }}>🕋 La Mecque</span>
                          {localTransportMakkah !== 'NONE'
                            ? <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#1D5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'white', fontWeight: 900, flexShrink: 0 }}>✓</span>
                            : <span style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #E8DFC8', flexShrink: 0 }} />
                          }
                        </button>

                        {/* Tab Madinah — grisé jusqu'à Makkah choisi */}
                        <button
                          onClick={() => {
                            if (localTransportMakkah === 'NONE') return
                            setLocalTransportTab('MADINAH')
                            setLocalTransportMadinahSeen(true)
                          }}
                          disabled={localTransportMakkah === 'NONE'}
                          style={{
                            flex: 1, padding: '0.65rem 0.75rem', borderRadius: 10, border: localTransportTab === 'MADINAH' ? '2px solid #1D5C3A' : '1.5px solid #E8DFC8',
                            background: localTransportTab === 'MADINAH' ? 'rgba(29,92,58,0.07)' : 'white',
                            cursor: localTransportMakkah === 'NONE' ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                            opacity: localTransportMakkah === 'NONE' ? 0.4 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: localTransportTab === 'MADINAH' ? '#1A1209' : '#7A6D5A' }}>🌿 Médine</span>
                          {localTransportMadinah !== 'NONE'
                            ? <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#1D5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'white', fontWeight: 900, flexShrink: 0 }}>✓</span>
                            : <span style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px dashed #C9A84C', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.55rem', color: '#C9A84C', fontWeight: 700 }}>!</span>
                              </span>
                          }
                        </button>
                      </div>
                    ) : (
                      /* Ville unique — pas de toggle */
                      <div style={{ marginBottom: '1rem' }} />
                    )}

                    {/* Choix voiture selon ville active */}
                    {(cityChoice === 'MADINAH' || (cityChoice === 'BOTH' && localTransportTab === 'MADINAH'))
                      ? <CarSelector city="MADINAH" value={localTransportMadinah} onChange={(v) => { setLocalTransportMadinah(v); setLocalTransportMadinahSeen(true) }} />
                      : <CarSelector city="MAKKAH" value={localTransportMakkah} onChange={setLocalTransportMakkah} />
                    }

                    {/* Hint si Madinah non encore vu */}
                    {cityChoice === 'BOTH' && localTransportMakkah !== 'NONE' && !localTransportMadinahSeen && (
                      <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.875rem', background: 'rgba(201,168,76,0.08)', border: '1px solid #C9A84C', borderRadius: 8, fontSize: '0.75rem', color: '#8B6914', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ↑ Choisissez aussi le transport pour vos visites à Médine
                      </div>
                    )}

                    {/* Récap sélections */}
                    {(localTransportMakkah !== 'NONE' || localTransportMadinah !== 'NONE') && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#FAF8F0', border: '1px solid #E8DFC8', borderRadius: 10, fontSize: '0.75rem', color: '#4A3F30' }}>
                        {localTransportMakkah !== 'NONE' && (
                          <div>🕋 Makkah : {localTransportMakkah === 'TAXI' ? 'Taxi public — courses du guide à régler sur place' : `${transportPricing.localVehicle.label} — ${daysMakkah} jour(s) · +${prixVoitureMakkah}€`}</div>
                        )}
                        {localTransportMadinah !== 'NONE' && (
                          <div style={{ marginTop: localTransportMakkah !== 'NONE' ? '0.35rem' : 0 }}>🌿 Madinah : {localTransportMadinah === 'TAXI' ? 'Taxi public — courses du guide à régler sur place' : `${transportPricing.localVehicle.label} — ${daysMadinah} jour(s) · +${prixVoitureMadinah}€`}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Drawer détail lieu */}
              {detailPlace && (() => {
                const place = placeCatalog.find(p => p.key === detailPlace)
                const isSelected = selectedPlaces.includes(detailPlace)
                const prix = place ? displayPlacePrices[place.key] : 0
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
                            <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.5rem', fontWeight: 700, color: '#C9A84C' }}>+{prix}€ <span style={{ fontSize: '0.75rem', color: '#7A6D5A', fontFamily: 'inherit', fontWeight: 400 }}>/ groupe</span></div>
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
                          href={`/lieux-saints/${PLACE_PAGE_SLUG[place.key] ?? place.key}`}
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

              {nextBtn(checkingAvailability ? 'Vérification…' : 'Continuer', handleNext3,
                (visitSubStep === 'TRANSPORT' && sameGuideForBothCities && transportOption === 'NONE') ||
                (visitSubStep === 'TRANSPORT' && cityChoice === 'BOTH' && !localTransportMadinahSeen) ||
                checkingAvailability
              )}
            </div>
          )
        })()}

        {/* ── ÉTAPE 2 (BOTH) / 4 (single) — VOTRE / VOS GUIDES ── */}
        {((step === 2 && cityChoice === 'BOTH') || (step === 4 && cityChoice !== 'BOTH')) && (() => {
          // Prochain slot à remplir (BOTH uniquement)
          const nextSlot: 'MAKKAH' | 'MADINAH' | null = cityChoice !== 'BOTH' ? null
            : !selectedGuideSlug ? 'MAKKAH'
            : !selectedGuideSlugMadinah ? 'MADINAH'
            : null

          const handleChoose = (slug: string) => {
            const candidate = availableGuides.find(item => item.slug === slug)
            if (nextSlot && !candidate?.serviceCities?.includes(nextSlot)) return
            if (cityChoice !== 'BOTH') { setSelectedGuideSlug(slug); return }
            if (!selectedGuideSlug) { setSelectedGuideSlug(slug); return }
            if (!selectedGuideSlugMadinah) { setSelectedGuideSlugMadinah(slug); return }
            // Les deux sont remplis — remplace Madinah par défaut
            setSelectedGuideSlugMadinah(slug)
          }

          const drawerGuide = guideDetailSlug ? availableGuides.find(g => g.slug === guideDetailSlug) : null
          const makkahGuideValid = !!selectedGuideSlug && availableGuides.some(item =>
            item.slug === selectedGuideSlug && item.serviceCities?.includes('MAKKAH')
          )
          const madinahGuideValid = !!selectedGuideSlugMadinah && availableGuides.some(item =>
            item.slug === selectedGuideSlugMadinah && item.serviceCities?.includes('MADINAH')
          )
          const bothDone = cityChoice === 'BOTH' && makkahGuideValid && madinahGuideValid
          const singleGuideValid = !!selectedGuideSlug && availableGuides.some(item => item.slug === selectedGuideSlug)
          const canContinue = cityChoice === 'BOTH' ? bothDone : singleGuideValid
          const continueFromGuideStep = () => {
            if (cityChoice !== 'BOTH' && range?.from && range.to) {
              const missionDays = cityChoice === 'MAKKAH' ? daysMakkah : daysMadinah
              if (addDays(range.from, missionDays - 1) > range.to) {
                setError('La durée du séjour est trop courte pour les visites sélectionnées.')
                return
              }
            }
            setError('')
            setStep(step + 1)
          }

          return (
            <div>
              {/* ── Drawer fiche guide ── */}
              {drawerGuide && (
                <>
                  <div onClick={() => setGuideDetailSlug(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50 }} />
                  <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '20px 20px 0 0', zIndex: 51, padding: '0 0 2.5rem' }}>
                    {/* Visuel gradient haut */}
                    <div style={{ height: 140, background: 'linear-gradient(135deg, #1A1209 0%, #2C1F10 60%, #C9A84C 100%)', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px', borderRadius: '20px 20px 0 0' }} />
                      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 700, color: '#1A1209', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        {drawerGuide.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <button onClick={() => setGuideDetailSlug(null)} style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'white', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                    {/* Identité */}
                    <div style={{ padding: '1.25rem 1.25rem 0' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1209', marginBottom: 2 }}>{drawerGuide.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#7A6D5A', marginBottom: 2 }}>
                        Guide Safaruma · {formatGuideCity(drawerGuide.city)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#C9A84C', fontWeight: 600, marginBottom: '1.25rem' }}>
                        ★ {drawerGuide.rating}
                        {(drawerGuide.languages?.length ?? 0) > 0 && (
                          <span style={{ color: '#7A6D5A', fontWeight: 400 }}> · {drawerGuide.languages?.slice(0, 3).join(', ')}</span>
                        )}
                      </div>
                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <a
                          href={`/guides/${drawerGuide.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', borderRadius: 50, border: '1.5px solid #E8DFC8', background: 'white', color: '#4A3F30', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}
                        >
                          Voir le profil complet →
                        </a>
                        <button
                          onClick={() => { handleChoose(drawerGuide.slug); setGuideDetailSlug(null) }}
                          style={{ flex: 1, padding: '0.75rem', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)', color: 'white', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(201,168,76,0.35)' }}
                        >
                          Choisir ce guide
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {backBtn(step - 1)}

              {/* Titre */}
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '0.4rem' }}>
                {cityChoice === 'BOTH' ? 'Vos guides' : 'Votre guide'}
              </h2>
              <p style={{ color: '#7A6D5A', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                {cityChoice === 'BOTH'
                  ? 'Choisissez un guide pour chaque ville.'
                  : 'Choisissez votre guide pour ce séjour.'}
              </p>

              {/* Résumé des choix (BOTH) */}
              {cityChoice === 'BOTH' && (
                <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem' }}>
                  {/* Slot Makkah */}
                  <div
                    onClick={() => { if (!selectedGuideSlug) router.push(`/guides?city=MAKKAH&returnSlug=${slug}`) }}
                    style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: selectedGuideSlug ? '1.5px solid #C9A84C' : '1.5px dashed #C9A84C', background: selectedGuideSlug ? 'rgba(201,168,76,0.07)' : 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', cursor: selectedGuideSlug ? 'default' : 'pointer', transition: 'all 0.15s' }}
                  >
                    <div style={{ height: 3, background: 'linear-gradient(90deg, #C9A84C, #8B6914)' }} />
                    <div style={{ padding: '0.55rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>🕋</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#8B6914', letterSpacing: '0.1em', textTransform: 'uppercase' }}>La Mecque</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1209', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedGuideSlug
                            ? (availableGuides.find(g => g.slug === selectedGuideSlug)?.name ?? selectedGuideSlug)
                            : <span style={{ color: '#C9A84C', fontWeight: 700 }}>Choisir →</span>
                          }
                        </div>
                      </div>
                      {selectedGuideSlug && (
                        <button onClick={e => { e.stopPropagation(); setSelectedGuideSlug(null) }} style={{ background: 'rgba(201,168,76,0.15)', border: 'none', color: '#8B6914', cursor: 'pointer', fontSize: '0.6rem', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}>✕</button>
                      )}
                    </div>
                  </div>
                  {/* Slot Madinah */}
                  <div
                    onClick={() => { if (!selectedGuideSlugMadinah) router.push(`/guides?city=MADINAH&returnSlug=${slug}`) }}
                    style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: selectedGuideSlugMadinah ? '1.5px solid #1D5C3A' : '1.5px dashed #27AE60', background: selectedGuideSlugMadinah ? 'rgba(29,92,58,0.07)' : 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', cursor: selectedGuideSlugMadinah ? 'default' : 'pointer', transition: 'all 0.15s' }}
                  >
                    <div style={{ height: 3, background: 'linear-gradient(90deg, #27AE60, #1D5C3A)' }} />
                    <div style={{ padding: '0.55rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>🌿</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#1D5C3A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Médine</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1209', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedGuideSlugMadinah
                            ? (availableGuides.find(g => g.slug === selectedGuideSlugMadinah)?.name ?? selectedGuideSlugMadinah)
                            : <span style={{ color: '#27AE60', fontWeight: 700 }}>Choisir →</span>
                          }
                        </div>
                      </div>
                      {selectedGuideSlugMadinah && (
                        <button onClick={e => { e.stopPropagation(); setSelectedGuideSlugMadinah(null) }} style={{ background: 'rgba(29,92,58,0.15)', border: 'none', color: '#1D5C3A', cursor: 'pointer', fontSize: '0.6rem', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}>✕</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instruction contextuelle */}
              {cityChoice === 'BOTH' && selectedGuideSlug && !selectedGuideSlugMadinah && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(29,92,58,0.07)', border: '1px solid rgba(29,92,58,0.25)', borderRadius: 8, padding: '0.6rem 0.875rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#1D5C3A', fontWeight: 600 }}>
                  🌿 Choisissez maintenant votre guide pour Médine
                </div>
              )}

              {/* ── Résumé duo quand les deux guides sont choisis (BOTH) ── */}
              {cityChoice === 'BOTH' && bothDone && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
                  {/* Guide Makkah */}
                  <div style={{ background: 'linear-gradient(135deg, #1A1209 0%, #2C1F10 100%)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(201,168,76,0.4)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
                      {(guide?.name || selectedGuideSlug || '')?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.65rem', color: '#C9A84C', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>🕋 Guide La Mecque</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{guide?.name || selectedGuideSlug}</div>
                    </div>
                    <button onClick={() => setSelectedGuideSlug(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', cursor: 'pointer', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                  </div>
                  {/* Guide Médine */}
                  <div style={{ background: 'linear-gradient(135deg, #0F3320 0%, #1D5C3A 100%)', borderRadius: 14, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(29,92,58,0.6)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6FCF97, #27AE60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {(guideDataMadinah?.name || selectedGuideSlugMadinah || '')?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.65rem', color: '#6FCF97', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>🌿 Guide Médine</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>{guideDataMadinah?.name || selectedGuideSlugMadinah}</div>
                    </div>
                    <button onClick={() => setSelectedGuideSlugMadinah(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', cursor: 'pointer', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                  </div>
                </div>
              )}

              {/* Liste des guides (cachée quand duo complet) */}
              {!(cityChoice === 'BOTH' && bothDone) && (loadingGuides ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ background: '#E8DFC8', borderRadius: 12, height: 90, opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))}
                  <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:0.8} }`}</style>
                </div>
              ) : availableGuides.length === 0 ? (
                <div style={{ background: '#FAF8F0', border: '1px solid #E8DFC8', borderRadius: 16, padding: '2rem 1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🕌</div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209', marginBottom: '0.5rem' }}>Votre guide sera confirmé</div>
                  <div style={{ fontSize: '0.82rem', color: '#7A6D5A', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    Aucun guide disponible pour vos critères. Notre équipe sélectionnera le plus adapté sous 24h.
                  </div>
                  <a href="https://wa.me/message/3LAXCIZV7FFEK1" target="_blank" rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#25D366', color: 'white', fontSize: '0.78rem', fontWeight: 700, padding: '0.6rem 1.25rem', borderRadius: 50, textDecoration: 'none' }}>
                    📱 Être conseillé sur WhatsApp
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {availableGuides.map(g => {
                    const isMakkah = selectedGuideSlug === g.slug
                    const isMadinah = selectedGuideSlugMadinah === g.slug
                    const hasBadge = isMakkah || isMadinah
                    const canServeNext = !nextSlot || g.serviceCities?.includes(nextSlot)

                    return (
                      <div key={g.slug} style={{
                        background: hasBadge ? (isMakkah && isMadinah ? 'rgba(201,168,76,0.06)' : isMakkah ? 'rgba(201,168,76,0.06)' : 'rgba(29,92,58,0.06)') : 'white',
                        border: hasBadge ? `2px solid ${isMakkah && isMadinah ? '#C9A84C' : isMakkah ? '#C9A84C' : '#1D5C3A'}` : '1.5px solid #E8DFC8',
                        borderRadius: 12, padding: '0.875rem 1rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          {/* Avatar */}
                          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.05rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
                            {g.name?.slice(0, 2).toUpperCase()}
                          </div>
                          {/* Infos */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1A1209' }}>{g.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 1 }}>Guide Safaruma · {formatGuideCity(g.city)}</div>
                            <div style={{ fontSize: '0.72rem', color: '#C9A84C', fontWeight: 600, marginTop: 1 }}>
                              ★ {g.rating}
                              {(g.languages?.length ?? 0) > 0 && <span style={{ color: '#7A6D5A', fontWeight: 400 }}> · {g.languages?.slice(0, 2).join(', ')}</span>}
                            </div>
                          </div>
                          {/* Boutons */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end', flexShrink: 0 }}>
                            <button
                              onClick={() => handleChoose(g.slug)}
                              disabled={!canServeNext}
                              style={{
                                padding: '0.45rem 0.9rem', borderRadius: 50, border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: canServeNext ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
                                background: nextSlot === null && !hasBadge ? '#E8DFC8'
                                  : nextSlot === 'MAKKAH' ? 'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)'
                                  : nextSlot === 'MADINAH' ? 'linear-gradient(135deg, #27AE60 0%, #1D5C3A 100%)'
                                  : '#E8DFC8',
                                color: nextSlot === null && !hasBadge ? '#4A3F30' : nextSlot ? 'white' : '#4A3F30',
                              }}
                            >
                              {!canServeNext ? 'Non proposé' : nextSlot === 'MAKKAH' ? 'Choisir · 🕋' : nextSlot === 'MADINAH' ? 'Choisir · 🌿' : 'Choisir'}
                            </button>
                            <button
                              onClick={() => setGuideDetailSlug(g.slug)}
                              style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                            >
                              Voir le profil
                            </button>
                          </div>
                        </div>

                        {/* Badges ville(s) choisie(s) */}
                        {hasBadge && (
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.625rem', paddingTop: '0.625rem', borderTop: '1px solid #E8DFC8', flexWrap: 'wrap' }}>
                            {isMakkah && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 50, padding: '0.25rem 0.6rem' }}>
                                <span style={{ fontSize: '0.7rem' }}>🕋</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#8B6914' }}>La Mecque</span>
                              </div>
                            )}
                            {isMadinah && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(29,92,58,0.1)', border: '1px solid rgba(29,92,58,0.3)', borderRadius: 50, padding: '0.25rem 0.6rem' }}>
                                <span style={{ fontSize: '0.7rem' }}>🌿</span>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1D5C3A' }}>Médine</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}

              {nextBtn(
                cityChoice === 'BOTH' ? 'Continuer' : 'Voir le récapitulatif',
                continueFromGuideStep,
                !canContinue || loadingGuide
              )}
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
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>Guide Safaruma · {formatGuideCity(guide.city)}</div>
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
                  onClick={() => setNbPersonnes(n => Math.min(32, n + 1))}
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
                  <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>Accompagnement sélectionné</div>
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1A1209' }}>{prixBase}€</div>
              </div>

              {/* Visites supp */}
              {extraPlaces.map(pk => {
                const place = placeCatalog.find(p => p.key === pk)
                const prix = displayPlacePrices[pk]
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
                    {transportOption === 'TRAIN' ? '🚄 Billet de train A/R du guide' : '🚗 Voiture privée A/R du guide'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prixTransport}€</div>
                </div>
              )}

              {localTransportMakkah === 'CAR' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>🚗 {transportPricing.localVehicle.label} — Makkah ({daysMakkah} j.)</div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prixVoitureMakkah}€</div>
                </div>
              )}
              {localTransportMadinah === 'CAR' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>🚗 {transportPricing.localVehicle.label} — Médine ({daysMadinah} j.)</div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prixVoitureMadinah}€</div>
                </div>
              )}

              {(localTransportMakkah === 'TAXI' || localTransportMadinah === 'TAXI') && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>🚕 Taxi public</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>Les courses du guide pendant les visites sont à votre charge et se règlent sur place.</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>0€</div>
                </div>
              )}

              {sameGuideForBothCities && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>🏨 Hébergement du guide</div>
                    <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>{guideBedProvided ? 'Lit fourni par le client' : `${transportPricing.guideHotelNights} nuit(s) hors ville principale`}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prixHotelGuide}€</div>
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
                ['Point d’arrivée', arrivalPoint === 'JEDDAH' ? 'Aéroport de Jeddah' : arrivalPoint === 'MADINAH' ? 'Médine' : 'Makkah'],
                ...(cityChoice === 'BOTH' ? [['Ordre des villes', arrivalPoint === 'MAKKAH' ? 'Makkah → Médine' : 'Médine → Makkah']] : []),
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

            {(arrivalPoint === 'MAKKAH' || (arrivalPoint === 'JEDDAH' && cityChoice === 'MAKKAH')) && (
              <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', color: '#991B1B', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 700 }}>
                Attention : mettez votre Ihram dans l’avion ou rendez-vous au Miqat le plus proche avant la Omra.
              </div>
            )}

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
