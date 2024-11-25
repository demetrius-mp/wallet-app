import type { ActionFailure } from '@sveltejs/kit';
import type { Dayjs } from 'dayjs';

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

	export type TransactionFilters = {
		term: string;
		tags: Set<string>;
		date: Dayjs;
		transactionModeTags: Set<Entities.TransactionMode>;
		transactionCategoryTags: Set<Entities.TransactionCategory>;
	};
}

type ExcludeActionFailure<T> = T extends ActionFailure<any> ? never : T extends void ? never : T;

type ActionsSuccess<T extends Record<string, (...args: any) => any>> = {
	[Key in keyof T]: ExcludeActionFailure<Awaited<ReturnType<T[Key]>>>;
}[keyof T];

type ExtractActionFailure<T> =
	T extends ActionFailure<infer X> ? (X extends void ? never : X) : never;

type ActionsFailure<T extends Record<string, (...args: any) => any>> = {
	[Key in keyof T]: Exclude<ExtractActionFailure<Awaited<ReturnType<T[Key]>>>, void>;
}[keyof T];
