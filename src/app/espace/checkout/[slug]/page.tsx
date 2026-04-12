'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PLACES, type Place } from '@/lib/places'
import { BASE_PACKAGES, getPackageForCity, type CityChoice } from '@/lib/packages'

// ── Types ─────────────────────────────────────────
type Gender = 'HOMME' | 'FEMME' | 'MIXTE'

const STEPS = ['Destination', 'Dates & Profil', 'Visites', 'Récap']

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

  // Étape 1
  const [cityChoice, setCityChoice] = useState<CityChoice | null>(null)

  // Étape 2
  const [departDate, setDepartDate] = useState('')
  const [nbPersonnes, setNbPersonnes] = useState(1)
  const [gender, setGender] = useState<Gender>('MIXTE')
  const [langue, setLangue] = useState('fr')

  // Étape 3
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([])
  const [withTransport, setWithTransport] = useState(false)
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

  // Fetch guide
  useEffect(() => {
    if (!slug) return
    fetch(`/api/guide/public/${slug}`)
      .then(r => r.json())
      .then(data => {
        setGuide(data.guide)
        setActivePlaces(data.activePlaces || [])
        setPlacePrices(data.placePrices || {})
      })
      .finally(() => setLoadingGuide(false))
  }, [slug])

  // Package de base
  const basePackage = cityChoice ? getPackageForCity(cityChoice) : null

  // Calcul prix
  const prixBase = (basePackage?.basePrice ?? 0) * nbPersonnes
  const extraPlaces = selectedPlaces.filter(pk => !basePackage?.includedPlaces.includes(pk))
  const prixLieux = extraPlaces.reduce((sum, pk) => sum + (placePrices[pk] ?? 50), 0) * nbPersonnes
  const prixTransport = withTransport && cityChoice === 'BOTH' ? 80 * nbPersonnes : 0
  const prixVoiture = withCar ? 45 : 0
  const total = prixBase + prixLieux + prixTransport + prixVoiture

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

  // Soumission
  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideSlug: slug,
          cityChoice,
          departDate,
          nbPersonnes,
          gender,
          langue,
          selectedPlaces,
          withTransport,
          withCar,
          totalPrice: total,
          packageName: basePackage?.name,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')
      router.push(`/espace/checkout/${slug}/confirmation?ref=${data.refNumber}`)
    } catch (e: any) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  // ── Barre de progression ──────────────────────
  const ProgressBar = () => (
    <div style={{
      position: 'sticky', top: 0, zIndex: 40, background: 'white',
      borderBottom: '1px solid #E8DFC8', padding: '1rem 2rem',
      display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center',
    }}>
      {STEPS.map((s, i) => {
        const n = i + 1
        const done = step > n
        const active = step === n
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: done ? '#1D5C3A' : active ? '#C9A84C' : '#E8DFC8',
              color: done || active ? 'white' : '#9CA3AF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
            }}>
              {done ? '✓' : n}
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: active ? 700 : 500, color: active ? '#1A1209' : '#9CA3AF' }}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div style={{ width: 24, height: 2, background: done ? '#1D5C3A' : '#E8DFC8', borderRadius: 1 }} />
            )}
          </div>
        )
      })}
    </div>
  )

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
    <div style={{ minHeight: '100vh', background: '#FAF7F0', fontFamily: 'Arial, sans-serif' }}>
      <ProgressBar />

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
                    <span style={{ fontSize: '0.75rem', color: '#7A6D5A', fontFamily: 'Arial, sans-serif', fontWeight: 400, marginLeft: 4 }}>/ personne</span>
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

            {nextBtn('Continuer →', () => setStep(2), !cityChoice)}
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
                  <button onClick={() => setNbPersonnes(n => Math.min(12, n + 1))} style={{ width: 48, height: 48, border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#1A1209', fontFamily: 'inherit' }}>+</button>
                </div>
              </div>

              {/* Genre */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '0.5rem' }}>
                  Profil du groupe
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['HOMME', 'FEMME', 'MIXTE'] as Gender[]).map(g => (
                    <button key={g} onClick={() => setGender(g)} style={{ flex: 1, padding: '0.65rem', border: gender === g ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 10, background: gender === g ? 'rgba(201,168,76,0.08)' : 'white', color: gender === g ? '#8B6914' : '#7A6D5A', fontWeight: gender === g ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {g === 'HOMME' ? '👨 Homme' : g === 'FEMME' ? '👩 Femme' : '👨‍👩 Mixte'}
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
                  {[{ code: 'fr', label: '🇫🇷 Français' }, { code: 'ar', label: '🇸🇦 Arabe' }, { code: 'en', label: '🇬🇧 English' }, { code: 'wo', label: '🇸🇳 Wolof' }].map(l => (
                    <button key={l.code} onClick={() => setLangue(l.code)} style={{ padding: '0.5rem 1rem', border: langue === l.code ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 50, background: langue === l.code ? 'rgba(201,168,76,0.08)' : 'white', color: langue === l.code ? '#8B6914' : '#7A6D5A', fontWeight: langue === l.code ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {nextBtn('Continuer →', () => setStep(3), !departDate)}
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

            {/* Train Haramayn */}
            {cityChoice === 'BOTH' && (
              <div
                onClick={() => setWithTransport(t => !t)}
                style={{ background: withTransport ? 'rgba(201,168,76,0.06)' : 'white', border: withTransport ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid #C9A84C', flexShrink: 0, background: withTransport ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {withTransport && <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>🚄 Train Haramayn — Makkah ↔ Madinah</div>
                  <div style={{ fontSize: '0.75rem', color: '#7A6D5A', marginTop: 2 }}>Requis pour le voyage complet · +80€/personne</div>
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#C9A84C' }}>+{80 * nbPersonnes}€</div>
              </div>
            )}

            {/* Voiture */}
            <div
              onClick={() => setWithCar(c => !c)}
              style={{ background: withCar ? 'rgba(201,168,76,0.06)' : 'white', border: withCar ? '2px solid #C9A84C' : '1.5px solid #E8DFC8', borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid #C9A84C', flexShrink: 0, background: withCar ? '#C9A84C' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {withCar && <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>🚗 Voiture du guide pour les visites</div>
                <div style={{ fontSize: '0.75rem', color: '#7A6D5A', marginTop: 2 }}>Recommandé pour Jabal Nour, Arafat, Badr · +45€/jour</div>
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

            {nextBtn('Voir le récapitulatif →', () => setStep(4))}
          </div>
        )}

        {/* ── ÉTAPE 4 — RÉCAP & PAIEMENT ── */}
        {step === 4 && (
          <div>
            {backBtn(3)}
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1A1209', marginBottom: '2rem' }}>
              Récapitulatif de votre voyage
            </h2>

            {/* Guide card */}
            {guide && (
              <div style={{ background: '#1A1209', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #F0D897, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209', flexShrink: 0 }}>
                  {guide.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{guide.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>Guide SAFARUMA · {guide.city}</div>
                </div>
              </div>
            )}

            {/* Tableau prix */}
            <div style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem' }}>
              {/* Package de base */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1A1209' }}>{basePackage?.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#7A6D5A', marginTop: 2 }}>{nbPersonnes} × {basePackage?.basePrice}€</div>
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
                      <div style={{ fontSize: '0.7rem', color: '#7A6D5A', marginTop: 2 }}>{nbPersonnes} × {prix}€</div>
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prix * nbPersonnes}€</div>
                  </div>
                ) : null
              })}

              {withTransport && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>🚄 Train Haramayn</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>{prixTransport}€</div>
                </div>
              )}

              {withCar && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #F5F0E8' }}>
                  <div style={{ fontSize: '0.85rem', color: '#1A1209' }}>🚗 Voiture du guide</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', fontWeight: 700, color: '#1A1209' }}>45€</div>
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
              {['✓ Guide mutawwif certifié SAFARUMA', '✓ Annulation gratuite sous 48h', '✓ Paiement 100% sécurisé', '✓ Confirmation sous 24h'].map(t => (
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
              style={{ width: '100%', padding: '1.1rem', background: submitting ? '#9CA3AF' : '#C9A84C', color: '#1A1209', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontWeight: 800, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', letterSpacing: '0.05em' }}
            >
              {submitting ? 'Envoi en cours…' : `Confirmer ma réservation — ${total.toLocaleString('fr-FR')}€`}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.75rem' }}>
              Sans engagement · Confirmation sous 24h · Annulation gratuite sous 48h
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
