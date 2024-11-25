import { z } from 'zod';

import { checkDateIsValid, dates } from '$lib/utils/dates';

function getToday() {
	return dates.tz(new Date(), 'America/Campo_Grande').utc(true).startOf('day');
}

export const BaseTransactionSchema = z.object({
	name: z.string(),
	value: z.number().int().positive(),
	purchasedAt: z
		.string()
		.default(() => getToday().format('YYYY-MM-DD'))
		.refine((d) => checkDateIsValid(d)),
	firstInstallmentAt: z
		.string()
		.default(() => getToday().add(1, 'month').format('YYYY-MM-DD'))
		.refine((d) => checkDateIsValid(d)),
	tags: z.set(z.string()).default(new Set()),
	category: z.enum(['EXPENSE', 'INCOME'])
});

function refineFirstInstallmentIsAfterPurchaseDate(
	data: { purchasedAt: string; firstInstallmentAt: string },
	ctx: z.RefinementCtx
) {
	const purchasedAt = dates(data.purchasedAt, 'YYYY-MM-DD');
	const firstInstallmentAt = dates(data.firstInstallmentAt, 'YYYY-MM-DD');

	if (firstInstallmentAt.isBefore(purchasedAt, 'month')) {
		ctx.addIssue({
			code: 'custom',
			message: 'Deve ser após a data da compra'
		});
	}
}

export const RecurrentTransactionSchema = BaseTransactionSchema.extend({
	mode: z.literal('RECURRENT').default('RECURRENT')
}).superRefine((data, ctx) => refineFirstInstallmentIsAfterPurchaseDate(data, ctx));

export const SinglePaymentTransactionSchema = BaseTransactionSchema.extend({
	mode: z.literal('SINGLE_PAYMENT').default('SINGLE_PAYMENT'),
	numberOfInstallments: z.literal(1).default(1),
	lastInstallmentAt: z
		.string()
		.default(() => getToday().add(1, 'month').format('YYYY-MM-DD'))
		.refine((d) => checkDateIsValid(d))
})
	.superRefine((data, ctx) => {
		refineFirstInstallmentIsAfterPurchaseDate(data, ctx);
	})
	.transform((data) => {
		return {
			...data,
			// since this is a single payment transaction, the payment is done in one installment
			// so we ignore the lastInstallmentAt field and set it to the firstInstallmentAt
			lastInstallmentAt: data.firstInstallmentAt
		};
	});

export const InInstallmentsTransactionSchema = BaseTransactionSchema.extend({
	mode: z.literal('IN_INSTALLMENTS').default('IN_INSTALLMENTS'),
	numberOfInstallments: z.number().int().min(2).default(2),
	lastInstallmentAt: z
		.string()
		.default(() => getToday().add(2, 'months').format('YYYY-MM-DD'))
		.refine((d) => checkDateIsValid(d))
}).superRefine((data, ctx) => {
	refineFirstInstallmentIsAfterPurchaseDate(data, ctx);

	const firstInstallmentAt = dates(data.firstInstallmentAt, 'YYYY-MM-DD');
	const lastInstallmentAt = dates(data.lastInstallmentAt, 'YYYY-MM-DD');

	if (
		lastInstallmentAt.isBefore(firstInstallmentAt, 'month') ||
		lastInstallmentAt.isSame(firstInstallmentAt, 'month')
	) {
		ctx.addIssue({
			code: 'custom',
			message: 'Deve ser após a primeira parcela'
		});
	}
});

export const ConfirmPaymentSchema = z.object({
	paymentDate: z
		.string()
		.default(() => getToday().format('YYYY-MM-DD'))
		.refine((d) => checkDateIsValid(d))
});

export const UpdateTransactionSchema = z.object({
	name: z.string(),
	value: z.number().int().positive(),
	tags: z.set(z.string()),
	category: z.enum(['EXPENSE', 'INCOME'])
});
