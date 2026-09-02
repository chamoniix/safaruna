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

type CheckoutScrollSnapshot = {
  windowScrollY: number
  bodyOverflow: string
  bodyPosition: string
  bodyTop: string
  bodyWidth: string
  documentOverflow: string
  container: HTMLElement | null
  containerOverflowY: string
  containerScrollTop: number
}

export function captureCheckoutScrollState(target: HTMLElement): CheckoutScrollSnapshot {
  const ownerDocument = target.ownerDocument
  const container = target.closest<HTMLElement>('[data-checkout-scroll-container]')

  return {
    windowScrollY: ownerDocument.defaultView?.scrollY ?? 0,
    bodyOverflow: ownerDocument.body.style.overflow,
    bodyPosition: ownerDocument.body.style.position,
    bodyTop: ownerDocument.body.style.top,
    bodyWidth: ownerDocument.body.style.width,
    documentOverflow: ownerDocument.documentElement.style.overflow,
    container,
    containerOverflowY: container?.style.overflowY ?? '',
    containerScrollTop: container?.scrollTop ?? 0,
  }
}

export function restoreCheckoutScrollState(snapshot: CheckoutScrollSnapshot, ownerDocument: Document): void {
  ownerDocument.body.style.overflow = snapshot.bodyOverflow
  ownerDocument.body.style.position = snapshot.bodyPosition
  ownerDocument.body.style.top = snapshot.bodyTop
  ownerDocument.body.style.width = snapshot.bodyWidth
  ownerDocument.documentElement.style.overflow = snapshot.documentOverflow

  if (snapshot.container) {
    snapshot.container.style.overflowY = snapshot.containerOverflowY
    snapshot.container.scrollTop = snapshot.containerScrollTop
  }
  ownerDocument.defaultView?.scrollTo(0, snapshot.windowScrollY)
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
  const scrollSnapshotRef = useRef<CheckoutScrollSnapshot | null>(null)
  const restoreTimersRef = useRef<number[]>([])
  const [fallbackReason, setFallbackReason] = useState<FallbackReason | null>(null)
  const [isReady, setIsReady] = useState(false)

  const restorePageScroll = () => {
    const snapshot = scrollSnapshotRef.current
    const ownerDocument = targetRef.current?.ownerDocument
    if (!snapshot || !ownerDocument) return

    restoreTimersRef.current.forEach(timer => window.clearTimeout(timer))
    restoreTimersRef.current = [0, 250].map(delay => window.setTimeout(() => {
      restoreCheckoutScrollState(snapshot, ownerDocument)
    }, delay))
  }

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

      scrollSnapshotRef.current = captureCheckoutScrollState(target)

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
            restorePageScroll()
            onLeaveForPayment()
            window.location.assign(confirmationUrl)
          },
          onCancel: () => {
            restorePageScroll()
            reportFallback('cancelled')
          },
          onError: ({ error }: { error: RevolutCheckoutError }) => {
            restorePageScroll()
            reportFallback('payment_error', error)
          },
        })

        if (disposed) {
          instance.destroy()
          return
        }
        instanceRef.current = instance
        setIsReady(true)
      } catch (error) {
        if (!disposed) reportFallback('sdk_error', error)
      }
    }

    void mountCheckout()
    return () => {
      disposed = true
      instanceRef.current?.destroy()
      instanceRef.current = null
      restoreTimersRef.current.forEach(timer => window.clearTimeout(timer))
      restoreTimersRef.current = []
      const snapshot = scrollSnapshotRef.current
      const ownerDocument = target.ownerDocument
      if (snapshot && ownerDocument) restoreCheckoutScrollState(snapshot, ownerDocument)
    }
    // The callbacks are intentionally fixed for this payment order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutToken, confirmationUrl])

  const hasSafeFallback = isAllowedHostedCheckoutUrl(hostedCheckoutUrl)

  return (
    <div className="revolut-checkout-shell">
      <style>{`
        .revolut-checkout-shell { margin-top: 1rem; }
        .revolut-checkout-stage { min-height: 390px; position: relative; }
        .revolut-checkout-target { width: 100%; min-width: 0; }
        .revolut-checkout-loader {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: .75rem;
          color: #7A6D5A; font-size: .8rem; text-align: center;
        }
        .revolut-checkout-spinner {
          width: 28px; height: 28px; border-radius: 50%;
          border: 3px solid #E8DFC8; border-top-color: #C9A84C;
          animation: revolutCheckoutSpin .8s linear infinite;
        }
        @keyframes revolutCheckoutSpin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .revolut-checkout-shell { margin-inline: -1.5rem; }
          .revolut-checkout-intro { padding-inline: 1.5rem; }
          .revolut-checkout-stage { min-height: 410px; }
        }
      `}</style>
      {!fallbackReason && (
        <div className="revolut-checkout-intro" style={{ color: '#7A6D5A', fontSize: '0.78rem', marginBottom: '0.75rem', textAlign: 'center' }}>
          Choisissez votre moyen de paiement sécurisé.
        </div>
      )}
      <div className="revolut-checkout-stage" aria-busy={!isReady && !fallbackReason}>
        {!isReady && !fallbackReason && (
          <div className="revolut-checkout-loader" role="status" aria-live="polite">
            <span className="revolut-checkout-spinner" aria-hidden="true" />
            Préparation des moyens de paiement sécurisés…
          </div>
        )}
        <div ref={targetRef} className="revolut-checkout-target" aria-label="Paiement sécurisé Revolut" />
      </div>
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
