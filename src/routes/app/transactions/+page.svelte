<script lang="ts">
	import { getLocalTimeZone, parseDate, startOfMonth, today } from '@internationalized/date';
	import type { Dayjs } from 'dayjs';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import Check from 'lucide-svelte/icons/check';
	import CopyIcon from 'lucide-svelte/icons/copy';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import SearchIcon from 'lucide-svelte/icons/search';
	import XIcon from 'lucide-svelte/icons/x';
	import { flip } from 'svelte/animate';
	import { SvelteSet } from 'svelte/reactivity';
	import { fade, scale } from 'svelte/transition';

	import { goto } from '$app/navigation';
	import MetaTags from '$lib/components/meta-tags.svelte';
	import MonthCalendar from '$lib/components/month-calendar.svelte';
	import { chipVariants } from '$lib/shadcn/custom/chip.svelte';
	import { badgeVariants } from '$lib/shadcn/ui/badge/badge.svelte';
	import Button, { buttonVariants } from '$lib/shadcn/ui/button/button.svelte';
	import * as Command from '$lib/shadcn/ui/command/index.js';
	import Input from '$lib/shadcn/ui/input/input.svelte';
	import * as Popover from '$lib/shadcn/ui/popover';
	import Separator from '$lib/shadcn/ui/separator/separator.svelte';
	import { cn } from '$lib/shadcn/utils';
	import { calendarDateToDayjs, dates, getDatesDiffInMonths } from '$lib/utils/dates.js';
	import { formatCurrency } from '$lib/utils/format-currency.js';
	import { isSubsetOf } from '$lib/utils/set';

	let { data } = $props();

	type SearchParams = {
		term: string;
		tags: Set<string>;
		date: Dayjs;
	};

	const currentMonth = dates().utc(true).startOf('month');

	let searchParams = $state<SearchParams>({
		term: data.searchParams.term,
		tags: new SvelteSet(data.searchParams.tags),
		date: dates(data.searchParams.date, 'YYYY-MM-DD').utc(true)
	});

	let searchInputValue = $state(searchParams.term);

	let filteredTransactions = $derived.by(() => {
		const minDate = searchParams.date.startOf('month');

		function checkDate(date: Date) {
			const transactionEndsAtDate = dates.utc(date);

			const endsAfterMinDate = transactionEndsAtDate.isAfter(minDate);
			const endsAtSameMonth = transactionEndsAtDate.isSame(minDate, 'month');
			const matchesDate = endsAfterMinDate || endsAtSameMonth;

			return matchesDate;
		}

		if (searchParams.term === '' && searchParams.tags.size === 0) {
			return data.transactions.filter((item) => {
				if (item.mode === 'IN_INSTALLMENTS') {
					return checkDate(item.lastInstallmentAt);
				}

				return true;
			});
		}

		const term = searchParams.term.toLowerCase();

		return data.transactions.filter((item) => {
			const isSubset = isSubsetOf(searchParams.tags, item.tags);
			const includesTerm = item.name.toLowerCase().includes(term);

			let isAfterDate = true;
			if (item.mode === 'IN_INSTALLMENTS') {
				isAfterDate = checkDate(item.lastInstallmentAt);
			}

			return isSubset && includesTerm && isAfterDate;
		});
	});

	let bill = $derived.by(() => {
		return filteredTransactions.reduce((acc, transaction) => {
			const value = transaction.category === 'EXPENSE' ? -transaction.value : transaction.value;

			return acc + value;
		}, 0);
	});

	function toggleTag(tag: string) {
		if (searchParams.tags.has(tag)) {
			searchParams.tags.delete(tag);
		} else {
			searchParams.tags.add(tag);
		}
	}

	$effect(() => {
		const params = new URLSearchParams();

		if (searchParams.term) {
			params.set('term', searchParams.term);
		}

		if (searchParams.tags.size > 0) {
			params.set('tags', Array.from(searchParams.tags).join(','));
		}

		if (!searchParams.date.isSame(currentMonth, 'month')) {
			params.set('date', searchParams.date.startOf('month').format('YYYY-MM-DD'));
		}

		goto(`?${params.toString()}`, {
			keepFocus: true
		});
	});
</script>

<MetaTags title="Transações" />

