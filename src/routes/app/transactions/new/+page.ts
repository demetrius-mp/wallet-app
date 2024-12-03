import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import {
	InInstallmentsTransactionSchema,
	RecurrentTransactionSchema,
	SinglePaymentTransactionSchema
} from '$lib/schemas';

import type { PageLoad } from './$types';

export const load = (async (e) => {
	const [recurrentTransactionForm, singlePaymentTransactionForm, inInstallmentsTransactionForm] =
		await Promise.all([
			superValidate(zod(RecurrentTransactionSchema)),
			superValidate(zod(SinglePaymentTransactionSchema)),
			superValidate(zod(InInstallmentsTransactionSchema))
		]);

	const copyFromParam = e.url.searchParams.get('copyFrom');
	const copyFrom = copyFromParam !== null ? parseInt(copyFromParam) : null;

	return {
		recurrentTransactionForm,
		singlePaymentTransactionForm,
		inInstallmentsTransactionForm,
		copyFrom
	};
}) satisfies PageLoad;
