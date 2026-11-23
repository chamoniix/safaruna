-- A declaration by the assigned Guide, independent of the pilgrim's stay status.
-- The recorded mission end date remains the sole date used for payout timing.
ALTER TABLE "ReservationMission" ADD COLUMN "guideCompleted" BOOLEAN NOT NULL DEFAULT false;
