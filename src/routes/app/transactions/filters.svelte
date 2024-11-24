<script lang="ts">
	import CheckIcon from 'lucide-svelte/icons/check';
	import { flip } from 'svelte/animate';
	import { scale } from 'svelte/transition';

	import {
		getTransactionCategoryLabel,
		getTransactionModeLabel,
		TRANSACTION_CATEGORIES,
		TRANSACTION_MODES
	} from '$lib/models/transaction';
	import { chipVariants } from '$lib/shadcn/custom/chip.svelte';
	import { badgeVariants } from '$lib/shadcn/ui/badge';
	import * as Command from '$lib/shadcn/ui/command';
	import * as Popover from '$lib/shadcn/ui/popover';
	import { cn } from '$lib/shadcn/utils';
	import type { Entities } from '$lib/types';

	type Props = {
		selectedTags: Set<string>;
		availableTags: Set<string>;
		transactionModeTags: Set<string>;
		transactionCategoryTags: Set<string>;
		onToggleTag: (tag: string) => void;
		onToggleTransactionModeTag: (transactionMode: Entities.TransactionMode) => void;
		onToggleTransactionCategoryTag: (transactionCategory: Entities.TransactionCategory) => void;
	};

	let {
		selectedTags,
		availableTags,
		transactionCategoryTags,
		transactionModeTags,
		onToggleTag,
		onToggleTransactionCategoryTag,
		onToggleTransactionModeTag
	}: Props = $props();
</script>

<div class="mt-4 flex flex-wrap gap-2">
	<Popover.Root>
		<Popover.Trigger>
			{#snippet child({ props })}
				<button {...props} class={cn(chipVariants({ variant: 'outline' }))}>
					+ Adicionar filtro
				</button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content side="bottom" align="start" class="w-[180px] p-0">
			<Command.Root>
				<Command.Input class="h-8" placeholder="Buscar filtros..." />
				<Command.List>
					<Command.Empty class="py-4">
						Nenhum filtro
						<br />
						encontrada.
					</Command.Empty>

					<Command.Group heading="Tipos de transação">
						{#each TRANSACTION_MODES as transactionMode}
							<Command.Item
								value={transactionMode}
								onSelect={() => onToggleTransactionModeTag(transactionMode)}
								class="flex items-center justify-between break-all"
							>
								{getTransactionModeLabel(transactionMode)}

								{#if transactionModeTags.has(transactionMode)}
									<CheckIcon />
								{/if}
							</Command.Item>
						{/each}

						{#each TRANSACTION_CATEGORIES as transactionCategory}
							<Command.Item
								value={transactionCategory}
								onSelect={() => onToggleTransactionCategoryTag(transactionCategory)}
								class="flex items-center justify-between break-all"
							>
								{getTransactionCategoryLabel(transactionCategory)}

								{#if transactionCategoryTags.has(transactionCategory)}
									<CheckIcon />
								{/if}
							</Command.Item>
						{/each}
					</Command.Group>

					<Command.Separator />

					{#if availableTags.size > 0}
						<Command.Group heading="Tags">
							{#each availableTags as tag}
								<Command.Item
									value={tag}
									onSelect={() => onToggleTag(tag)}
									class="flex items-center justify-between break-all"
								>
									{tag}

									{#if selectedTags.has(tag)}
										<CheckIcon />
									{/if}
								</Command.Item>
							{/each}
						</Command.Group>
					{/if}
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>

	{#each selectedTags as tag (tag)}
		<button
			animate:flip={{
				duration: 150
			}}
			transition:scale={{
				duration: 150
			}}
			class={cn(badgeVariants())}
			onclick={() => onToggleTag(tag)}
		>
			{tag}
		</button>
	{/each}
</div>
