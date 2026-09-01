'use client'

import { useEffect, useState } from 'react'

type Referral = {
  id: string; status: 'REGISTERED' | 'QUALIFIED'; createdAt: string; qualifiedAt: string | null
  sponsor: { name: string | null; firstName: string | null; lastName: string | null; email: string | null }
  referred: { name: string | null; firstName: string | null; lastName: string | null; email: string | null }
  payment: { refNumber: string; totalPrice: number; createdAt: string } | null
  promoCodes: Array<{ code: string; kind: 'REFERRED_SIGNUP' | 'SPONSOR_REWARD'; status: string; discountPercent: number; expiresAt: string; redeemedAt: string | null }>
}

const date = (value: string | null) => value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
const identity = (person: Referral['sponsor']) => person.name || `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim() || person.email || '—'

export default function AdminReferralsPage() {
  const [rows, setRows] = useState<Referral[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/admin/referrals', { cache: 'no-store' }).then(async response => {
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Impossible de charger les parrainages.')
      setRows(body.referrals || [])
    }).catch(reason => setError(reason instanceof Error ? reason.message : 'Impossible de charger les parrainages.')).finally(() => setLoading(false))
  }, [])
  const qualified = rows.filter(row => row.status === 'QUALIFIED').length
  return <div style={{ display: 'grid', gap: '1rem' }}>
    <header><h1 style={{ margin: 0, fontSize: '1.5rem', color: '#0F172A' }}>Parrainages</h1><p style={{ margin: '.25rem 0 0', color: '#64748B', fontSize: '.78rem' }}>Données réelles : lien utilisé, inscription, codes à 10 % et paiement Stripe qualifiant.</p></header>
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '.7rem' }}>{[['Liens utilisés', rows.length], ['Paiements confirmés', qualified], ['En attente', rows.length - qualified]].map(([label, value]) => <article key={String(label)} style={{ background: 'white', border: '1px solid #DCE6F0', borderRadius: 12, padding: '.9rem' }}><div style={{ color: '#64748B', fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</div><strong style={{ display: 'block', marginTop: '.35rem', color: '#0F172A', fontSize: '1.6rem' }}>{loading ? '—' : value}</strong></article>)}</section>
    {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '.75rem', color: '#B91C1C', fontSize: '.8rem' }}>{error}</div>}
    <section style={{ background: 'white', border: '1px solid #DCE6F0', borderRadius: 12, overflow: 'auto' }}><table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse' }}><thead><tr style={{ background: '#F8FAFC' }}>{['Parrain', 'Filleul', 'Lien utilisé', 'Statut', 'Codes', 'Paiement Stripe'].map(label => <th key={label} style={{ textAlign: 'left', padding: '.75rem', fontSize: '.62rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</th>)}</tr></thead><tbody>{!loading && !rows.length ? <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748B', fontSize: '.8rem' }}>Aucun parrainage réel.</td></tr> : rows.map(row => <tr key={row.id} style={{ borderTop: '1px solid #EEF2F7' }}><td style={{ padding: '.75rem', fontSize: '.78rem' }}><b>{identity(row.sponsor)}</b><br /><small style={{ color: '#64748B' }}>{row.sponsor.email}</small></td><td style={{ padding: '.75rem', fontSize: '.78rem' }}><b>{identity(row.referred)}</b><br /><small style={{ color: '#64748B' }}>{row.referred.email}</small></td><td style={{ padding: '.75rem', color: '#64748B', fontSize: '.72rem' }}>{date(row.createdAt)}</td><td style={{ padding: '.75rem' }}><span style={{ borderRadius: 99, padding: '.25rem .55rem', background: row.status === 'QUALIFIED' ? '#DCFCE7' : '#FEF3C7', color: row.status === 'QUALIFIED' ? '#166534' : '#92400E', fontSize: '.65rem', fontWeight: 800 }}>{row.status === 'QUALIFIED' ? 'Paiement confirmé' : 'En attente'}</span></td><td style={{ padding: '.75rem', fontSize: '.7rem' }}>{row.promoCodes.map(code => <div key={`${code.kind}:${code.code}`}><code>{code.code}</code> · {code.discountPercent} % · {code.status}</div>)}</td><td style={{ padding: '.75rem', fontSize: '.75rem' }}>{row.payment ? <><code>{row.payment.refNumber}</code><br /><b>{row.payment.totalPrice.toLocaleString('fr-FR')} €</b><br /><small style={{ color: '#64748B' }}>{date(row.payment.createdAt)}</small></> : '—'}</td></tr>)}</tbody></table></section>
  </div>
}
