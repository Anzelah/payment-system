-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "phone" TEXT,
ALTER COLUMN "currency" DROP NOT NULL;
