<script lang="ts" module>
	const df = new DateFormatter('pt-BR', {
		month: '2-digit',
		year: 'numeric'
	});
</script>

<script lang="ts">
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate
	} from '@internationalized/date';
	import { isAfter, isBefore } from '@melt-ui/svelte/internal/helpers/date';
	import type { ControlAttrs } from 'formsnap';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import MinusIcon from 'lucide-svelte/icons/minus';
	import PlusIcon from 'lucide-svelte/icons/plus';

	import MonthCalendar from '$lib/components/month-calendar.svelte';
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import { buttonVariants } from '$lib/shadcn/ui/button/index.js';
	import * as Popover from '$lib/shadcn/ui/popover/index.js';
	import { cn } from '$lib/shadcn/utils';

	type Props = ControlAttrs & {
		value: string | null | undefined;
		minValue?: DateValue;
		maxValue?: DateValue;
		noDateSelectedText?: string;
		onValueChange?: (value?: DateValue) => void;
		disabled?: boolean;
	};

	let {
		value = $bindable(),
		disabled,
		minValue,
		maxValue,
		noDateSelectedText,
		onValueChange,
		...props
	}: Props = $props();

	let dateValue = $state<CalendarDate | undefined>(value ? parseDate(value) : undefined);

	$effect(() => {
		dateValue = value ? parseDate(value) : undefined;
	});
</script>

<Popover.Root>
	<div class="relative">
		<div
			class={cn(
				'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
			)}
		>
			{dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : noDateSelectedText}
		</div>

		<div class="absolute right-1 top-1">
			<Button
				onclick={() => {
					if (!dateValue) return;

					const newDate = dateValue.subtract({ months: 1 });

					if (minValue && isBefore(newDate, minValue)) return;

					value = newDate.toString();
					onValueChange?.(newDate);
				}}
				variant="ghost"
				size="icon"
				class="size-8"
			>
				<MinusIcon />
			</Button>

			<Button
				onclick={() => {
					if (!dateValue) return;

					const newDate = dateValue.add({ months: 1 });

					if (maxValue && isAfter(newDate, maxValue)) return;

					value = newDate.toString();
					onValueChange?.(newDate);
				}}
				variant="ghost"
				size="icon"
				class="size-8"
			>
				<PlusIcon />
			</Button>

			<Popover.Trigger
				{...props}
				class={cn(
					buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-8' }),
					!dateValue && 'text-muted-foreground'
				)}
			>
				<CalendarIcon />
			</Popover.Trigger>
		</div>
	</div>

	<Popover.Content class="w-auto p-0" side="top" align="end">
		<MonthCalendar
			value={dateValue}
			{minValue}
			{maxValue}
			onValueChange={(v) => {
				value = v?.toString();
				onValueChange?.(v);
			}}
		/>
	</Popover.Content>
</Popover.Root>

<input hidden {value} name={props.name} />
