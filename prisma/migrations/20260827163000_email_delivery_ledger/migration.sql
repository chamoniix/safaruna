CREATE TABLE "EmailDelivery" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'BREVO',
  "providerMessageId" TEXT,
  "category" TEXT NOT NULL,
  "recipientEmail" TEXT NOT NULL,
  "referenceType" TEXT,
  "referenceId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "nextAttemptAt" TIMESTAMP(3),
  "payloadEncrypted" TEXT,
  "lastError" TEXT,
  "acceptedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "lastEventAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailDeliveryEvent" (
  "id" TEXT NOT NULL,
  "providerEventKey" TEXT NOT NULL,
  "deliveryId" TEXT,
  "provider" TEXT NOT NULL DEFAULT 'BREVO',
  "providerMessageId" TEXT,
  "event" TEXT NOT NULL,
  "recipientEmail" TEXT,
  "reason" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailDeliveryEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailDelivery_idempotencyKey_key" ON "EmailDelivery"("idempotencyKey");
CREATE UNIQUE INDEX "EmailDelivery_providerMessageId_key" ON "EmailDelivery"("providerMessageId");
CREATE INDEX "EmailDelivery_status_nextAttemptAt_idx" ON "EmailDelivery"("status", "nextAttemptAt");
CREATE INDEX "EmailDelivery_category_createdAt_idx" ON "EmailDelivery"("category", "createdAt");
CREATE INDEX "EmailDelivery_referenceType_referenceId_idx" ON "EmailDelivery"("referenceType", "referenceId");
CREATE INDEX "EmailDelivery_createdAt_idx" ON "EmailDelivery"("createdAt");
CREATE UNIQUE INDEX "EmailDeliveryEvent_providerEventKey_key" ON "EmailDeliveryEvent"("providerEventKey");
CREATE INDEX "EmailDeliveryEvent_deliveryId_occurredAt_idx" ON "EmailDeliveryEvent"("deliveryId", "occurredAt");
CREATE INDEX "EmailDeliveryEvent_providerMessageId_idx" ON "EmailDeliveryEvent"("providerMessageId");
CREATE INDEX "EmailDeliveryEvent_event_occurredAt_idx" ON "EmailDeliveryEvent"("event", "occurredAt");

ALTER TABLE "EmailDeliveryEvent"
  ADD CONSTRAINT "EmailDeliveryEvent_deliveryId_fkey"
  FOREIGN KEY ("deliveryId") REFERENCES "EmailDelivery"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
