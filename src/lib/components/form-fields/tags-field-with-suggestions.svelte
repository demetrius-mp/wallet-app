<script lang="ts">
	import { createTagsInput, melt } from '@melt-ui/svelte';
	import type { ControlAttrs } from 'formsnap';
	import SquarePen from 'lucide-svelte/icons/square-pen';
	import XIcon from 'lucide-svelte/icons/x';
	import { flip } from 'svelte/animate';
	import { scale, slide } from 'svelte/transition';

	import { chipVariants } from '$lib/shadcn/custom/chip.svelte';
	import { buttonVariants } from '$lib/shadcn/ui/button';
	import * as Dialog from '$lib/shadcn/ui/dialog';
	import Separator from '$lib/shadcn/ui/separator/separator.svelte';
	import { cn } from '$lib/shadcn/utils';

	type Props = ControlAttrs & {
		value?: Set<string>;
		suggestions?: string[];
	};

	let { value = $bindable(new Set()), suggestions: _suggestions = [], ...props }: Props = $props();

	let inputRef: HTMLInputElement | null = $state(null);

	const {
		elements: { root, input, tag, deleteTrigger, edit },
		states: { tags }
	} = createTagsInput({
		defaultTags: Array.from(value),
		unique: true,
		add(tag) {
			if (tag.includes(',')) {
				throw new Error("Tag cannot include ','");
			}

			return { id: tag, value: tag };
		},
		update({ value }) {
			if (value.includes(',')) {
				throw new Error("Tag cannot include ','");
			}

			return { id: value, value };
		},
		onTagsChange({ next }) {
			value = new Set(next.map((t) => t.value));

			return next;
		}
	});
</script>

<div class={cn('relative flex min-h-11 flex-wrap items-center rounded-md border transition-all')}>
	{#if $tags.length === 0}
		<span class="pl-3 text-muted-foreground"> Nenhuma tag </span>
	{/if}
	<div class="flex flex-wrap items-center gap-2 p-2 pr-10">
		{#if $tags.length > 0}
			{#each $tags as t (t.id)}
				<div
					animate:flip={{
						duration: 150
					}}
					transition:scale={{
						duration: 250
					}}
				>
					<div class={cn(chipVariants())}>
						{t.value}
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<div class="absolute right-[5px] top-[5px]">
		<Dialog.Root>
			<Dialog.Trigger
				type="button"
				class={cn(buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-8' }))}
				{...props}
			>
				<SquarePen />
			</Dialog.Trigger>
			<Dialog.Content class="p-4">
				<Dialog.Header>
					<Dialog.Title>Alterar tags</Dialog.Title>
					<Dialog.Description>Adicione e remova tags desta transação</Dialog.Description>
				</Dialog.Header>

				<div>
					<div
						use:melt={$root}
						class={cn(
							'flex flex-wrap items-center rounded-md border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1'
						)}
					>
						{#if $tags.length > 0}
							<div
								transition:slide={{
									duration: 250
								}}
								class="flex flex-wrap items-center gap-2 p-2"
							>
								{#each $tags as t (t.id)}
									<div
										animate:flip={{
											duration: 150
										}}
										transition:scale={{
											duration: 250
										}}
									>
										<div
											class={cn(chipVariants(), 'data-[selected]:bg-primary/75', 'py-1')}
											use:melt={$tag(t)}
										>
											{t.value}

											<button
												type="button"
												use:melt={$deleteTrigger(t)}
												class="ml-1 rounded-full p-0.5 hover:bg-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
											>
												<XIcon class="h-3 w-3" />
												<span class="sr-only">Remover</span>
											</button>
										</div>

										<div
											use:melt={$edit(t)}
											class="flex items-center overflow-hidden rounded-md px-2 py-[0.09rem] [word-break:break-word] data-[invalid-edit]:outline-destructive"
										></div>
									</div>
								{/each}
							</div>

							<Separator />
						{/if}

						<input
							use:melt={$input}
							name="tags-input--{props.id}"
							bind:this={inputRef}
							enterkeyhint="enter"
							onkeypress={(e) => {
								if (e.key === ',') {
									e.preventDefault();
									if (!inputRef) return;

									const event = new KeyboardEvent('keydown', {
										key: 'Enter',
										code: 'Enter'
									});

									inputRef.dispatchEvent(event);
								}
							}}
							type="text"
							class={cn(
								// shadcn input styles
								'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
								// custom styles
								'flex-grow border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
								'data-[invalid]:text-destructive'
							)}
						/>
					</div>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	</div>
</div>

<input type="hidden" name={props.name} value={$tags.map((t) => t.value).join(',')} />
