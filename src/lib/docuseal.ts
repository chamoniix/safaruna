import 'server-only'

import { DocusealApi } from '@docuseal/api'
import { z } from 'zod'

export function getDocusealClient(): DocusealApi {
  const key = process.env.DOCUSEAL_API_KEY?.trim()
  if (!key) throw new Error('Clé API DocuSeal non configurée.')
  return new DocusealApi({ key, url: 'https://api.docuseal.com' })
}

const draftSchema = z.object({
  templateId: z.number().int().positive(),
  guideName: z.string().trim().min(1),
  guideEmail: z.email(),
  externalId: z.string().trim().min(1).max(200).optional(),
  guideCity: z.string().trim().min(1).max(120).optional(),
  guideAddress: z.string().trim().min(1).max(1000).optional(),
}).strict()

// Preparation only. Sending invitations is a separate administrative action.
// This function neither signs on anyone's behalf nor activates a Guide profile.
export async function createGuideContractDraft(input: z.input<typeof draftSchema>) {
  const draft = draftSchema.parse(input)
  return getDocusealClient().createSubmission({
    template_id: draft.templateId,
    send_email: false,
    send_sms: false,
    submitters: [{
      role: 'Guide',
      name: draft.guideName,
      email: draft.guideEmail,
      ...(draft.externalId && { external_id: draft.externalId }),
      values: {
        'Nom complet du Guide': draft.guideName,
        'Email du Guide': draft.guideEmail,
        ...(draft.guideCity && { 'Ville principale': draft.guideCity }),
        ...(draft.guideAddress && { 'Adresse du Guide': draft.guideAddress }),
      },
      send_email: false,
      send_sms: false,
    }],
  })
}

const referenceSchema = z.object({
  templateId: z.number().int().positive(),
  submissionId: z.number().int().positive(),
  submitterId: z.number().int().positive(),
  externalId: z.string().trim().min(1).max(200),
  guideEmail: z.email(),
}).strict()

export type GuideContractReference = z.input<typeof referenceSchema>

export class DocusealContractError extends Error {
  constructor(message: string, public status = 409) { super(message) }
}

// Always re-read the provider's record and its ownership. Browser callbacks,
// local labels and a caller-provided document URL cannot prove a signature.
export async function readVerifiedGuideContract(input: GuideContractReference) {
  const reference = referenceSchema.parse(input)
  const submission = await getDocusealClient().getSubmission(reference.submissionId)
  const submitter = submission.submitters.find(item => item.id === reference.submitterId)
  if (submission.id !== reference.submissionId || submission.template?.id !== reference.templateId
    || submission.submitters.length !== 1 || !submitter || submitter.role !== 'Guide'
    || submitter.submission_id !== reference.submissionId || submitter.external_id !== reference.externalId
    || submitter.email?.toLowerCase() !== reference.guideEmail.toLowerCase()) {
    throw new DocusealContractError('Le contrat DocuSeal ne correspond pas au Guide attendu.')
  }
  return { submission, submitter }
}

// This is the sole invitation operation. It never changes recipients, fields,
// signatures or profile status. Repeating after a confirmed send sends no email.
export async function sendGuideContractInvitation(input: GuideContractReference) {
  const { submission, submitter } = await readVerifiedGuideContract(input)
  if (submission.archived_at || submission.status !== 'pending'
    || (submission.expire_at && new Date(submission.expire_at).getTime() <= Date.now())
    || submitter.completed_at || submitter.declined_at) {
    throw new DocusealContractError('Ce contrat ne peut plus être envoyé pour signature.')
  }
  if (submitter.sent_at) return { sentAt: submitter.sent_at, alreadySent: true }
  await getDocusealClient().updateSubmitter(submitter.id, { send_email: true, send_sms: false })
  // Verify the resulting state instead of treating an HTTP success as proof of delivery.
  const updated = await readVerifiedGuideContract(input)
  return { sentAt: updated.submitter.sent_at, alreadySent: false }
}

// Return a fresh provider URL to server-side callers only. Route handlers must
// authenticate and bind the persisted reference before proxying the PDF bytes.
export async function readSignedGuideContractDocument(input: GuideContractReference, kind: 'contract' | 'audit') {
  const { submission, submitter } = await readVerifiedGuideContract(input)
  if (submission.archived_at || submission.status !== 'completed' || !submission.completed_at
    || submitter.status !== 'completed' || !submitter.completed_at) {
    throw new DocusealContractError('Le contrat n’est pas encore entièrement signé.')
  }
  if (kind === 'audit') {
    if (!submission.audit_log_url) throw new DocusealContractError('La preuve de signature est indisponible.', 503)
    return submission.audit_log_url
  }
  const result = await getDocusealClient().getSubmissionDocuments(submission.id, { merge: true })
  if (result.id !== submission.id || result.documents.length !== 1 || !result.documents[0].url) {
    throw new DocusealContractError('Le document signé est indisponible.', 503)
  }
  return result.documents[0].url
}
