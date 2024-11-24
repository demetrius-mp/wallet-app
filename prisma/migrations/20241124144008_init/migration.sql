-- DropForeignKey
ALTER TABLE "transaction_payment_confirmations" DROP CONSTRAINT "transaction_payment_confirmations_transaction_id_fkey";

-- AddForeignKey
ALTER TABLE "transaction_payment_confirmations" ADD CONSTRAINT "transaction_payment_confirmations_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
