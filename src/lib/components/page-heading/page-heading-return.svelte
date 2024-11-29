<script lang="ts">
	import ChevronLeftIcon from 'lucide-svelte/icons/chevron-left';
	import type { Snippet } from 'svelte';

	type Props = {
		href: string;
		children: Snippet;
	};

	let { children, href }: Props = $props();
</script>

<a {href} class="mb-2 flex cursor-pointer items-center text-muted-foreground hover:text-primary">
	<ChevronLeftIcon class="mr-1.5 h-4 w-4 " />

	<span class="mt-0.5 text-sm">
		{@render children()}
	</span>
</a>
