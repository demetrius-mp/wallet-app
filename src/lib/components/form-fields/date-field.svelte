<script lang="ts">
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import {
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate
	} from '@internationalized/date';

	import { cn } from '$lib/shadcn/utils';
	import { buttonVariants } from '$lib/shadcn/ui/button/index.js';
	import { Calendar } from '$lib/shadcn/ui/calendar/index.js';
	import * as Popover from '$lib/shadcn/ui/popover/index.js';
	import type { ControlAttrs } from 'formsnap';

	type Props = Expand<ControlAttrs> & {
		value: string | null | undefined;
		minValue?: DateValue;
		maxValue?: DateValue;
		calendarLabel?: string;
		noDateSelectedText?: string;
		onValueChange?: (value?: DateValue) => void;
	};

	let {
		value = $bindable(),
		minValue,
		maxValue,
		calendarLabel,
		noDateSelectedText,
		onValueChange,
		...props
	}: Props = $props();

	const df = new DateFormatter('pt-BR', {
		dateStyle: 'short'
	});

	let dateValue = $state<DateValue | undefined>();

	$effect(() => {
		dateValue = value ? parseDate(value) : undefined;
	});
</script>

<Popover.Root>
	<Popover.Trigger
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
		<Calendar
			locale="pt-BR"
			type="single"
			value={dateValue as DateValue}
			{minValue}
			{maxValue}
			{calendarLabel}
			onValueChange={(v) => {
				value = v?.toString();
				onValueChange?.(v);
			}}
		/>
	</Popover.Content>
</Popover.Root>

<input hidden {value} name={props.name} />
