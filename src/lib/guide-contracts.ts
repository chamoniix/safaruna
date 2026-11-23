import 'server-only'

import { randomUUID } from 'node:crypto'
import { Prisma, type GuideContract } from '@prisma/client'
import prisma from '@/lib/prisma'
import { adminAuditDetail, adminAuditFields, type AdminActor, type AdminAuditContext } from '@/lib/check-admin'
import { requireCurrentDossierAdmin } from '@/lib/guide-dossier'
import { createGuideContractDraft, DocusealContractError, getDocusealClient, readSignedGuideContractDocument,
  readVerifiedGuideContract, sendGuideContractInvitation, type GuideContractReference } from '@/lib/docuseal'

export const GUIDE_CONTRACT_VERSION = '2026-11-23'
export const GUIDE_CONTRACT_TEMPLATE_ID = 7108668

export class GuideContractError extends Error {
  constructor(message: string, public status = 409) { super(message) }
}

async function withGuide<T>(actor: AdminActor, slug: string,
  work: (tx: Prisma.TransactionClient, guide: { id: string; city: string | null; guideAccount: {
    id: string; firstName: string | null; lastName: string | null; email: string
  } | null }) => Promise<T>) {
  if (!actor.id || !['ADMIN', 'SUPERADMIN'].includes(actor.role)) throw new GuideContractError('Accès administrateur non autorisé.', 403)
  return prisma.$transaction(async tx => {
    await requireCurrentDossierAdmin(tx, actor)
    const guide = await tx.guideProfile.findUnique({ where: { slug }, select: {
      id: true, city: true, guideAccount: { select: { id: true, firstName: true, lastName: true, email: true } },
    } })
    if (!guide) throw new GuideContractError('Guide introuvable.', 404)
    return work(tx, guide)
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 })
}

function identity(guide: Parameters<Parameters<typeof withGuide>[2]>[1]) {
  const a = guide.guideAccount
  if (!a?.firstName?.trim() || !a.lastName?.trim() || !a.email || !['MAKKAH', 'MADINAH'].includes(guide.city || '')) {
    throw new GuideContractError('Renseignez le compte, le prénom, le nom, l’email et la ville principale du Guide avant de préparer son contrat.')
  }
  return { guideAccountId: a.id, guideName: `${a.firstName.trim()} ${a.lastName.trim()}`,
    guideEmail: a.email, guideCity: guide.city === 'MAKKAH' ? 'Makkah' : 'Médine' }
}

function sameIdentity(contract: GuideContract, current: ReturnType<typeof identity>) {
  if (contract.guideAccountId !== current.guideAccountId || contract.guideName !== current.guideName
    || contract.guideEmail !== current.guideEmail || contract.guideCity !== current.guideCity) {
    throw new GuideContractError('L’identité du Guide a changé depuis la préparation du contrat. Faites vérifier ce contrat avant tout envoi.')
  }
}

function reference(c: GuideContract): GuideContractReference {
  if (!c.submissionId || !c.submitterId) throw new GuideContractError('La préparation DocuSeal doit d’abord être vérifiée.')
  return { templateId: c.templateId, submissionId: c.submissionId, submitterId: c.submitterId,
    externalId: c.externalId, guideEmail: c.guideEmail }
}

async function findContract(tx: Prisma.TransactionClient, guideId: string, contractId?: string) {
  const contract = contractId
    ? await tx.guideContract.findFirst({ where: { id: contractId, guideProfileId: guideId } })
    : await tx.guideContract.findUnique({ where: { guideProfileId_version: { guideProfileId: guideId, version: GUIDE_CONTRACT_VERSION } } })
  if (contractId && !contract) throw new GuideContractError('Contrat introuvable.', 404)
  return contract
}

function audit(tx: Prisma.TransactionClient, actor: AdminActor, context: AdminAuditContext,
  contract: GuideContract, action: string, extra: Record<string, unknown> = {}) {
  return tx.auditLog.create({ data: {
    actor: actor.email, actorRole: actor.role, actorAdminId: actor.id, action, target: contract.guideProfileId,
    detail: adminAuditDetail(context, { contractId: contract.id, version: contract.version, ...extra }),
    ...adminAuditFields(context),
  } })
}

