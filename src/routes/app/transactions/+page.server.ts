// import { prisma } from '$lib/server/prisma';
// import { dates } from '$lib/utils/dates';

// import type { PageServerLoad } from './$types';

// export const load = (async () => {
// 	const lastMonth = dates
// 		.tz(new Date(), 'America/Campo_Grande')
// 		.utc(true)
// 		.startOf('month')
// 		.subtract(1, 'month')
// 		.toDate();

// 	const transactions = await prisma.transaction.findMany({
// 		include: {
// 			paymentConfirmations: {
// 				select: {
// 					id: true,
// 					paidAt: true
// 				},
// 				orderBy: {
// 					paidAt: 'desc'
// 				},
// 				take: 1
// 			}
// 		},
// 		where: {
// 			OR: [
// 				{
// 					lastInstallmentAt: {
// 						gte: lastMonth
// 					}
// 				},
// 				{
// 					lastInstallmentAt: null
// 				}
// 			]
// 		},
// 		orderBy: [
// 			{
// 				purchasedAt: 'desc'
// 			},
// 			{
// 				name: 'asc'
// 			}
// 		]
// 	});

// 	return {
// 		transactions
// 	};
// }) satisfies PageServerLoad;
