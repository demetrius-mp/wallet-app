<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<p class="mt-2 whitespace-pre-line text-sm text-muted-foreground">
	{@render children()}
</p>
