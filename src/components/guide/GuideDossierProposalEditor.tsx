'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { GuideDossierView } from '@/lib/guide-dossier'
import { APPLICATION_PHOTO_KINDS, APPLICATION_PHOTO_LABELS, type ApplicationMediaView, type ApplicationPhotoKind } from '@/lib/guide-application-media'

export type GuideBankProposal = { firstName: string; lastName: string; bankName: string; country: string; iban: string; bic: string }
export type GuideDossierProposal = {
  bankProposal?: GuideBankProposal
  mediaProposal?: {
    hasPersonalVehicle?: boolean
    vehicleModel?: string
    vehicleYear?: number | null
    vehiclePassengerSeats?: number | null
    vehicleColor?: string
    vehicleSeatsConfirmed?: boolean
    profilePhotoReceipt?: string
    vehicleDashboardPhotoReceipt?: string
    vehicleSeatsPhotoReceipt?: string
    vehicleExteriorPhotoReceipt?: string
  }
}

type Props = {
  email: string
  bank: GuideDossierView['bank']
  media: ApplicationMediaView | null
  initialBank?: GuideBankProposal | null
  initialMedia?: ApplicationMediaView | null
  disabled?: boolean
  onChange: (value: GuideDossierProposal) => void
  onBusyChange: (busy: boolean) => void
}

const receiptFields = { profile: 'profilePhotoReceipt', dashboard: 'vehicleDashboardPhotoReceipt', seats: 'vehicleSeatsPhotoReceipt', exterior: 'vehicleExteriorPhotoReceipt' } as const
const card: React.CSSProperties = { border: '1px solid #E8DFC8', borderRadius: 12, background: 'white', padding: '1.25rem', color: '#1A1209' }
const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '0.7rem 0.875rem', border: '1px solid #E8DFC8', borderRadius: 8, background: 'white', color: '#1A1209', font: 'inherit', fontSize: '0.82rem' }
const label: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#4A3F30', marginBottom: 6 }
const button: React.CSSProperties = { padding: '0.65rem 1.15rem', border: '1px solid #E8DFC8', borderRadius: 50, background: '#1A1209', color: '#F0D897', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }

