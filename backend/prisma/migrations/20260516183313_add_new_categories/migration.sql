-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Category" ADD VALUE 'Healthcare';
ALTER TYPE "Category" ADD VALUE 'Education';
ALTER TYPE "Category" ADD VALUE 'Shopping';
ALTER TYPE "Category" ADD VALUE 'Travel';
ALTER TYPE "Category" ADD VALUE 'Insurance';
ALTER TYPE "Category" ADD VALUE 'Subscriptions';

-- DropIndex
DROP INDEX "transaction_resolvedByUserId_idx";
