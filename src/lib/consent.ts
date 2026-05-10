const CONSENT_KEY = 'safaruma_consent';
const CONSENT_VERSION = '1.0';
const CONSENT_DURATION_MONTHS = 13;

export type ConsentChoice = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  confort: boolean;
  timestamp: string;
  version: string;
};

type UserInput = {
  analytics?: boolean;
  marketing?: boolean;
  confort?: boolean;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function dispatchConsentChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('consent-changed'));
  }
}

function pushConsentToGtag(choice: ConsentChoice) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: choice.analytics ? 'granted' : 'denied',
      ad_storage: choice.marketing ? 'granted' : 'denied',
      ad_user_data: choice.marketing ? 'granted' : 'denied',
      ad_personalization: choice.marketing ? 'granted' : 'denied',
      functionality_storage: choice.confort ? 'granted' : 'denied',
      personalization_storage: choice.confort ? 'granted' : 'denied',
    });
  }
}

export function getConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed: ConsentChoice = JSON.parse(raw);
    const expiry = new Date(parsed.timestamp);
    expiry.setMonth(expiry.getMonth() + CONSENT_DURATION_MONTHS);
    if (new Date() > expiry) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setConsent(input: UserInput): void {
  if (typeof window === 'undefined') return;
  const current = getConsent();
  const updated: ConsentChoice = {
    essential: true,
    analytics: input.analytics ?? current?.analytics ?? false,
    marketing: input.marketing ?? current?.marketing ?? false,
    confort: input.confort ?? current?.confort ?? false,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(updated));
  pushConsentToGtag(updated);
  dispatchConsentChanged();
}

export function hasConsented(): boolean {
  return getConsent() !== null;
}

export function resetConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_KEY);
  dispatchConsentChanged();
}

export function acceptAll(): void {
  setConsent({ analytics: true, marketing: true, confort: true });
}

export function rejectAll(): void {
  setConsent({ analytics: false, marketing: false, confort: false });
}
