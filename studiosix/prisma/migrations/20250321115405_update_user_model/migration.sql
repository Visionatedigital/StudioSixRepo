/*
  Warnings:

  - You are about to drop the column `currency` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_userId_fkey";

-- DropIndex
DROP INDEX "PaymentTransaction_reference_idx";

-- DropIndex
DROP INDEX "PaymentTransaction_userId_idx";

-- AlterTable
ALTER TABLE "PaymentTransaction" DROP COLUMN "currency",
DROP COLUMN "type",
DROP COLUMN "userId",
ADD COLUMN     "providerReference" TEXT,
ALTER COLUMN "metadata" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashedPassword",
DROP COLUMN "image",
ADD COLUMN     "password" TEXT,
ADD COLUMN     "weeklyNewsletter" BOOLEAN NOT NULL DEFAULT false;
