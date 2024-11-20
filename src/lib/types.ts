// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Entities {
	export type BaseTransaction = {
		id: number;
		name: string;
		value: number;
		purchasedAt: Date;
		firstChargeAt: Date;
		tags: Set<string>;
		category: 'income' | 'expense';
	};

	export type RecurrentTransaction = BaseTransaction & {
		mode: 'recurrent';
	};

	export type SinglePaymentTransaction = BaseTransaction & {
		mode: 'single-payment';
		numberOfInstallments: 1;
		endsAt: Date;
	};

	export type InInstallmentsTransaction = BaseTransaction & {
		mode: 'in-installments';
		numberOfInstallments: number;
		endsAt: Date;
	};

	export type Transaction =
		| RecurrentTransaction
		| SinglePaymentTransaction
		| InInstallmentsTransaction;
}
