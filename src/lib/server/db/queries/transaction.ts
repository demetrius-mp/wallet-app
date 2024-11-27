import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { transactionsTable } from '$lib/server/db/schema';

export async function queryTransactions(filters: { minLastInstallmentAt: Date }) {
	const { minLastInstallmentAt } = filters;

	return await db.query.transactionsTable.findMany({
		where: (t, { or, gte, isNull }) => {
			return or(gte(t.lastInstallmentAt, minLastInstallmentAt), isNull(t.lastInstallmentAt));
		},
		with: {
			paymentConfirmations: {
				columns: {
					id: true,
					paidAt: true
				},
				orderBy: (t, { desc }) => [desc(t.paidAt)],
				limit: 1
			}
		},
		orderBy: (t, { asc, desc }) => [desc(t.purchasedAt), asc(t.id)]
	});
}

export async function getTransaction(data: { id: number }) {
	return await db.query.transactionsTable.findFirst({
		where: (t, { eq }) => eq(t.id, data.id),
		with: {
			paymentConfirmations: {
				columns: {
					id: true,
					paidAt: true
				},
				orderBy: (t, { desc }) => [desc(t.paidAt)],
				limit: 1
			}
		}
	});
}

export async function createTransaction(data: {
	mode: 'RECURRENT' | 'SINGLE_PAYMENT' | 'IN_INSTALLMENTS';
	userId: number;
	name: string;
	value: number;
	purchasedAt: Date;
	firstInstallmentAt: Date;
	category: 'EXPENSE' | 'INCOME';
	numberOfInstallments?: number;
	lastInstallmentAt?: Date;
	tags?: string[];
}) {
	const created = await db.insert(transactionsTable).values(data).returning();

	return created[0];
}

export async function updateTransaction(data: {
	id: number;
	mode?: 'RECURRENT' | 'SINGLE_PAYMENT' | 'IN_INSTALLMENTS';
	name?: string;
	value?: number;
	purchasedAt?: Date;
	firstInstallmentAt?: Date;
	category?: 'EXPENSE' | 'INCOME';
	numberOfInstallments?: number | null;
	lastInstallmentAt?: Date | null;
	tags?: string[];
}) {
	const { id, ...restData } = data;

	const updated = await db
		.update(transactionsTable)
		.set(restData)
		.where(eq(transactionsTable.id, id))
		.returning();

	return updated[0];
}
