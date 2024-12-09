import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { transactionsTable } from '$lib/server/db/schema';

export class TransactionRepository {
	async queryTransactions(props: { minLastInstallmentAt: Date }) {
		const { minLastInstallmentAt } = props;

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

	async transactionExists(props: { id: number }): Promise<boolean> {
		const { id } = props;

		const result = await db.query.transactionsTable.findFirst({
			columns: {
				id: true
			},
			where: (t, { eq }) => eq(t.id, id)
		});

		return result !== undefined;
	}

	async getOneTransaction(props: { id: number }) {
		const { id } = props;

		return await db.query.transactionsTable.findFirst({
			where: (t, { eq }) => eq(t.id, id),
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

	async createTransaction(props: {
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
		const created = await db.insert(transactionsTable).values(props).returning();

		return created[0];
	}

	async updateTransaction(props: {
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
		const { id, ...restData } = props;

		const updated = await db
			.update(transactionsTable)
			.set(restData)
			.where(eq(transactionsTable.id, id))
			.returning();

		return updated[0];
	}

	async deleteOneTransaction(props: { id: number }) {
		const { id } = props;

		await db.delete(transactionsTable).where(eq(transactionsTable.id, id));
	}
}
