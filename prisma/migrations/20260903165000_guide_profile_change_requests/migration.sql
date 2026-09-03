CREATE TYPE "GuideProfileChangeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "GuideProfileChangeRequest" (
  "id" TEXT NOT NULL,
  "guideProfileId" TEXT NOT NULL,
  "activeKey" TEXT,
  "changes" JSONB NOT NULL,
  "before" JSONB NOT NULL,
  "status" "GuideProfileChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
  "requestedByGuideAccountId" TEXT NOT NULL,
  "requestedByEmail" TEXT NOT NULL,
  "submittedIp" TEXT,
  "submittedCountry" TEXT,
  "submittedCity" TEXT,
  "submittedDevice" TEXT,
  "submittedBrowser" TEXT,
  "submittedUserAgent" TEXT,
  "reviewedByAdminId" TEXT,
  "reviewedByEmail" TEXT,
  "reviewNotes" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GuideProfileChangeRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GuideProfileChangeRequest_activeKey_key" ON "GuideProfileChangeRequest"("activeKey");
CREATE INDEX "GuideProfileChangeRequest_status_createdAt_idx" ON "GuideProfileChangeRequest"("status", "createdAt");
CREATE INDEX "GuideProfileChangeRequest_guideProfileId_createdAt_idx" ON "GuideProfileChangeRequest"("guideProfileId", "createdAt");

ALTER TABLE "GuideProfileChangeRequest"
  ADD CONSTRAINT "GuideProfileChangeRequest_guideProfileId_fkey"
  FOREIGN KEY ("guideProfileId") REFERENCES "GuideProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
