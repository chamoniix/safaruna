-- Additive only: existing applications and public guide photos remain unchanged.
ALTER TABLE "GuideApplication"
ADD COLUMN "profilePhotoPath" TEXT,
ADD COLUMN "hasPersonalVehicle" BOOLEAN,
ADD COLUMN "vehicleModel" TEXT,
ADD COLUMN "vehicleYear" INTEGER,
ADD COLUMN "vehiclePassengerSeats" INTEGER,
ADD COLUMN "vehicleColor" TEXT,
ADD COLUMN "vehicleSeatsConfirmed" BOOLEAN,
ADD COLUMN "vehicleDashboardPhotoPath" TEXT,
ADD COLUMN "vehicleSeatsPhotoPath" TEXT,
ADD COLUMN "vehicleExteriorPhotoPath" TEXT;
