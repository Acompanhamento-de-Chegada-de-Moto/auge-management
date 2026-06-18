/*
  Warnings:

  - You are about to drop the `client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `motorcycle` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ArrivalStatus" AS ENUM ('DELAYED', 'ARRIVED', 'NO_INFORMATION');

-- DropForeignKey
ALTER TABLE "motorcycle" DROP CONSTRAINT "motorcycle_clientId_fkey";

-- DropTable
DROP TABLE "client";

-- DropTable
DROP TABLE "motorcycle";

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "sellersName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motorcycles" (
    "id" UUID NOT NULL,
    "chassi" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "forecastArrival" TIMESTAMP(3),
    "forecastArrivalStatus" "ArrivalStatus" NOT NULL DEFAULT 'NO_INFORMATION',
    "registrationStatus" "RegistrationStatus",
    "clientId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "motorcycles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "motorcycles_chassi_key" ON "motorcycles"("chassi");

-- AddForeignKey
ALTER TABLE "motorcycles" ADD CONSTRAINT "motorcycles_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
