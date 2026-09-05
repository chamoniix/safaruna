'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LANG_CODE_TO_LABEL } from '@/lib/languages'

type Status = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'
type Application = {
  id: string
  firstName: string
  lastName: string
  email: string
  whatsapp: string | null
  city: string | null
  gender: string
  serviceCities: string[]
  nationality: string | null
  dateOfBirth: string
  bio: string | null
  experienceYears: number | null
  education: string
  educationDetails: string | null
  languages: string[]
  otherLanguages: string | null
  masteredPlaces: Array<{ key: string; name: string }>
  otherPlaces: string | null
  transportModes: string[]
  transportDetails: string | null
  proposedOmraPriceCents: number | null
  proposedMadinahPackagePriceCents: number | null
  proposedMadinahPlacePriceCents: number | null
  proposedMakkahPlacePriceCents: number | null
  makkahIncludedDetails: string | null
  makkahOtherDetails: string | null
  madinahIncludedDetails: string | null
  madinahOtherDetails: string | null
  pricingDetails: string | null
  bankAccountFirstName: string
  bankAccountLastName: string
  bankName: string
  bankCountry: string
  ibanMasked: string | null
  bicMasked: string | null
  acceptedCharteAt: string
  status: Status
  reviewNotes: string | null
  reviewedByEmail: string | null
  reviewedAt: string | null
  submittedCountry: string | null
  submittedDevice: string | null
  createdAt: string
}

type Payload = {
  applications: Application[]
  counts: Partial<Record<Status, number>>
  pagination: { page: number; pages: number; total: number }
}

const labels: Record<Status, string> = {
  PENDING: 'À traiter',
  IN_REVIEW: 'En cours',
  APPROVED: 'Validée',
  REJECTED: 'Rejetée',
}

const tones: Record<Status, { color: string; bg: string }> = {
  PENDING: { color: '#92400E', bg: '#FEF3C7' },
  IN_REVIEW: { color: '#1D4ED8', bg: '#DBEAFE' },
  APPROVED: { color: '#166534', bg: '#DCFCE7' },
  REJECTED: { color: '#991B1B', bg: '#FEE2E2' },
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Non renseigné'
}

function formatBirthDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value))
}

