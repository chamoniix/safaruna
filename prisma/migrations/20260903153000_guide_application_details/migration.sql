ALTER TABLE "GuideApplication"
  ADD COLUMN "transportMode" TEXT NOT NULL,
  ADD COLUMN "transportDetails" TEXT,
  ADD COLUMN "proposedOmraPriceCents" INTEGER NOT NULL,
  ADD COLUMN "proposedMadinahPackagePriceCents" INTEGER NOT NULL,
  ADD COLUMN "proposedMadinahPlacePriceCents" INTEGER NOT NULL,
  ADD COLUMN "proposedMakkahPackagePriceCents" INTEGER NOT NULL,
  ADD COLUMN "proposedMakkahPlacePriceCents" INTEGER NOT NULL,
  ADD COLUMN "pricingDetails" TEXT,
  ADD COLUMN "bankAccountFirstName" TEXT NOT NULL,
  ADD COLUMN "bankAccountLastName" TEXT NOT NULL,
  ADD COLUMN "bankName" TEXT NOT NULL,
  ADD COLUMN "bankCountry" TEXT NOT NULL,
  ADD COLUMN "bicEncrypted" TEXT;

ALTER TABLE "GuideProfile"
  ADD COLUMN "bankAccountFirstName" TEXT,
  ADD COLUMN "bankAccountLastName" TEXT,
  ADD COLUMN "bankName" TEXT,
  ADD COLUMN "bankCountry" TEXT,
  ADD COLUMN "bicEncrypted" TEXT;
