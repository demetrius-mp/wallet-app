import { z } from 'zod';

export const TransactionSchema = z
	.object({
		mode: z.enum(['RECURRENT', 'SINGLE_PAYMENT', 'IN_INSTALLMENTS']),
		name: z.string(),
		value: z.number().int().positive(),
		purchasedAt: z.string(),
		firstInstallmentAt: z.string(),
		numberOfInstallments: z.number().int().positive().nullish(),
		lastInstallmentAt: z.string().nullish(),
		tags: z.set(z.string()).default(new Set()),
		category: z.enum(['EXPENSE', 'INCOME'])
	})
	.superRefine((data, ctx) => {
		if (data.mode === 'IN_INSTALLMENTS' && (data.numberOfInstallments || 0) < 2) {
			ctx.addIssue({
				code: 'custom',
				message: 'Deve ser pelo menos 2',
				path: ['numberOfInstallments']
			});
		}
	});