export async function readAdminGuideContract(actor: AdminActor, slug: string) {
  return withGuide(actor, slug, async (tx, guide) => {
    const contract = await findContract(tx, guide.id)
    let preparationBlocker: string | null = null
    try { const current = identity(guide); if (contract) sameIdentity(contract, current) }
    catch (error) { if (error instanceof GuideContractError) preparationBlocker = error.message; else throw error }
    const prepared = Boolean(contract?.submissionId && contract.submitterId)
    const completed = contract?.providerStatus === 'completed' && contract.submitterStatus === 'completed' && Boolean(contract.completedAt) && !contract.archivedAt
    return {
      configured: Boolean(process.env.DOCUSEAL_API_KEY?.trim()), preparationBlocker,
      contract: contract ? {
        id: contract.id, version: contract.version, guideName: contract.guideName, guideEmail: contract.guideEmail,
        guideCity: contract.guideCity, guideAddress: contract.guideAddress, prepared,
        status: contract.archivedAt ? 'archived' : contract.providerStatus,
        submitterStatus: contract.submitterStatus, sentAt: contract.sentAt?.toISOString() || null,
        completedAt: completed ? contract.completedAt!.toISOString() : null,
        lastSyncedAt: contract.lastSyncedAt?.toISOString() || null,
        photoConsent: completed ? contract.photoConsent : null,
        preparationUncertain: !prepared && Boolean(contract.preparationAttemptedAt),
        canResumePreparation: !prepared && !contract.preparationAttemptedAt,
        sendUncertain: prepared && Boolean(contract.sendAttemptedAt) && !contract.sentAt && contract.providerStatus === 'pending' && !contract.archivedAt,
        canSend: prepared && contract.providerStatus === 'pending' && !contract.archivedAt
          && !contract.sentAt && !contract.sendAttemptedAt && !preparationBlocker,
        canDownloadSigned: completed,
      } : null,
    }
  })
}

async function owned(actor: AdminActor, slug: string, contractId: string, sending = false) {
  return withGuide(actor, slug, async (tx, guide) => {
    const contract = (await findContract(tx, guide.id, contractId))!
    if (sending) sameIdentity(contract, identity(guide))
    return contract
  })
}

export async function syncAdminGuideContract(actor: AdminActor, context: AdminAuditContext, slug: string, contractId: string) {
  let contract = await owned(actor, slug, contractId)
  if (!contract.submissionId || !contract.submitterId) {
    // A lost create response must be reconciled by external_id. Never blindly
    // issue another create: external_id is a lookup key, not an idempotency key.
    const recovered = await getDocusealClient().listSubmitters({ external_id: contract.externalId, limit: 2 })
    if (!recovered.data) throw new GuideContractError('La réponse DocuSeal ne peut pas être vérifiée.', 503)
    if (recovered.data.length !== 1) throw new GuideContractError(recovered.data.length
      ? 'Plusieurs demandes DocuSeal correspondent à ce contrat. Une vérification administrative est nécessaire.'
      : 'Préparation en cours ou résultat incertain. Actualisez à nouveau avant toute nouvelle tentative.')
    const signer = recovered.data[0]
    await readVerifiedGuideContract({ templateId: contract.templateId, submissionId: signer.submission_id,
      submitterId: signer.id, externalId: contract.externalId, guideEmail: contract.guideEmail })
    contract = await withGuide(actor, slug, async (tx, guide) => {
      const current = (await findContract(tx, guide.id, contractId))!
      if (current.externalId !== contract.externalId) throw new GuideContractError('Le contrat a changé.')
      return tx.guideContract.update({ where: { id: current.id }, data: { submissionId: signer.submission_id, submitterId: signer.id } })
    })
  }
  const { submission, submitter } = await readVerifiedGuideContract(reference(contract))
  if (!['pending', 'completed', 'expired', 'declined'].includes(submission.status)
    || !['awaiting', 'sent', 'opened', 'completed', 'declined'].includes(submitter.status)) {
    throw new GuideContractError('Le statut DocuSeal ne peut pas être vérifié.', 503)
  }
  const complete = submission.status === 'completed' && submitter.status === 'completed'
    && Boolean(submission.completed_at && submitter.completed_at) && !submission.archived_at
  const photo = submitter.values.find(value => value.field === 'Autorisation photo')?.value
  const parsedDate = (value: string | null) => {
    if (!value) return null
    const date = new Date(value)
    if (!Number.isFinite(date.getTime())) throw new GuideContractError('La date DocuSeal ne peut pas être vérifiée.', 503)
    return date
  }
  const data = {
    providerStatus: submission.status, submitterStatus: submitter.status,
    sentAt: parsedDate(submitter.sent_at), completedAt: complete ? parsedDate(submission.completed_at) : null,
    archivedAt: parsedDate(submission.archived_at), photoConsent: complete && typeof photo === 'boolean' ? photo : null,
    lastSyncedAt: new Date(), providerUpdatedAt: parsedDate(submission.updated_at),
  }
  if (!data.providerUpdatedAt) throw new GuideContractError('La version du statut DocuSeal ne peut pas être vérifiée.', 503)
  const signerUpdatedAt = parsedDate(submitter.updated_at)
  if (signerUpdatedAt && signerUpdatedAt > data.providerUpdatedAt) data.providerUpdatedAt = signerUpdatedAt
  await withGuide(actor, slug, async (tx, guide) => {
    const current = (await findContract(tx, guide.id, contractId))!
    if (current.submissionId !== submission.id || current.submitterId !== submitter.id) throw new GuideContractError('Le contrat a changé.')
    // Concurrent refreshes must not overwrite a newer provider state with an older response.
    if (current.providerUpdatedAt && data.providerUpdatedAt && current.providerUpdatedAt > data.providerUpdatedAt) return
    await tx.guideContract.update({ where: { id: current.id }, data })
    await audit(tx, actor, context, current, 'GUIDE_CONTRACT_SYNCED', { status: data.providerStatus, submitterStatus: data.submitterStatus })
  })
  return readAdminGuideContract(actor, slug)
}