function formatEuros(cents: number | null) {
  return cents === null ? 'Non renseigné' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

const transportLabels: Record<string, string> = {
  CAR: 'Voiture, jusqu’à 6 pèlerins',
  VAN: 'Van',
  OTHER: 'Autre',
}

export default function GuideApplicationsPage() {
  const [data, setData] = useState<Payload | null>(null)
  const [status, setStatus] = useState<'ALL' | Status>('ALL')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Application | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const activeRequest = useRef<AbortController | null>(null)

  const load = useCallback(async () => {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setLoading(true)
    setLoadError('')
    setData(null)
    const params = new URLSearchParams({ page: String(page) })
    if (status !== 'ALL') params.set('status', status)
    if (query.trim()) params.set('q', query.trim())
    try {
      const response = await fetch(`/api/admin/guide-applications?${params}`, { cache: 'no-store', signal: controller.signal })
      const payload = await response.json()
      if (controller.signal.aborted) return
      if (!response.ok) throw new Error(payload.error || 'Chargement impossible')
      setData(payload)
    } catch (cause) {
      if (!controller.signal.aborted) setLoadError(cause instanceof Error ? cause.message : 'Chargement impossible')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [page, query, status])

  const reloadCurrentFilters = useRef<(() => Promise<void>) | null>(null)
  useEffect(() => {
    reloadCurrentFilters.current = load
    void load()
    return () => {
      reloadCurrentFilters.current = null
      activeRequest.current?.abort()
    }
  }, [load])

  async function update(nextStatus: Exclude<Status, 'PENDING'>) {
    if (!selected) return
    const action = nextStatus === 'APPROVED' ? 'valider et créer le compte guide' : nextStatus === 'REJECTED' ? 'rejeter et supprimer définitivement' : 'prendre en charge'
    if (!window.confirm(`Confirmer : ${action} cette candidature ?`)) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/admin/guide-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: selected.id, status: nextStatus, reviewNotes: notes }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Mise à jour impossible')
      setSelected(null)
      setNotes('')
      await reloadCurrentFilters.current?.()
      if (nextStatus === 'APPROVED' && payload.accessEmailSent !== true) {
        setError('Candidature validée et compte créé, mais l’invitation n’a pas pu être envoyée. Le guide peut utiliser « Mot de passe oublié ».')
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mise à jour impossible')
    } finally {
      setSaving(false)
    }
  }

  return <div style={{ display: 'grid', gap: 20 }}>
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
      {(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'] as Status[]).map(item => <button key={item} onClick={() => { setStatus(item); setPage(1) }} style={{ textAlign: 'left', border: status === item ? '2px solid #C9A84C' : '1px solid #E8DFC8', borderRadius: 12, padding: 16, background: 'white', cursor: 'pointer' }}>
        <span style={{ display: 'block', color: '#7A6D5A', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>{labels[item]}</span>
        <strong style={{ display: 'block', fontSize: 28, color: tones[item].color, marginTop: 8 }}>{loading || !data ? '—' : data.counts[item] ?? 0}</strong>
      </button>)}
    </section>

    <section style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', borderBottom: '1px solid #E8DFC8' }}>
        <input value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} placeholder="Nom, email, WhatsApp…" style={{ flex: '1 1 260px', padding: '10px 12px', border: '1px solid #E8DFC8', borderRadius: 8 }} />
        <select value={status} onChange={event => { setStatus(event.target.value as 'ALL' | Status); setPage(1) }} style={{ padding: '10px 12px', border: '1px solid #E8DFC8', borderRadius: 8, background: 'white' }}>
          <option value="ALL">Tous les statuts</option>
          {(Object.keys(labels) as Status[]).map(item => <option value={item} key={item}>{labels[item]}</option>)}
        </select>
      </div>
      {error && <div style={{ margin: 16, padding: 12, background: '#FEE2E2', color: '#991B1B', borderRadius: 8 }}>{error}</div>}
      {loadError && <div role="alert" style={{ margin: 16, padding: 12, background: '#FEE2E2', color: '#991B1B', borderRadius: 8 }}>
        {loadError} <button type="button" onClick={() => void load()} disabled={loading}>Réessayer</button>
      </div>}
      <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
        <thead><tr style={{ background: '#F8F6F2' }}>{['Candidat', 'Contact', 'Ville(s)', 'Langues', 'Reçue', 'Statut', ''].map(label => <th key={label} style={{ padding: 12, textAlign: 'left', color: '#7A6D5A', fontSize: 11, textTransform: 'uppercase' }}>{label}</th>)}</tr></thead>
        <tbody>{loading ? <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center' }}>Chargement…</td></tr> : !data ? <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: '#991B1B' }}>Les candidatures n’ont pas pu être chargées.</td></tr> : !data.applications.length ? <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: '#7A6D5A' }}>Aucune candidature ne correspond aux filtres sélectionnés.</td></tr> : data.applications.map(item => <tr key={item.id} style={{ borderTop: '1px solid #F0EBE0' }}>
          <td style={{ padding: 12 }}><strong>{item.firstName} {item.lastName}</strong><small style={{ display: 'block', color: '#7A6D5A' }}>{item.gender} · {item.nationality || 'Non renseigné'}</small></td>
          <td style={{ padding: 12 }}><span>{item.email}</span><small style={{ display: 'block', color: '#7A6D5A' }}>{item.whatsapp || 'Non renseigné'}</small></td>
          <td style={{ padding: 12 }}>{item.serviceCities.join(' · ') || 'Non renseigné'}</td>
          <td style={{ padding: 12 }}>{[item.languages.map(code => LANG_CODE_TO_LABEL[code] || code).join(', '), item.otherLanguages].filter(Boolean).join(', ') || 'Non renseigné'}</td>
          <td style={{ padding: 12, whiteSpace: 'nowrap' }}>{formatDate(item.createdAt)}</td>
          <td style={{ padding: 12 }}><span style={{ background: tones[item.status].bg, color: tones[item.status].color, padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{labels[item.status]}</span></td>
          <td style={{ padding: 12 }}><button onClick={() => { setSelected(item); setNotes(item.reviewNotes || '') }} style={{ border: 0, borderRadius: 20, padding: '7px 12px', background: '#1A1209', color: '#F0D897', cursor: 'pointer' }}>Voir</button></td>
        </tr>)}</tbody>
      </table></div>
      <div style={{ padding: 14, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E8DFC8' }}>
        <button disabled={loading || !data || page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Précédent</button>
        <span>{loading ? 'Chargement…' : data ? `Page ${data.pagination.page} / ${data.pagination.pages} · ${data.pagination.total} candidature(s)` : 'Pagination indisponible'}</span>
        <button disabled={loading || !data || page >= data.pagination.pages} onClick={() => setPage(value => value + 1)}>Suivant</button>
      </div>
    </section>

    {selected && <div onClick={event => { if (event.target === event.currentTarget) setSelected(null) }} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(15,10,5,.55)', display: 'grid', placeItems: 'center', padding: 20 }}>
      <article style={{ width: 'min(760px,100%)', maxHeight: '90vh', overflow: 'auto', background: 'white', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}><div><h2 style={{ margin: 0 }}>{selected.firstName} {selected.lastName}</h2><p style={{ color: '#7A6D5A' }}>Candidature {selected.id}</p></div><button onClick={() => setSelected(null)} style={{ border: 0, background: 'transparent', fontSize: 20 }}>×</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12, background: '#F8F6F2', padding: 16, borderRadius: 12 }}>
          <div><b>Email</b><p>{selected.email}</p></div><div><b>WhatsApp</b><p>{selected.whatsapp || 'Non renseigné'}</p></div><div><b>Date de naissance</b><p>{formatBirthDate(selected.dateOfBirth)}</p></div><div><b>Formation</b><p>{selected.education}{selected.educationDetails ? ` — ${selected.educationDetails}` : ''}</p></div><div><b>Ville principale</b><p>{selected.city || 'Non renseigné'}</p></div><div><b>Villes servies</b><p>{selected.serviceCities.join(', ') || 'Non renseigné'}</p></div><div><b>Langues</b><p>{[selected.languages.map(code => LANG_CODE_TO_LABEL[code] || code).join(', '), selected.otherLanguages].filter(Boolean).join(', ') || 'Non renseigné'}</p></div><div><b>Expérience</b><p>{selected.experienceYears === null ? 'Non renseigné' : `${selected.experienceYears} an(s)`}</p></div><div><b>Pays de soumission</b><p>{selected.submittedCountry || 'Non renseigné'}</p></div><div><b>Appareil</b><p>{selected.submittedDevice || 'Non renseigné'}</p></div>
        </div>
        <div style={{ marginTop: 16 }}><b>Lieux maîtrisés</b><p style={{ lineHeight: 1.6 }}>{selected.masteredPlaces.map(place => place.name).join(', ') || 'Non renseigné'}</p>{selected.otherPlaces && <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}><b>Autres lieux :</b> {selected.otherPlaces}</p>}</div>
        <div style={{ marginTop: 16 }}><b>Transport proposé</b><p style={{ lineHeight: 1.6 }}>{selected.transportModes.length ? selected.transportModes.map(mode => transportLabels[mode] || mode).join(', ') : 'Aucun transport sélectionné'}{selected.transportDetails ? ` — ${selected.transportDetails}` : ''}</p></div>
        <div style={{ marginTop: 16 }}>
          <b>Tarifs proposés par le candidat</b>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginTop: 10 }}>
            <div><small>Accompagnement Omra</small><p>{formatEuros(selected.proposedOmraPriceCents)}</p></div>
            <div><small>Visite supplémentaire Makkah</small><p>{formatEuros(selected.proposedMakkahPlacePriceCents)}</p></div>
            <div><small>Accompagnement Médine</small><p>{formatEuros(selected.proposedMadinahPackagePriceCents)}</p></div>
            <div><small>Visite supplémentaire Médine</small><p>{formatEuros(selected.proposedMadinahPlacePriceCents)}</p></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
            <div><small>Inclus à Makkah</small><p style={{ whiteSpace: 'pre-wrap' }}>{selected.makkahIncludedDetails || 'Non renseigné'}</p></div>
            <div><small>Autres précisions Makkah</small><p style={{ whiteSpace: 'pre-wrap' }}>{selected.makkahOtherDetails || 'Non renseigné'}</p></div>
            <div><small>Inclus à Médine</small><p style={{ whiteSpace: 'pre-wrap' }}>{selected.madinahIncludedDetails || 'Non renseigné'}</p></div>
            <div><small>Autres précisions Médine</small><p style={{ whiteSpace: 'pre-wrap' }}>{selected.madinahOtherDetails || 'Non renseigné'}</p></div>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}><b>Précisions tarifaires :</b> {selected.pricingDetails || 'Non renseigné'}</p>
          <small style={{ color: '#7A6D5A' }}>Ces montants sont informatifs. Ils ne modifient pas les tarifs du profil public.</small>
        </div>
        <div style={{ marginTop: 16 }}>
          <b>Coordonnées bancaires</b>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginTop: 10 }}>
            <div><small>Titulaire</small><p>{selected.bankAccountFirstName} {selected.bankAccountLastName}</p></div>
            <div><small>Banque</small><p>{selected.bankName}</p></div>
            <div><small>Pays</small><p>{selected.bankCountry}</p></div>
            <div><small>IBAN</small><p>{selected.ibanMasked || 'Non renseigné'}</p></div>
            <div><small>SWIFT / BIC</small><p>{selected.bicMasked || 'Non renseigné'}</p></div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}><b>Présentation</b><p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{selected.bio || 'Non renseigné'}</p></div>
        <label style={{ display: 'grid', gap: 7, marginTop: 16 }}><b>Notes internes</b><textarea value={notes} onChange={event => setNotes(event.target.value)} rows={4} maxLength={2000} style={{ padding: 12, border: '1px solid #E8DFC8', borderRadius: 8 }} /></label>
        {selected.reviewedByEmail && <p style={{ color: '#7A6D5A', fontSize: 12 }}>Dernier traitement : {selected.reviewedByEmail} · {formatDate(selected.reviewedAt)}</p>}
        {selected.status !== 'APPROVED' && <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 18 }}>
          <button disabled={saving} onClick={() => update('IN_REVIEW')} style={{ padding: '10px 16px' }}>Mettre en cours</button>
          <button disabled={saving} onClick={() => update('REJECTED')} style={{ padding: '10px 16px', background: '#991B1B', color: 'white', border: 0, borderRadius: 7 }}>Rejeter</button>
          <button disabled={saving} onClick={() => update('APPROVED')} style={{ padding: '10px 16px', background: '#166534', color: 'white', border: 0, borderRadius: 7 }}>Valider et créer le compte</button>
        </div>}
      </article>
    </div>}
  </div>
}
