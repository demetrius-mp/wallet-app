<script lang="ts">
	import { useTransactions } from '$lib/providers/transactions-provider/transactions-provider.svelte';

	import TransactionsPage from './transactions-page.svelte';

	const { transactions } = useTransactions();

	let { data } = $props();
</script>

{#await transactions.fetchTransactions()}
	<p>fetching transactions...</p>
{:then}
	<TransactionsPage
		data={{
			availableTags: $transactions.data.availableTags,
			searchParams: data.searchParams
		}}
	/>
{:catch}
	<p>error fetching transactions</p>
{/await}
