<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<h2 class="text-3xl font-semibold tracking-tight text-foreground">
	{@render children()}
</h2>
