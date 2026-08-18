import 'server-only'

import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'

const RETENTION_DAYS = 90

export async function archiveExpiredAnalyticsEvents(): Promise<number> {
  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - RETENTION_DAYS)
  cutoff.setUTCHours(0, 0, 0, 0)

  return prisma.$transaction(async tx => {
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "AnalyticsDailyAggregate" (
        "id", "day", "eventName", "country", "device", "path",
        "count", "uniqueSessions", "revenueCents", "updatedAt"
      )
      SELECT
        md5(
          date_trunc('day', "createdAt")::text || '|' || "eventName" || '|' ||
          COALESCE("country", 'UNKNOWN') || '|' || COALESCE("device", 'UNKNOWN') || '|' ||
          COALESCE("path", '')
        ),
        date_trunc('day', "createdAt"),
        "eventName",
        COALESCE("country", 'UNKNOWN'),
        COALESCE("device", 'UNKNOWN'),
        COALESCE("path", ''),
        COUNT(*)::int,
        COUNT(DISTINCT "sessionHash")::int,
        COALESCE(SUM(
          CASE
            WHEN "eventName" = 'purchase'
              AND COALESCE("metadata"->>'amountCents', '') ~ '^[0-9]+$'
            THEN ("metadata"->>'amountCents')::int
            ELSE 0
          END
        ), 0)::int,
        NOW()
      FROM "AnalyticsEvent"
      WHERE "createdAt" < ${cutoff}
      GROUP BY
        date_trunc('day', "createdAt"), "eventName",
        COALESCE("country", 'UNKNOWN'), COALESCE("device", 'UNKNOWN'), COALESCE("path", '')
      ON CONFLICT ("day", "eventName", "country", "device", "path")
      DO UPDATE SET
        "count" = EXCLUDED."count",
        "uniqueSessions" = EXCLUDED."uniqueSessions",
        "revenueCents" = EXCLUDED."revenueCents",
        "updatedAt" = NOW()
    `)

    const deleted = await tx.analyticsEvent.deleteMany({ where: { createdAt: { lt: cutoff } } })
    return deleted.count
  })
}

