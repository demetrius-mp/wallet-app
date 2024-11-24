import { error } from '@sveltejs/kit';

import { prisma } from '$lib/server/prisma';

import type { Actions } from './$types';

export const actions = {
	async default(e) {
		const transactionId = parseInt(e.params.transactionId);

		if (!prisma.transaction.exists({ id: transactionId })) {
			error(404, { message: 'Transação não encontrada' });
		}

		await prisma.transaction.delete({
			where: {
				id: transactionId
			}
		});
	}
} satisfies Actions;
