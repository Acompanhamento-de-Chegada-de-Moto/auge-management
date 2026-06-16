/*
  Warnings:

  - The `role` column on the `user` table is being changed from `UserRole` enum to `text`.
  - The `UserRole` enum will be dropped.

*/

-- AlterTable: change role from enum to text, add admin plugin fields
ALTER TABLE "user"
  ALTER COLUMN "role" TYPE text USING "role"::text,
  ALTER COLUMN "role" SET DEFAULT 'USER',
  ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN     "banReason" TEXT,
  ADD COLUMN     "banExpires" TIMESTAMP(3);

-- AlterTable: add impersonatedBy to session
ALTER TABLE "session"
  ADD COLUMN     "impersonatedBy" TEXT;

-- DropEnum
DROP TYPE IF EXISTS "UserRole";
