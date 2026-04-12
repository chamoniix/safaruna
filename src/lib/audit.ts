import prisma from '@/lib/prisma'

export async function createAuditLog({
  actor,
  actorRole,
  action,
  target,
  detail,
  ip,
}: {
  actor: string
  actorRole: string
  action: string
  target?: string
  detail?: string
  ip?: string
}) {
  try {
    await prisma.auditLog.create({
      data: { actor, actorRole, action, target, detail, ip },
    })
  } catch (e) {
    console.error('AuditLog error:', e)
  }
}
