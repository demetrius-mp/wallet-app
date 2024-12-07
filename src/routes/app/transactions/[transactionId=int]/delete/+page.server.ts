import { error } from '@sveltejs/kit';

import { checkTransactionExists, deleteTransaction } from '$lib/server/db/queries/transaction';

import type { Actions } from './$types';

export const actions = {
	async default(e) {
		const transactionId = parseInt(e.params.transactionId);

		const transactionExists = checkTransactionExists({ id: transactionId });

		if (!transactionExists) {
			error(404, { message: 'Transação não encontrada' });
		}

		await deleteTransaction({ id: transactionId });
	}
} satisfies Actions;
