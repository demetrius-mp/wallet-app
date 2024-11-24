/*
  Warnings:

  - A unique constraint covering the columns `[transaction_id,paid_at]` on the table `transaction_payment_confirmations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "transaction_payment_confirmations_transaction_id_paid_at_key" ON "transaction_payment_confirmations"("transaction_id", "paid_at");
