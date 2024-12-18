import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { convertTransaction } from '$lib/models/transaction';
import {
	InInstallmentsTransactionSchema,
	RecurrentTransactionSchema,
	SinglePaymentTransactionSchema,
	UpdateTransactionSchema
} from '$lib/schemas';
import { dates } from '$lib/utils/dates';

import type { PageLoad } from './$types';

export const load = (async (e) => {
	const { transaction, ...restData } = e.data;

	const [
		recurrentTransactionForm,
		singlePaymentTransactionForm,
		inInstallmentsTransactionForm,
		updateTransactionForm
	] = await Promise.all([
		superValidate(zod(RecurrentTransactionSchema)),
		superValidate(zod(SinglePaymentTransactionSchema)),
		superValidate(zod(InInstallmentsTransactionSchema)),
		superValidate(zod(UpdateTransactionSchema))
	]);

	const lastInstallmentAt =
		transaction.lastInstallmentAt !== null
			? dates.utc(transaction.lastInstallmentAt)
			: dates().utc(true);

	recurrentTransactionForm.data.name = transaction.name;
	recurrentTransactionForm.data.category = transaction.category;
	recurrentTransactionForm.data.firstInstallmentAt = dates
		.utc(transaction.firstInstallmentAt)
		.format('YYYY-MM-DD');
	recurrentTransactionForm.data.purchasedAt = dates
		.utc(transaction.purchasedAt)
		.format('YYYY-MM-DD');
	recurrentTransactionForm.data.value = transaction.value;
	recurrentTransactionForm.data.tags = new Set(transaction.tags);
	recurrentTransactionForm.data.mode = 'RECURRENT';

	singlePaymentTransactionForm.data.name = transaction.name;
	singlePaymentTransactionForm.data.category = transaction.category;
	singlePaymentTransactionForm.data.purchasedAt = dates
		.utc(transaction.purchasedAt)
		.format('YYYY-MM-DD');
	singlePaymentTransactionForm.data.value = transaction.value;
	singlePaymentTransactionForm.data.tags = new Set(transaction.tags);
	singlePaymentTransactionForm.data.firstInstallmentAt = dates
		.utc(transaction.firstInstallmentAt)
		.format('YYYY-MM-DD');
	singlePaymentTransactionForm.data.lastInstallmentAt = lastInstallmentAt.format('YYYY-MM-DD');
	singlePaymentTransactionForm.data.mode = 'SINGLE_PAYMENT';
	singlePaymentTransactionForm.data.numberOfInstallments = 1;

	inInstallmentsTransactionForm.data.name = transaction.name;
	inInstallmentsTransactionForm.data.category = transaction.category;
	inInstallmentsTransactionForm.data.purchasedAt = dates
		.utc(transaction.purchasedAt)
		.format('YYYY-MM-DD');
	inInstallmentsTransactionForm.data.value = transaction.value;
	inInstallmentsTransactionForm.data.tags = new Set(transaction.tags);
	inInstallmentsTransactionForm.data.firstInstallmentAt = dates
		.utc(transaction.firstInstallmentAt)
		.format('YYYY-MM-DD');
	inInstallmentsTransactionForm.data.lastInstallmentAt = lastInstallmentAt
		.add(1, 'month')
		.format('YYYY-MM-DD');
	inInstallmentsTransactionForm.data.mode = 'IN_INSTALLMENTS';
	inInstallmentsTransactionForm.data.numberOfInstallments = transaction.numberOfInstallments ?? 2;

	updateTransactionForm.data.name = transaction.name;
	updateTransactionForm.data.category = transaction.category;
	updateTransactionForm.data.value = transaction.value;
	updateTransactionForm.data.tags = new Set(transaction.tags);

	return {
		recurrentTransactionForm,
		singlePaymentTransactionForm,
		inInstallmentsTransactionForm,
		updateTransactionForm,
		transaction: convertTransaction(transaction),
		...restData
	};
}) satisfies PageLoad;
