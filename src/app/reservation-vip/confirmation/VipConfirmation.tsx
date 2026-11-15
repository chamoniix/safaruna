'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type VipStatus = {
  paid: boolean
  calendlyUrl: string | null
  contactPlatform: 'WHATSAPP' | 'TELEGRAM' | null
  contactPhone: string | null
}

export default function VipConfirmation({ refNumber }: { refNumber: string }) {
  const [status, setStatus] = useState<VipStatus | null>(null)
  const [platform, setPlatform] = useState<'WHATSAPP' | 'TELEGRAM'>('WHATSAPP')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined
    async function refresh() {
      try {
        const response = await fetch(`/api/reservation-vip/${encodeURIComponent(refNumber)}`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Vérification temporairement indisponible')
        const next = await response.json() as VipStatus
        if (!active) return
        setStatus(next)
        if (next.paid) {
          setPlatform(next.contactPlatform ?? 'WHATSAPP')
          setPhone(next.contactPhone ?? '')
          return
        }
      } catch {
        if (!active) return
      }
      timer = setTimeout(() => void refresh(), 4000)
    }
    void refresh()
    return () => { active = false; clearTimeout(timer) }
  }, [refNumber])

  async function saveContact() {
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`/api/reservation-vip/${encodeURIComponent(refNumber)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, phone }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Enregistrement impossible.')
      setMessage('Votre préférence a bien été enregistrée.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Enregistrement impossible.')
    } finally { setSaving(false) }
  }

  return <main style={{ minHeight: '75vh', padding: '8rem 1.25rem 5rem', background: '#15130F', color: '#F8F4E9' }}>
    <section style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(1.5rem,5vw,3rem)', border: '1px solid rgba(213,182,94,.35)', background: '#1D1A14' }}>
      <p style={{ color: '#D5B65E', letterSpacing: '.18em', textTransform: 'uppercase', fontSize: '.72rem' }}>Réservation VIP · {refNumber}</p>
      {!status?.paid ? <>
        <h1 style={{ color: 'inherit', font: '500 clamp(2.2rem,6vw,3.5rem) var(--font-cormorant, Georgia, serif)' }}>Nous vérifions votre paiement</h1>
        <p style={{ color: '#D5D0C4', lineHeight: 1.8 }}>Cette page se mettra à jour dès que Whop aura confirmé le règlement de votre acompte.</p>
      </> : <>
        <h1 style={{ color: 'inherit', font: '500 clamp(2.2rem,6vw,3.5rem) var(--font-cormorant, Georgia, serif)' }}>Votre acompte est confirmé</h1>
        <p style={{ color: '#D5D0C4', lineHeight: 1.8 }}>Choisissez maintenant votre créneau pour échanger avec notre organisateur. Nous vous enverrons ensuite la confirmation écrite et la suite de votre demande.</p>
        {status.calendlyUrl ? <a href={status.calendlyUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', margin: '.5rem 0 1.5rem', borderRadius: 999, padding: '.9rem 1.35rem', color: '#17130C', background: 'linear-gradient(135deg,#F0D897,#B99037)', textDecoration: 'none', fontWeight: 700 }}>Choisir mon créneau Calendly</a> : <p role="alert">Le lien de rendez-vous n’est pas configuré. Contactez SAFARUMA avec votre référence.</p>}
        <h2 style={{ marginTop: '1.2rem', font: '500 1.8rem var(--font-cormorant, Georgia, serif)' }}>Votre canal de contact préféré</h2>
        <label style={{ display: 'block', margin: '.8rem 0', color: '#D5D0C4' }}>WhatsApp ou Telegram
          <select value={platform} onChange={event => setPlatform(event.target.value as 'WHATSAPP' | 'TELEGRAM')} style={{ display: 'block', width: '100%', marginTop: '.35rem', padding: '.8rem', background: '#15130F', color: '#F8F4E9', border: '1px solid #6E613D', borderRadius: 6 }}>
            <option value="WHATSAPP">WhatsApp</option><option value="TELEGRAM">Telegram</option>
          </select>
        </label>
        <label style={{ display: 'block', margin: '.8rem 0', color: '#D5D0C4' }}>Votre numéro avec indicatif
          <input value={phone} onChange={event => setPhone(event.target.value)} autoComplete="tel" placeholder="+33…" style={{ display: 'block', width: '100%', marginTop: '.35rem', padding: '.8rem', background: '#15130F', color: '#F8F4E9', border: '1px solid #6E613D', borderRadius: 6 }} />
        </label>
        <button type="button" onClick={saveContact} disabled={saving || phone.trim().length < 6} style={{ marginTop: '.4rem', border: 0, borderRadius: 999, padding: '.8rem 1.2rem', background: '#D5B65E', color: '#17130C', fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Enregistrement…' : 'Enregistrer ma préférence'}</button>
        {message && <p role="status" style={{ color: '#E2C97A' }}>{message}</p>}
      </>}
      <p style={{ marginTop: '2rem', color: '#B8B0A0', fontSize: '.82rem' }}>Besoin d’aide ? <Link href="/contact" style={{ color: '#E2C97A' }}>Contacter SAFARUMA</Link></p>
    </section>
  </main>
}
