// Bump the version when the terms presented for acknowledgement change.
export const GUIDE_DOSSIER_TERMS_VERSION = '2026-11-23'
export const GUIDE_PAYOUT_POLICY = {
  delay: 'Le virement est envoyé trois jours ouvrés après la date de fin de la prestation du Guide. Les jours comptabilisés vont du lundi au vendredi ; le samedi et le dimanche sont exclus. Le calcul repose uniquement sur la date de fin, sans heure de fin à renseigner. Le Guide doit avoir déclaré sa prestation terminée dans son espace.',
  bankDelay: 'Le délai de réception dépend ensuite de votre banque. La réception des fonds n’est pas garantie le jour de l’envoi.',
  currency: 'Les virements sont envoyés en euros. Selon la devise de votre compte, votre banque peut appliquer un taux de change et des frais.',
  holder: 'Le compte bancaire doit être au nom du Guide. Aucun virement ne peut être effectué vers le compte d’un tiers. Les coordonnées sont vérifiées par un Admin ou un Superadmin avant leur validation.',
} as const

export const GUIDE_DOSSIER_ACKNOWLEDGEMENTS = {
  bank: 'Je confirme que ces coordonnées bancaires sont exactes et que ce compte est à mon nom.',
  rates: 'J’accepte les montants nets de base, des lieux et des frais de déplacement affichés dans mon dossier.',
  terms: 'J’ai lu et j’accepte les Conditions Guides, la Charte SAFARUMA et les modalités de rémunération ci-dessus.',
  calendar: 'J’ai vérifié mes villes, mes lieux proposés et mes dates indisponibles dans mon calendrier.',
} as const

export type GuideDossierSection = keyof typeof GUIDE_DOSSIER_ACKNOWLEDGEMENTS

export const GUIDE_PAYOUT_TIME_ZONE = 'Asia/Riyadh'

// Date-only policy: three Monday–Friday days after the service date in Riyadh.
export function guideTransferDueAt(serviceEnd: Date): Date {
  if (!Number.isFinite(serviceEnd.getTime())) throw new Error('Date de fin de prestation invalide.')
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: GUIDE_PAYOUT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(serviceEnd)
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(item => item.type === type)?.value)
  const day = new Date(Date.UTC(part('year'), part('month') - 1, part('day')))
  for (let remaining = 3; remaining > 0;) {
    day.setUTCDate(day.getUTCDate() + 1)
    if (day.getUTCDay() >= 1 && day.getUTCDay() <= 5) remaining--
  }
  // Riyadh midnight (UTC+03:00), independent of the server's local timezone.
  return new Date(day.getTime() - 3 * 60 * 60 * 1000)
}
