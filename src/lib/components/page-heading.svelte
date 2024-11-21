<script lang="ts">
	import ChevronLeftIcon from 'lucide-svelte/icons/chevron-left';

	import Separator from '$lib/shadcn/ui/separator/separator.svelte';

	type Props = {
		title: string;
		description?: string;
		returnTo?: {
			label: string;
			href: string;
		};
	};

	let { title, description, returnTo }: Props = $props();
</script>

{#if returnTo}
	<a
		href={returnTo.href}
		class="mb-2 flex cursor-pointer items-center text-muted-foreground hover:text-primary"
	>
		<ChevronLeftIcon class="mr-1.5 h-4 w-4 " />
		<span class="mt-0.5 text-sm">
			{returnTo.label}
		</span>
	</a>
{/if}

<h2 class="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>

{#if description}
	<p class="mt-2 text-sm text-muted-foreground">{description}</p>
{/if}

<Separator class="my-6" />
