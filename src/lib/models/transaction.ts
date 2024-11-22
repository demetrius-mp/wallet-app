import type { Transaction } from '@prisma/client';

import type { Entities } from '$lib/types';

export function convertTransaction(transaction: Transaction): Entities.Transaction {
	return {
		id: transaction.id,
		name: transaction.name,
		value: transaction.value,
		purchasedAt: transaction.purchasedAt,
		firstInstallmentAt: transaction.firstInstallmentAt,
		tags: new Set(transaction.tags),
		category: transaction.category,
		mode: transaction.mode,
		numberOfInstallments: transaction.numberOfInstallments,
		lastInstallmentAt: transaction.lastInstallmentAt
	} as Entities.Transaction;
}

export const transactionModeLabel: Record<Entities.TransactionMode, string> = {
	RECURRENT: 'Recorrente',
	SINGLE_PAYMENT: 'À vista',
	IN_INSTALLMENTS: 'Parcelada'
};

export function getTransactionModeLabel(mode: Entities.TransactionMode): string {
	return transactionModeLabel[mode];
}
