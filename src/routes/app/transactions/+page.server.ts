import { prisma } from '$lib/server/prisma';
import { dates } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load = (async () => {
	const thisMonth = dates
		.tz(new Date(), 'America/Campo_Grande')
		.utc(true)
		.startOf('month')
		.toDate();

	async function getTransactions() {
		const transactions = await prisma.transaction.findMany({
			include: {
				paymentConfirmations: {
					select: {
						paidAt: true
					},
					orderBy: {
						paidAt: 'desc'
					},
					take: 1
				}
			},
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

		return transactions;
	}

	const transactions = await getTransactions();

	return {
		transactions
	};
}) satisfies PageServerLoad;
