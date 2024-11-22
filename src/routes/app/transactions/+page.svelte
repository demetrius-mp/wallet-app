<script lang="ts">
	import type { Dayjs } from 'dayjs';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import Check from 'lucide-svelte/icons/check';
	import CopyIcon from 'lucide-svelte/icons/copy';
	import EditIcon from 'lucide-svelte/icons/edit';
	import EllipsisVerticalIcon from 'lucide-svelte/icons/ellipsis-vertical';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import SearchIcon from 'lucide-svelte/icons/search';
	import TrashIcon from 'lucide-svelte/icons/trash';
	import XIcon from 'lucide-svelte/icons/x';
	import { flip } from 'svelte/animate';
	import { SvelteSet } from 'svelte/reactivity';
	import { fade, scale } from 'svelte/transition';

	import { goto } from '$app/navigation';
	import MetaTags from '$lib/components/meta-tags.svelte';
	import MonthCalendar from '$lib/components/month-calendar.svelte';
	import { getTransactionModeLabel, TRANSACTION_MODES } from '$lib/models/transaction';
	import { chipVariants } from '$lib/shadcn/custom/chip.svelte';
	import { badgeVariants } from '$lib/shadcn/ui/badge/badge.svelte';
	import Button, { buttonVariants } from '$lib/shadcn/ui/button/button.svelte';
	import * as Card from '$lib/shadcn/ui/card';
	import * as Command from '$lib/shadcn/ui/command/index.js';
	import * as DropdownMenu from '$lib/shadcn/ui/dropdown-menu';
	import Input from '$lib/shadcn/ui/input/input.svelte';
	import * as Popover from '$lib/shadcn/ui/popover';
	import Separator from '$lib/shadcn/ui/separator/separator.svelte';
	import { cn } from '$lib/shadcn/utils';
	import type { Entities } from '$lib/types.js';
	import {
		calendarDateToDayjs,
		dates,
		dayjsToCalendarDate,
		getDatesDiffInMonths
	} from '$lib/utils/dates.js';
	import { formatCurrency } from '$lib/utils/format-currency.js';
	import { isSubsetOf } from '$lib/utils/set';

	let { data } = $props();

	type SearchParams = {
		term: string;
		tags: Set<string>;
		date: Dayjs;
		transactionModeTag: Entities.TransactionMode | null;
		transactionCategoryTag: Entities.TransactionCategory | null;
	};

	const nextMonth = dates().utc(true).startOf('month').add(1, 'month');

	let searchParams = $state<SearchParams>({
		term: data.searchParams.term,
		tags: new SvelteSet(data.searchParams.tags),
		date: dates(data.searchParams.date, 'YYYY-MM-DD').utc(true),
		transactionModeTag: data.searchParams.transactionModeTag,
		transactionCategoryTag: data.searchParams.transactionCategoryTag
	});

	function checkTouchedSearchParams() {
		const touchedTerm = () => searchParams.term !== '';
		const touchedTags = () => searchParams.tags.size > 0;
		const touchedDate = () => !searchParams.date.isSame(nextMonth);
		const touchedTransactionModeTag = () => searchParams.transactionModeTag !== null;
		const touchedTransactionCategoryTag = () => searchParams.transactionCategoryTag !== null;

		return (
			touchedTerm() ||
			touchedTags() ||
			touchedDate() ||
			touchedTransactionCategoryTag() ||
			touchedTransactionModeTag()
		);
	}

	let searchInputValue = $state(searchParams.term);

	let filteredTransactions = $derived.by(() => {
		const minDate = searchParams.date.startOf('month');

		function checkMatchesTransactionMode(transaction: (typeof data.transactions)[number]) {
			if (searchParams.transactionModeTag) {
				return transaction.mode === searchParams.transactionModeTag;
			}

			return true;
		}

		function checkMatchesTransactionCategory(transaction: (typeof data.transactions)[number]) {
			if (searchParams.transactionCategoryTag) {
				return transaction.category === searchParams.transactionCategoryTag;
			}

			return true;
		}

		function checkMatchesDate(transaction: (typeof data.transactions)[number]) {
			const firstInstallmentAt = dates.utc(transaction.firstInstallmentAt).startOf('month');
			const firstInstallmentIsBeforeMinDate = firstInstallmentAt.isBefore(minDate);
			const firstInstallmentIsSameAsMinDate = firstInstallmentAt.isSame(minDate);

			if (transaction.mode === 'RECURRENT') {
				return firstInstallmentIsBeforeMinDate || firstInstallmentIsSameAsMinDate;
			}

			const lastInstallmentAt = dates.utc(transaction.lastInstallmentAt).startOf('month');

			const lastInstallmentIsAfterMinDate = lastInstallmentAt.isAfter(minDate);
			const lastInstallmentIsSameMonth = lastInstallmentAt.isSame(minDate, 'month');

			return (
				(firstInstallmentIsBeforeMinDate || firstInstallmentIsSameAsMinDate) &&
				(lastInstallmentIsAfterMinDate || lastInstallmentIsSameMonth)
			);
		}

		if (!checkTouchedSearchParams()) {
			return data.transactions.filter((item) => {
				const matchesDate = checkMatchesDate(item);

				return matchesDate;
			});
		}

		const term = searchParams.term.toLowerCase();

		return data.transactions.filter((item) => {
			const isSubset = isSubsetOf(searchParams.tags, item.tags);
			const includesTerm = item.name.toLowerCase().includes(term);
			const matchesTransactionMode = checkMatchesTransactionMode(item);
			const matchesTransactionCategory = checkMatchesTransactionCategory(item);

			let isAfterDate = true;
			if (item.mode === 'IN_INSTALLMENTS') {
				isAfterDate = checkMatchesDate(item);
			}

			return (
				isSubset &&
				includesTerm &&
				isAfterDate &&
				matchesTransactionMode &&
				matchesTransactionCategory
			);
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

	function toggleTransactionModeTag(tag: Entities.TransactionMode) {
		if (searchParams.transactionModeTag === tag) {
			searchParams.transactionModeTag = null;
		} else {
			searchParams.transactionModeTag = tag;
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

		if (!searchParams.date.isSame(nextMonth, 'month')) {
			params.set('date', searchParams.date.startOf('month').format('YYYY-MM-DD'));
		}

		if (searchParams.transactionModeTag) {
			params.set('transactionModeTag', searchParams.transactionModeTag);
		}

		if (searchParams.transactionCategoryTag) {
			params.set('transactionCategoryTag', searchParams.transactionCategoryTag);
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
						minValue={dayjsToCalendarDate(nextMonth.subtract(1, 'month'))}
						value={dayjsToCalendarDate(searchParams.date)}
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
						+ Adicionar filtro
					</button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content side="bottom" align="start" class="w-[180px] p-0">
				<Command.Root>
					<Command.Input class="h-8" placeholder="Buscar filtros..." />
					<Command.List>
						<Command.Empty class="py-4">
							Nenhum filtro
							<br />
							encontrada.
						</Command.Empty>

						<Command.Group heading="Tipos de transação">
							{#each TRANSACTION_MODES as transactionMode}
								<Command.Item
									value={transactionMode}
									onSelect={() => toggleTransactionModeTag(transactionMode)}
									class="flex items-center justify-between break-all"
								>
									{getTransactionModeLabel(transactionMode)}

									{#if searchParams.transactionModeTag === transactionMode}
										<Check />
									{/if}
								</Command.Item>
							{/each}
						</Command.Group>

						<Command.Separator />

						<Command.Group heading="Tags">
							{#each data.availableTags as tag}
								<Command.Item
									value={tag}
									onSelect={() => toggleTag(tag)}
									class="flex items-center justify-between break-all"
								>
									{tag}

									{#if searchParams.tags.has(tag)}
										<Check />
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

	<ul class="space-y-4">
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
				<Card.Root class="w-full max-w-lg">
					<Card.Header class="p-4 pb-3">
						<div class="flex items-start justify-between">
							<Card.Title class="max-w-[calc(100%-2rem)] break-words break-all pr-2">
								{transaction.name}
							</Card.Title>

							<DropdownMenu.Root>
								<DropdownMenu.Trigger
									class={cn(buttonVariants({ variant: 'ghost' }), 'size-8 flex-shrink-0 p-0')}
								>
									<span class="sr-only"> Opções </span>
									<EllipsisVerticalIcon />
								</DropdownMenu.Trigger>

								<DropdownMenu.Content align="end" side="bottom">
									<DropdownMenu.Group>
										<DropdownMenu.Item>
											<EditIcon class="mr-2 size-4" />
											<span>Editar</span>
										</DropdownMenu.Item>

										<DropdownMenu.Separator />

										<DropdownMenu.Item class="text-destructive data-[highlighted]:text-destructive">
											<TrashIcon class="mr-2 size-4" />
											<span>Excluir</span>
										</DropdownMenu.Item>
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					</Card.Header>

					<Card.Content class="p-4 pt-0">
						<div class="flex items-center justify-between gap-2">
							<div>
								<span class="text-xl font-bold">
									{formatCurrency(transaction.value)}
								</span>
							</div>

							<div>
								<button
									class={cn(
										badgeVariants({
											variant:
												searchParams.transactionModeTag === transaction.mode ? 'default' : 'outline'
										})
									)}
									onclick={() => toggleTransactionModeTag(transaction.mode)}
								>
									{getTransactionModeLabel(transaction.mode)}
								</button>
							</div>
						</div>

						{#if transaction.mode === 'IN_INSTALLMENTS'}
							<div>
								<p class="mt-0.5 text-sm text-muted-foreground">
									Total:
									{formatCurrency(transaction.value * transaction.numberOfInstallments)}
								</p>
							</div>
						{/if}

						<Separator class="my-4" />

						<div class="grid grid-cols-2 gap-2 text-sm">
							<span class="text-muted-foreground">Data da compra:</span>
							<span class="text-end">
								{dates.utc(transaction.purchasedAt).format('DD/MM/YYYY')}
							</span>

							{#if transaction.mode === 'IN_INSTALLMENTS'}
								<span class="text-muted-foreground">Primeira parcela:</span>
								<span class="text-end">
									{dates.utc(transaction.firstInstallmentAt).format('MM/YYYY')}
								</span>

								<span class="text-muted-foreground">Última parcela:</span>
								<span class="text-end">
									{dates.utc(transaction.lastInstallmentAt).format('MM/YYYY')}
								</span>

								<span class="text-muted-foreground">Parcelas pagas:</span>
								<span class="text-end">
									{paidInstallments}/{transaction.numberOfInstallments}
								</span>

								<span class="text-muted-foreground">Valor total pago:</span>
								<span class="text-end">
									{formatCurrency(transaction.value * paidInstallments)}
								</span>

								<span class="text-muted-foreground">Valor restante:</span>
								<span class="text-end">
									{formatCurrency(
										transaction.value * (transaction.numberOfInstallments - paidInstallments)
									)}
								</span>
							{:else if transaction.mode === 'SINGLE_PAYMENT'}
								<span class="text-muted-foreground">Data de pagamento:</span>
								<span class="text-end">
									{dates.utc(transaction.firstInstallmentAt).format('MM/YYYY')}
								</span>
							{/if}
						</div>
					</Card.Content>

					{#if transaction.tags.size > 0}
						<Card.Footer class="block p-4 pt-0">
							<Separator class="mb-2.5" />

							<div class="flex flex-wrap items-center gap-2">
								<span class="mb-0.5"> Tags: </span>
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
						</Card.Footer>
					{/if}
				</Card.Root>
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
