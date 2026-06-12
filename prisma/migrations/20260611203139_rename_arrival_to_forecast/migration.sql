/*
  Warnings:

  - You are about to drop the column `arrivalDate` on the `motorcycle` table. All the data in the column will be lost.
  - Made the column `cpf` on table `client` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "client" ALTER COLUMN "cpf" SET NOT NULL;

-- AlterTable
ALTER TABLE "motorcycle" DROP COLUMN "arrivalDate",
ADD COLUMN     "forecastDate" TIMESTAMP(3);
