// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Entities {
	export type BaseTransaction = {
		id: number;
		name: string;
		value: number;
		purchasedAt: Date;
		firstInstallmentAt: Date;
		tags: Set<string>;
		category: 'INCOME' | 'EXPENSE';
	};

	export type RecurrentTransaction = BaseTransaction & {
		mode: 'RECURRENT';
	};

	export type SinglePaymentTransaction = BaseTransaction & {
		mode: 'SINGLE_PAYMENT';
		numberOfInstallments: 1;
		lastInstallmentAt: Date;
	};

	export type InInstallmentsTransaction = BaseTransaction & {
		mode: 'IN_INSTALLMENTS';
		numberOfInstallments: number;
		lastInstallmentAt: Date;
	};

	export type Transaction =
		| RecurrentTransaction
		| SinglePaymentTransaction
		| InInstallmentsTransaction;
}
