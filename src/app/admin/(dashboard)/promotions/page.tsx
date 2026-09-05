'use client'

import { useCallback, useEffect, useState } from 'react'

type Campaign = {
  id: string; name: string; code: string; status: string; discountPercent: number
  startsAt: string; expiresAt: string; maxRedemptions: number | null
  maxRedemptionsPerPelerin: number | null; maxDiscountBudgetEuros: number | null
  redeemedCount: number; heldCount: number; promotionExpenseEuros: number
  createdByAdmin: { email: string }
}

const initialForm = {
  name: '', code: '', discountPercent: '10', startsAt: '', expiresAt: '',
  maxRedemptions: '', maxRedemptionsPerPelerin: '1', maxDiscountBudgetEuros: '',
}

export default function PromotionsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [canEdit, setCanEdit] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/promotions', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Impossible de charger les campagnes.')
      setCampaigns(data.campaigns || [])
      setCanEdit(Boolean(data.canEdit))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de charger les campagnes.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const create = async () => {
    setSaving(true); setError('')
    try {
      const response = await fetch('/api/admin/promotions', {
        method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          name: form.name, code: form.code, discountPercent: Number(form.discountPercent),
          startsAt: new Date(form.startsAt).toISOString(), expiresAt: new Date(form.expiresAt).toISOString(),
          maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
          maxRedemptionsPerPelerin: form.maxRedemptionsPerPelerin ? Number(form.maxRedemptionsPerPelerin) : null,
          maxDiscountBudgetEuros: form.maxDiscountBudgetEuros ? Number(form.maxDiscountBudgetEuros) : null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Création impossible.')
      setForm(initialForm); setEditingId(null); await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Création impossible.') }
    finally { setSaving(false) }
  }

  const toggle = async (campaign: Campaign) => {
    setSaving(true); setError('')
    try {
      const response = await fetch('/api/admin/promotions', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id, status: campaign.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Modification impossible.')
      await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Modification impossible.') }
    finally { setSaving(false) }
  }

  const edit = (campaign: Campaign) => {
    const localDate = (value: string) => {
      const date = new Date(value)
      return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
    }
    setEditingId(campaign.id)
    setForm({
      name: campaign.name, code: campaign.code, discountPercent: String(campaign.discountPercent),
      startsAt: localDate(campaign.startsAt), expiresAt: localDate(campaign.expiresAt),
      maxRedemptions: campaign.maxRedemptions === null ? '' : String(campaign.maxRedemptions),
      maxRedemptionsPerPelerin: campaign.maxRedemptionsPerPelerin === null ? '' : String(campaign.maxRedemptionsPerPelerin),
      maxDiscountBudgetEuros: campaign.maxDiscountBudgetEuros === null ? '' : String(campaign.maxDiscountBudgetEuros),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const card = { background: 'white', border: '1px solid #D9E4F0', borderRadius: 12, padding: '1rem' }
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div><h1 style={{ margin: 0, fontSize: '1.45rem' }}>Campagnes promotionnelles</h1><p style={{ color: '#64748B', fontSize: '.78rem' }}>Codes marketing séparés du parrainage. Les remises sont financées par SAFARUMA.</p></div>
    {canEdit && <section style={card}>
      <h2 style={{ marginTop: 0, fontSize: '1rem' }}>{editingId ? 'Modifier la campagne' : 'Nouvelle campagne'}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '.65rem' }}>
        {[
          ['name','Nom','text'], ['code','Code','text'], ['discountPercent','Remise (%)','number'],
          ['startsAt','Début','datetime-local'], ['expiresAt','Fin','datetime-local'],
          ['maxRedemptions','Utilisations globales','number'], ['maxRedemptionsPerPelerin','Par pèlerin','number'],
          ['maxDiscountBudgetEuros','Budget remise (€)','number'],
        ].map(([key,label,type]) => <label key={key} style={{ fontSize: '.72rem', fontWeight: 700 }}>{label}<input type={type} value={form[key as keyof typeof form]} onChange={event => setForm(current => ({ ...current, [key]: event.target.value }))} style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 5, padding: '.55rem', border: '1px solid #CBD5E1', borderRadius: 8 }} /></label>)}
      </div>
      <div style={{ display: 'flex', gap: '.5rem', marginTop: '.8rem' }}><button disabled={saving || !form.name || !form.code || !form.startsAt || !form.expiresAt} onClick={create} style={{ padding: '.6rem 1rem', border: 0, borderRadius: 8, background: '#0369A1', color: 'white', fontWeight: 800, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Créer la campagne'}</button>{editingId && <button onClick={() => { setEditingId(null); setForm(initialForm) }}>Annuler</button>}</div>
    </section>}
    {error && <div style={{ padding: '.7rem', background: '#FEF2F2', color: '#B91C1C', borderRadius: 8 }}>{error}</div>}
    <section style={{ ...card, overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 850 }}><thead><tr>{['Campagne','Remise','Période','Utilisation','Budget consommé','Créée par','Statut','Action'].map(item => <th key={item} style={{ padding: '.6rem', textAlign: 'left', fontSize: '.65rem', color: '#64748B' }}>{item}</th>)}</tr></thead><tbody>
      {loading ? <tr><td colSpan={8} style={{ padding: '1.5rem', textAlign: 'center' }}>Chargement…</td></tr> : campaigns.length === 0 ? <tr><td colSpan={8} style={{ padding: '1.5rem', textAlign: 'center' }}>Aucune campagne</td></tr> : campaigns.map(campaign => <tr key={campaign.id} style={{ borderTop: '1px solid #E2E8F0' }}><td style={{ padding: '.7rem' }}><b>{campaign.name}</b><br/><code>{campaign.code}</code></td><td>{campaign.discountPercent} %</td><td>{new Date(campaign.startsAt).toLocaleString('fr-FR')}<br/>{new Date(campaign.expiresAt).toLocaleString('fr-FR')}</td><td>{campaign.redeemedCount} payée(s) · {campaign.heldCount} en cours<br/><small>Limite {campaign.maxRedemptions ?? 'illimitée'} · {campaign.maxRedemptionsPerPelerin ?? 'illimitée'} / pèlerin</small></td><td>{campaign.promotionExpenseEuros.toFixed(2)} € / {campaign.maxDiscountBudgetEuros === null ? 'illimité' : `${campaign.maxDiscountBudgetEuros} €`}</td><td>{campaign.createdByAdmin.email}</td><td><b>{campaign.status}</b></td><td>{canEdit && <div style={{ display: 'flex', gap: 4 }}><button disabled={saving} onClick={() => edit(campaign)}>Modifier</button><button disabled={saving || campaign.status === 'EXPIRED'} onClick={() => toggle(campaign)}>{campaign.status === 'ACTIVE' ? 'Désactiver' : campaign.status === 'EXHAUSTED' ? 'Réactiver' : 'Activer'}</button></div>}</td></tr>)}
    </tbody></table></section>
  </div>
}
