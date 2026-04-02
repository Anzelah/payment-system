/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `PaymentEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `PaymentEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentEvent" ADD COLUMN     "eventId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_eventId_key" ON "PaymentEvent"("eventId");