<div class="p-4">
	<div class="flex items-baseline gap-2">
		<h2 class="text-2xl">Saldo</h2>
		<small>
			({searchParams.date.format('MM/YYYY')})
		</small>
	</div>

	<span class="text-4xl font-extrabold">
		{formatCurrency(bill)}
	</span>

	<Separator class="my-4" />

	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl">Transações</h2>
			<span class="text-sm">
				do mês
				{searchParams.date.format('MM/YYYY')}
			</span>
		</div>

		<div class="flex gap-2">
			<Button variant="outline" class="h-12 w-12 rounded-full">
				<CopyIcon class="!h-6 !w-6" />
				<span class="sr-only"> Copiar transações </span>
			</Button>

			<Popover.Root>
				<Popover.Trigger class={cn(buttonVariants({ variant: 'outline' }), 'size-12 rounded-full')}>
					<CalendarIcon class="!h-6 !w-6" />
					<span class="sr-only"> Filtrar por mês </span>
				</Popover.Trigger>

				<Popover.Content align="end" side="bottom" class="w-auto p-0">
					<MonthCalendar
						minValue={startOfMonth(today(getLocalTimeZone())).subtract({ months: 1 })}
						value={parseDate(searchParams.date.format('YYYY-MM-DD'))}
						onValueChange={(value) => {
							if (!value) return;

							searchParams.date = calendarDateToDayjs(value);
						}}
					/>
				</Popover.Content>
			</Popover.Root>
		</div>
	</div>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			searchParams.term = searchInputValue;
		}}
		class="mt-4 flex gap-2"
	>
		<div class="relative w-full">
			<Input
				name="term"
				bind:value={searchInputValue}
				class="pr-8"
				type="text"
				placeholder="Pesquise por nome"
			/>

			{#if searchInputValue}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class="group absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
					onclick={() => {
						searchParams.term = '';
						searchInputValue = '';
					}}
					aria-label="Limpar pesquisa"
				>
					<XIcon
						class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground"
					/>
				</Button>
			{/if}
		</div>

		<Button type="submit">
			<SearchIcon />
			<span class="hidden sm:inline"> Buscar </span>
		</Button>
	</form>

	<div class="mt-4 flex flex-wrap gap-2">
		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<button {...props} class={cn(chipVariants({ variant: 'outline' }))}>
						+ Adicionar tag
					</button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content side="bottom" align="start" class="w-[180px] p-0">
				<Command.Root>
					<Command.Input class="h-8" placeholder="Buscar tag..." />
					<Command.List>
						<Command.Empty class="py-4">
							Nenhuma tag
							<br />
							encontrada.
						</Command.Empty>
						<Command.Group>
							{#each data.availableTags as tag}
								<Command.Item
									value={tag}
									onSelect={() => toggleTag(tag)}
									class="flex items-center justify-between break-all"
								>
									{tag}

									{#if searchParams.tags.has(tag)}
										<Check class="size-4" />
									{/if}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>

		{#each searchParams.tags as tag (tag)}
			<button
				animate:flip={{
					duration: 150
				}}
				transition:scale={{
					duration: 150
				}}
				class={cn(badgeVariants())}
				onclick={() => toggleTag(tag)}
			>
				{tag}
			</button>
		{/each}
	</div>

	<Separator class="my-4" />

	<ul>
		{#each filteredTransactions as transaction (transaction.id)}
			{@const paidInstallments =
				getDatesDiffInMonths(transaction.firstInstallmentAt, searchParams.date.toDate()) + 1}

			<li
				animate:flip={{
					duration: 100
				}}
				transition:fade={{
					duration: 100
				}}
			>
				<a href="/app/transactions/{transaction.id}">
					<div class="flex justify-between gap-2">
						<h3 class="text-lg font-bold">
							{transaction.name}
						</h3>

						<span class="text-lg">
							{formatCurrency(transaction.value)}
						</span>
					</div>

					<div class="flex justify-between">
						<span class="text-sm">
							{dates(transaction.purchasedAt).format('DD/MM/YYYY')}
						</span>
						<span class="text-nowrap text-sm">
							{#if transaction.mode === 'IN_INSTALLMENTS'}
								{paidInstallments}/{transaction.numberOfInstallments}
							{:else if transaction.mode === 'RECURRENT'}
								Recorrente
							{:else}
								À vista
							{/if}
						</span>
					</div>
				</a>

				<div class="mt-3 flex flex-wrap gap-2">
					{#each transaction.tags as tag}
						{@const isSelected = searchParams.tags.has(tag)}

						<button
							class={cn(
								badgeVariants({
									variant: isSelected ? 'default' : 'outline'
								})
							)}
							onclick={() => toggleTag(tag)}
						>
							{tag}
						</button>
					{/each}
				</div>

				<Separator class="my-4" />
			</li>
		{/each}
	</ul>
</div>

<div>
	<div class="mt-12"></div>
	<div class="floating-button-container">
		<Button href="/app/transactions/new" class="h-12 w-12 rounded-full">
			<PlusIcon class="!h-6 !w-6" />
		</Button>
	</div>
</div>

<style lang="postcss">
	.floating-button-container {
		@apply fixed bottom-4;
		right: calc(1rem + var(--scrollbar-width, 0px));
	}
</style>
