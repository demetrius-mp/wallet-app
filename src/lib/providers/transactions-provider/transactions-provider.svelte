<script lang="ts" module>
	import { getContext, setContext, type Snippet } from 'svelte';
	import { writable } from 'svelte/store';

	import { convertTransaction } from '$lib/models/transaction';
	import type { Entities } from '$lib/types';
	import { dates } from '$lib/utils/dates';
	import { setUnion } from '$lib/utils/set';

	const TRANSACTIONS_CONTEXT_KEY = Symbol('transactions-context');

	function setTransactionsContext() {
		const { set, subscribe, update } = writable<{
			data: {
				transactions: Entities.Transaction[];
				availableTags: Set<string>;
			};
			state: 'idle' | 'fetching' | 'fetched' | 'error';
		}>({
			data: {
				availableTags: new Set(),
				transactions: []
			},
			state: 'idle'
		});

		const context = {
			transactions: {
				subscribe,
				async fetchTransactions() {
					update((state) => {
						return {
							...state,
							state: 'fetching'
						};
					});

					const response = await fetch('/api/transactions');
					const { transactions: dbTransactions } = await response.json();

					let availableTags = new Set<string>();

					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const transactions = dbTransactions.map((t: any) => {
						const converted = convertTransaction(t);

						availableTags = setUnion(availableTags, converted.tags);

						return converted;
					});

					set({
						data: {
							transactions,
							availableTags
						},
						state: 'fetched'
					});

					return transactions;
				},
				addTransaction(transaction: Entities.Transaction) {
					update((state) => {
						return {
							...state,
							data: {
								availableTags: setUnion(state.data.availableTags, transaction.tags),
								transactions: [...state.data.transactions, transaction].toSorted((a, b) => {
									return dates.utc(a.purchasedAt).diff(dates.utc(b.purchasedAt));
								})
							}
						};
					});
				},
				deleteTransaction(transactionId: number) {
					update((state) => {
						return {
							...state,
							data: {
								...state.data,
								transactions: state.data.transactions.filter(
									(transaction) => transaction.id !== transactionId
								)
							}
						};
					});
				},
				updateTransaction(transaction: Entities.Transaction) {
					update((state) => {
						return {
							...state,
							data: {
								...state.data,
								transactions: state.data.transactions.map((t) => {
									if (t.id === transaction.id) {
										return transaction;
									}

									return t;
								})
							}
						};
					});
				},
				setLastPaymentConfirmation(
					transactionId: Entities.Transaction['id'],
					lastPaymentConfirmation: Date | null
				) {
					update((state) => {
						return {
							...state,
							data: {
								...state.data,
								transactions: state.data.transactions.map((t) => {
									if (t.id === transactionId) {
										return {
											...t,
											paymentConfirmations:
												lastPaymentConfirmation === null
													? []
													: [{ paidAt: lastPaymentConfirmation }]
										};
									}

									return t;
								})
							}
						};
					});
				}
			}
		};

		return setContext(TRANSACTIONS_CONTEXT_KEY, context);
	}

	export function useTransactions() {
		const context = getContext<ReturnType<typeof setTransactionsContext>>(TRANSACTIONS_CONTEXT_KEY);

		return context;
	}
</script>

<script lang="ts">
	setTransactionsContext();

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

{@render children()}