export default function GuideDossierProposalEditor({ email, bank, media, initialBank, initialMedia, disabled = false, onChange, onBusyChange }: Props) {
  const prefix = useId()
  const [editingBank, setEditingBank] = useState(Boolean(initialBank))
  const [editingMedia, setEditingMedia] = useState(Boolean(initialMedia))
  const [bankValues, setBankValues] = useState<GuideBankProposal>(() => initialBank || {
    firstName: bank.firstName || '', lastName: bank.lastName || '', bankName: bank.bankName || '',
    country: bank.country || '', iban: bank.iban || '', bic: bank.bic || '',
  })
  const [vehicle, setVehicle] = useState(() => {
    const baseline = initialMedia || media
    return {
      hasPersonalVehicle: baseline?.hasPersonalVehicle ?? null,
      vehicleModel: baseline?.vehicleModel || '', vehicleYear: baseline?.vehicleYear ?? null,
      vehiclePassengerSeats: baseline?.vehiclePassengerSeats ?? null,
      vehicleColor: baseline?.vehicleColor || '', vehicleSeatsConfirmed: baseline?.vehicleSeatsConfirmed ?? false,
    }
  })
  const [photos, setPhotos] = useState<Record<ApplicationPhotoKind, string | null>>(() => ({
    profile: initialMedia?.photos.profile || null, dashboard: initialMedia?.photos.dashboard || null,
    seats: initialMedia?.photos.seats || null, exterior: initialMedia?.photos.exterior || null,
  }))
  const [failedPhotos, setFailedPhotos] = useState<Partial<Record<ApplicationPhotoKind, boolean>>>({})
  const [uploading, setUploading] = useState<ApplicationPhotoKind | null>(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const proposalRef = useRef<GuideDossierProposal>({})
  const controllerRef = useRef<AbortController | null>(null)
  const photoInputs = useRef<Partial<Record<ApplicationPhotoKind, HTMLInputElement | null>>>({})
  const locked = disabled || uploading !== null

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  function changeBank(field: keyof GuideBankProposal, value: string) {
    const next = { ...bankValues, [field]: value }
    setBankValues(next)
    proposalRef.current = { ...proposalRef.current, bankProposal: next }
    onChange(proposalRef.current)
  }

  function changeMedia(change: NonNullable<GuideDossierProposal['mediaProposal']>) {
    proposalRef.current = { ...proposalRef.current, mediaProposal: { ...proposalRef.current.mediaProposal, ...change } }
    onChange(proposalRef.current)
  }

  function changeVehicle(change: Partial<typeof vehicle> & NonNullable<GuideDossierProposal['mediaProposal']>) {
    setVehicle(previous => ({ ...previous, ...change }))
    changeMedia(change)
  }

  async function uploadPhoto(kind: ApplicationPhotoKind, file: File) {
    if (disabled || controllerRef.current) return
    setUploadMessage('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadMessage('Choisissez une photo au format JPEG, PNG ou WebP.')
      return
    }
    if (file.size === 0 || file.size > 4_000_000) {
      setUploadMessage(file.size === 0 ? 'Le fichier est vide.' : 'La photo doit peser au maximum 4 Mo.')
      return
    }
    const controller = new AbortController()
    controllerRef.current = controller
    setUploading(kind)
    onBusyChange(true)
    try {
      // Read before upload: data URLs obey the existing CSP, and a failed local
      // preview cannot leave an uploaded receipt falsely reported as unsent.
      const preview = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        const abort = () => { reader.abort(); reject(new DOMException('Lecture annulée', 'AbortError')) }
        const cleanup = () => controller.signal.removeEventListener('abort', abort)
        reader.onload = () => {
          cleanup()
          if (controller.signal.aborted) reject(new DOMException('Lecture annulée', 'AbortError'))
          else if (typeof reader.result === 'string') resolve(reader.result)
          else reject(new Error('L’aperçu de la photo n’a pas pu être lu. Réessayez.'))
        }
        reader.onerror = () => { cleanup(); reject(new Error('L’aperçu de la photo n’a pas pu être lu. Réessayez.')) }
        reader.onabort = () => { cleanup(); reject(new DOMException('Lecture annulée', 'AbortError')) }
        controller.signal.addEventListener('abort', abort, { once: true })
        try { reader.readAsDataURL(file) } catch {
          cleanup()
          reject(new Error('L’aperçu de la photo n’a pas pu être lu. Réessayez.'))
        }
      })
      if (controller.signal.aborted) return
      const response = await fetch(`/api/guide/inscription/photos?kind=${kind}`, {
        method: 'POST', headers: { 'Content-Type': file.type, 'x-guide-email': encodeURIComponent(email) },
        body: file, signal: controller.signal,
      })
      const data = await response.json()
      if (controller.signal.aborted) return
      if (!response.ok) throw new Error(data.error || 'La photo n’a pas pu être envoyée.')
      if (typeof data.receipt !== 'string' || !data.receipt) throw new Error('Le reçu de la photo est manquant. Réessayez.')
      changeMedia({ [receiptFields[kind]]: data.receipt })
      setPhotos(previous => ({ ...previous, [kind]: preview }))
      setFailedPhotos(previous => ({ ...previous, [kind]: false }))
      setUploadMessage('Photo prête à transmettre avec vos modifications. Elle n’est pas publiée.')
    } catch (cause) {
      if (!controller.signal.aborted) setUploadMessage(cause instanceof Error ? cause.message : 'L’envoi de la photo a échoué. Réessayez.')
    } finally {
      controllerRef.current = null
      if (!controller.signal.aborted) {
        setUploading(null)
        onBusyChange(false)
      }
    }
  }

  return <div style={{ display: 'grid', gap: '1rem' }}>
    <section data-clarity-mask="true" data-sentry-mask style={card}>
      <button type="button" onClick={() => setEditingBank(true)} disabled={locked} style={button}>Modifier les coordonnées bancaires</button>
      {editingBank && <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: '1rem 0 0', minWidth: 0 }}>
        <legend style={{ ...label, padding: 0 }}>Coordonnées bancaires proposées</legend>
        <p style={{ fontSize: '0.78rem', lineHeight: 1.6, color: '#7A6D5A' }}>Ces coordonnées privées seront examinées par l’administration. Elles ne remplacent pas les coordonnées actuelles avant approbation.</p>
        <div className="guide-profile-grid">
          {([
            ['firstName', 'Prénom du titulaire', 80], ['lastName', 'Nom du titulaire', 80],
            ['bankName', 'Nom de la banque', 120], ['country', 'Pays de la banque', 100],
            ['iban', 'IBAN', 100], ['bic', 'SWIFT / BIC (facultatif)', 100],
          ] as const).map(([field, title, maxLength]) => <div key={field}>
            <label htmlFor={`${prefix}-bank-${field}`} style={label}>{title}</label>
            <input id={`${prefix}-bank-${field}`} value={bankValues[field]} onChange={event => changeBank(field, event.target.value)} maxLength={maxLength} autoComplete="off" spellCheck={false} style={input} />
          </div>)}
        </div>
      </fieldset>}
    </section>
    <section style={card}>
      <button type="button" onClick={() => setEditingMedia(true)} disabled={locked} style={button}>Modifier les photos et le véhicule</button>
      {editingMedia && <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: '1rem 0 0', minWidth: 0 }}>
        <legend style={{ ...label, padding: 0 }}>Photos et véhicule proposés</legend>
        <p style={{ fontSize: '0.78rem', lineHeight: 1.6, color: '#7A6D5A' }}>Les photos approuvées restent dans votre dossier privé. Seul le Superadmin peut publier le portrait, par une action séparée. Les photos du véhicule ne sont jamais publiques.</p>
        <label htmlFor={`${prefix}-vehicle`} style={label}>Disposez-vous d’un véhicule personnel ?</label>
        <select id={`${prefix}-vehicle`} value={vehicle.hasPersonalVehicle === null ? '' : vehicle.hasPersonalVehicle ? 'yes' : 'no'} onChange={event => { if (event.target.value) changeVehicle({ hasPersonalVehicle: event.target.value === 'yes' }) }} style={input}>
          <option value="" disabled>Choisissez une réponse</option><option value="yes">Oui</option><option value="no">Non</option>
        </select>
        {vehicle.hasPersonalVehicle && <div className="guide-profile-grid" style={{ marginTop: '1rem' }}>
          {([['vehicleModel', 'Modèle du véhicule', 120], ['vehicleColor', 'Couleur du véhicule', 80]] as const).map(([field, title, maxLength]) => <div key={field}>
            <label htmlFor={`${prefix}-${field}`} style={label}>{title}</label>
            <input id={`${prefix}-${field}`} value={vehicle[field]} onChange={event => changeVehicle({ [field]: event.target.value })} maxLength={maxLength} style={input} />
          </div>)}
          {([['vehicleYear', 'Année du véhicule', 1000, 9999], ['vehiclePassengerSeats', 'Places disponibles, hors conducteur', 1, 999]] as const).map(([field, title, min, max]) => <div key={field}>
            <label htmlFor={`${prefix}-${field}`} style={label}>{title}</label>
            <input id={`${prefix}-${field}`} type="number" min={min} max={max} step={1} value={vehicle[field] ?? ''} onChange={event => changeVehicle({ [field]: event.target.value === '' ? null : Number(event.target.value) })} style={input} />
          </div>)}
          <label style={{ ...label, display: 'flex', alignItems: 'start', gap: 8 }}><input type="checkbox" checked={vehicle.vehicleSeatsConfirmed} onChange={event => changeVehicle({ vehicleSeatsConfirmed: event.target.checked })} />Je confirme le nombre de places disponibles, hors conducteur.</label>
        </div>}
        {vehicle.hasPersonalVehicle === false && <p style={{ fontSize: '0.75rem', color: '#7A6D5A' }}>Les informations du véhicule sont masquées et conservées. Ce choix ne supprime pas vos photos.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: '1rem', marginTop: '1rem' }}>
          {APPLICATION_PHOTO_KINDS.filter(kind => kind === 'profile' || vehicle.hasPersonalVehicle).map(kind => <div key={kind} style={{ border: '1px solid #E8DFC8', borderRadius: 10, padding: '0.875rem' }}>
            <label htmlFor={`${prefix}-photo-${kind}`} style={label}>{kind === 'profile' ? 'Portrait proposé à l’équipe' : APPLICATION_PHOTO_LABELS[kind]}</label>
            {photos[kind] && !failedPhotos[kind] && (
              // Private authenticated URLs and local previews must bypass the public image optimizer.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[kind]!} alt={`Proposition : ${APPLICATION_PHOTO_LABELS[kind]}`} onError={() => setFailedPhotos(previous => ({ ...previous, [kind]: true }))} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, marginBottom: 10 }} />
            )}
            {failedPhotos[kind] && <p role="alert" style={{ fontSize: '0.75rem', color: '#991B1B' }}>Aperçu indisponible. Rechargez le dossier ou choisissez une nouvelle photo.</p>}
            <input ref={element => { photoInputs.current[kind] = element }} id={`${prefix}-photo-${kind}`} type="file" hidden disabled={locked} accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void uploadPhoto(kind, file) }} />
            <button type="button" disabled={locked} onClick={() => { if (!locked) photoInputs.current[kind]?.click() }} aria-label={`${photos[kind] || media?.photos[kind] ? 'Remplacer la photo' : 'Importer une photo'} — ${APPLICATION_PHOTO_LABELS[kind]}`} style={button}>
              {photos[kind] || media?.photos[kind] ? 'Remplacer la photo' : 'Importer une photo'}
            </button>
            <p style={{ fontSize: '0.7rem', color: '#7A6D5A', marginBottom: 0 }}>{uploading === kind ? 'Envoi de la photo…' : 'JPEG, PNG ou WebP — 4 Mo maximum. Aucun fichier choisi ne supprime la photo actuelle.'}</p>
          </div>)}
        </div>
      </fieldset>}
      {uploadMessage && <p role="status" style={{ fontSize: '0.78rem', color: '#4A3F30', lineHeight: 1.6 }}>{uploadMessage}</p>}
    </section>
  </div>
}
