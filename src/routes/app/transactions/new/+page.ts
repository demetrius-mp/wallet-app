import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import {
	InInstallmentsTransactionSchema,
	RecurrentTransactionSchema,
	SinglePaymentTransactionSchema
} from '$lib/schemas';

import type { PageLoad } from './$types';

export const load = (async () => {
	const [recurrentTransactionForm, singlePaymentTransactionForm, inInstallmentsTransactionForm] =
		await Promise.all([
			superValidate(zod(RecurrentTransactionSchema)),
			superValidate(zod(SinglePaymentTransactionSchema)),
			superValidate(zod(InInstallmentsTransactionSchema))
		]);

	return {
		recurrentTransactionForm,
		singlePaymentTransactionForm,
		inInstallmentsTransactionForm
	};
}) satisfies PageLoad;
