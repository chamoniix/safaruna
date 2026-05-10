'use client';
import { useState, useEffect } from 'react';
import {
  ConsentChoice,
  getConsent,
  hasConsented,
  resetConsent as libResetConsent,
  setConsent,
} from '@/lib/consent';

export function useConsent() {
  const [consent, setConsentState] = useState<ConsentChoice | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsentState(getConsent());
    const handler = () => setConsentState(getConsent());
    window.addEventListener('consent-changed', handler);
    return () => window.removeEventListener('consent-changed', handler);
  }, []);

  return {
    consent: mounted ? consent : null,
    hasConsented: mounted ? hasConsented() : false,
    updateConsent: setConsent,
    resetConsent: () => {
      libResetConsent();
      setConsentState(null);
    },
  };
}
