ALTER TABLE "GuideProfile"
  ADD COLUMN "profileSubmittedAt" TIMESTAMP(3),
  ADD COLUMN "cancellationCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "permanentlyDeactivatedAt" TIMESTAMP(3);

ALTER TYPE "GuideConfirmationStatus" ADD VALUE 'DECLINED';
ALTER TYPE "GuideConfirmationStatus" ADD VALUE 'NO_RESPONSE';

CREATE TYPE "GuideReservationIncidentType" AS ENUM ('GUIDE_DECLINED', 'NO_RESPONSE');
CREATE TYPE "GuideReservationIncidentStatus" AS ENUM ('PENDING', 'COUNTED', 'EXCUSED');

CREATE TABLE "GuideReservationIncident" (
  "id" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "guideProfileId" TEXT NOT NULL,
  "type" "GuideReservationIncidentType" NOT NULL,
  "reason" TEXT,
  "status" "GuideReservationIncidentStatus" NOT NULL DEFAULT 'PENDING',
  "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedByAdminId" TEXT,
  "reviewedByEmail" TEXT,
  "reviewNotes" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GuideReservationIncident_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GuideReservationIncident_reservationId_guideProfileId_key"
  ON "GuideReservationIncident"("reservationId", "guideProfileId");
CREATE INDEX "GuideReservationIncident_guideProfileId_status_reportedAt_idx"
  ON "GuideReservationIncident"("guideProfileId", "status", "reportedAt");
CREATE INDEX "GuideReservationIncident_status_reportedAt_idx"
  ON "GuideReservationIncident"("status", "reportedAt");

ALTER TABLE "GuideReservationIncident"
  ADD CONSTRAINT "GuideReservationIncident_reservationId_fkey"
  FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuideReservationIncident"
  ADD CONSTRAINT "GuideReservationIncident_guideProfileId_fkey"
  FOREIGN KEY ("guideProfileId") REFERENCES "GuideProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
