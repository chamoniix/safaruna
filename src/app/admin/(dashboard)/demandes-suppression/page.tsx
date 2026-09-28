'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Status = 'PENDING' | 'APPROVED' | 'REJECTED'
type DeletionRequest = {
  id: string
  status: Status
  requestedAt: string
  reviewedAt: string | null
  reviewedByEmail: string | null
  reviewNotes: string | null
  user: { id: string; name: string; email: string | null; createdAt: string }
}

type Payload = {
  requests: DeletionRequest[]
  counts: Partial<Record<Status, number>>
}

const labels: Record<Status, string> = {
  PENDING: 'À traiter',
  APPROVED: 'Validée',
  REJECTED: 'Rejetée',
}

const tones: Record<Status, { color: string; bg: string }> = {
  PENDING: { color: '#92400E', bg: '#FEF3C7' },
  APPROVED: { color: '#166534', bg: '#DCFCE7' },
  REJECTED: { color: '#991B1B', bg: '#FEE2E2' },
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Non renseigné'
}

export default function DeletionRequestsPage() {
  const [data, setData] = useState<Payload | null>(null)
  const [status, setStatus] = useState<'ALL' | Status>('PENDING')
  const [selected, setSelected] = useState<DeletionRequest | null>(null)
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
    const params = new URLSearchParams()
    if (status !== 'ALL') params.set('status', status)
    try {
      const response = await fetch(`/api/admin/deletion-requests?${params}`, { cache: 'no-store', signal: controller.signal })
      const payload = await response.json()
      if (controller.signal.aborted) return
      if (!response.ok) throw new Error(payload.error || 'Chargement impossible')
      setData(payload)
    } catch (cause) {
      if (!controller.signal.aborted) setLoadError(cause instanceof Error ? cause.message : 'Chargement impossible')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [status])

  const reloadCurrentFilters = useRef<(() => Promise<void>) | null>(null)
  useEffect(() => {
    reloadCurrentFilters.current = load
    void load()
    return () => {
      reloadCurrentFilters.current = null
      activeRequest.current?.abort()
    }
  }, [load])

  async function update(nextStatus: 'APPROVED' | 'REJECTED') {
    if (!selected) return
    const action = nextStatus === 'APPROVED'
      ? 'valider — le compte sera anonymisé définitivement (nom, email, téléphone), ses réservations passées sont conservées sans lien nominatif'
      : 'rejeter — le compte du pèlerin sera réactivé'
    if (!window.confirm(`Confirmer : ${action} ?`)) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/admin/deletion-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: selected.id, status: nextStatus, reviewNotes: notes }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Mise à jour impossible')
      setSelected(null)
      setNotes('')
      await reloadCurrentFilters.current?.()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mise à jour impossible')
    } finally {
      setSaving(false)
    }
  }

  return <div style={{ display: 'grid', gap: 20 }}>
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
      {(['PENDING', 'APPROVED', 'REJECTED'] as Status[]).map(item => <button key={item} onClick={() => setStatus(item)} style={{ textAlign: 'left', border: status === item ? '2px solid #C9A84C' : '1px solid #E8DFC8', borderRadius: 12, padding: 16, background: 'white', cursor: 'pointer' }}>
        <span style={{ display: 'block', color: '#7A6D5A', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700 }}>{labels[item]}</span>
        <strong style={{ display: 'block', fontSize: 28, color: tones[item].color, marginTop: 8 }}>{loading || !data ? '—' : data.counts[item] ?? 0}</strong>
      </button>)}
    </section>

    <section style={{ background: 'white', border: '1px solid #E8DFC8', borderRadius: 12, overflow: 'hidden' }}>
      {error && <div style={{ margin: 16, padding: 12, background: '#FEE2E2', color: '#991B1B', borderRadius: 8 }}>{error}</div>}
      {loadError && <div role="alert" style={{ margin: 16, padding: 12, background: '#FEE2E2', color: '#991B1B', borderRadius: 8 }}>
        {loadError} <button type="button" onClick={() => void load()} disabled={loading}>Réessayer</button>
      </div>}
      <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead><tr style={{ background: '#F8F6F2' }}>{['Pèlerin', 'Email', 'Compte créé le', 'Demande reçue', 'Statut', ''].map(label => <th key={label} style={{ padding: 12, textAlign: 'left', color: '#7A6D5A', fontSize: 11, textTransform: 'uppercase' }}>{label}</th>)}</tr></thead>
        <tbody>{loading ? <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center' }}>Chargement…</td></tr> : !data ? <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: '#991B1B' }}>Les demandes n’ont pas pu être chargées.</td></tr> : !data.requests.length ? <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: '#7A6D5A' }}>Aucune demande.</td></tr> : data.requests.map(item => <tr key={item.id} style={{ borderTop: '1px solid #F0EBE0' }}>
          <td style={{ padding: 12 }}><strong>{item.user.name}</strong></td>
          <td style={{ padding: 12 }}>{item.user.email}</td>
          <td style={{ padding: 12, whiteSpace: 'nowrap' }}>{formatDate(item.user.createdAt)}</td>
          <td style={{ padding: 12, whiteSpace: 'nowrap' }}>{formatDate(item.requestedAt)}</td>
          <td style={{ padding: 12 }}><span style={{ background: tones[item.status].bg, color: tones[item.status].color, padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{labels[item.status]}</span></td>
          <td style={{ padding: 12 }}><button onClick={() => { setSelected(item); setNotes(item.reviewNotes || '') }} style={{ border: 0, borderRadius: 20, padding: '7px 12px', background: '#1A1209', color: '#F0D897', cursor: 'pointer' }}>Voir</button></td>
        </tr>)}</tbody>
      </table></div>
    </section>

    {selected && <div onClick={event => { if (event.target === event.currentTarget) setSelected(null) }} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(15,10,5,.55)', display: 'grid', placeItems: 'center', padding: 20 }}>
      <article style={{ width: 'min(520px,100%)', maxHeight: '90vh', overflow: 'auto', background: 'white', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}><div><h2 style={{ margin: 0 }}>{selected.user.name}</h2><p style={{ color: '#7A6D5A' }}>Demande {selected.id}</p></div><button onClick={() => setSelected(null)} style={{ border: 0, background: 'transparent', fontSize: 20 }}>×</button></div>
        <div style={{ display: 'grid', gap: 8, background: '#F8F6F2', padding: 16, borderRadius: 12, marginTop: 12 }}>
          <div><b>Email</b><p style={{ margin: '2px 0 0' }}>{selected.user.email}</p></div>
          <div><b>Compte créé le</b><p style={{ margin: '2px 0 0' }}>{formatDate(selected.user.createdAt)}</p></div>
          <div><b>Demande reçue le</b><p style={{ margin: '2px 0 0' }}>{formatDate(selected.requestedAt)}</p></div>
        </div>
        <label style={{ display: 'grid', gap: 7, marginTop: 16 }}><b>Notes internes</b><textarea value={notes} onChange={event => setNotes(event.target.value)} rows={4} maxLength={2000} style={{ padding: 12, border: '1px solid #E8DFC8', borderRadius: 8 }} /></label>
        {selected.reviewedByEmail && <p style={{ color: '#7A6D5A', fontSize: 12 }}>Dernier traitement : {selected.reviewedByEmail} · {formatDate(selected.reviewedAt)}</p>}
        {selected.status === 'PENDING' && <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 18 }}>
          <button disabled={saving} onClick={() => update('REJECTED')} style={{ padding: '10px 16px', border: '1px solid #E8DFC8', borderRadius: 7, background: 'white', cursor: 'pointer' }}>Rejeter (réactiver le compte)</button>
          <button disabled={saving} onClick={() => update('APPROVED')} style={{ padding: '10px 16px', background: '#991B1B', color: 'white', border: 0, borderRadius: 7, cursor: 'pointer' }}>Valider (anonymiser définitivement)</button>
        </div>}
      </article>
    </div>}
  </div>
}
