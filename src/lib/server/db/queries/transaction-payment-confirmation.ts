import { and, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { transactionPaymentConfirmationsTable } from '$lib/server/db/schema';

export async function createPaymentConfirmation(data: { transactionId: number; paidAt: Date }) {
	const { transactionId, paidAt } = data;

	const created = await db
		.insert(transactionPaymentConfirmationsTable)
		.values({
			transactionId,
			paidAt
		})
		.returning();

	return created[0];
}

export async function deletePaymentConfirmation(data: {
	transactionId: number;
	paymentConfirmationId: number;
}): Promise<void>;
export async function deletePaymentConfirmation(data: {
	transactionId: number;
	paidAt: Date;
}): Promise<void>;
export async function deletePaymentConfirmation(data: {
	transactionId: number;
	paidAt?: Date;
	paymentConfirmationId?: number;
}): Promise<void> {
	const { transactionId, paidAt, paymentConfirmationId } = data;

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

export async function deleteAllPaymentConfirmations(data: { transactionId: number }) {
	const { transactionId } = data;

	await db
		.delete(transactionPaymentConfirmationsTable)
		.where(eq(transactionPaymentConfirmationsTable.transactionId, transactionId));
}
