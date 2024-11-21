import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import {
	InInstallmentsTransactionSchema,
	RecurrentTransactionSchema,
	SinglePaymentTransactionSchema
} from '$lib/schemas';

import type { PageLoad } from './$types';

export const load = (async () => {
	// const today = dates.tz(new Date(), 'America/Campo_Grande').utc(true).startOf('day');

	const [recurrentTransactionForm, singlePaymentTransactionForm, inInstallmentsTransactionForm] =
		await Promise.all([
			superValidate(zod(RecurrentTransactionSchema)),
			superValidate(zod(SinglePaymentTransactionSchema)),
			superValidate(zod(InInstallmentsTransactionSchema))
		]);

	// recurrentTransactionForm.data.purchasedAt = today.format('YYYY-MM-DD');
	// recurrentTransactionForm.data.firstInstallmentAt = today.add(1, 'month').format('YYYY-MM-DD');

	// singlePaymentTransactionForm.data.purchasedAt = today.format('YYYY-MM-DD');
	// singlePaymentTransactionForm.data.numberOfInstallments = 1;
	// singlePaymentTransactionForm.data.firstInstallmentAt = today.add(1, 'month').format('YYYY-MM-DD');
	// singlePaymentTransactionForm.data.lastInstallmentAt = today.add(1, 'month').format('YYYY-MM-DD');

	// inInstallmentsTransactionForm.data.purchasedAt = today.format('YYYY-MM-DD');
	// inInstallmentsTransactionForm.data.numberOfInstallments = 2;
	// inInstallmentsTransactionForm.data.firstInstallmentAt = today
	// 	.add(1, 'month')
	// 	.format('YYYY-MM-DD');
	// inInstallmentsTransactionForm.data.lastInstallmentAt = today.add(3, 'month').format('YYYY-MM-DD');

	return {
		recurrentTransactionForm,
		singlePaymentTransactionForm,
		inInstallmentsTransactionForm
	};
}) satisfies PageLoad;
