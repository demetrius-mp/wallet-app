-- CreateEnum
CREATE TYPE "TransactionMode" AS ENUM ('RECURRENT', 'SINGLE_PAYMENT', 'IN_INSTALLMENTS');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('EXPENSE', 'INCOME');

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "mode" "TransactionMode" NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "purchased_at" DATE NOT NULL,
    "first_installment_at" DATE NOT NULL,
    "number_of_installments" INTEGER,
    "last_installment_at" DATE,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" "TransactionCategory" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
