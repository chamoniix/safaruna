import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { getPackageForCity } from '@/lib/packages'
import type {
  NormalizedCheckoutExpiredEvent,
  NormalizedCheckoutPaidEvent,
  PaymentDraftData,
  PaymentProviderId,
} from '@/lib/payments/types'

const EVENT_PROCESSING_LEASE_MS = 5 * 60 * 1000

export class PaymentProcessingError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

type ClaimedEvent = { id: string; duplicate: boolean }

function safeError(error: unknown): string {
  return (error instanceof Error ? error.message : 'Erreur de traitement inconnue').slice(0, 500)
}

function eachDate(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  for (let current = new Date(start); current <= end; current = new Date(current.getTime() + 86_400_000)) {
    dates.push(current)
  }
  return dates
}

async function claimPaymentEvent(input: {
  provider: PaymentProviderId
  providerEventId: string
  providerEventType: string
  providerObjectId: string
  occurredAt: Date
  bookingRef: string
  attemptId?: string | null
}): Promise<ClaimedEvent> {
  try {
    const created = await prisma.paymentEvent.create({
      data: {
        provider: input.provider,
        providerEventId: input.providerEventId,
        providerEventType: input.providerEventType,
        providerObjectId: input.providerObjectId,
        occurredAt: input.occurredAt,
        attemptId: input.attemptId,
        metadata: { bookingRef: input.bookingRef },
      },
      select: { id: true },
    })
    return { id: created.id, duplicate: false }
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      throw error
    }
  }

  const existing = await prisma.paymentEvent.findUnique({
    where: {
      provider_providerEventId: {
        provider: input.provider,
        providerEventId: input.providerEventId,
      },
    },
  })
  if (!existing) throw new Error('PAYMENT_EVENT_CONFLICT_WITHOUT_ROW')
  if (existing.status === 'PROCESSED' || existing.status === 'IGNORED') {
    return { id: existing.id, duplicate: true }
  }

  const staleBefore = new Date(Date.now() - EVENT_PROCESSING_LEASE_MS)
  if (existing.status === 'PROCESSING' && existing.processingStartedAt > staleBefore) {
    return { id: existing.id, duplicate: true }
  }

  const reclaimed = await prisma.paymentEvent.updateMany({
    where: {
      id: existing.id,
      OR: [
        { status: 'FAILED' },
        { status: 'PROCESSING', processingStartedAt: { lte: staleBefore } },
      ],
    },
    data: {
      status: 'PROCESSING',
      processingAttempts: { increment: 1 },
      processingStartedAt: new Date(),
      processedAt: null,
      lastError: null,
      attemptId: input.attemptId ?? existing.attemptId,
    },
  })

  return { id: existing.id, duplicate: reclaimed.count !== 1 }
}

async function markEventFailed(eventId: string, error: unknown) {
  await prisma.paymentEvent.update({
    where: { id: eventId },
    data: { status: 'FAILED', lastError: safeError(error) },
  }).catch(ledgerError => console.error('[payment-event] failure update failed', ledgerError))
}

