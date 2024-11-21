<script lang="ts" module>
	const months = [
		'Janeiro',
		'Fevereiro',
		'Março',
		'Abril',
		'Maio',
		'Junho',
		'Julho',
		'Agosto',
		'Setembro',
		'Outubro',
		'Novembro',
		'Dezembro'
	];
</script>

<script lang="ts">
	import {
		CalendarDate,
		type DateValue,
		getLocalTimeZone,
		isSameMonth,
		today
	} from '@internationalized/date';
	import ChevronLeftIcon from 'lucide-svelte/icons/chevron-left';
	import ChevronRightIcon from 'lucide-svelte/icons/chevron-right';

	import Button from '$lib/shadcn/ui/button/button.svelte';
	import { cn } from '$lib/shadcn/utils';

	type Props = {
		value?: CalendarDate;
		maxValue?: DateValue;
		minValue?: DateValue;
		onValueChange?: (value?: CalendarDate) => void;
		allowUnselect?: boolean;
	};

	const todayDate = today(getLocalTimeZone());

	let {
		value = $bindable(),
		maxValue,
		minValue,
		allowUnselect = false,
		onValueChange
	}: Props = $props();

	let selectedDate = $state(value);
	let calendarYear = $state(todayDate.year);

	function checkIsSelected(year: number, month: number) {
		return selectedDate?.month === month && selectedDate?.year === year;
	}

	function checkIsToday(year: number, month: number) {
		return todayDate.month === month && todayDate.year === year;
	}

	function checkIsDisabled(year: number, month: number) {
		const date = new CalendarDate(year, month, 1);

		if (minValue && date.compare(minValue) < 0) {
			return true;
		}

		if (maxValue && date.compare(maxValue) > 0) {
			return true;
		}
	}

	function setSelectedDate(year: number, month: number) {
		const newDate = new CalendarDate(year, month, 1);

		if (selectedDate && isSameMonth(newDate, selectedDate) && allowUnselect) {
			selectedDate = undefined;
		} else {
			selectedDate = new CalendarDate(year, month, 1);
			value = selectedDate;
		}

		onValueChange?.(selectedDate);
	}

	$effect(() => {
		selectedDate = value;
		calendarYear = value?.year || todayDate.year;
	});
</script>

<div class="p-3">
	<div class="flex items-center justify-between">
		<Button
			onclick={() => (calendarYear -= 1)}
			disabled={calendarYear === minValue?.year}
			variant="outline"
			class="size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
		>
			<ChevronLeftIcon class="size-4" />

			<span class="sr-only"> Ano anterior </span>
		</Button>

		<h3 class="text-sm font-medium">
			{calendarYear}
		</h3>

		<Button
			onclick={() => (calendarYear += 1)}
			disabled={calendarYear === maxValue?.year}
			variant="outline"
			class="size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
		>
			<ChevronRightIcon class="size-4" />

			<span class="sr-only"> Próximo ano </span>
		</Button>
	</div>

	<div class="mt-4 grid grid-cols-4 place-items-center gap-2">
		{#each months as monthName, i}
			{@const month = i + 1}
			<Button
				variant="ghost"
				onclick={() => setSelectedDate(calendarYear, month)}
				data-today={checkIsToday(calendarYear, month) || undefined}
				data-selected={checkIsSelected(calendarYear, month) || undefined}
				disabled={checkIsDisabled(calendarYear, month)}
				class={cn(
					'size-12 uppercase',
					'[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground',
					// Selected
					'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:opacity-100 data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground'
				)}
				aria-label="Selecionar mês"
			>
				{monthName.substring(0, 3)}
			</Button>
		{/each}
	</div>
</div>
