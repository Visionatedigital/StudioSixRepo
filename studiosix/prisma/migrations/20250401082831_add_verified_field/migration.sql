/*
  Warnings:

  - Added the required column `userId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_projectId_fkey";

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "userId" TEXT;

-- Update existing chat messages to use the project owner's user ID
UPDATE "ChatMessage" cm
SET "userId" = p."userId"
FROM "Project" p
WHERE cm."projectId" = p.id;

-- Make userId required after setting values
ALTER TABLE "ChatMessage" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "canvasData" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "hashedPassword" TEXT,
ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
