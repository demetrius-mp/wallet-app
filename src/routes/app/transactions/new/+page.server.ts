import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import {
	InInstallmentsTransactionSchema,
	RecurrentTransactionSchema,
	SinglePaymentTransactionSchema
} from '$lib/schemas';
import { prisma } from '$lib/server/prisma';
import { transformDayMonthYearDate, transformMonthYearDate } from '$lib/utils/dates';

import type { Actions } from './$types';

export const actions = {
	async recurrent(e) {
		const form = await superValidate(e, zod(RecurrentTransactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const transaction = await prisma.transaction.create({
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
		const form = await superValidate(e, zod(InInstallmentsTransactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const transaction = await prisma.transaction.create({
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
		const form = await superValidate(e, zod(SinglePaymentTransactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const transaction = await prisma.transaction.create({
			data: {
				...data,
				purchasedAt: transformDayMonthYearDate(data.purchasedAt),
				firstInstallmentAt: transformDayMonthYearDate(data.firstInstallmentAt),
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
