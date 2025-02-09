<script lang="ts">
	import ChevronLeftIcon from 'lucide-svelte/icons/chevron-left';
	import type { Snippet } from 'svelte';

	type Props = {
		href: string;
		children: Snippet;
	};

	let { children, href }: Props = $props();
</script>

<a
	{href}
	class="flex w-fit cursor-pointer items-center p-2 pl-0 text-muted-foreground hover:text-primary"
>
	<ChevronLeftIcon class="mr-1.5 h-4 w-4 " />

	<span class="text-sm">
		{@render children()}
	</span>
</a>
