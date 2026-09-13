// Bump the version when the terms presented for acknowledgement change.
export const GUIDE_DOSSIER_TERMS_VERSION = '2026-09-13'
export const GUIDE_PAYOUT_POLICY = {
  delay: 'Le virement est envoyé trois jours ouvrés après la date de fin du séjour du pèlerin. Le vendredi, le samedi et le dimanche sont exclus du décompte : les jours comptabilisés sont du lundi au jeudi.',
  bankDelay: 'Le délai de traitement de votre banque s’ajoute à ce délai d’envoi. La réception des fonds n’est pas garantie le jour de l’envoi.',
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
