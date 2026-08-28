CREATE TYPE "PaymentAttemptStatus" AS ENUM (
  'CREATED',
  'PENDING',
  'SUCCEEDED',
  'EXPIRED',
  'FAILED',
  'CANCELLED'
);

CREATE TYPE "PaymentEventStatus" AS ENUM (
  'PROCESSING',
  'PROCESSED',
  'FAILED',
  'IGNORED'
);

CREATE TYPE "PaymentTransactionType" AS ENUM (
  'CHARGE',
  'REFUND',
  'CHARGEBACK'
);

CREATE TYPE "PaymentTransactionStatus" AS ENUM (
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'REVERSED'
);

CREATE TABLE "PaymentAttempt" (
  "id" TEXT NOT NULL,
  "bookingRef" TEXT NOT NULL,
  "reservationId" TEXT,
  "provider" TEXT NOT NULL,
  "providerCheckoutId" TEXT,
  "providerPaymentId" TEXT,
  "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATED',
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "checkoutExpiresAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "failureCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentAttempt_amountCents_check" CHECK ("amountCents" > 0),
  CONSTRAINT "PaymentAttempt_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$'),
  CONSTRAINT "PaymentAttempt_provider_check" CHECK (length(trim("provider")) > 0)
);

CREATE TABLE "PaymentEvent" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT,
  "provider" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "providerEventType" TEXT NOT NULL,
  "providerObjectId" TEXT,
  "status" "PaymentEventStatus" NOT NULL DEFAULT 'PROCESSING',
  "processingAttempts" INTEGER NOT NULL DEFAULT 1,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "processingStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentEvent_processingAttempts_check" CHECK ("processingAttempts" > 0),
  CONSTRAINT "PaymentEvent_provider_check" CHECK (length(trim("provider")) > 0)
);

CREATE TABLE "PaymentTransaction" (
  "id" TEXT NOT NULL,
  "bookingRef" TEXT NOT NULL,
  "reservationId" TEXT,
  "attemptId" TEXT,
  "provider" TEXT NOT NULL,
  "providerTransactionId" TEXT NOT NULL,
  "type" "PaymentTransactionType" NOT NULL,
  "status" "PaymentTransactionStatus" NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentTransaction_amountCents_check" CHECK ("amountCents" > 0),
  CONSTRAINT "PaymentTransaction_currency_check" CHECK ("currency" ~ '^[A-Z]{3}$'),
  CONSTRAINT "PaymentTransaction_provider_check" CHECK (length(trim("provider")) > 0)
);

CREATE UNIQUE INDEX "PaymentAttempt_provider_providerCheckoutId_key"
  ON "PaymentAttempt"("provider", "providerCheckoutId");
CREATE UNIQUE INDEX "PaymentAttempt_provider_providerPaymentId_key"
  ON "PaymentAttempt"("provider", "providerPaymentId");
CREATE INDEX "PaymentAttempt_bookingRef_createdAt_idx"
  ON "PaymentAttempt"("bookingRef", "createdAt");
CREATE INDEX "PaymentAttempt_reservationId_idx"
  ON "PaymentAttempt"("reservationId");
CREATE INDEX "PaymentAttempt_status_createdAt_idx"
  ON "PaymentAttempt"("status", "createdAt");

CREATE UNIQUE INDEX "PaymentEvent_provider_providerEventId_key"
  ON "PaymentEvent"("provider", "providerEventId");
CREATE INDEX "PaymentEvent_attemptId_occurredAt_idx"
  ON "PaymentEvent"("attemptId", "occurredAt");
CREATE INDEX "PaymentEvent_status_processingStartedAt_idx"
  ON "PaymentEvent"("status", "processingStartedAt");
CREATE INDEX "PaymentEvent_providerObjectId_idx"
  ON "PaymentEvent"("providerObjectId");

CREATE UNIQUE INDEX "PaymentTransaction_provider_type_providerTransactionId_key"
  ON "PaymentTransaction"("provider", "type", "providerTransactionId");
