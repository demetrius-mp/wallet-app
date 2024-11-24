import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import {
	InInstallmentsTransactionSchema,
	RecurrentTransactionSchema,
	SinglePaymentTransactionSchema
} from '$lib/schemas';
import { prisma } from '$lib/server/prisma';
import { transformDayMonthYearDate, transformMonthYearDate } from '$lib/utils/dates';

import type { Actions, PageServerLoad } from './$types';

export const load = (async (e) => {
	const transactionId = parseInt(e.params.transactionId);

	const transaction = await prisma.transaction.findFirst({
		where: {
			id: transactionId
		},
		select: {
			id: true,
			name: true,
			category: true,
			purchasedAt: true,
			firstInstallmentAt: true,
			lastInstallmentAt: true,
			value: true,
			numberOfInstallments: true,
			mode: true,
			tags: true
		}
	});

	if (!transaction) {
		error(404, { message: 'Transação não encontrada' });
	}

	return {
		transaction
	};
}) satisfies PageServerLoad;

export const actions = {
	async recurrent(e) {
		const transactionId = parseInt(e.params.transactionId);

		if (!prisma.transaction.exists({ id: transactionId })) {
			error(404, { message: 'Transação não encontrada' });
		}

		const form = await superValidate(e, zod(RecurrentTransactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const transaction = await prisma.transaction.update({
			where: {
				id: transactionId
			},
			data: {
				...data,
				purchasedAt: transformDayMonthYearDate(data.purchasedAt),
				firstInstallmentAt: transformMonthYearDate(data.firstInstallmentAt),
				tags: Array.from(data.tags)
			}
		});

		return {
			form,
			transaction
		};
	},
	async inInstallments(e) {
		const transactionId = parseInt(e.params.transactionId);

		if (!prisma.transaction.exists({ id: transactionId })) {
			error(404, { message: 'Transação não encontrada' });
		}

		const form = await superValidate(e, zod(InInstallmentsTransactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const transaction = await prisma.transaction.update({
			where: {
				id: transactionId
			},
			data: {
				...data,
				purchasedAt: transformDayMonthYearDate(data.purchasedAt),
				firstInstallmentAt: transformMonthYearDate(data.firstInstallmentAt),
				lastInstallmentAt: transformMonthYearDate(data.lastInstallmentAt),
				tags: Array.from(data.tags)
			}
		});

		return {
			form,
			transaction
		};
	},
	async singlePayment(e) {
		const transactionId = parseInt(e.params.transactionId);

		if (!prisma.transaction.exists({ id: transactionId })) {
			error(404, { message: 'Transação não encontrada' });
		}

		const form = await superValidate(e, zod(SinglePaymentTransactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const transaction = await prisma.transaction.update({
			where: {
				id: transactionId
			},
			data: {
				...data,
				purchasedAt: transformDayMonthYearDate(data.purchasedAt),
				firstInstallmentAt: transformMonthYearDate(data.firstInstallmentAt),
				lastInstallmentAt: transformMonthYearDate(data.lastInstallmentAt),
				tags: Array.from(data.tags)
			}
		});

		return {
			form,
			transaction
		};
	}
} satisfies Actions;
