CREATE TYPE "ReferralStatus" AS ENUM ('REGISTERED', 'QUALIFIED');
CREATE TYPE "PromoCodeKind" AS ENUM ('REFERRED_SIGNUP', 'SPONSOR_REWARD');
CREATE TYPE "PromoCodeStatus" AS ENUM ('ACTIVE', 'HELD', 'REDEEMED', 'EXPIRED');

CREATE TABLE "ReferralCode" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Referral" (
  "id" TEXT NOT NULL,
  "referralCodeId" TEXT NOT NULL,
  "sponsorId" TEXT NOT NULL,
  "referredUserId" TEXT NOT NULL,
  "status" "ReferralStatus" NOT NULL DEFAULT 'REGISTERED',
  "qualifiedReservationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "qualifiedAt" TIMESTAMP(3),
  CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PromoCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "kind" "PromoCodeKind" NOT NULL,
  "status" "PromoCodeStatus" NOT NULL DEFAULT 'ACTIVE',
  "ownerId" TEXT NOT NULL,
  "referralId" TEXT NOT NULL,
  "discountBps" INTEGER NOT NULL DEFAULT 1000,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "reservedDraftId" TEXT,
  "reservationId" TEXT,
  "redeemedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PromoCode_discountBps_check" CHECK ("discountBps" > 0 AND "discountBps" < 10000)
);

CREATE TABLE "ReferralOAuthIntent" (
  "id" TEXT NOT NULL,
  "referralCodeId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReferralOAuthIntent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReferralCode_ownerId_key" ON "ReferralCode"("ownerId");
CREATE UNIQUE INDEX "ReferralCode_code_key" ON "ReferralCode"("code");
CREATE UNIQUE INDEX "Referral_referredUserId_key" ON "Referral"("referredUserId");
CREATE UNIQUE INDEX "Referral_qualifiedReservationId_key" ON "Referral"("qualifiedReservationId");
CREATE UNIQUE INDEX "Referral_sponsorId_referredUserId_key" ON "Referral"("sponsorId", "referredUserId");
CREATE INDEX "Referral_sponsorId_status_createdAt_idx" ON "Referral"("sponsorId", "status", "createdAt");
CREATE INDEX "Referral_referralCodeId_createdAt_idx" ON "Referral"("referralCodeId", "createdAt");
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
CREATE UNIQUE INDEX "PromoCode_reservedDraftId_key" ON "PromoCode"("reservedDraftId");
CREATE UNIQUE INDEX "PromoCode_reservationId_key" ON "PromoCode"("reservationId");
CREATE UNIQUE INDEX "PromoCode_referralId_kind_key" ON "PromoCode"("referralId", "kind");
CREATE INDEX "PromoCode_ownerId_status_expiresAt_idx" ON "PromoCode"("ownerId", "status", "expiresAt");
CREATE INDEX "PromoCode_status_expiresAt_idx" ON "PromoCode"("status", "expiresAt");
CREATE INDEX "ReferralOAuthIntent_expiresAt_idx" ON "ReferralOAuthIntent"("expiresAt");
CREATE INDEX "ReferralOAuthIntent_referralCodeId_createdAt_idx" ON "ReferralOAuthIntent"("referralCodeId", "createdAt");

ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referralCodeId_fkey"
  FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_sponsorId_fkey"
  FOREIGN KEY ("sponsorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredUserId_fkey"
  FOREIGN KEY ("referredUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_qualifiedReservationId_fkey"
  FOREIGN KEY ("qualifiedReservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_referralId_fkey"
  FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_reservedDraftId_fkey"
  FOREIGN KEY ("reservedDraftId") REFERENCES "ReservationDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_reservationId_fkey"
  FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReferralOAuthIntent" ADD CONSTRAINT "ReferralOAuthIntent_referralCodeId_fkey"
  FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
