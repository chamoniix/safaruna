'use client'

import { useEffect, useState } from 'react'

type ReferralData = {
  link: string
  stats: { invited: number; qualified: number; pending: number }
  referrals: Array<{ id: string; name: string; status: 'REGISTERED' | 'QUALIFIED'; createdAt: string; qualifiedAt: string | null }>
  promoCodes: Array<{ id: string; code: string; kind: 'REFERRED_SIGNUP' | 'SPONSOR_REWARD'; status: 'ACTIVE' | 'HELD' | 'REDEEMED' | 'EXPIRED'; discountPercent: number; expiresAt: string; redeemedAt: string | null; daysRemaining: number }>
}

function date(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
}

export default function ParrainagePage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/espace/referral', { cache: 'no-store' })
      .then(async response => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || 'Impossible de charger le parrainage.')
        setData(body)
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Impossible de charger le parrainage.'))
  }, [])

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2_500)
  }
  const card: React.CSSProperties = { background: 'white', border: '1px solid #EDE8DC', borderRadius: 16, padding: '1.25rem' }
  const activeCodes = data?.promoCodes.filter(code => code.status === 'ACTIVE' || code.status === 'HELD') || []

  return <div style={{ display: 'grid', gap: '1.25rem' }}>
    <header>
      <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 600, color: '#1A1209', margin: 0 }}>Parrainage</h1>
      <p style={{ fontSize: '0.875rem', color: '#7A6D5A', margin: '0.25rem 0 0' }}>Partagez votre lien. Chaque code est personnel, valable 60 jours et utilisable une seule fois.</p>
    </header>

    {error && <div style={{ padding: '0.9rem 1rem', borderRadius: 10, background: '#FDECEA', color: '#C0392B', fontSize: '0.82rem' }}>{error}</div>}

    <section style={{ background: 'linear-gradient(135deg, #1A1209, #2D1F08)', borderRadius: 20, padding: '1.75rem', color: 'white' }}>
      <div style={{ fontSize: '0.65rem', color: '#F0D897', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>Programme de parrainage</div>
      <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', margin: '0.5rem 0', fontSize: '2rem' }}>10 % pour votre proche,<br />10 % pour vous</h2>
      <p style={{ color: 'rgba(255,255,255,.68)', fontSize: '.83rem', lineHeight: 1.65, maxWidth: 620, margin: 0 }}>Votre proche reçoit son code après son inscription. Après son paiement confirmé, votre code personnel vous est envoyé par email.</p>
    </section>

    <section style={card}>
      <div style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '.8rem' }}>Mon lien de parrainage</div>
      {!data ? <div style={{ color: '#7A6D5A', fontSize: '.82rem' }}>Chargement du lien…</div> : <>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
          <code style={{ flex: '1 1 260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: '#FAF7F0', border: '1px solid #EDE8DC', borderRadius: 10, padding: '.75rem .9rem', color: '#1A1209', fontSize: '.78rem' }}>{data.link}</code>
          <button type="button" onClick={() => copy(data.link)} style={{ border: 'none', borderRadius: 10, background: copied ? '#1D5C3A' : '#1A1209', color: '#F0D897', padding: '.7rem 1rem', cursor: 'pointer', fontWeight: 800, fontFamily: 'inherit' }}>{copied ? 'Copié' : 'Copier'}</button>
        </div>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginTop: '.75rem' }}>
          <a href={`https://wa.me/?text=${encodeURIComponent(`Découvrez SAFARUMA avec mon lien : ${data.link}`)}`} target="_blank" rel="noreferrer" style={{ color: '#1D5C3A', fontSize: '.78rem', fontWeight: 800, textDecoration: 'none' }}>Partager sur WhatsApp</a>
          <a href={`mailto:?subject=${encodeURIComponent('Invitation SAFARUMA')}&body=${encodeURIComponent(data.link)}`} style={{ color: '#7A6D5A', fontSize: '.78rem', fontWeight: 800, textDecoration: 'none' }}>Partager par email</a>
        </div>
      </>}
    </section>

    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '.8rem' }}>
        <div><div style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7A6D5A' }}>Mes codes promotionnels</div><p style={{ margin: '.25rem 0 0', color: '#7A6D5A', fontSize: '.76rem' }}>À saisir volontairement au checkout. Aucun cumul possible.</p></div>
      </div>
      {!data ? <div style={{ color: '#7A6D5A', fontSize: '.82rem' }}>Chargement…</div> : !activeCodes.length ? <div style={{ background: '#FAF7F0', borderRadius: 10, padding: '1rem', color: '#7A6D5A', fontSize: '.8rem' }}>Aucun code actif pour le moment.</div> : <div style={{ display: 'grid', gap: '.65rem' }}>{activeCodes.map(code => <article key={code.id} style={{ background: '#FAF7F0', border: '1px solid #EDE8DC', borderRadius: 10, padding: '.85rem', display: 'flex', justifyContent: 'space-between', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}><div><b style={{ color: '#1A1209', fontFamily: 'monospace', letterSpacing: '.04em' }}>{code.code}</b><div style={{ color: '#7A6D5A', fontSize: '.7rem', marginTop: '.25rem' }}>{code.kind === 'REFERRED_SIGNUP' ? 'Code de bienvenue parrainé' : 'Code récompense parrainage'} · expire le {date(code.expiresAt)} · {code.daysRemaining} j. restant(s)</div></div><button type="button" onClick={() => copy(code.code)} style={{ border: '1px solid #C9A84C', background: 'white', color: '#8B6914', padding: '.45rem .75rem', borderRadius: 8, cursor: 'pointer', fontWeight: 800, fontFamily: 'inherit', fontSize: '.72rem' }}>Copier · {code.discountPercent} %</button></article>)}</div>}
    </section>

    <section style={card}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '.65rem', marginBottom: '1rem' }}>
        {[['Invités', data?.stats.invited ?? '—'], ['Paiements confirmés', data?.stats.qualified ?? '—'], ['En attente', data?.stats.pending ?? '—']].map(([label, value]) => <div key={label} style={{ background: '#FAF7F0', borderRadius: 10, padding: '.8rem', textAlign: 'center' }}><strong style={{ display: 'block', color: '#1A1209', fontSize: '1.35rem' }}>{value}</strong><span style={{ color: '#7A6D5A', fontSize: '.66rem', fontWeight: 700 }}>{label}</span></div>)}
      </div>
      <div style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7A6D5A', marginBottom: '.75rem' }}>Historique réel</div>
      {!data ? null : !data.referrals.length ? <div style={{ color: '#7A6D5A', fontSize: '.8rem' }}>Aucun parrainage enregistré.</div> : <div style={{ display: 'grid', gap: '.5rem' }}>{data.referrals.map(referral => <div key={referral.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', alignItems: 'center', padding: '.7rem .8rem', borderRadius: 9, background: '#FAF7F0' }}><div><b style={{ color: '#1A1209', fontSize: '.82rem' }}>{referral.name}</b><div style={{ color: '#7A6D5A', fontSize: '.67rem', marginTop: 2 }}>Inscription le {date(referral.createdAt)}</div></div><span style={{ borderRadius: 99, padding: '.25rem .55rem', background: referral.status === 'QUALIFIED' ? '#E8F5EE' : '#FAF3E0', color: referral.status === 'QUALIFIED' ? '#1D5C3A' : '#8B6914', fontSize: '.64rem', fontWeight: 800 }}>{referral.status === 'QUALIFIED' ? 'Paiement confirmé' : 'En attente de paiement'}</span></div>)}</div>}
    </section>
  </div>
}