export async function prepareAdminGuideContract(actor: AdminActor, context: AdminAuditContext, slug: string, address?: string) {
  getDocusealClient() // Fail before reserving an operation when the key is missing.
  const contract = await withGuide(actor, slug, async (tx, guide) => {
    const current = identity(guide)
    const result = await tx.guideContract.upsert({
      where: { guideProfileId_version: { guideProfileId: guide.id, version: GUIDE_CONTRACT_VERSION } }, update: {},
      create: { guideProfileId: guide.id, ...current, version: GUIDE_CONTRACT_VERSION, templateId: GUIDE_CONTRACT_TEMPLATE_ID,
        externalId: `safaruma-guide-${randomUUID()}`, guideAddress: address || null },
    })
    sameIdentity(result, current)
    return result
  })
  if (contract.preparationAttemptedAt || contract.submissionId) return syncAdminGuideContract(actor, context, slug, contract.id)
  const claimed = await withGuide(actor, slug, async (tx, guide) => {
    const current = (await findContract(tx, guide.id, contract.id))!
    sameIdentity(current, identity(guide))
    const claim = await tx.guideContract.updateMany({ where: { id: current.id, preparationAttemptedAt: null }, data: { preparationAttemptedAt: new Date() } })
    if (claim.count === 1) await audit(tx, actor, context, current, 'GUIDE_CONTRACT_PREPARATION_STARTED')
    return claim.count === 1
  })
  if (!claimed) return syncAdminGuideContract(actor, context, slug, contract.id)
  const remote = await createGuideContractDraft({ templateId: contract.templateId, guideName: contract.guideName,
    guideEmail: contract.guideEmail, guideCity: contract.guideCity, externalId: contract.externalId,
    ...(contract.guideAddress && { guideAddress: contract.guideAddress }) })
  const signer = remote.submitters.length === 1 ? remote.submitters[0] : null
  if (!Number.isSafeInteger(remote.id) || !signer || !Number.isSafeInteger(signer.id)) {
    throw new GuideContractError('La préparation doit être vérifiée auprès de DocuSeal.', 503)
  }
  await readVerifiedGuideContract({ templateId: contract.templateId, submissionId: remote.id,
    submitterId: signer.id, externalId: contract.externalId, guideEmail: contract.guideEmail })
  await withGuide(actor, slug, async (tx, guide) => {
    const current = (await findContract(tx, guide.id, contract.id))!
    await tx.guideContract.update({ where: { id: current.id }, data: { submissionId: remote.id, submitterId: signer.id } })
    await audit(tx, actor, context, current, 'GUIDE_CONTRACT_PREPARED')
  })
  return syncAdminGuideContract(actor, context, slug, contract.id)
}

export async function sendAdminGuideContract(actor: AdminActor, context: AdminAuditContext, slug: string, contractId: string) {
  const contract = await owned(actor, slug, contractId, true)
  const ref = reference(contract)
  const remote = await readVerifiedGuideContract(ref)
  if (remote.submitter.sent_at) return syncAdminGuideContract(actor, context, slug, contractId)
  const claimed = await withGuide(actor, slug, async (tx, guide) => {
    const current = (await findContract(tx, guide.id, contractId))!
    sameIdentity(current, identity(guide))
    const claim = await tx.guideContract.updateMany({ where: { id: current.id, sendAttemptedAt: null }, data: { sendAttemptedAt: new Date() } })
    if (claim.count === 1) await audit(tx, actor, context, current, 'GUIDE_CONTRACT_INVITATION_REQUESTED')
    return claim.count === 1
  })
  if (!claimed) throw new GuideContractError('Un envoi a déjà été demandé. Actualisez le statut avant toute autre action.')
  await sendGuideContractInvitation(ref)
  return syncAdminGuideContract(actor, context, slug, contractId)
}

export async function downloadAdminGuideContract(actor: AdminActor, slug: string, contractId: string,
  kind: 'preview' | 'contract' | 'audit') {
  const contract = await owned(actor, slug, contractId)
  const ref = reference(contract)
  let url: string
  if (kind === 'preview') {
    const { submission } = await readVerifiedGuideContract(ref)
    if (submission.archived_at) throw new GuideContractError('Ce contrat est archivé.')
    const documents = await getDocusealClient().getSubmissionDocuments(submission.id, { merge: true })
    if (documents.id !== submission.id || documents.documents.length !== 1) throw new GuideContractError('Document indisponible.', 503)
    url = documents.documents[0].url
  } else url = await readSignedGuideContractDocument(ref, kind)
  // The observed global DocuSeal file endpoint is docuseal.com. Never fetch
  // client-provided URLs, arbitrary hosts, redirects, credentials or HTTP URLs.
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'docuseal.com' || parsed.port || parsed.username || parsed.password) {
    throw new DocusealContractError('L’hôte du document DocuSeal ne peut pas être vérifié.', 503)
  }
  const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(30000) })
  if (!response.ok || !response.headers.get('content-type')?.toLowerCase().startsWith('application/pdf') || !response.body) {
    throw new GuideContractError('Document DocuSeal temporairement indisponible.', 503)
  }
  return response.body
}
