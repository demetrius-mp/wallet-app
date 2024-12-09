import { and, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { transactionPaymentConfirmationsTable } from '$lib/server/db/schema';

export class TransactionPaymentConfirmationRepository {
	async createPaymentConfirmation(props: { transactionId: number; paidAt: Date }) {
		const { transactionId, paidAt } = props;

		const created = await db
			.insert(transactionPaymentConfirmationsTable)
			.values({
				transactionId,
				paidAt
			})
			.returning();

		return created[0];
	}

	async deletePaymentConfirmation(props: {
		transactionId: number;
		paymentConfirmationId: number;
	}): Promise<void>;
	async deletePaymentConfirmation(props: { transactionId: number; paidAt: Date }): Promise<void>;
	async deletePaymentConfirmation(props: {
		transactionId: number;
		paidAt?: Date;
		paymentConfirmationId?: number;
	}): Promise<void> {
		const { transactionId, paidAt, paymentConfirmationId } = props;

		const filterByPaidAt =
			paidAt !== undefined ? eq(transactionPaymentConfirmationsTable.paidAt, paidAt) : undefined;

		const filterByPaymentConfirmationId =
			paymentConfirmationId !== undefined
				? eq(transactionPaymentConfirmationsTable.id, paymentConfirmationId)
				: undefined;

		if (!filterByPaidAt && !filterByPaymentConfirmationId) {
			throw new Error('You must provide either paidAt or paymentConfirmationId');
		}

		if (filterByPaidAt && filterByPaymentConfirmationId) {
			throw new Error('You cannot provide both paidAt and paymentConfirmationId');
		}

		await db
			.delete(transactionPaymentConfirmationsTable)
			.where(
				and(
					eq(transactionPaymentConfirmationsTable.transactionId, transactionId),
					filterByPaidAt || filterByPaymentConfirmationId
				)
			);
	}

	async deleteAllPaymentConfirmations(props: { transactionId: number }) {
		const { transactionId } = props;

		await db
			.delete(transactionPaymentConfirmationsTable)
			.where(eq(transactionPaymentConfirmationsTable.transactionId, transactionId));
	}
}
