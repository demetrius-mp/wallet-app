import { relations, sql } from 'drizzle-orm';
import { date, integer, pgEnum, pgTable, real, text, unique, varchar } from 'drizzle-orm/pg-core';

export const transactionModeEnum = pgEnum('transactionMode', [
	'RECURRENT',
	'SINGLE_PAYMENT',
	'IN_INSTALLMENTS'
]);

export const transactionCategoryEnum = pgEnum('transactionCategory', ['EXPENSE', 'INCOME']);

export const transactionsTable = pgTable('transactions', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

	mode: transactionModeEnum('mode').notNull(),
	name: varchar('name', { length: 255 }).notNull(),
	value: real('value').notNull(),
	purchasedAt: date('purchased_at', { mode: 'date' }).notNull(),
	firstInstallmentAt: date('first_installment_at', { mode: 'date' }).notNull(),
	numberOfInstallments: integer('number_of_installments'),
	lastInstallmentAt: date('last_installment_at', { mode: 'date' }),
	category: transactionCategoryEnum('category').notNull(),
	tags: text('tags')
		.array()
		.notNull()
		.default(sql`ARRAY[]::text[]`)
});

export const transactionsRelations = relations(transactionsTable, ({ many }) => ({
	paymentConfirmations: many(transactionPaymentConfirmationsTable)
}));

export const transactionPaymentConfirmationsTable = pgTable(
	'transactionPaymentConfirmations',
	{
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

		transactionId: integer('transaction_id').notNull(),
		paidAt: date('paid_at', { mode: 'date' }).notNull()
	},
	(t) => ({
		transactionIdPaidAtUnique: unique('transaction_id_paid_at_unique').on(t.transactionId, t.paidAt)
	})
);

export const transactionPaymentConfirmationsRelations = relations(
	transactionPaymentConfirmationsTable,
	({ one }) => ({
		transaction: one(transactionsTable, {
			fields: [transactionPaymentConfirmationsTable.transactionId],
			references: [transactionsTable.id]
		})
	})
);
