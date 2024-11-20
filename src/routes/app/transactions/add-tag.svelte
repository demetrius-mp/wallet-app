<script lang="ts">
	import Check from 'lucide-svelte/icons/check';

	import { chipVariants } from '$lib/shadcn/custom/chip.svelte';
	import * as Command from '$lib/shadcn/ui/command/index.js';
	import * as Popover from '$lib/shadcn/ui/popover/index.js';
	import { cn } from '$lib/shadcn/utils';

	type Props = {
		availableTags: Set<string>;
		selectedTags: Set<string>;
	};

	let { availableTags, selectedTags = $bindable() }: Props = $props();
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<button {...props} class={cn(chipVariants({ variant: 'outline' }))}> + Adicionar tag </button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content side="bottom" align="center" class="w-[180px] p-0">
		<Command.Root>
			<Command.Input placeholder="Buscar tag..." />
			<Command.List>
				<Command.Empty>Nenhuma tag encontrada.</Command.Empty>
				<Command.Group>
					{#each availableTags as tag}
						<Command.Item
							value={tag}
							onSelect={() => {
								if (selectedTags.has(tag)) {
									selectedTags.delete(tag);
								} else {
									selectedTags.add(tag);
								}
							}}
							class="flex items-center justify-between break-all"
						>
							{tag}

							{#if selectedTags.has(tag)}
								<Check class="size-4" />
							{/if}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
