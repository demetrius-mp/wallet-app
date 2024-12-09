import { json, type RequestHandler } from '@sveltejs/kit';

import { TransactionRepository } from '$lib/server/db/repositories/transaction.repository';
import { dates } from '$lib/utils/dates';

export const GET: RequestHandler = async (_e) => {
	const repository = new TransactionRepository();

	const thisMonth = dates
		.tz(new Date(), 'America/Campo_Grande')
		.utc(true)
		.startOf('month')
		.toDate();

	const transactions = await repository.queryTransactions({
		minLastInstallmentAt: thisMonth
	});

	return json({ transactions });
};
