import prisma from '@/lib/prisma'
import { GUIDE_SERVICE_MARKUP_BPS, TRAVEL_MARKUP_BPS } from '@/lib/guide-pricing'

export const PLATFORM_PRICING_SETTINGS_ID = 'global'

export type PlatformPricing = {
  guideServiceMarkupBps: number
  travelMarkupBps: number
}

export const DEFAULT_PLATFORM_PRICING: PlatformPricing = {
  guideServiceMarkupBps: GUIDE_SERVICE_MARKUP_BPS,
  travelMarkupBps: TRAVEL_MARKUP_BPS,
}

export async function getPlatformPricing(): Promise<PlatformPricing> {
  const settings = await prisma.platformPricingSettings.findUnique({
    where: { id: PLATFORM_PRICING_SETTINGS_ID },
    select: { guideServiceMarkupBps: true, travelMarkupBps: true },
  })

  return settings ?? DEFAULT_PLATFORM_PRICING
}
