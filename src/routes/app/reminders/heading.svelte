<script lang="ts">
	import type { Dayjs } from 'dayjs';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import CopyIcon from 'lucide-svelte/icons/copy';

	import MonthCalendar from '$lib/components/month-calendar.svelte';
	import Button, { buttonVariants } from '$lib/shadcn/ui/button/button.svelte';
	import * as Popover from '$lib/shadcn/ui/popover';
	import Separator from '$lib/shadcn/ui/separator/separator.svelte';
	import { cn } from '$lib/shadcn/utils';
	import { calendarDateToDayjs, dayjsToCalendarDate } from '$lib/utils/dates';
	import { formatCurrency } from '$lib/utils/format-currency';

	type Props = {
		date: Dayjs;
		total: number;
		minCalendarDate: Dayjs;
	};

	let { date = $bindable(), total, minCalendarDate }: Props = $props();
</script>

<div class="flex items-baseline gap-2">
	<h2 class="text-2xl">Total</h2>
	<small>
		({date.format('MM/YYYY')})
	</small>
</div>

<span class="text-4xl font-extrabold">
	{formatCurrency(total)}
</span>

<Separator class="my-4" />

<div class="flex items-center justify-between">
	<div>
		<h2 class="text-2xl">Contas</h2>
		<span class="text-sm">
			do mês
			{date.format('MM/YYYY')}
		</span>
	</div>

	<div class="flex gap-2">
		<Button variant="outline" class="size-12 rounded-full">
			<CopyIcon class="!size-6" />
			<span class="sr-only"> Copiar </span>
		</Button>

		<Popover.Root>
			<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }), 'size-12 rounded-full')}>
				<CalendarIcon class="!size-6" />
				<span class="sr-only"> Filtrar por mês </span>
			</Popover.Trigger>

			<Popover.Content align="end" side="bottom" class="w-auto p-0">
				<MonthCalendar
					minValue={dayjsToCalendarDate(minCalendarDate)}
					value={dayjsToCalendarDate(date)}
					onValueChange={(value) => {
						if (!value) return;

						date = calendarDateToDayjs(value);
					}}
				/>
			</Popover.Content>
		</Popover.Root>
	</div>
</div>
