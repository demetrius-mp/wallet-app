import { error, fail as kitFail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { convertTransaction } from '$lib/models/transaction';
import { ConfirmPaymentSchema } from '$lib/schemas';
import { prisma } from '$lib/server/prisma';
import { dates } from '$lib/utils/dates';

import type { Actions } from './$types';

export const actions = {
	async default(e) {
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
		const lastPaymentConfirmation = transaction.lastPaymentConfirmationAt;
		const firstInstallmentAt = dates.utc(transaction.firstInstallmentAt).startOf('month');

		if (transaction.mode === 'SINGLE_PAYMENT') {
			// transaction has no payment confirmation
			if (!lastPaymentConfirmation) {
				// so we set the payment confirmation as the first installment date
				const paymentConfirmation = await prisma.transactionPaymentConfirmation.create({
					data: {
						transactionId,
						paidAt: transaction.firstInstallmentAt
					},
					select: {
						paidAt: true
					}
				});

				return {
					message: 'Pagamento confirmado com sucesso',
					paymentConfirmations: [paymentConfirmation]
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
				message: 'Pagamento removido com sucesso',
				paymentConfirmations: []
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

				const paymentConfirmation = await prisma.transactionPaymentConfirmation.create({
					data: {
						transactionId: transaction.id,
						paidAt: transaction.firstInstallmentAt
					},
					select: {
						paidAt: true
					}
				});

				return {
					message: 'Pagamento confirmado com sucesso',
					paymentConfirmations: [paymentConfirmation]
				};
			}

			const lastPaymentConfirmationAt = dates.utc(lastPaymentConfirmation).startOf('month');

			// can only remove the last payment confirmation
			if (lastPaymentConfirmationAt.isSame(paymentDate)) {
				await prisma.transactionPaymentConfirmation.delete({
					where: {
						transactionId_paidAt: {
							paidAt: paymentDate.toDate(),
							transactionId: transaction.id
						}
					}
				});

				const paymentConfirmations: { paidAt: Date }[] = [];

				if (!firstInstallmentAt.isAfter(lastPaymentConfirmationAt.subtract(1, 'month'))) {
					paymentConfirmations.push({
						paidAt: lastPaymentConfirmationAt.subtract(1, 'month').toDate()
					});
				}

				return {
					message: 'Pagamento removido com sucesso',
					paymentConfirmations
				};
			}

			// can only confirm payments that are subsequent to the last payment confirmation
			if (paymentDate.isSame(lastPaymentConfirmationAt.add(1, 'month'))) {
				const paymentConfirmation = await prisma.transactionPaymentConfirmation.create({
					data: {
						transactionId: transaction.id,
						paidAt: paymentDate.toDate()
					},
					select: {
						paidAt: true
					}
				});

				return {
					message: 'Pagamento confirmado com sucesso',
					paymentConfirmations: [paymentConfirmation]
				};
			}

			// user is trying to remove a payment confirmation that is not the last one
			if (paymentDate.isBefore(lastPaymentConfirmationAt)) {
				return kitFail(400, {
					message: 'Não é possivel remover confirmações de pagamento anteriores.'
				});
			}

			// user is trying to confirm a payment that is not subsequent to the last payment confirmation
			if (paymentDate.isAfter(lastPaymentConfirmationAt.add(1, 'month'))) {
				return kitFail(400, {
					message: 'Não é possivel confirmar pagamentos posteriores.'
				});
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

				const paymentConfirmation = await prisma.transactionPaymentConfirmation.create({
					data: {
						transactionId: transaction.id,
						paidAt: transaction.firstInstallmentAt
					},
					select: {
						paidAt: true
					}
				});

				return {
					message: 'Pagamento confirmado com sucesso',
					paymentConfirmations: [paymentConfirmation]
				};
			}

			const lastPaymentConfirmationAt = dates.utc(lastPaymentConfirmation).startOf('month');

			// can only remove the last payment confirmation
			if (lastPaymentConfirmationAt.isSame(paymentDate)) {
				await prisma.transactionPaymentConfirmation.delete({
					where: {
						transactionId_paidAt: {
							paidAt: paymentDate.toDate(),
							transactionId: transaction.id
						}
					}
				});

				const paymentConfirmations: { paidAt: Date }[] = [];

				if (!firstInstallmentAt.isAfter(lastPaymentConfirmationAt.subtract(1, 'month'))) {
					paymentConfirmations.push({
						paidAt: lastPaymentConfirmationAt.subtract(1, 'month').toDate()
					});
				}

				return {
					message: 'Pagamento removido com sucesso',
					paymentConfirmations
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
				const paymentConfirmation = await prisma.transactionPaymentConfirmation.create({
					data: {
						transactionId: transaction.id,
						paidAt: paymentDate.toDate()
					}
				});

				return {
					message: 'Pagamento confirmado com sucesso',
					paymentConfirmations: [paymentConfirmation]
				};
			}

			// user is trying to remove a payment confirmation that is not the last one
			if (paymentDate.isBefore(lastPaymentConfirmationAt)) {
				return kitFail(400, {
					message: 'Não é possivel remover confirmações de pagamento anteriores.'
				});
			}

			// user is trying to confirm a payment that is not subsequent to the last payment confirmation
			if (paymentDate.isAfter(lastPaymentConfirmationAt.add(1, 'month'))) {
				return kitFail(400, {
					message: 'Não é possivel confirmar pagamentos posteriores.'
				});
			}

			return kitFail(400, {
				message: 'Requisição inválida'
			});
		}
	}
} satisfies Actions;
