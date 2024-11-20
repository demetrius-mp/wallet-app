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
	import type { ControlAttrs } from 'formsnap';
	import CalendarIcon from 'lucide-svelte/icons/calendar';

	import MonthCalendar from '$lib/components/month-calendar.svelte';
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
	<Popover.Trigger
		{disabled}
		{...props}
		class={cn(
			buttonVariants({ variant: 'outline' }),
			'w-full justify-start pl-3 text-left font-normal',
			!dateValue && 'text-muted-foreground'
		)}
	>
		{dateValue ? df.format(dateValue.toDate(getLocalTimeZone())) : noDateSelectedText}

		<CalendarIcon class="ml-auto size-4 opacity-50" />
	</Popover.Trigger>
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