CREATE INDEX "PaymentTransaction_bookingRef_occurredAt_idx"
  ON "PaymentTransaction"("bookingRef", "occurredAt");
CREATE INDEX "PaymentTransaction_reservationId_idx"
  ON "PaymentTransaction"("reservationId");
CREATE INDEX "PaymentTransaction_attemptId_idx"
  ON "PaymentTransaction"("attemptId");
CREATE INDEX "PaymentTransaction_status_occurredAt_idx"
  ON "PaymentTransaction"("status", "occurredAt");

ALTER TABLE "PaymentAttempt"
  ADD CONSTRAINT "PaymentAttempt_reservationId_fkey"
  FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentEvent"
  ADD CONSTRAINT "PaymentEvent_attemptId_fkey"
  FOREIGN KEY ("attemptId") REFERENCES "PaymentAttempt"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentTransaction"
  ADD CONSTRAINT "PaymentTransaction_reservationId_fkey"
  FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentTransaction"
  ADD CONSTRAINT "PaymentTransaction_attemptId_fkey"
  FOREIGN KEY ("attemptId") REFERENCES "PaymentAttempt"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill additif : les références Stripe restent aussi dans leurs colonnes
-- historiques pendant toute la migration.
INSERT INTO "PaymentAttempt" (
  "id", "bookingRef", "reservationId", "provider", "providerPaymentId",
  "status", "amountCents", "currency", "paidAt", "createdAt", "updatedAt"
)
SELECT
  'legacy_res_' || md5(r."id"),
  r."refNumber",
  r."id",
  'STRIPE',
  r."stripePaymentId",
  'SUCCEEDED'::"PaymentAttemptStatus",
  ROUND(r."totalPrice" * 100)::INTEGER,
  'EUR',
  r."createdAt",
  r."createdAt",
  CURRENT_TIMESTAMP
FROM "Reservation" r
WHERE r."stripePaymentId" IS NOT NULL
  AND r."totalPrice" > 0
ON CONFLICT ("provider", "providerPaymentId") DO NOTHING;

INSERT INTO "PaymentTransaction" (
  "id", "bookingRef", "reservationId", "attemptId", "provider",
  "providerTransactionId", "type", "status", "amountCents", "currency",
  "occurredAt", "createdAt", "updatedAt"
)
SELECT
  'legacy_charge_' || md5(r."id"),
  r."refNumber",
  r."id",
  pa."id",
  'STRIPE',
  r."stripePaymentId",
  'CHARGE'::"PaymentTransactionType",
  'SUCCEEDED'::"PaymentTransactionStatus",
  ROUND(r."totalPrice" * 100)::INTEGER,
  'EUR',
  r."createdAt",
  r."createdAt",
  CURRENT_TIMESTAMP
FROM "Reservation" r
JOIN "PaymentAttempt" pa
  ON pa."provider" = 'STRIPE' AND pa."providerPaymentId" = r."stripePaymentId"
WHERE r."stripePaymentId" IS NOT NULL
  AND r."totalPrice" > 0
ON CONFLICT ("provider", "type", "providerTransactionId") DO NOTHING;

INSERT INTO "PaymentAttempt" (
  "id", "bookingRef", "provider", "providerCheckoutId", "status",
  "amountCents", "currency", "checkoutExpiresAt", "createdAt", "updatedAt"
)
SELECT
  'legacy_draft_' || md5(d."id"),
  d."refNumber",
  'STRIPE',
  d."stripeSessionId",
  'PENDING'::"PaymentAttemptStatus",
  ROUND(((d."data"::jsonb ->> 'totalPrice')::NUMERIC) * 100)::INTEGER,
  'EUR',
  d."expiresAt",
  d."createdAt",
  CURRENT_TIMESTAMP
FROM "ReservationDraft" d
WHERE d."stripeSessionId" IS NOT NULL
  AND (d."data"::jsonb ->> 'totalPrice') ~ '^[0-9]+([.][0-9]+)?$'
  AND ((d."data"::jsonb ->> 'totalPrice')::NUMERIC) > 0
ON CONFLICT ("provider", "providerCheckoutId") DO NOTHING;
