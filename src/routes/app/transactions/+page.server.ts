import { prisma } from '$lib/server/prisma';

import type { PageServerLoad } from './$types';
import { convertTransaction } from '$lib/models/transaction';
import { dates } from '$lib/utils/dates';

export const load = (async (e) => {
	const thisMonth = dates
		.tz(new Date(), 'America/Campo_Grande')
		.utc(true)
		.startOf('month')
		.toDate();

	async function getTransactions() {
		const transactions = await prisma.transaction.findMany({
			where: {
				OR: [
					{
						lastInstallmentAt: {
							gte: thisMonth
						}
					},
					{
						lastInstallmentAt: null
					}
				]
			},
			orderBy: [
				{
					purchasedAt: 'desc'
				},
				{
					name: 'asc'
				}
			]
		});

		return transactions.map((t) => convertTransaction(t));
	}

	const term = e.url.searchParams.get('term') || '';
	const tagsParam = e.url.searchParams.get('tags');
	const tags = tagsParam ? tagsParam.split(',') : [];

	const searchParams = {
		term,
		tags
	};

	return {
		transactions: await getTransactions(),
		searchParams
	};
}) satisfies PageServerLoad;
