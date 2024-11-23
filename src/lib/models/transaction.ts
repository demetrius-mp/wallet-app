import type { Transaction } from '@prisma/client';
import type { Dayjs } from 'dayjs';

import type { Entities } from '$lib/types';
import { dates } from '$lib/utils/dates';
import { isSubsetOf } from '$lib/utils/set';

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

export function getTransactionCategoryLabel(category: Entities.TransactionCategory): string {
	return transactionCategoryLabel[category];
}

export function checkTransactionModeIsValid(mode: string): mode is Entities.TransactionMode {
	return TRANSACTION_MODES.includes(mode as Entities.TransactionMode);
}

export function checkTransactionCategoryIsValid(
	category: string
): category is Entities.TransactionCategory {
	return TRANSACTION_CATEGORIES.includes(category as Entities.TransactionCategory);
}

export const transactionFilters = {
	matchesModeTags(
		transaction: { mode: Entities.TransactionMode },
		tags: Set<Entities.TransactionMode>
	) {
		if (tags.size === 0) {
			return true;
		}

		return tags.has(transaction.mode);
	},
	matchesCategoryTags(
		transaction: { category: Entities.TransactionCategory },
		tags: Set<Entities.TransactionCategory>
	) {
		if (tags.size === 0) {
			return true;
		}

		return tags.has(transaction.category);
	},
	matchesTags(transaction: { tags: Set<string> }, tags: Set<string>) {
		if (tags.size === 0) {
			return true;
		}

		return isSubsetOf(tags, transaction.tags);
	},
	matchesTerm(transaction: { name: string }, term: string) {
		if (!term) {
			return true;
		}

		return transaction.name.toLowerCase().includes(term);
	},
	matchesDate(transaction: Entities.Transaction, minDate: Dayjs) {
		const firstInstallmentAt = dates.utc(transaction.firstInstallmentAt).startOf('month');
		const firstInstallmentIsBeforeMinDate = firstInstallmentAt.isBefore(minDate);
		const firstInstallmentIsSameAsMinDate = firstInstallmentAt.isSame(minDate);

		if (transaction.mode === 'RECURRENT') {
			return firstInstallmentIsBeforeMinDate || firstInstallmentIsSameAsMinDate;
		}

		const lastInstallmentAt = dates.utc(transaction.lastInstallmentAt).startOf('month');

		const lastInstallmentIsAfterMinDate = lastInstallmentAt.isAfter(minDate);
		const lastInstallmentIsSameMonth = lastInstallmentAt.isSame(minDate, 'month');

		if (transaction.mode === 'SINGLE_PAYMENT') {
			return lastInstallmentIsSameMonth;
		}

		return (
			(firstInstallmentIsBeforeMinDate || firstInstallmentIsSameAsMinDate) &&
			(lastInstallmentIsAfterMinDate || lastInstallmentIsSameMonth)
		);
	}
};
