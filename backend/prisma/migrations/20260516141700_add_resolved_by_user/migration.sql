-- AlterTable: add resolvedByUserId to track who resolved each transaction (AI or human)
ALTER TABLE "transaction" ADD COLUMN "resolvedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "transaction_resolvedByUserId_idx" ON "transaction"("resolvedByUserId");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
