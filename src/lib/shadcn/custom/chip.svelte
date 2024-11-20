<script lang="ts" module>
	import XIcon from 'lucide-svelte/icons/x';
	import type { ComponentProps } from 'svelte';
	import { tv, type VariantProps } from 'tailwind-variants';

	import Badge from '$lib/shadcn/ui/badge/badge.svelte';
	import { cn } from '$lib/shadcn/utils';

	export const chipVariants = tv({
		base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground',
				secondary: 'border-transparent bg-secondary text-secondary-foreground',
				destructive: 'border-transparent bg-destructive text-destructive-foreground',
				outline: 'text-foreground'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type ChipVariant = VariantProps<typeof chipVariants>['variant'];
</script>

<script lang="ts">
	type Props = ComponentProps<typeof Badge> & {
		variant?: ChipVariant;
		onRemove?: () => void;
	};

	let { variant = 'default', class: className, children, onRemove, ...restProps }: Props = $props();
</script>

<Badge {variant} class={cn(chipVariants({ variant }), 'pr-1', className)} {...restProps}>
	{@render children?.()}
	{#if onRemove}
		<button
			type="button"
			onclick={onRemove}
			class="ml-1 rounded-full p-0.5 hover:bg-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		>
			<XIcon class="h-3 w-3" />
			<span class="sr-only">Remove</span>
		</button>
	{/if}
</Badge>
