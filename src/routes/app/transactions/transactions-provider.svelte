<script lang="ts" module>
	import { getContext, setContext, type Snippet } from 'svelte';
	import { derived, get, writable } from 'svelte/store';

	import { convertTransaction, getPaidInstallments } from '$lib/models/transaction';
	import type { Entities } from '$lib/types';
	import { dates } from '$lib/utils/dates';

	const TRANSACTIONS_CONTEXT_KEY = Symbol('transactions-context');

	function setTransactionsContext() {
		const status = writable<'idle' | 'fetching' | 'fetched'>('idle');
		const transactions = writable<Entities.Transaction[]>([]);
		const tagsFrequency = derived(
			transactions,
			($transactions) => {
				const freqs = new Map<string, number>();

				$transactions.forEach((t) => {
					t.tags.forEach((tag) => {
						const count = freqs.get(tag) ?? 0;
						freqs.set(tag, count + 1);
					});
				});

				return freqs;
			},
			new Map<string, number>()
		);
		const availableTags = derived(
			tagsFrequency,
			($tagsFrequency) => {
				return new Set<string>($tagsFrequency.keys());
			},
			new Set<string>()
		);

		async function fetchTransactions() {
			status.set('fetching');

			const response = await fetch('/api/transactions');
			const { transactions: dbTransactions } = await response.json();

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const convertedTransactions = dbTransactions.map((t: any) => {
				const converted = convertTransaction(t);

				return converted;
			});

			transactions.set(convertedTransactions);

			status.set('fetched');
		}

		function addTransaction(transaction: Entities.Transaction) {
			transactions.update((v) => {
				return [...v, transaction].toSorted((a, b) => {
					const aDate = dates.utc(a.purchasedAt);
					const bDate = dates.utc(b.purchasedAt);

					if (bDate.isAfter(aDate)) return 1;
					if (bDate.isBefore(aDate)) return -1;

					return a.id - b.id;
				});
			});
		}

		function deleteTransaction(transactionId: Entities.Transaction['id']) {
			transactions.update((v) => {
				return v.filter((t) => {
					return t.id !== transactionId;
				});
			});
		}

		function updateTransaction(
			transactionId: Entities.Transaction['id'],
			newTransaction: Entities.Transaction
		) {
			transactions.update((v) => {
				return v.map((t) => {
					if (t.id === transactionId) {
						return newTransaction;
					}

					return t;
				});
			});
		}

		function setTransactionPaymentConfirmation(
			transactionId: Entities.Transaction['id'],
			paymentConfirmation: Entities.Transaction['lastPaymentConfirmationAt']
		) {
			return transactions.update((v) => {
				return v.map((t) => {
					if (t.id === transactionId) {
						const updatedTransaction: Entities.Transaction = {
							...t,
							lastPaymentConfirmationAt: paymentConfirmation
						};

						if (updatedTransaction.mode === 'IN_INSTALLMENTS') {
							updatedTransaction.paidInstallments = getPaidInstallments({
								lastPaymentConfirmation: paymentConfirmation,
								firstInstallmentAt: updatedTransaction.firstInstallmentAt
							});
						}

						return updatedTransaction;
					}

					return t;
				});
			});
		}

		function getTransactionById(transactionId: Entities.Transaction['id']) {
			return get(transactions).find((t) => t.id === transactionId);
		}

		return setContext(TRANSACTIONS_CONTEXT_KEY, {
			status,
			transactions,
			availableTags,
			fetchTransactions,
			getTransactionById,
			addTransaction,
			deleteTransaction,
			updateTransaction,
			setTransactionPaymentConfirmation
		});
	}

	export function useTransactionsContext() {
		return getContext<ReturnType<typeof setTransactionsContext>>(TRANSACTIONS_CONTEXT_KEY);
	}
</script>

<script lang="ts">
	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	const { fetchTransactions } = setTransactionsContext();
</script>

{#await fetchTransactions()}
	<p>carregando transações...</p>
{:then}
	{@render children()}
{/await}
