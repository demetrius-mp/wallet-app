import { error } from '@sveltejs/kit';

import { TransactionRepository } from '$lib/server/db/repositories/transaction.repository';

import type { Actions } from './$types';

export const actions = {
	async default(e) {
		const transactionId = parseInt(e.params.transactionId);

		const repository = new TransactionRepository();

		const transactionExists = repository.transactionExists({ id: transactionId });

		if (!transactionExists) {
			error(404, { message: 'Transação não encontrada' });
		}

		await repository.deleteOneTransaction({ id: transactionId });
	}
} satisfies Actions;
