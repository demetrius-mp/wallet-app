<script lang="ts">
	import type { Dayjs } from 'dayjs';
	import CheckIcon from 'lucide-svelte/icons/check';
	import EditIcon from 'lucide-svelte/icons/edit';
	import EllipsisVerticalIcon from 'lucide-svelte/icons/ellipsis-vertical';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import SquareIcon from 'lucide-svelte/icons/square';
	import SquareCheckIcon from 'lucide-svelte/icons/square-check';
	import TrashIcon from 'lucide-svelte/icons/trash';
	import { SvelteSet } from 'svelte/reactivity';
	import { toast } from 'svelte-sonner';

	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import FloatingButton from '$lib/components/floating-button.svelte';
	import MetaTags from '$lib/components/meta-tags.svelte';
	import {
		checkPaymentIsConfirmed,
		getBill,
		getTransactionModeLabel,
		transactionFilters
	} from '$lib/models/transaction';
	import { badgeVariants } from '$lib/shadcn/ui/badge/badge.svelte';
	import Button, { buttonVariants } from '$lib/shadcn/ui/button/button.svelte';
	import * as Card from '$lib/shadcn/ui/card';
	import * as DropdownMenu from '$lib/shadcn/ui/dropdown-menu';
	import Separator from '$lib/shadcn/ui/separator/separator.svelte';
	import { cn } from '$lib/shadcn/utils';
	import type { Entities } from '$lib/types.js';
	import { dates } from '$lib/utils/dates.js';
	import { formatCurrency } from '$lib/utils/format-currency.js';

	import Filters from './filters.svelte';
	import Heading from './heading.svelte';
	import SearchBar from './search-bar.svelte';

	let { data } = $props();

	type SearchParams = {
		term: string;
		tags: Set<string>;
		date: Dayjs;
		transactionModeTags: Set<Entities.TransactionMode>;
		transactionCategoryTags: Set<Entities.TransactionCategory>;
	};

	const nextMonth = dates().utc(true).startOf('month').add(1, 'month');

	let searchParams = $state<SearchParams>({
		term: data.searchParams.term,
		tags: new SvelteSet(data.searchParams.tags),
		date: dates(data.searchParams.date, 'YYYY-MM-DD').utc(true),
		transactionModeTags: new SvelteSet(data.searchParams.transactionModeTags),
		transactionCategoryTags: new SvelteSet(data.searchParams.transactionCategoryTags)
	});

	function checkTouchedSearchParams() {
		const touchedTerm = () => searchParams.term !== '';
		const touchedTags = () => searchParams.tags.size > 0;
		const touchedDate = () => !searchParams.date.isSame(nextMonth);
		const touchedTransactionModeTag = () => searchParams.transactionModeTags !== null;
		const touchedTransactionCategoryTag = () => searchParams.transactionCategoryTags !== null;

		return (
			touchedTerm() ||
			touchedTags() ||
			touchedDate() ||
			touchedTransactionCategoryTag() ||
			touchedTransactionModeTag()
		);
	}

	let filteredTransactions = $derived.by(() => {
		const minDate = searchParams.date.startOf('month');

		if (!checkTouchedSearchParams()) {
			return data.transactions.filter((item) => {
				const matchesDate = transactionFilters.matchesDate(item, minDate);

				return matchesDate;
			});
		}

		const term = searchParams.term.toLowerCase().trim();

		return data.transactions.filter((item) => {
			const matchesTags = () => transactionFilters.matchesTags(item, searchParams.tags);
			const matchesTerm = () => transactionFilters.matchesTerm(item, term);
			const matchesTransactionMode = () =>
				transactionFilters.matchesModeTags(item, searchParams.transactionModeTags);
			const matchesTransactionCategory = () =>
				transactionFilters.matchesCategoryTags(item, searchParams.transactionCategoryTags);
			const matchesDate = () => transactionFilters.matchesDate(item, minDate);

			return (
				matchesTags() &&
				matchesTerm() &&
				matchesDate() &&
				matchesTransactionMode() &&
				matchesTransactionCategory
			);
		});
	});

	let bill = $derived(getBill(filteredTransactions, searchParams.date));

	function toggleTag(tag: string) {
		if (searchParams.tags.has(tag)) {
			searchParams.tags.delete(tag);
		} else {
			searchParams.tags.add(tag);
		}
	}

	function toggleTransactionModeTag(tag: Entities.TransactionMode) {
		if (searchParams.transactionModeTags.has(tag)) {
			searchParams.transactionModeTags.delete(tag);
		} else {
			searchParams.transactionModeTags.add(tag);
		}
	}

	function toggleTransactionCategoryTag(tag: Entities.TransactionCategory) {
		if (searchParams.transactionCategoryTags.has(tag)) {
			searchParams.transactionCategoryTags.delete(tag);
		} else {
			searchParams.transactionCategoryTags.add(tag);
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

		if (searchParams.transactionModeTags.size > 0) {
			params.set('transactionModeTags', Array.from(searchParams.transactionModeTags).join(','));
		}

		if (searchParams.transactionCategoryTags.size > 0) {
			params.set(
				'transactionCategoryTags',
				Array.from(searchParams.transactionCategoryTags).join(',')
			);
		}

		goto(`?${params.toString()}`, {
			keepFocus: true
		});
	});
