/*
  Warnings:

  - You are about to drop the `transaction_payment_histories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "transaction_payment_histories" DROP CONSTRAINT "transaction_payment_histories_transaction_id_fkey";

-- DropTable
DROP TABLE "transaction_payment_histories";

-- CreateTable
CREATE TABLE "transaction_payment_confirmations" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "paid_at" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_payment_confirmations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transaction_payment_confirmations" ADD CONSTRAINT "transaction_payment_confirmations_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
