<script lang="ts" module>
	import { getContext, setContext, type Snippet } from 'svelte';
	import { derived, get, writable } from 'svelte/store';

	import MetaTags from '$lib/components/meta-tags.svelte';
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

<MetaTags title="Transações - Carregando..." />

{#await fetchTransactions()}
	<div style="height: calc(100vh - 97px);" class="flex flex-col items-center justify-center gap-4">
		<div role="status">
			<svg
				aria-hidden="true"
				class="inline h-8 w-8 animate-spin fill-gray-600 text-gray-200 dark:fill-gray-300 dark:text-gray-600"
				viewBox="0 0 100 101"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
					fill="currentColor"
				/>
				<path
					d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
					fill="currentFill"
				/>
			</svg>
			<span class="sr-only">Carregando...</span>
		</div>

		<p>Carregando...</p>
	</div>
{:then}
	{@render children()}
{/await}