</script>

<MetaTags title="Transações" />

<div class="p-4">
	<Heading {bill} bind:date={searchParams.date} initialDate={nextMonth} />

	<div class="mt-4">
		<SearchBar bind:term={searchParams.term} />
	</div>

	<div class="mt-4">
		<Filters
			availableTags={data.availableTags}
			selectedTags={searchParams.tags}
			transactionCategoryTags={searchParams.transactionCategoryTags}
			transactionModeTags={searchParams.transactionModeTags}
			onToggleTag={toggleTag}
			onToggleTransactionCategoryTag={toggleTransactionCategoryTag}
			onToggleTransactionModeTag={toggleTransactionModeTag}
		/>
	</div>

	<Separator class="my-4" />

	<ul class="space-y-4">
		{#each filteredTransactions as transaction (transaction.id)}
			{@const paymentIsConfirmed = checkPaymentIsConfirmed(transaction, searchParams.date)}

			<li>
				<Card.Root class="w-full max-w-lg">
					<Card.Header class="p-4 pb-3">
						<div class="flex items-start justify-between">
							<Card.Title class="max-w-[calc(100%-5rem)] break-words break-all pr-2">
								<a href="/app/transactions/{transaction.id}">
									{transaction.name}
								</a>
							</Card.Title>

							<div class="flex items-center gap-2">
								<form
									method="post"
									action="/app/transactions/{transaction.id}?/confirmPayment"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success' && result.data) {
												toast.success(result.data.message as string);
											} else if (result.type === 'failure' && result.data) {
												toast.error(result.data.message as string);
											}

											await applyAction(result);
											await invalidateAll();
										};
									}}
								>
									<input
										type="hidden"
										name="paymentDate"
										value={searchParams.date.format('YYYY-MM-DD')}
									/>

									<button
										class={cn(
											buttonVariants({ variant: 'ghost' }),
											'size-8 p-0',
											paymentIsConfirmed && 'text-green-800 hover:text-green-800'
										)}
										type="submit"
									>
										{#if paymentIsConfirmed}
											<span class="sr-only">
												{transaction.category === 'EXPENSE'
													? 'Marcar como não pago'
													: 'Marcar como não recebido'}
											</span>
											<SquareCheckIcon />
										{:else}
											<span class="sr-only">
												{transaction.category === 'EXPENSE'
													? 'Marcar como pago'
													: 'Marcar como recebido'}
											</span>
											<SquareIcon />
										{/if}
									</button>
								</form>

								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class={cn(buttonVariants({ variant: 'ghost' }), 'size-8 p-0')}
									>
										<span class="sr-only"> Opções </span>
										<EllipsisVerticalIcon />
									</DropdownMenu.Trigger>

									<DropdownMenu.Content align="end" side="bottom">
										<DropdownMenu.Group>
											<DropdownMenu.Item class="cursor-pointer">
												{#snippet child({ props })}
													<a href="/app/transactions/{transaction.id}" {...props}>
														<EditIcon class="mr-2 size-4" />
														<span>Editar</span>
													</a>
												{/snippet}
											</DropdownMenu.Item>

											<DropdownMenu.Separator />

											<DropdownMenu.Item
												class="w-full cursor-pointer text-destructive data-[highlighted]:text-destructive"
											>
												{#snippet child({ props })}
													<form
														method="post"
														action="/app/transactions/{transaction.id}?/delete"
														use:enhance
													>
														<button {...props} type="submit">
															<TrashIcon class="mr-2 size-4" />
															<span>Excluir</span>
														</button>
													</form>
												{/snippet}
											</DropdownMenu.Item>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
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
											variant: searchParams.transactionModeTags.has(transaction.mode)
												? 'default'
												: 'outline'
										})
									)}
									onclick={() => toggleTransactionModeTag(transaction.mode)}
								>
									{getTransactionModeLabel(transaction.mode)}
								</button>
							</div>
						</div>

						{#if transaction.mode === 'IN_INSTALLMENTS'}
							<div class="mt-2 flex justify-between">
								<span class="text-sm text-muted-foreground">
									Total:
									{formatCurrency(transaction.value * transaction.numberOfInstallments)}
								</span>

								<span
									class={cn(
										'flex items-center gap-1 text-sm',
										transaction.paidInstallments === transaction.numberOfInstallments
											? 'text-green-800'
											: 'text-muted-foreground'
									)}
								>
									{#if transaction.paidInstallments === transaction.numberOfInstallments}
										<CheckIcon class="!size-3.5" />
									{/if}

									{#if transaction.paidInstallments === 0}
										Nenhuma parcela paga
									{:else}
										{transaction.paidInstallments} de {transaction.numberOfInstallments} parcelas
									{/if}
								</span>
							</div>
						{/if}

						<Separator class="my-4" />

						<div class="grid grid-cols-2 gap-2 text-sm">
							<span class="text-muted-foreground">Data da transação:</span>
							<span class="text-end">
								{dates.utc(transaction.purchasedAt).format('DD/MM/YYYY')}
							</span>

							{#if transaction.mode === 'IN_INSTALLMENTS'}
								<span class="text-muted-foreground">Primeira parcela:</span>
								<span class="text-end">
									{dates.utc(transaction.firstInstallmentAt).format('MM/YYYY')}
								</span>

								{#if transaction.numberOfInstallments !== transaction.paidInstallments}
									{#if transaction.lastPaymentConfirmationAt}
										<span class="text-muted-foreground">Última confirmação:</span>
										<span class="text-end">
											{dates.utc(transaction.lastPaymentConfirmationAt).format('MM/YYYY')}
										</span>
									{/if}

									<span class="text-muted-foreground">Finaliza em:</span>
									<span class="text-end">
										{dates.utc(transaction.lastInstallmentAt).format('MM/YYYY')}
									</span>

									<span class="text-muted-foreground">
										{#if transaction.category === 'EXPENSE'}
											Valor total pago:
										{:else if transaction.category === 'INCOME'}
											Valor total recebido
										{/if}
									</span>
									<span class="text-end">
										{formatCurrency(transaction.value * transaction.paidInstallments)}
									</span>

									<span class="text-muted-foreground">Valor restante:</span>
									<span class="text-end">
										{formatCurrency(
											transaction.value *
												(transaction.numberOfInstallments - transaction.paidInstallments)
										)}
									</span>
								{/if}
							{:else if transaction.mode === 'SINGLE_PAYMENT'}
								<span class="text-muted-foreground">
									{#if transaction.category === 'EXPENSE'}
										Data de pagamento:
									{:else if transaction.category === 'INCOME'}
										Data de recebimento
									{/if}
								</span>
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

<FloatingButton>
	<Button href="/app/transactions/new" class="size-12 rounded-full">
		<PlusIcon class="!size-6" />
	</Button>
</FloatingButton>
