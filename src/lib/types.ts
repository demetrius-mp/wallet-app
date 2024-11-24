import type { TRANSACTION_CATEGORIES, TRANSACTION_MODES } from '$lib/models/transaction';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Entities {
	export type TransactionMode = (typeof TRANSACTION_MODES)[number];
	export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

	export type BaseTransaction = {
		id: number;
		name: string;
		value: number;
		purchasedAt: Date;
		firstInstallmentAt: Date;
		tags: Set<string>;
		category: 'INCOME' | 'EXPENSE';
		lastPaymentConfirmationAt: Date | null;
	};

	export type RecurrentTransaction = BaseTransaction & {
		mode: 'RECURRENT';
	};

	export type SinglePaymentTransaction = BaseTransaction & {
		mode: 'SINGLE_PAYMENT';
		numberOfInstallments: 1;
		lastInstallmentAt: Date;
		paidInstallments: 0 | 1;
	};

	export type InInstallmentsTransaction = BaseTransaction & {
		mode: 'IN_INSTALLMENTS';
		numberOfInstallments: number;
		lastInstallmentAt: Date;
		paidInstallments: number;
	};

	export type Transaction =
		| RecurrentTransaction
		| SinglePaymentTransaction
		| InInstallmentsTransaction;
}
