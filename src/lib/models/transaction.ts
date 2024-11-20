import type { Entities } from '$lib/types';
import type { Transaction } from '@prisma/client';

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