async function reconcileExistingReservation(
  eventId: string,
  event: NormalizedCheckoutPaidEvent,
  reservation: { id: string; totalPrice: number },
) {
  const amountCents = Math.round(reservation.totalPrice * 100)
  if (amountCents !== event.amountCents) {
    throw new PaymentProcessingError('Montant de réservation incohérent', 400)
  }

  await prisma.$transaction(async tx => {
    const attempt = await tx.paymentAttempt.upsert({
      where: {
        provider_providerPaymentId: {
          provider: event.provider,
          providerPaymentId: event.providerPaymentId,
        },
      },
      update: {
        reservationId: reservation.id,
        providerCheckoutId: event.providerCheckoutId,
        status: 'SUCCEEDED',
        paidAt: event.occurredAt,
        failureCode: null,
      },
      create: {
        bookingRef: event.bookingRef,
        reservationId: reservation.id,
        provider: event.provider,
        providerCheckoutId: event.providerCheckoutId,
        providerPaymentId: event.providerPaymentId,
        status: 'SUCCEEDED',
        amountCents: event.amountCents,
        currency: event.currency,
        paidAt: event.occurredAt,
      },
    })

    if (attempt.bookingRef !== event.bookingRef || attempt.amountCents !== event.amountCents) {
      throw new PaymentProcessingError('Référence de paiement déjà utilisée', 409)
    }

    await tx.paymentTransaction.upsert({
      where: {
        provider_type_providerTransactionId: {
          provider: event.provider,
          type: 'CHARGE',
          providerTransactionId: event.providerPaymentId,
        },
      },
      update: {
        reservationId: reservation.id,
        attemptId: attempt.id,
        status: 'SUCCEEDED',
      },
      create: {
        bookingRef: event.bookingRef,
        reservationId: reservation.id,
        attemptId: attempt.id,
        provider: event.provider,
        providerTransactionId: event.providerPaymentId,
        type: 'CHARGE',
        status: 'SUCCEEDED',
        amountCents: event.amountCents,
        currency: event.currency,
        occurredAt: event.occurredAt,
      },
    })
    await tx.paymentEvent.update({
      where: { id: eventId },
      data: { attemptId: attempt.id, status: 'PROCESSED', processedAt: new Date() },
    })
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
}

export type PaidPaymentResult = {
  duplicate: boolean
  refNumber: string
  amount: number
  data?: PaymentDraftData
  pelerin?: {
    id: string
    email: string | null
    name: string | null
    firstName: string | null
    lastName: string | null
  }
  guides?: Array<{
    id: string
    slug: string | null
    guideAccount: {
      email: string
      displayName: string | null
      firstName: string | null
      lastName: string | null
    } | null
  }>
}

export async function processPaidCheckout(event: NormalizedCheckoutPaidEvent): Promise<PaidPaymentResult> {
  const existingAttempt = await prisma.paymentAttempt.findUnique({
    where: {
      provider_providerCheckoutId: {
        provider: event.provider,
        providerCheckoutId: event.providerCheckoutId,
      },
    },
  })
  const claimed = await claimPaymentEvent({
    provider: event.provider,
    providerEventId: event.providerEventId,
    providerEventType: event.providerEventType,
    providerObjectId: event.providerCheckoutId,
    occurredAt: event.occurredAt,
    bookingRef: event.bookingRef,
    attemptId: existingAttempt?.id,
  })
  if (claimed.duplicate) {
    return { duplicate: true, refNumber: event.bookingRef, amount: event.amountCents / 100 }
  }

  try {
    const existingReservation = await prisma.reservation.findUnique({
      where: { refNumber: event.bookingRef },
      select: { id: true, totalPrice: true },
    })
    if (existingReservation) {
      await reconcileExistingReservation(claimed.id, event, existingReservation)
      return { duplicate: true, refNumber: event.bookingRef, amount: event.amountCents / 100 }
    }

    const draft = await prisma.reservationDraft.findUnique({ where: { refNumber: event.bookingRef } })
    if (!draft) throw new PaymentProcessingError('Draft non trouvé', 404)
    if (draft.pelerinId !== event.pelerinId) {
      throw new PaymentProcessingError('Identité pèlerin incohérente', 400)
    }

    let attempt = existingAttempt
    if (!attempt) {
      attempt = await prisma.paymentAttempt.create({
        data: {
          bookingRef: event.bookingRef,
          provider: event.provider,
          providerCheckoutId: event.providerCheckoutId,
          status: 'PENDING',
          amountCents: event.amountCents,
          currency: event.currency,
          checkoutExpiresAt: draft.expiresAt,
        },
      })
    }
    if (
      attempt.bookingRef !== event.bookingRef
      || attempt.amountCents !== event.amountCents
      || attempt.currency !== event.currency
    ) {
      throw new PaymentProcessingError('Tentative de paiement incohérente', 400)
    }
    if (event.provider === 'STRIPE' && draft.stripeSessionId !== event.providerCheckoutId) {
      throw new PaymentProcessingError('Session de paiement incohérente', 400)
    }

    const data = JSON.parse(draft.data) as PaymentDraftData
    if (!Array.isArray(data.missions) || data.missions.length === 0) {
      throw new PaymentProcessingError('Missions manquantes', 400)
    }
    if (!Array.isArray(data.earnings)) {
      throw new PaymentProcessingError('Rémunérations guides manquantes', 400)
    }
    if (Math.round(data.totalPrice * 100) !== event.amountCents) {
      throw new PaymentProcessingError('Montant du paiement incohérent', 400)
    }

    const pelerin = await prisma.user.findUnique({ where: { id: draft.pelerinId } })
    if (!pelerin) throw new PaymentProcessingError('Pèlerin non trouvé', 404)
    if (
      pelerin.role !== 'PELERIN'
      || !pelerin.emailVerified
      || pelerin.email?.toLowerCase() !== event.pelerinEmail.toLowerCase()
    ) {
      throw new PaymentProcessingError('Compte pèlerin incohérent', 400)
    }

    const guideIds = [...new Set(data.missions.map(mission => mission.guideProfileId))]
    const guides = await prisma.guideProfile.findMany({
      where: { id: { in: guideIds } },
      include: { guideAccount: true, packages: true },
    })
    if (guides.length !== guideIds.length) {
      throw new PaymentProcessingError('Guide introuvable', 404)
    }
    if (data.earnings.length !== guideIds.length) {
      throw new PaymentProcessingError('Rémunérations guides incohérentes', 400)
    }

    const primaryGuide = guides.find(guide => guide.slug === data.selectedGuideSlug) ?? guides[0]
    const basePackage = getPackageForCity(data.cityChoice)
    let pkg = primaryGuide.packages.find(item => item.name === basePackage.name)
    if (!pkg) {
      pkg = await prisma.package.create({
        data: {
          guideProfileId: primaryGuide.id,
          name: basePackage.name,
          durationDays: data.missions.reduce((sum, mission) => sum + mission.localTransportDays, 0),
          pricePerPerson: data.pricing.base,
          maxPeople: 32,
        },
      })
    }

    const totalGuideNetCents = data.earnings.reduce((sum, earning) => sum + earning.totalNetCents, 0)
    const commission = (event.amountCents - totalGuideNetCents) / 100
    if (commission < 0) throw new PaymentProcessingError('Rémunérations guides incohérentes', 400)

    const reservationCreated = await prisma.$transaction(async tx => {
      const duplicate = await tx.reservation.findUnique({ where: { refNumber: event.bookingRef } })
      if (duplicate) {
        await tx.paymentEvent.update({
          where: { id: claimed.id },
          data: { status: 'PROCESSED', processedAt: new Date() },
        })
        return false
      }

      const reservation = await tx.reservation.create({
        data: {
          refNumber: event.bookingRef,
          pelerinId: pelerin.id,
          guideProfileId: primaryGuide.id,
          packageId: pkg!.id,
          startDate: new Date(data.departDate),
          endDate: new Date(data.returnDate),
          nbPeople: data.nbPersonnes,
          basePrice: event.amountCents / 100,
          commissionAmount: commission,
          totalPrice: event.amountCents / 100,
          status: 'CONFIRMED',
          selectedPlaces: data.selectedPlaces,
          selectedCities: data.cityChoice,
          withTransport: data.pricing.intercityTransport > 0,
          withCar: data.localTransportMakkah === 'CAR' || data.localTransportMadinah === 'CAR',
          gender: data.gender,
          langue: data.langue,
          arrivalPoint: data.arrivalPoint,
          cityOrder: data.cityOrder.join(','),
          guideBedProvided: data.guideBedProvided,
          ihramAlert: data.ihramAlert,
          pricingJson: data.pricing as unknown as Prisma.InputJsonValue,
          stripePaymentId: event.provider === 'STRIPE' ? event.providerPaymentId : null,
          notes: `Payé via ${event.provider} · Session: ${event.providerCheckoutId}`,
          optionsJson: {
            guideSlugMadinah: data.selectedGuideSlugMadinah,
            transportOption: data.transportOption,
            packageName: data.packageName,
            sameGuideForBothCities: data.sameGuideForBothCities,
          },
          missions: {
            create: data.missions.map(mission => ({
              guideProfileId: mission.guideProfileId,
              city: mission.city,
              startDate: new Date(mission.startDate),
              endDate: new Date(mission.endDate),
              selectedPlaces: mission.selectedPlaces,
              localTransport: mission.localTransport,
              localTransportDays: mission.localTransportDays,
            })),
          },
        },
      })

      await tx.guideEarning.createMany({
        data: data.earnings.map(earning => ({
          reservationId: reservation.id,
          guideProfileId: earning.guideProfileId,
          serviceNetCents: earning.serviceNetCents,
          placesNetCents: earning.placesNetCents,
          transportNetCents: earning.transportNetCents,
          hotelNetCents: earning.hotelNetCents,
          totalNetCents: earning.totalNetCents,
          breakdown: earning.breakdown,
          status: 'UPCOMING',
        })),
      })

      for (const mission of data.missions) {
        for (const date of eachDate(new Date(mission.startDate), new Date(mission.endDate))) {
          const otherBooking = await tx.availability.findFirst({
            where: { guideProfileId: mission.guideProfileId, date, status: 'BOOKED' },
          })
          if (otherBooking && otherBooking.reservationId !== reservation.id) {
            throw new PaymentProcessingError('Guide déjà réservé', 409)
          }
          await tx.availability.upsert({
            where: {
              guideProfileId_date_city: {
                guideProfileId: mission.guideProfileId,
                date,
                city: mission.city,
              },
            },
            update: { status: 'BOOKED', reservationId: reservation.id },
            create: {
              guideProfileId: mission.guideProfileId,
              date,
              city: mission.city,
              status: 'BOOKED',
              reservationId: reservation.id,
            },
          })
        }
      }

      await tx.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          reservationId: reservation.id,
          providerPaymentId: event.providerPaymentId,
          status: 'SUCCEEDED',
          paidAt: event.occurredAt,
          failureCode: null,
        },
      })
      await tx.paymentTransaction.create({
        data: {
          bookingRef: event.bookingRef,
          reservationId: reservation.id,
          attemptId: attempt.id,
          provider: event.provider,
          providerTransactionId: event.providerPaymentId,
          type: 'CHARGE',
          status: 'SUCCEEDED',
          amountCents: event.amountCents,
          currency: event.currency,
          occurredAt: event.occurredAt,
        },
      })
      await tx.paymentEvent.update({
        where: { id: claimed.id },
        data: {
          attemptId: attempt.id,
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      })
      await tx.auditLog.create({
        data: {
          actor: event.pelerinEmail,
          actorRole: 'CLIENT',
          action: 'PAYMENT_CONFIRMED',
          target: event.bookingRef,
          detail: JSON.stringify({
            provider: event.provider,
            amountCents: event.amountCents,
            cityChoice: data.cityChoice,
            missions: data.missions.length,
          }),
        },
      })
      await tx.reservationDraft.delete({ where: { refNumber: event.bookingRef } })
      return true
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    return {
      duplicate: !reservationCreated,
      refNumber: event.bookingRef,
      amount: event.amountCents / 100,
      ...(reservationCreated ? { data, pelerin, guides } : {}),
    }
  } catch (error) {
    await markEventFailed(claimed.id, error)
    throw error
  }
}

export async function processExpiredCheckout(event: NormalizedCheckoutExpiredEvent) {
  const attempt = await prisma.paymentAttempt.findUnique({
    where: {
      provider_providerCheckoutId: {
        provider: event.provider,
        providerCheckoutId: event.providerCheckoutId,
      },
    },
  })
  const claimed = await claimPaymentEvent({
    provider: event.provider,
    providerEventId: event.providerEventId,
    providerEventType: event.providerEventType,
    providerObjectId: event.providerCheckoutId,
    occurredAt: event.occurredAt,
    bookingRef: event.bookingRef,
    attemptId: attempt?.id,
  })
  if (claimed.duplicate) return { duplicate: true, expired: false }

  try {
    if (attempt && attempt.bookingRef !== event.bookingRef) {
      throw new PaymentProcessingError('Session de paiement incohérente', 400)
    }
    const draft = await prisma.reservationDraft.findUnique({ where: { refNumber: event.bookingRef } })
    if (event.provider === 'STRIPE' && draft && draft.stripeSessionId !== event.providerCheckoutId) {
      throw new PaymentProcessingError('Session de paiement incohérente', 400)
    }

    const [, deleted] = await prisma.$transaction([
      prisma.paymentAttempt.updateMany({
        where: {
          bookingRef: event.bookingRef,
          provider: event.provider,
          providerCheckoutId: event.providerCheckoutId,
          status: { in: ['CREATED', 'PENDING'] },
        },
        data: { status: 'EXPIRED' },
      }),
      prisma.reservationDraft.deleteMany({ where: { refNumber: event.bookingRef } }),
      prisma.paymentEvent.update({
        where: { id: claimed.id },
        data: { status: 'PROCESSED', processedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          actor: event.provider.toLowerCase(),
          actorRole: 'SYSTEM',
          action: 'PAYMENT_SESSION_EXPIRED',
          target: event.bookingRef,
          detail: JSON.stringify({ provider: event.provider }),
        },
      }),
    ])
    return { duplicate: false, expired: deleted.count > 0 }
  } catch (error) {
    await markEventFailed(claimed.id, error)
    throw error
  }
}

export async function recordIgnoredPaymentEvent(input: {
  provider: PaymentProviderId
  providerEventId: string
  providerEventType: string
  providerObjectId?: string | null
  occurredAt: Date
}) {
  await prisma.paymentEvent.upsert({
    where: {
      provider_providerEventId: {
        provider: input.provider,
        providerEventId: input.providerEventId,
      },
    },
    update: {},
    create: {
      provider: input.provider,
      providerEventId: input.providerEventId,
      providerEventType: input.providerEventType,
      providerObjectId: input.providerObjectId,
      occurredAt: input.occurredAt,
      status: 'IGNORED',
      processedAt: new Date(),
    },
  })
}

export async function recordRejectedPaymentEvent(input: {
  provider: PaymentProviderId
  providerEventId: string
  providerEventType: string
  providerObjectId?: string | null
  occurredAt: Date
  error: unknown
}) {
  const lastError = safeError(input.error)
  await prisma.paymentEvent.upsert({
    where: {
      provider_providerEventId: {
        provider: input.provider,
        providerEventId: input.providerEventId,
      },
    },
    update: { status: 'FAILED', lastError },
    create: {
      provider: input.provider,
      providerEventId: input.providerEventId,
      providerEventType: input.providerEventType,
      providerObjectId: input.providerObjectId,
      occurredAt: input.occurredAt,
      status: 'FAILED',
      lastError,
    },
  })
}
