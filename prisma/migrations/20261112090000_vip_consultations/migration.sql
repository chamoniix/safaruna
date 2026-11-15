CREATE TYPE "VipConsultationStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CONSULTATION_BOOKED');

CREATE TABLE "VipConsultation" (
    "id" TEXT NOT NULL,
    "refNumber" TEXT NOT NULL,
    "status" "VipConsultationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "amountCents" INTEGER NOT NULL DEFAULT 50000,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "provider" TEXT NOT NULL DEFAULT 'WHOP',
    "providerCheckoutId" TEXT,
    "providerPaymentId" TEXT,
    "customerEmail" TEXT,
    "contactPlatform" TEXT,
    "contactPhone" TEXT,
    "paidAt" TIMESTAMP(3),
    "consultationBookedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VipConsultation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VipConsultation_refNumber_key" ON "VipConsultation"("refNumber");
CREATE UNIQUE INDEX "VipConsultation_providerCheckoutId_key" ON "VipConsultation"("providerCheckoutId");
CREATE UNIQUE INDEX "VipConsultation_providerPaymentId_key" ON "VipConsultation"("providerPaymentId");
CREATE INDEX "VipConsultation_status_createdAt_idx" ON "VipConsultation"("status", "createdAt");
