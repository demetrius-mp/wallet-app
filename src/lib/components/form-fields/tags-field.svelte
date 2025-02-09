<script lang="ts" module>
	export function createSetTags() {
		return (_tags: Set<string>) => {};
	}
</script>

<script lang="ts">
	import { type Tag } from '@melt-ui/svelte';
	import { createTagsInput, melt } from '@melt-ui/svelte';
	import type { ControlAttrs } from 'formsnap';
	import XIcon from 'lucide-svelte/icons/x';
	import { flip } from 'svelte/animate';
	import type { HTMLAttributes } from 'svelte/elements';
	import { writable } from 'svelte/store';
	import { scale } from 'svelte/transition';

	import { chipVariants } from '$lib/shadcn/custom/chip.svelte';
	import Separator from '$lib/shadcn/ui/separator/separator.svelte';
	import { cn } from '$lib/shadcn/utils';

	type Props = ControlAttrs &
		HTMLAttributes<HTMLDivElement> & {
			value?: Set<string>;
			setTags?: (tags: Set<string>) => void;
		};

	let {
		value = $bindable(new Set()),
		setTags = $bindable(),
		id,
		name,
		class: className,
		...restProps
	}: Props = $props();

	const customTagsStore = writable<Tag[]>([]);

	setTags = (tags) => {
		$customTagsStore = Array.from(tags).map((t) => ({ id: t, value: t }));
	};

	setTags(value);

	let inputRef: HTMLInputElement | null = $state(null);

	const {
		elements: { root, input, tag, deleteTrigger, edit },
		states: { tags }
	} = createTagsInput({
		tags: customTagsStore,
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
		},
		addOnPaste: true
	});
</script>

<div
	use:melt={$root}
	{...restProps}
	class={cn(
		'flex flex-wrap items-center rounded-md border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
		className
	)}
>
	{#if $tags.length > 0}
		<div
			transition:scale={{
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
							<span class="sr-only">Remove</span>
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
		{id}
		name="tags-input--{id}"
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

<input type="hidden" {name} value={$tags.map((t) => t.value).join(',')} />
