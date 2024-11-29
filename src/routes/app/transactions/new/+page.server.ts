import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import {
	InInstallmentsTransactionSchema,
	RecurrentTransactionSchema,
	SinglePaymentTransactionSchema
} from '$lib/schemas';
import { createTransaction } from '$lib/server/db/queries/transaction';
import { ensureAuth } from '$lib/server/ensure-auth';
import { transformDayMonthYearDate, transformMonthYearDate } from '$lib/utils/dates';

import type { Actions } from './$types';

export const actions = {
	async recurrent(e) {
		const session = ensureAuth(e);
		const form = await superValidate(e, zod(RecurrentTransactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const transaction = await createTransaction({
			...data,
			userId: session.userId,
			purchasedAt: transformDayMonthYearDate(data.purchasedAt),
			firstInstallmentAt: transformMonthYearDate(data.firstInstallmentAt),
			tags: Array.from(data.tags)
		});

		return {
			form,
			transaction
		};
	},
	async inInstallments(e) {
		const session = ensureAuth(e);
		const form = await superValidate(e, zod(InInstallmentsTransactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const transaction = await createTransaction({
			...data,
			userId: session.userId,
			purchasedAt: transformDayMonthYearDate(data.purchasedAt),
			firstInstallmentAt: transformMonthYearDate(data.firstInstallmentAt),
			lastInstallmentAt: transformMonthYearDate(data.lastInstallmentAt),
			tags: Array.from(data.tags)
		});

		return {
			form,
			transaction
		};
	},
	async singlePayment(e) {
		const session = ensureAuth(e);
		const form = await superValidate(e, zod(SinglePaymentTransactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const transaction = await createTransaction({
			...data,
			userId: session.userId,
			purchasedAt: transformDayMonthYearDate(data.purchasedAt),
			firstInstallmentAt: transformDayMonthYearDate(data.firstInstallmentAt),
			lastInstallmentAt: transformMonthYearDate(data.lastInstallmentAt),
			tags: Array.from(data.tags)
		});

		return {
			form,
			transaction
		};
	}
} satisfies Actions;
