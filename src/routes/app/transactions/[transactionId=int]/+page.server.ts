import { error, fail as kitFail } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { convertTransaction } from '$lib/models/transaction';
import {
	ConfirmPaymentSchema,
	InInstallmentsTransactionSchema,
	RecurrentTransactionSchema,
	SinglePaymentTransactionSchema
} from '$lib/schemas';
import { prisma } from '$lib/server/prisma';
import { dates, transformDayMonthYearDate, transformMonthYearDate } from '$lib/utils/dates';

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
	},
	async delete(e) {
		const transactionId = parseInt(e.params.transactionId);

		if (!prisma.transaction.exists({ id: transactionId })) {
			error(404, { message: 'Transação não encontrada' });
		}

		await prisma.transaction.delete({
			where: {
				id: transactionId
			}
		});
	},
	async confirmPayment(e) {
		const transactionId = parseInt(e.params.transactionId);

		const dbTransaction = await prisma.transaction.findFirst({
			where: {
				id: transactionId
			},
			include: {
				paymentConfirmations: {
					select: {
						id: true,
						paidAt: true
					},
					orderBy: {
						paidAt: 'desc'
					},
					take: 1
				}
			}
		});

		if (!dbTransaction) {
			error(404, { message: 'Transação não encontrada' });
		}

		const transaction = convertTransaction(dbTransaction);

		const form = await superValidate(e, zod(ConfirmPaymentSchema));

		if (!form.valid) {
			return kitFail(400, {
				message: 'Data de pagamento inválida'
			});
		}

		const { data } = form;

		const paymentDate = dates.utc(data.paymentDate, 'YYYY-MM-DD').startOf('month');
		const lastPaymentConfirmation = transaction.paymentConfirmations.at(0);
		const firstInstallmentAt = dates.utc(transaction.firstInstallmentAt).startOf('month');

		if (transaction.mode === 'SINGLE_PAYMENT') {
			// transaction has no payment confirmation
			if (!lastPaymentConfirmation) {
				// so we set the payment confirmation as the first installment date
				await prisma.transactionPaymentConfirmation.create({
					data: {
						transactionId,
						paidAt: transaction.firstInstallmentAt
					}
				});

				return {
					message: 'Pagamento confirmado com sucesso'
				};
			}

			// if the transaction has payment confirmations
			// we remove every confirmation
			await prisma.transactionPaymentConfirmation.deleteMany({
				where: {
					transactionId: transaction.id
				}
			});

			return {
				message: 'Pagamento removido com sucesso'
			};
		}

		if (transaction.mode === 'RECURRENT') {
			// first confirmation of this recurrent transaction
			if (!lastPaymentConfirmation) {
				// the first payment confirmation must be the same as the first installment
				if (!paymentDate.isSame(firstInstallmentAt)) {
					return kitFail(400, {
						message: 'Data de pagamento deve ser igual a data da primeira ocorrência'
					});
				}

				await prisma.transactionPaymentConfirmation.create({
					data: {
						transactionId: transaction.id,
						paidAt: transaction.firstInstallmentAt
					}
				});

				return {
					message: 'Pagamento confirmado com sucesso'
				};
			}

			const lastPaymentConfirmationAt = dates.utc(lastPaymentConfirmation.paidAt).startOf('month');

			// can only remove the last payment confirmation
			if (lastPaymentConfirmationAt.isSame(paymentDate)) {
				await prisma.transactionPaymentConfirmation.delete({
					where: {
						transactionId: transaction.id,
						id: lastPaymentConfirmation.id
					}
				});

				return {
					message: 'Pagamento removido com sucesso'
				};
			}

			// can only confirm payments that are subsequent to the last payment confirmation
			if (paymentDate.isSame(lastPaymentConfirmationAt.add(1, 'month'))) {
				await prisma.transactionPaymentConfirmation.create({
					data: {
						transactionId: transaction.id,
						paidAt: paymentDate.toDate()
					}
				});

				return {
					message: 'Pagamento confirmado com sucesso'
				};
			}

			return kitFail(400, {
				message: 'Requisição inválida'
			});
		}

		if (transaction.mode === 'IN_INSTALLMENTS') {
			// first confirmation of this installments transaction
			if (!lastPaymentConfirmation) {
				// the first payment confirmation must be the same as the first installment
				if (!paymentDate.isSame(firstInstallmentAt)) {
					return kitFail(400, {
						message: 'Data de pagamento deve ser igual a data da primeira ocorrência'
					});
				}

				await prisma.transactionPaymentConfirmation.create({
					data: {
						transactionId: transaction.id,
						paidAt: transaction.firstInstallmentAt
					}
				});

				return {
					message: 'Pagamento confirmado com sucesso'
				};
			}

			const lastPaymentConfirmationAt = dates.utc(lastPaymentConfirmation.paidAt).startOf('month');

			// can only remove the last payment confirmation
			if (lastPaymentConfirmationAt.isSame(paymentDate)) {
				await prisma.transactionPaymentConfirmation.delete({
					where: {
						transactionId: transaction.id,
						id: lastPaymentConfirmation.id
					}
				});

				return {
					message: 'Pagamento removido com sucesso'
				};
			}

			const lastInstallmentAt = dates.utc(transaction.lastInstallmentAt).startOf('month');
			const nextAvailableConfirmation = lastPaymentConfirmationAt.add(1, 'month');

			if (
				// if the payment date is the last payment + 1 month
				paymentDate.isSame(nextAvailableConfirmation) &&
				// and the last payment + 1 month is not after the last installment
				// EXAMPLE: it doesnt make sense to confirm a payment at 12/2024 if the last intallment is
				// at 11/2024
				!nextAvailableConfirmation.isAfter(lastInstallmentAt)
			) {
				await prisma.transactionPaymentConfirmation.create({
					data: {
						transactionId: transaction.id,
						paidAt: paymentDate.toDate()
					}
				});

				return {
					message: 'Pagamento confirmado com sucesso'
				};
			}

			return kitFail(400, {
				message: 'Requisição inválida'
			});
		}
	}
} satisfies Actions;
