'use client'

import { useState } from 'react'

export default function PayDepositButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function startCheckout() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/reservation-vip/create-session', { method: 'POST' })
      const result = await response.json() as { checkoutUrl?: string; error?: string }
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || 'Paiement indisponible.')
      window.location.assign(result.checkoutUrl)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Paiement indisponible.')
      setLoading(false)
    }
  }

  return <div>
    <button type="button" onClick={startCheckout} disabled={loading} style={{ border: 0, borderRadius: 999, padding: '1rem 1.6rem', color: '#17130C', background: 'linear-gradient(135deg,#F0D897,#B99037)', font: '700 1rem var(--font-manrope, sans-serif)', cursor: loading ? 'wait' : 'pointer' }}>
      {loading ? 'Préparation du paiement…' : 'Verser l’acompte de 500 €'}
    </button>
    {error && <p role="alert" style={{ color: '#ffd7c9', margin: '0.8rem 0 0' }}>{error}</p>}
  </div>
}
