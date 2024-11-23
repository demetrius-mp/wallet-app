import { json, type RequestHandler } from '@sveltejs/kit';

import { prisma } from '$lib/server/prisma';
import { dates } from '$lib/utils/dates';

export const GET: RequestHandler = async (_e) => {
	const thisMonth = dates
		.tz(new Date(), 'America/Campo_Grande')
		.utc(true)
		.startOf('month')
		.toDate();

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

	return json({ transactions });
};
