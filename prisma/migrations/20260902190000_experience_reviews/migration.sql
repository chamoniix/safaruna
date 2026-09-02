-- Avis général d'un membre, ou avis de séjour vérifié lié à une réservation.
-- Les avis Guide existants restent dans la table Review.
CREATE TABLE "ExperienceReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reservationId" TEXT,
    "generalReviewKey" TEXT,
    "firstName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "status" "ReviewModerationStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedByAdminId" TEXT,
    "moderatedByEmail" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "moderationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperienceReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExperienceReview_reservationId_key" ON "ExperienceReview"("reservationId");
CREATE UNIQUE INDEX "ExperienceReview_generalReviewKey_key" ON "ExperienceReview"("generalReviewKey");
CREATE INDEX "ExperienceReview_userId_status_createdAt_idx" ON "ExperienceReview"("userId", "status", "createdAt");
CREATE INDEX "ExperienceReview_status_moderatedAt_createdAt_idx" ON "ExperienceReview"("status", "moderatedAt", "createdAt");

ALTER TABLE "ExperienceReview"
ADD CONSTRAINT "ExperienceReview_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ExperienceReview"
ADD CONSTRAINT "ExperienceReview_reservationId_fkey"
FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ExperienceReview"
ADD CONSTRAINT "ExperienceReview_moderatedByAdminId_fkey"
FOREIGN KEY ("moderatedByAdminId") REFERENCES "AdminAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
