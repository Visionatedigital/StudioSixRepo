-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "hasGenerateAction" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isGeneratedImage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "selectedElement" JSONB,
ADD COLUMN     "sources" JSONB;

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
