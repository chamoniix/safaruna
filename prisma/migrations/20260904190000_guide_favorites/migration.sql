-- CreateTable
CREATE TABLE "GuideFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guideProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuideFavorite_userId_guideProfileId_key" ON "GuideFavorite"("userId", "guideProfileId");

-- CreateIndex
CREATE INDEX "GuideFavorite_userId_createdAt_idx" ON "GuideFavorite"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GuideFavorite_guideProfileId_createdAt_idx" ON "GuideFavorite"("guideProfileId", "createdAt");

-- AddForeignKey
ALTER TABLE "GuideFavorite" ADD CONSTRAINT "GuideFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideFavorite" ADD CONSTRAINT "GuideFavorite_guideProfileId_fkey" FOREIGN KEY ("guideProfileId") REFERENCES "GuideProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
