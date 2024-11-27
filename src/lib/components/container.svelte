<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/shadcn/utils';

	type Props = {
		children: Snippet;
		class?: string;
	};

	let { children, class: className }: Props = $props();
</script>

<div class={cn('mx-auto my-4 max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
	<div class="mx-auto max-w-4xl">
		{@render children()}
	</div>
</div>
