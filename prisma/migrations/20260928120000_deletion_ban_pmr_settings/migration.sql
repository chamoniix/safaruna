-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "bannedAt" TIMESTAMP(3),
  ADD COLUMN "notifConfirmOptIn" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notifRappelOptIn" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notifMessagesOptIn" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notifPromoOptIn" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "language" TEXT NOT NULL DEFAULT 'fr',
  ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
  ADD COLUMN "accessibilityPmr" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "GuideProfile" ADD COLUMN "pmrCertified" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum
CREATE TYPE "AccountDeletionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AccountDeletionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AccountDeletionStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedByAdminId" TEXT,
    "reviewedByEmail" TEXT,
    "reviewNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountDeletionRequest_userId_createdAt_idx" ON "AccountDeletionRequest"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AccountDeletionRequest_status_requestedAt_idx" ON "AccountDeletionRequest"("status", "requestedAt");

-- AddForeignKey
ALTER TABLE "AccountDeletionRequest" ADD CONSTRAINT "AccountDeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex (partial unique: at most one PENDING deletion request per user, enforced atomically)
CREATE UNIQUE INDEX "AccountDeletionRequest_userId_pending_unique" ON "AccountDeletionRequest"("userId") WHERE status = 'PENDING';
