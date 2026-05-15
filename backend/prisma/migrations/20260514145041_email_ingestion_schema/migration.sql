-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('Inflow', 'Outflow');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('confirmed', 'pending');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Food', 'Housing', 'Utilities', 'Transport', 'Entertainment', 'Salary', 'Other');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('RON');

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "category" "Category" NOT NULL,
    "subcategory" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'RON',
    "status" "TransactionStatus" NOT NULL DEFAULT 'confirmed',
    "date" TIMESTAMP(3) NOT NULL,
    "rawEmailBody" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sender_whitelist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sender_whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transaction_userId_idx" ON "transaction"("userId");

-- CreateIndex
CREATE INDEX "transaction_userId_status_idx" ON "transaction"("userId", "status");

-- CreateIndex
CREATE INDEX "sender_whitelist_senderEmail_idx" ON "sender_whitelist"("senderEmail");

-- CreateIndex
CREATE UNIQUE INDEX "sender_whitelist_userId_senderEmail_key" ON "sender_whitelist"("userId", "senderEmail");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sender_whitelist" ADD CONSTRAINT "sender_whitelist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
