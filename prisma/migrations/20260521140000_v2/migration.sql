-- Drop audit_log table and related enums
DROP TABLE IF EXISTS "audit_log";
DROP TYPE IF EXISTS "AuditAction";
DROP TYPE IF EXISTS "EntityType";

-- Update RegistrationStatus enum
ALTER TYPE "RegistrationStatus" RENAME TO "RegistrationStatus_old";
CREATE TYPE "RegistrationStatus" AS ENUM ('NO_PLATE', 'PLATING', 'PLATED');
ALTER TABLE "motorcycle" ALTER COLUMN "registrationStatus" DROP DEFAULT;
ALTER TABLE "motorcycle" ALTER COLUMN "registrationStatus" TYPE "RegistrationStatus" USING "registrationStatus"::text::"RegistrationStatus";
ALTER TABLE "motorcycle" ALTER COLUMN "registrationStatus" SET DEFAULT 'NO_PLATE';
DROP TYPE IF EXISTS "RegistrationStatus_old";

-- Add columns to client
ALTER TABLE "client" ADD COLUMN "cpf" TEXT;
ALTER TABLE "client" ADD COLUMN "deliveryForecast" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "client_cpf_key" ON "client"("cpf");
