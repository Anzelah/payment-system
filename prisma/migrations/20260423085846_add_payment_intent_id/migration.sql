/*
  Warnings:

  - A unique constraint covering the columns `[paymentIntentId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentIntentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_paymentIntentId_key" ON "Transaction"("paymentIntentId");
