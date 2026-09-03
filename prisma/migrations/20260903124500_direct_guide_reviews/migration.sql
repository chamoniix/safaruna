ALTER TABLE "Review" DROP CONSTRAINT "Review_reservationId_fkey";

ALTER TABLE "Review"
  ALTER COLUMN "reservationId" DROP NOT NULL,
  ADD COLUMN "directReviewKey" TEXT,
  ADD COLUMN "reviewerFirstName" TEXT,
  ADD COLUMN "reviewerCity" TEXT,
  ADD COLUMN "reviewerCountry" TEXT;

CREATE UNIQUE INDEX "Review_directReviewKey_key" ON "Review"("directReviewKey");
CREATE INDEX "Review_pelerinId_directReviewKey_idx" ON "Review"("pelerinId", "directReviewKey");

ALTER TABLE "Review"
  ADD CONSTRAINT "Review_reservationId_fkey"
  FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
