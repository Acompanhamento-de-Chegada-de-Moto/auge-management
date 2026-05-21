-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "billingDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motorcycle" (
    "id" TEXT NOT NULL,
    "chassis" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "arrivalDate" TIMESTAMP(3),
    "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "registrationStatusDate" TIMESTAMP(3),
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motorcycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "motorcycle_chassis_key" ON "motorcycle"("chassis");

-- CreateIndex
CREATE INDEX "motorcycle_createdAt_idx" ON "motorcycle"("createdAt");

-- CreateIndex
CREATE INDEX "motorcycle_updatedAt_idx" ON "motorcycle"("updatedAt");

-- AddForeignKey
ALTER TABLE "motorcycle" ADD CONSTRAINT "motorcycle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
