BEGIN;
ALTER TABLE "motorcycles" ADD COLUMN "arrivedAt" TIMESTAMP(3);
CREATE INDEX "motorcycles_arrivedAt_forecastArrival_idx" ON "motorcycles"("arrivedAt", "forecastArrival");

CREATE TABLE "check_in_operators" (
  "id" UUID NOT NULL, "name" TEXT NOT NULL, "identifier" TEXT NOT NULL,
  "pinHash" TEXT NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  "failedAttempts" INTEGER NOT NULL DEFAULT 0, "lockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "check_in_operators_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "check_in_operators_identifier_key" ON "check_in_operators"("identifier");
CREATE TABLE "check_in_sessions" (
  "id" UUID NOT NULL, "tokenHash" TEXT NOT NULL, "operatorId" UUID NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "check_in_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "check_in_sessions_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "check_in_operators"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "check_in_sessions_tokenHash_key" ON "check_in_sessions"("tokenHash");
CREATE INDEX "check_in_sessions_operatorId_idx" ON "check_in_sessions"("operatorId");
CREATE INDEX "check_in_sessions_expiresAt_idx" ON "check_in_sessions"("expiresAt");
CREATE TABLE "motorcycle_receipts" (
  "id" UUID NOT NULL, "motorcycleId" UUID NOT NULL, "operatorId" UUID,
  "actorLabel" TEXT NOT NULL, "source" TEXT NOT NULL, "arrivedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "motorcycle_receipts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "motorcycle_receipts_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "motorcycles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "motorcycle_receipts_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "check_in_operators"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "motorcycle_receipts_motorcycleId_key" ON "motorcycle_receipts"("motorcycleId");
CREATE INDEX "motorcycle_receipts_operatorId_idx" ON "motorcycle_receipts"("operatorId");
-- Existing ARRIVED records retain their status. Their actual receipt time is
-- unknown, so do not fabricate arrivedAt from updatedAt or the forecast.
COMMIT;
