import { json, type RequestHandler } from '@sveltejs/kit';

import { queryTransactions } from '$lib/server/db/queries/transaction';
import { dates } from '$lib/utils/dates';

export const GET: RequestHandler = async (_e) => {
	const thisMonth = dates
		.tz(new Date(), 'America/Campo_Grande')
		.utc(true)
		.startOf('month')
		.toDate();

	const transactions = await queryTransactions({
		minLastInstallmentAt: thisMonth
	});

	return json({ transactions });
};
