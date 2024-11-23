-- CreateTable
CREATE TABLE "transaction_payment_histories" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "paid_at" DATE NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_payment_histories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transaction_payment_histories" ADD CONSTRAINT "transaction_payment_histories_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
