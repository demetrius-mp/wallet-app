import type { Transaction } from '@prisma/client';
import type { Dayjs } from 'dayjs';

import type { Entities } from '$lib/types';
import { dates, getDatesDiffInMonths } from '$lib/utils/dates';
import { isSubsetOf } from '$lib/utils/set';

export const TRANSACTION_MODES = ['RECURRENT', 'SINGLE_PAYMENT', 'IN_INSTALLMENTS'] as const;
export const TRANSACTION_CATEGORIES = ['INCOME', 'EXPENSE'] as const;

function convertRecurrentTransaction(
	transaction: Transaction & { paymentConfirmations: { id: number; paidAt: Date }[] }
): Entities.RecurrentTransaction {
	const lastPaymentConfirmation = transaction.paymentConfirmations.at(0)?.paidAt;

	return {
		id: transaction.id,
		name: transaction.name,
		value: transaction.value,
		purchasedAt: transaction.purchasedAt,
		firstInstallmentAt: transaction.firstInstallmentAt,
		tags: new Set(transaction.tags),
		category: transaction.category,
		mode: 'RECURRENT',
		lastPaymentConfirmationAt: lastPaymentConfirmation ?? null
	};
}

function convertSinglePaymentTransaction(
	transaction: Transaction & { paymentConfirmations: { id: number; paidAt: Date }[] }
): Entities.SinglePaymentTransaction {
	if (transaction.numberOfInstallments !== 1 || transaction.lastInstallmentAt === null) {
		throw new Error('Invalid Single Payment Transaction');
	}

	const lastPaymentConfirmation = transaction.paymentConfirmations.at(0)?.paidAt;
	const paidInstallments = lastPaymentConfirmation ? 1 : 0;

	return {
		id: transaction.id,
		name: transaction.name,
		value: transaction.value,
		numberOfInstallments: 1,
		firstInstallmentAt: transaction.firstInstallmentAt,
		lastInstallmentAt: transaction.lastInstallmentAt,
		paidInstallments,
		purchasedAt: transaction.purchasedAt,
		category: transaction.category,
		mode: 'SINGLE_PAYMENT',
		tags: new Set(transaction.tags),
		lastPaymentConfirmationAt: lastPaymentConfirmation ?? null
	};
}

function convertInInstallmentsTransaction(
	transaction: Transaction & { paymentConfirmations: { id: number; paidAt: Date }[] }
): Entities.InInstallmentsTransaction {
	if (transaction.numberOfInstallments === null || transaction.lastInstallmentAt === null) {
		throw new Error('Invalid In Installments Transaction');
	}

	const lastPaymentConfirmation = transaction.paymentConfirmations.at(0)?.paidAt;
	const paidInstallments = lastPaymentConfirmation
		? getDatesDiffInMonths(lastPaymentConfirmation, transaction.firstInstallmentAt) + 1
		: 0;

	return {
		id: transaction.id,
		name: transaction.name,
		value: transaction.value,
		purchasedAt: transaction.purchasedAt,
		firstInstallmentAt: transaction.firstInstallmentAt,
		paidInstallments,
		tags: new Set(transaction.tags),
		category: transaction.category,
		mode: 'IN_INSTALLMENTS',
		numberOfInstallments: transaction.numberOfInstallments,
		lastInstallmentAt: transaction.lastInstallmentAt,
		lastPaymentConfirmationAt: lastPaymentConfirmation ?? null
	};
}

export function convertTransaction(
	transaction: Transaction & { paymentConfirmations: { id: number; paidAt: Date }[] }
): Entities.Transaction {
	switch (transaction.mode) {
		case 'RECURRENT':
			return convertRecurrentTransaction(transaction);
		case 'SINGLE_PAYMENT':
			return convertSinglePaymentTransaction(transaction);

		case 'IN_INSTALLMENTS':
			return convertInInstallmentsTransaction(transaction);
	}
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

export function checkPaymentIsConfirmed(transaction: Entities.Transaction, date: Dayjs) {
	const lastPaymentConfirmationAt = transaction.lastPaymentConfirmationAt;

	if (!lastPaymentConfirmationAt) {
		return false;
	}

	const paidAt = dates.utc(lastPaymentConfirmationAt);

	return !paidAt.isBefore(date, 'month');
}

export function getBill(transactions: Entities.Transaction[], date: Dayjs) {
	return transactions.reduce((acc, transaction) => {
		if (!checkPaymentIsConfirmed(transaction, date)) {
			return acc;
		}

		const value = transaction.category === 'EXPENSE' ? -transaction.value : transaction.value;

		return acc + value;
	}, 0);
}
