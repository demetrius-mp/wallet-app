import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { transactionsTable } from '$lib/server/db/schema';

import type { Actions } from './$types';

export const actions = {
	async default(e) {
		const transactionId = parseInt(e.params.transactionId);

		const transaction = await db.query.transactionsTable.findFirst({
			columns: {
				id: true
			},
			where: (t, { eq }) => eq(t.id, transactionId)
		});

		if (!transaction) {
			error(404, { message: 'Transação não encontrada' });
		}

		await db.delete(transactionsTable).where(eq(transactionsTable.id, transactionId));
	}
} satisfies Actions;
