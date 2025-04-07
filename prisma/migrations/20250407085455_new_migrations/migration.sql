/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - The `subscriptionStatus` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ALTER COLUMN "email" SET NOT NULL,
DROP COLUMN "subscriptionStatus",
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE';
