'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect, useRef, useState } from 'react'
import type { RevolutCheckoutError } from '@revolut/checkout'

type FallbackReason = 'cancelled' | 'sdk_error' | 'payment_error'

type RevolutEmbeddedCheckoutProps = {
  checkoutToken: string
  confirmationUrl: string
  hostedCheckoutUrl: string
  onFallback: (reason: FallbackReason) => void
  onLeaveForPayment: () => void
}

export function isAllowedHostedCheckoutUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'checkout.revolut.com'
  } catch {
    return false
  }
}

export default function RevolutEmbeddedCheckout({
  checkoutToken,
  confirmationUrl,
  hostedCheckoutUrl,
  onFallback,
  onLeaveForPayment,
}: RevolutEmbeddedCheckoutProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<{ destroy: () => void } | null>(null)
  const fallbackReportedRef = useRef<FallbackReason | null>(null)
  const [fallbackReason, setFallbackReason] = useState<FallbackReason | null>(null)

  const reportFallback = (reason: FallbackReason, error?: unknown) => {
    setFallbackReason(reason)
    if (fallbackReportedRef.current !== reason) {
      fallbackReportedRef.current = reason
      onFallback(reason)
    }
    if (error) {
      Sentry.captureException(error, {
        tags: { area: 'revolut-embedded-checkout', reason },
      })
    }
  }

  useEffect(() => {
    let disposed = false

    const mountCheckout = async () => {
      const publicKey = process.env.NEXT_PUBLIC_REVOLUT_MERCHANT_PUBLIC_KEY?.trim()
      const target = targetRef.current
      if (!publicKey || !target) {
        reportFallback('sdk_error', new Error('Revolut Checkout public configuration is unavailable'))
        return
      }

      try {
        const { default: RevolutCheckout } = await import('@revolut/checkout')
        if (disposed || !targetRef.current) return

        const instance = await RevolutCheckout.embeddedCheckout({
          publicToken: publicKey,
          mode: 'prod',
          locale: 'fr',
          target: targetRef.current,
          createOrder: async () => ({ publicId: checkoutToken }),
          onSuccess: () => {
            onLeaveForPayment()
            window.location.assign(confirmationUrl)
          },
          onCancel: () => reportFallback('cancelled'),
          onError: ({ error }: { error: RevolutCheckoutError }) => {
            reportFallback('payment_error', error)
          },
        })

        if (disposed) {
          instance.destroy()
          return
        }
        instanceRef.current = instance
      } catch (error) {
        if (!disposed) reportFallback('sdk_error', error)
      }
    }

    void mountCheckout()
    return () => {
      disposed = true
      instanceRef.current?.destroy()
      instanceRef.current = null
    }
    // The callbacks are intentionally fixed for this payment order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutToken, confirmationUrl])

  const hasSafeFallback = isAllowedHostedCheckoutUrl(hostedCheckoutUrl)

  return (
    <div style={{ marginTop: '1rem' }}>
      {!fallbackReason && (
        <div style={{ color: '#7A6D5A', fontSize: '0.78rem', marginBottom: '0.75rem', textAlign: 'center' }}>
          Choisissez votre moyen de paiement sécurisé.
        </div>
      )}
      <div ref={targetRef} aria-label="Paiement sécurisé Revolut" />
      {fallbackReason && (
        <div role="alert" style={{ background: '#FAF7F0', border: '1px solid #E8DFC8', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
          <div style={{ color: '#1A1209', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Le module intégré n’a pas pu terminer le paiement.
          </div>
          {hasSafeFallback ? (
            <a
              href={hostedCheckoutUrl}
              onClick={onLeaveForPayment}
              style={{ display: 'inline-block', borderRadius: 50, padding: '0.8rem 1rem', background: '#1A1209', color: '#F0D897', fontSize: '0.8rem', fontWeight: 800, textDecoration: 'none' }}
            >
              Continuer sur la page sécurisée Revolut
            </a>
          ) : (
            <div style={{ color: '#C0392B', fontSize: '0.78rem', fontWeight: 700 }}>
              Le paiement est momentanément indisponible. Réessayez dans un instant.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
