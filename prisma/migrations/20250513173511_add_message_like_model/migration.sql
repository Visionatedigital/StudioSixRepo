-- CreateTable
CREATE TABLE "MessageLike" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageLike_messageId_idx" ON "MessageLike"("messageId");

-- CreateIndex
CREATE INDEX "MessageLike_userId_idx" ON "MessageLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageLike_messageId_userId_key" ON "MessageLike"("messageId", "userId");
