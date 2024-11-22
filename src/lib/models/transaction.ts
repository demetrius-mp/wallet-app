import type { Transaction } from '@prisma/client';

import type { Entities } from '$lib/types';

export const TRANSACTION_MODES = ['RECURRENT', 'SINGLE_PAYMENT', 'IN_INSTALLMENTS'] as const;
export const TRANSACTION_CATEGORIES = ['INCOME', 'EXPENSE'] as const;

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

export const transactionCategoryLabel: Record<Entities.TransactionCategory, string> = {
	INCOME: 'Receita',
	EXPENSE: 'Despesa'
};

export function checkTransactionModeIsValid(mode: string): mode is Entities.TransactionMode {
	return TRANSACTION_MODES.includes(mode as Entities.TransactionMode);
}

export function checkTransactionCategoryIsValid(
	category: string
): category is Entities.TransactionCategory {
	return TRANSACTION_CATEGORIES.includes(category as Entities.TransactionCategory);
}
