ALTER TABLE "GuideApplication"
  ADD COLUMN "educationDetails" TEXT,
  ADD COLUMN "otherLanguages" TEXT,
  ADD COLUMN "otherPlaces" TEXT,
  ADD COLUMN "transportModes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "makkahIncludedDetails" TEXT,
  ADD COLUMN "makkahOtherDetails" TEXT,
  ADD COLUMN "madinahIncludedDetails" TEXT,
  ADD COLUMN "madinahOtherDetails" TEXT;

UPDATE "GuideApplication"
SET "transportModes" = CASE
  WHEN "transportMode" IN ('CAR', 'VAN', 'OTHER') THEN ARRAY["transportMode"]
  ELSE ARRAY[]::TEXT[]
END;

ALTER TABLE "GuideApplication"
  ALTER COLUMN "proposedOmraPriceCents" DROP NOT NULL,
  ALTER COLUMN "proposedMadinahPackagePriceCents" DROP NOT NULL,
  ALTER COLUMN "proposedMadinahPlacePriceCents" DROP NOT NULL,
  ALTER COLUMN "proposedMakkahPackagePriceCents" DROP NOT NULL,
  ALTER COLUMN "proposedMakkahPlacePriceCents" DROP NOT NULL;
