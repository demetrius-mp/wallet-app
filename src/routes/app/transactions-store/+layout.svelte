<script lang="ts">
	import TransactionsProvider from '$lib/providers/transactions-provider/transactions-provider.svelte';

	let { children } = $props();
</script>

<TransactionsProvider>
	{@render children()}
</TransactionsProvider>
