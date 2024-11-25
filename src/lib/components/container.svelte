<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div class="mx-auto my-4 max-w-7xl px-4 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-4xl">
		{@render children()}
	</div>
</div>
