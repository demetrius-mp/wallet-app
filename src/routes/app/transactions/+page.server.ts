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

		const availableTags = new Set<string>();

		const convertedTransactions = transactions.map((t) => {
			const converted = convertTransaction(t);

			converted.tags.forEach((tag) => availableTags.add(tag));

			return converted;
		});

		return {
			transactions: convertedTransactions,
			availableTags
		};
	}

	const term = e.url.searchParams.get('term') || '';
	const tagsParam = e.url.searchParams.get('tags');
	const tags = tagsParam ? tagsParam.split(',') : [];

	const searchParams = {
		term,
		tags
	};

	const { transactions, availableTags } = await getTransactions();

	return {
		transactions,
		availableTags,
		searchParams
	};
}) satisfies PageServerLoad;
