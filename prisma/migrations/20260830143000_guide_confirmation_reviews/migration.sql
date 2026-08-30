CREATE TYPE "GuideConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED');
CREATE TYPE "ReviewModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

ALTER TABLE "Reservation"
  ADD COLUMN "reviewRequestSentAt" TIMESTAMP(3),
  ADD COLUMN "stayRating" INTEGER,
  ADD COLUMN "stayComment" TEXT,
  ADD COLUMN "feedbackSubmittedAt" TIMESTAMP(3);

ALTER TABLE "ReservationMission"
  ADD COLUMN "guideConfirmationStatus" "GuideConfirmationStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "guideConfirmationRequestedAt" TIMESTAMP(3),
  ADD COLUMN "guideConfirmedAt" TIMESTAMP(3);

UPDATE "ReservationMission"
SET "guideConfirmationRequestedAt" = "createdAt"
WHERE "guideConfirmationRequestedAt" IS NULL;

ALTER TABLE "Review"
  ADD COLUMN "guideProfileId" TEXT,
  ADD COLUMN "status" "ReviewModerationStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "moderatedByAdminId" TEXT,
  ADD COLUMN "moderatedByEmail" TEXT,
  ADD COLUMN "moderatedAt" TIMESTAMP(3),
  ADD COLUMN "moderationNote" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Review" AS review
SET "guideProfileId" = reservation."guideProfileId"
FROM "Reservation" AS reservation
WHERE review."reservationId" = reservation."id"
  AND review."guideProfileId" IS NULL;

ALTER TABLE "Review"
  ALTER COLUMN "guideProfileId" SET NOT NULL;

ALTER TABLE "Review"
  ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE INDEX "ReservationMission_guideProfileId_guideConfirmationStatus_createdAt_idx"
  ON "ReservationMission"("guideProfileId", "guideConfirmationStatus", "createdAt");
CREATE UNIQUE INDEX "Review_reservationId_guideProfileId_key"
  ON "Review"("reservationId", "guideProfileId");
CREATE INDEX "Review_guideProfileId_status_createdAt_idx"
  ON "Review"("guideProfileId", "status", "createdAt");
CREATE INDEX "Review_status_createdAt_idx"
  ON "Review"("status", "createdAt");

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_guideProfileId_fkey"
  FOREIGN KEY ("guideProfileId") REFERENCES "GuideProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Review"
  ADD CONSTRAINT "Review_moderatedByAdminId_fkey"
  FOREIGN KEY ("moderatedByAdminId") REFERENCES "AdminAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
