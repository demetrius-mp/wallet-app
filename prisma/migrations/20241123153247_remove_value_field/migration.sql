/*
  Warnings:

  - You are about to drop the column `value` on the `transaction_payment_histories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transaction_payment_histories" DROP COLUMN "value";
