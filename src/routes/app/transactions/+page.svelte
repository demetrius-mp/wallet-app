<script lang="ts" module>
	const dateFormatterShort = new DateFormatter('pt-BR', {
		dateStyle: 'short'
	});

	function formatDateShort(date: Date) {
		return dateFormatterShort.format(date);
	}

	const dateFormatterMonthYear = new DateFormatter('pt-BR', {
		month: '2-digit',
		year: 'numeric'
	});

	function formatDateMonthYear(date: Date) {
		return dateFormatterMonthYear.format(date);
	}

	function getDatesDiffInMonths(d1: Date, d2: Date) {
		const start = dates.utc(d1).startOf('month');
		const end = dates.utc(d2).startOf('month');

		const diff = end.diff(start, 'month');

		return diff;
	}
</script>

<script lang="ts">
	import * as Dialog from '$lib/shadcn/ui/dialog';
	import { badgeVariants } from '$lib/shadcn/ui/badge/badge.svelte';
	import { flip } from 'svelte/animate';
	import { SvelteSet } from 'svelte/reactivity';
	import Button, { buttonVariants } from '$lib/shadcn/ui/button/button.svelte';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import CopyIcon from 'lucide-svelte/icons/copy';
	import * as Popover from '$lib/shadcn/ui/popover';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { fade, scale } from 'svelte/transition';
	import Separator from '$lib/shadcn/ui/separator/separator.svelte';
	import Input from '$lib/shadcn/ui/input/input.svelte';
	import SearchIcon from 'lucide-svelte/icons/search';
	import XIcon from 'lucide-svelte/icons/x';
	import { formatCurrency } from '$lib/utils/format-currency.js';
	import { cn } from '$lib/shadcn/utils';
	import { goto } from '$app/navigation';
	import TransactionForm from '$lib/components/forms/transaction-form/transaction-form.svelte';
	import {
		CalendarDate,
		DateFormatter,
		getLocalTimeZone,
		startOfMonth,
		today
	} from '@internationalized/date';
	import { dates } from '$lib/utils/dates.js';
	import MonthCalendar from '$lib/components/month-calendar.svelte';
	import AddTag from './add-tag.svelte';
	import { isSubsetOf } from '$lib/utils/set';

	let { data } = $props();

	type SearchParams = {
		term: string;
		tags: Set<string>;
		date: CalendarDate;
	};

	let searchParams = $state<SearchParams>({
		term: data.searchParams.term,
		tags: new SvelteSet(data.searchParams.tags),
		date: startOfMonth(today(getLocalTimeZone()))
	});

	let searchInputValue = $state(searchParams.term);
	let createTransactionDialogIsOpen = $state(false);

	let filteredTransactions = $derived.by(() => {
		const minDate = dates(searchParams.date.toDate(getLocalTimeZone())).utc();

		function checkDate(date: Date) {
			const transactionEndsAtDate = dates.utc(date);

			const endsAfterMinDate = transactionEndsAtDate.isAfter(minDate);
			const endsAtSameMonth = transactionEndsAtDate.isSame(minDate, 'month');
			const matchesDate = true && (endsAfterMinDate || endsAtSameMonth);

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

	let selectedMonthYear = $derived(
		formatDateMonthYear(searchParams.date.toDate(getLocalTimeZone()))
	);

	function toggleTag(tag: string) {
		if (searchParams.tags.has(tag)) {
			searchParams.tags.delete(tag);
		} else {
			searchParams.tags.add(tag);
		}
	}

	$effect(() => {
		const params = new URLSearchParams();
		params.set('term', searchParams.term);
		params.set('tags', Array.from(searchParams.tags).join(','));

		goto(`?${params.toString()}`, {
			keepFocus: true
		});
	});
</script>

<div class="p-4">
	<div class="flex items-baseline gap-2">
		<h2 class="text-2xl">Saldo</h2>
		<small>
			({selectedMonthYear})
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
				do mês {selectedMonthYear}
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

				<Popover.Content align="end" side="bottom" class="p-0">
					<MonthCalendar
						bind:value={searchParams.date}
						minValue={startOfMonth(today(getLocalTimeZone())).subtract({ months: 1 })}
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

		<AddTag availableTags={data.availableTags} bind:selectedTags={searchParams.tags} />
	</div>

	<Separator class="my-4" />

	<ul>
		{#each filteredTransactions as transaction (transaction.id)}
			{@const paidInstallments =
				getDatesDiffInMonths(
					transaction.firstInstallmentAt,
					searchParams.date.toDate(getLocalTimeZone())
				) + 1}

			<li
				animate:flip={{
					duration: 100
				}}
				transition:fade={{
					duration: 100
				}}
			>
				<a href="/">
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
							{formatDateShort(transaction.purchasedAt)}
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
		<Dialog.Root bind:open={createTransactionDialogIsOpen}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props} class="h-12 w-12 rounded-full">
						<PlusIcon class="!h-6 !w-6" />
					</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content class="max-h-screen overflow-y-auto rounded-sm sm:max-w-[425px]">
				<Dialog.Header>
					<Dialog.Title>Nova transação</Dialog.Title>
				</Dialog.Header>

				<TransactionForm
					onCancel={() => {
						createTransactionDialogIsOpen = false;
					}}
				/>
			</Dialog.Content>
		</Dialog.Root>
	</div>
</div>

<style lang="postcss">
	.floating-button-container {
		@apply fixed bottom-4;
		right: calc(1rem + var(--scrollbar-width, 0px));
	}
</style>
