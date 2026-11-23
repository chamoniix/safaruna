CREATE TABLE "GuideContract" (
    "id" TEXT NOT NULL,
    "guideProfileId" TEXT NOT NULL,
    "guideAccountId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "templateId" INTEGER NOT NULL,
    "externalId" TEXT NOT NULL,
    "guideName" TEXT NOT NULL,
    "guideEmail" TEXT NOT NULL,
    "guideCity" TEXT NOT NULL,
    "guideAddress" TEXT,
    "submissionId" INTEGER,
    "submitterId" INTEGER,
    "preparationAttemptedAt" TIMESTAMP(3),
    "sendAttemptedAt" TIMESTAMP(3),
    "providerStatus" TEXT,
    "submitterStatus" TEXT,
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "photoConsent" BOOLEAN,
    "lastSyncedAt" TIMESTAMP(3),
    "providerUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuideContract_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GuideContract_externalId_key" ON "GuideContract"("externalId");
CREATE UNIQUE INDEX "GuideContract_submissionId_key" ON "GuideContract"("submissionId");
CREATE UNIQUE INDEX "GuideContract_submitterId_key" ON "GuideContract"("submitterId");
CREATE UNIQUE INDEX "GuideContract_guideProfileId_version_key" ON "GuideContract"("guideProfileId", "version");
ALTER TABLE "GuideContract" ADD CONSTRAINT "GuideContract_guideProfileId_fkey" FOREIGN KEY ("guideProfileId") REFERENCES "GuideProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
