CREATE TYPE "PromotionCampaignStatus" AS ENUM ('ACTIVE', 'DISABLED', 'EXHAUSTED');
CREATE TYPE "PromotionRedemptionStatus" AS ENUM ('HELD', 'REDEEMED', 'RELEASED', 'EXPIRED');

ALTER TABLE "Reservation"
ADD COLUMN "grossPrice" DOUBLE PRECISION,
ADD COLUMN "promotionDiscountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE TABLE "PromotionCampaign" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "PromotionCampaignStatus" NOT NULL DEFAULT 'ACTIVE',
  "discountBps" INTEGER NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "maxRedemptions" INTEGER,
  "maxRedemptionsPerPelerin" INTEGER,
  "maxDiscountBudgetCents" INTEGER,
  "createdByAdminId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromotionCampaign_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PromotionCampaign_code_format_check" CHECK ("code" = UPPER(BTRIM("code")) AND "code" NOT LIKE 'SAF-%'),
  CONSTRAINT "PromotionCampaign_discount_check" CHECK ("discountBps" > 0 AND "discountBps" < 10000),
  CONSTRAINT "PromotionCampaign_dates_check" CHECK ("expiresAt" > "startsAt"),
  CONSTRAINT "PromotionCampaign_global_limit_check" CHECK ("maxRedemptions" IS NULL OR "maxRedemptions" > 0),
  CONSTRAINT "PromotionCampaign_user_limit_check" CHECK ("maxRedemptionsPerPelerin" IS NULL OR "maxRedemptionsPerPelerin" > 0),
  CONSTRAINT "PromotionCampaign_limit_consistency_check" CHECK ("maxRedemptions" IS NULL OR "maxRedemptionsPerPelerin" IS NULL OR "maxRedemptionsPerPelerin" <= "maxRedemptions"),
  CONSTRAINT "PromotionCampaign_budget_check" CHECK ("maxDiscountBudgetCents" IS NULL OR "maxDiscountBudgetCents" > 0)
);

CREATE TABLE "PromotionRedemption" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "pelerinId" TEXT NOT NULL,
  "status" "PromotionRedemptionStatus" NOT NULL DEFAULT 'HELD',
  "reservationDraftId" TEXT,
  "reservationId" TEXT,
  "grossAmountCents" INTEGER NOT NULL,
  "discountAmountCents" INTEGER NOT NULL,
  "discountBpsSnapshot" INTEGER NOT NULL,
  "campaignCodeSnapshot" TEXT NOT NULL,
  "heldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "redeemedAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromotionRedemption_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PromotionRedemption_amounts_check" CHECK ("grossAmountCents" > 0 AND "discountAmountCents" > 0 AND "discountAmountCents" < "grossAmountCents"),
  CONSTRAINT "PromotionRedemption_discount_check" CHECK ("discountBpsSnapshot" > 0 AND "discountBpsSnapshot" < 10000)
);

CREATE UNIQUE INDEX "PromotionCampaign_code_key" ON "PromotionCampaign"("code");
CREATE INDEX "PromotionCampaign_status_startsAt_expiresAt_idx" ON "PromotionCampaign"("status", "startsAt", "expiresAt");
CREATE UNIQUE INDEX "PromotionRedemption_reservationDraftId_key" ON "PromotionRedemption"("reservationDraftId");
CREATE UNIQUE INDEX "PromotionRedemption_reservationId_key" ON "PromotionRedemption"("reservationId");
CREATE INDEX "PromotionRedemption_campaignId_status_idx" ON "PromotionRedemption"("campaignId", "status");
CREATE INDEX "PromotionRedemption_campaignId_pelerinId_status_idx" ON "PromotionRedemption"("campaignId", "pelerinId", "status");

ALTER TABLE "PromotionCampaign" ADD CONSTRAINT "PromotionCampaign_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PromotionCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_pelerinId_fkey" FOREIGN KEY ("pelerinId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_reservationDraftId_fkey" FOREIGN KEY ("reservationDraftId") REFERENCES "ReservationDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PromotionRedemption" ADD CONSTRAINT "PromotionRedemption_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
