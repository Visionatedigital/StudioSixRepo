/*
  Warnings:

  - You are about to drop the column `currency` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyNewsletter` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentTransaction" DROP COLUMN "currency",
DROP COLUMN "type",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "weeklyNewsletter",
ADD COLUMN     "image" TEXT;
