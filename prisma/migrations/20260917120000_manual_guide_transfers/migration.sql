-- Additive register: existing rows keep their values and are not marked verified.
-- Legacy float columns become optional; new records use exact EUR cents only.
ALTER TABLE "Transfer"
  ALTER COLUMN "amount" DROP NOT NULL,
  ALTER COLUMN "commission" DROP NOT NULL,
  ALTER COLUMN "net" DROP NOT NULL,
  ALTER COLUMN "period" DROP NOT NULL,
  ADD COLUMN "recordedEarningId" TEXT,
  ADD COLUMN "amountCents" INTEGER,
  ADD COLUMN "currency" TEXT,
  ADD COLUMN "bankReference" TEXT,
  ADD COLUMN "sentAt" TIMESTAMP(3),
  ADD COLUMN "dueAt" TIMESTAMP(3),
  ADD COLUMN "bankSnapshotEncrypted" TEXT,
  ADD COLUMN "bankRevision" TEXT,
  ADD COLUMN "sourceRevision" TEXT,
  ADD COLUMN "preparedByAdminId" TEXT,
  ADD COLUMN "preparedByEmail" TEXT,
  ADD COLUMN "confirmedByAdminId" TEXT,
  ADD COLUMN "confirmedByEmail" TEXT,
  ADD COLUMN "confirmedAt" TIMESTAMP(3),
  ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "Transfer_recordedEarningId_key" ON "Transfer"("recordedEarningId");
CREATE INDEX "Transfer_status_dueAt_idx" ON "Transfer"("status", "dueAt");
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_recordedEarningId_fkey"
  FOREIGN KEY ("recordedEarningId") REFERENCES "GuideEarning"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- SQL checks apply to the new records only; null legacy fields stay untouched.
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_manual_record_check" CHECK (
  "recordedEarningId" IS NULL OR (
    "amountCents" IS NOT NULL AND "amountCents" > 0 AND
    "currency" IS NOT NULL AND "currency" = 'EUR' AND
    "bankReference" IS NOT NULL AND length(trim("bankReference")) > 0 AND
    "sentAt" IS NOT NULL AND "dueAt" IS NOT NULL AND
    "bankSnapshotEncrypted" IS NOT NULL AND "bankRevision" IS NOT NULL AND
    "sourceRevision" IS NOT NULL AND "preparedByAdminId" IS NOT NULL AND
    "preparedByEmail" IS NOT NULL AND "revision" >= 0 AND
    ("status" <> 'PAID' OR (
      "confirmedAt" IS NOT NULL AND "confirmedByAdminId" IS NOT NULL AND
      "confirmedByEmail" IS NOT NULL
    ))
  )
);
