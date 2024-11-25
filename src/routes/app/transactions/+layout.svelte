<script>
	import TransactionsProvider from './transactions-provider.svelte';

	let { children } = $props();
</script>

<TransactionsProvider>
	{@render children()}
</TransactionsProvider>
