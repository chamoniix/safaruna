import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requirePelerin } from '@/lib/require-account'

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
}

const duaIdSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
])

const checklistItemIdSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
])

const checklistCategorySchema = z.enum(['Administratif', 'Spirituel', 'Bagages'])

const customChecklistItemSchema = z.object({
  id: z.string().uuid(),
  category: checklistCategorySchema,
  title: z.string().trim().min(1).max(120),
  done: z.boolean(),
}).strict()

const patchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('SET_DUA'),
    duaId: duaIdSchema,
    memorized: z.boolean(),
  }).strict(),
  z.object({
    action: z.literal('SET_CHECKLIST_ITEM'),
    itemId: checklistItemIdSchema,
    done: z.boolean(),
  }).strict(),
  z.object({
    action: z.literal('ADD_CUSTOM_CHECKLIST_ITEM'),
    item: customChecklistItemSchema,
  }).strict(),
  z.object({
    action: z.literal('SET_CUSTOM_CHECKLIST_ITEM'),
    itemId: z.string().uuid(),
    done: z.boolean(),
  }).strict(),
])

type CustomChecklistItem = z.infer<typeof customChecklistItemSchema>
type DashboardState = {
  memorizedDuaIds: number[]
  completedChecklistItemIds: number[]
  customChecklistItems: CustomChecklistItem[]
}

class DashboardStateError extends Error {
  constructor(
    readonly status: 400 | 404,
    message: string,
  ) {
    super(message)
  }
}

function response(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status,
    headers: noStoreHeaders,
  })
}

function parseCustomChecklistItems(value: Prisma.JsonValue | null | undefined): CustomChecklistItem[] {
  const parsed = z.array(customChecklistItemSchema).max(50).safeParse(value)
  return parsed.success ? parsed.data : []
}

function normalizeState(state: {
  memorizedDuaIds: number[]
  completedChecklistItemIds: number[]
  customChecklistItems: Prisma.JsonValue
} | null): DashboardState {
  return {
    memorizedDuaIds: state?.memorizedDuaIds.filter(id => duaIdSchema.safeParse(id).success) ?? [],
    completedChecklistItemIds: state?.completedChecklistItemIds.filter(id => checklistItemIdSchema.safeParse(id).success) ?? [],
    customChecklistItems: parseCustomChecklistItems(state?.customChecklistItems),
  }
}

function mutateState(current: DashboardState, input: z.infer<typeof patchSchema>): DashboardState {
  if (input.action === 'SET_DUA') {
    const ids = new Set(current.memorizedDuaIds)
    if (input.memorized) ids.add(input.duaId)
    else ids.delete(input.duaId)
    return { ...current, memorizedDuaIds: [...ids].sort((a, b) => a - b) }
  }

  if (input.action === 'SET_CHECKLIST_ITEM') {
    const ids = new Set(current.completedChecklistItemIds)
    if (input.done) ids.add(input.itemId)
    else ids.delete(input.itemId)
    return { ...current, completedChecklistItemIds: [...ids].sort((a, b) => a - b) }
  }

  if (input.action === 'ADD_CUSTOM_CHECKLIST_ITEM') {
    if (current.customChecklistItems.some(item => item.id === input.item.id)) return current
    if (current.customChecklistItems.length >= 50) {
      throw new DashboardStateError(400, 'Vous avez atteint la limite de tâches personnalisées.')
    }
    return { ...current, customChecklistItems: [...current.customChecklistItems, input.item] }
  }

  let found = false
  const customChecklistItems = current.customChecklistItems.map(item => {
    if (item.id !== input.itemId) return item
    found = true
    return { ...item, done: input.done }
  })
  if (!found) throw new DashboardStateError(404, 'Tâche personnalisée introuvable.')
  return { ...current, customChecklistItems }
}

export async function GET() {
  const access = await requirePelerin()
  if (!access.ok) return access.response

  const state = await prisma.pelerinDashboardState.findUnique({
    where: { userId: access.actor.id },
    select: {
      memorizedDuaIds: true,
      completedChecklistItemIds: true,
      customChecklistItems: true,
    },
  })

  return response({ state: normalizeState(state) })
}

export async function PATCH(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) {
    return response({ error: 'Origine non autorisée' }, { status: 403 })
  }

  const access = await requirePelerin()
  if (!access.ok) return access.response

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > 4_000) return response({ error: 'Contenu trop volumineux' }, { status: 413 })

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return response({ error: 'Modification invalide' }, { status: 400 })

  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const state = await prisma.$transaction(async tx => {
          const stored = await tx.pelerinDashboardState.findUnique({
            where: { userId: access.actor.id },
            select: {
              memorizedDuaIds: true,
              completedChecklistItemIds: true,
              customChecklistItems: true,
            },
          })
          const next = mutateState(normalizeState(stored), parsed.data)

          const saved = await tx.pelerinDashboardState.upsert({
            where: { userId: access.actor.id },
            create: {
              userId: access.actor.id,
              memorizedDuaIds: next.memorizedDuaIds,
              completedChecklistItemIds: next.completedChecklistItemIds,
              customChecklistItems: next.customChecklistItems as Prisma.InputJsonValue,
            },
            update: {
              memorizedDuaIds: next.memorizedDuaIds,
              completedChecklistItemIds: next.completedChecklistItemIds,
              customChecklistItems: next.customChecklistItems as Prisma.InputJsonValue,
            },
            select: {
              memorizedDuaIds: true,
              completedChecklistItemIds: true,
              customChecklistItems: true,
            },
          })

          return normalizeState(saved)
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

        return response({ state })
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError
          && ['P2002', 'P2034'].includes(error.code)
          && attempt < 2
        ) continue
        throw error
      }
    }
  } catch (error) {
    if (error instanceof DashboardStateError) {
      return response({ error: error.message }, { status: error.status })
    }
    console.error('Unable to update Pèlerin dashboard state', error)
    return response({ error: 'Enregistrement impossible. Réessayez.' }, { status: 503 })
  }

  return response({ error: 'Enregistrement impossible. Réessayez.' }, { status: 503 })
}
