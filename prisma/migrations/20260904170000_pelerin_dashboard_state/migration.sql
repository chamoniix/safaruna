-- CreateTable
CREATE TABLE "PelerinDashboardState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memorizedDuaIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "completedChecklistItemIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "customChecklistItems" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PelerinDashboardState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PelerinDashboardState_userId_key" ON "PelerinDashboardState"("userId");

-- CreateIndex
CREATE INDEX "PelerinDashboardState_userId_updatedAt_idx" ON "PelerinDashboardState"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "PelerinDashboardState" ADD CONSTRAINT "PelerinDashboardState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
