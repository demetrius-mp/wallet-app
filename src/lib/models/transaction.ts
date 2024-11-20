import type { Transaction, TransactionCategory, TransactionMode } from '@prisma/client';
import { stringify } from 'devalue';
import type { z } from 'zod';

import type { TransactionSchema } from '$lib/schemas';
import type { Entities } from '$lib/types';
import { transformDayMonthYearDate, transformMonthYearDate } from '$lib/utils/dates';

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

type CreateDBTransactionData = {
	mode: TransactionMode;
	name: string;
	value: number;
	purchasedAt: Date;
	firstInstallmentAt: Date;
	tags: string[];
	category: TransactionCategory;
	numberOfInstallments: number | null;
	lastInstallmentAt: Date | null;
};

export function formDataToCreateDBTransaction(
	data: z.infer<typeof TransactionSchema>
): CreateDBTransactionData {
	const baseData: Omit<Entities.BaseTransaction, 'id' | 'tags'> = {
		name: data.name,
		category: data.category,
		purchasedAt: transformDayMonthYearDate(data.purchasedAt),
		value: data.value,
		firstInstallmentAt: transformMonthYearDate(data.firstInstallmentAt)
	};

	switch (data.mode) {
		case 'RECURRENT':
			return {
				...baseData,
				mode: 'RECURRENT',
				tags: Array.from(data.tags),
				numberOfInstallments: null,
				lastInstallmentAt: null
			};

		case 'SINGLE_PAYMENT':
			if (data.lastInstallmentAt === null || data.lastInstallmentAt === undefined) {
				throw new Error('Last installment date is required for single payment transactions');
			}

			return {
				...baseData,
				mode: 'SINGLE_PAYMENT',
				tags: Array.from(data.tags),
				numberOfInstallments: 1,
				lastInstallmentAt: transformMonthYearDate(data.lastInstallmentAt)
			};

		case 'IN_INSTALLMENTS':
			if (
				data.lastInstallmentAt === null ||
				data.lastInstallmentAt === undefined ||
				data.numberOfInstallments === null ||
				data.numberOfInstallments === undefined
			) {
				throw new Error('Last installment date is required for single payment transactions');
			}

			return {
				...baseData,
				mode: 'SINGLE_PAYMENT',
				tags: Array.from(data.tags),
				numberOfInstallments: data.numberOfInstallments,
				lastInstallmentAt: transformMonthYearDate(data.lastInstallmentAt)
			};
	}
}

export async function createTransaction(
	transaction: z.infer<typeof TransactionSchema>
): Promise<Entities.Transaction> {
	const res = await fetch('/api/transactions', {
		method: 'POST',
		body: stringify(transaction)
	});

	if (!res.ok) {
		throw new Error('Failed to create transaction');
	}

	const data = await res.json();

	console.log(data);

	return data;
}
