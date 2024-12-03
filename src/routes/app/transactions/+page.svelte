<script lang="ts">
	import { shortcut } from '@svelte-put/shortcut';
	import type { Dayjs } from 'dayjs';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import { SvelteSet } from 'svelte/reactivity';
	import { toast } from 'svelte-sonner';

	import { goto } from '$app/navigation';
	import FloatingButton from '$lib/components/floating-button.svelte';
	import MetaTags from '$lib/components/meta-tags.svelte';
	import { filterTransactions, getBill } from '$lib/models/transaction';
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import Separator from '$lib/shadcn/ui/separator/separator.svelte';
	import type { Entities } from '$lib/types.js';
	import { dates } from '$lib/utils/dates.js';
	import { formatCurrency } from '$lib/utils/format-currency';

	import Filters from './filters.svelte';
	import Heading from './heading.svelte';
	import SearchBar from './search-bar.svelte';
	import TransactionCard from './transaction-card.svelte';
	import { useTransactionsContext } from './transactions-provider.svelte';

	let { data } = $props();

	type SearchParams = {
		term: string;
		tags: Set<string>;
		date: Dayjs;
		transactionModeTags: Set<Entities.TransactionMode>;
		transactionCategoryTags: Set<Entities.TransactionCategory>;
	};

	const currentMonth = dates(data.searchParams.currentMonth, 'YYYY-MM-DD').utc(true);
	const minDate = dates(data.searchParams.currentMonth, 'YYYY-MM-DD')
		.utc(true)
		.subtract(1, 'month');

	let searchParams = $state<SearchParams>({
		term: data.searchParams.term,
		tags: new SvelteSet(data.searchParams.tags),
		date: dates(data.searchParams.date, 'YYYY-MM-DD').utc(true),
		transactionModeTags: new SvelteSet(data.searchParams.transactionModeTags),
		transactionCategoryTags: new SvelteSet(data.searchParams.transactionCategoryTags)
	});

	const { transactions, availableTags } = useTransactionsContext();

	let filteredTransactions = $derived(filterTransactions($transactions, searchParams));
	let bill = $derived(getBill(filteredTransactions));

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

		if (!searchParams.date.isSame(currentMonth, 'month')) {
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

	function handleNextMonthShortcut() {
		searchParams.date = searchParams.date.add(1, 'month');
	}

	function handlePreviousMonthShortcut() {
		if (searchParams.date.isSame(minDate, 'month')) return;

		searchParams.date = searchParams.date.subtract(1, 'month');
	}

	async function handleNavigateToCreateTransaction() {
		await goto('/app/transactions/new');
	}

	async function handleCopyTransactionsToClipboard() {
		const initial = `Transações em ${searchParams.date.format('MM/YYYY')}\nValor total: ${formatCurrency(bill)}\n\n`;

		const report = filteredTransactions
			.reduce((acc, transaction) => {
				let line = `${transaction.name} - ${formatCurrency(transaction.value)}\n`;

				if (transaction.mode === 'SINGLE_PAYMENT') {
					line += 'À vista';
				} else if (transaction.mode === 'IN_INSTALLMENTS') {
					line += `Parcela ${transaction.paidInstallments}/${transaction.numberOfInstallments}`;
				} else if (transaction.mode === 'RECURRENT') {
					line += 'Recorrente';
				}

				line += '\n';

				return acc + line + '\n';
			}, initial)
			.trim();

		await navigator.clipboard.writeText(report);

		toast.success('Transações copiadas para a área de transferência');
	}
</script>

<svelte:document
	use:shortcut={{
		trigger: {
			key: 'l',
			modifier: ['ctrl', 'meta'],
			preventDefault: true,
			callback: handleNextMonthShortcut
		}
	}}
	use:shortcut={{
		trigger: {
			key: 'j',
			modifier: ['ctrl', 'meta'],
			preventDefault: true,
			callback: handlePreviousMonthShortcut
		}
	}}
	use:shortcut={{
		trigger: {
			key: ',',
			modifier: ['ctrl', 'meta'],
			preventDefault: true,
			callback: handleNavigateToCreateTransaction
		}
	}}
/>

<MetaTags title="Transações" />

<Heading
	onCopyTransactionsToClipboard={handleCopyTransactionsToClipboard}
	{bill}
	bind:date={searchParams.date}
	minCalendarDate={minDate}
/>

<div class="mt-4">
	<SearchBar bind:term={searchParams.term} />
</div>

<div class="mt-4">
	<Filters
		availableTags={$availableTags}
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
		<li>
			<TransactionCard
				{transaction}
				date={searchParams.date}
				selectedTags={searchParams.tags}
				transactionModeTags={searchParams.transactionModeTags}
				onToggleTag={toggleTag}
				onToggleTransactionModeTag={toggleTransactionModeTag}
			/>
		</li>
	{/each}
</ul>

<FloatingButton spacerClass="mt-16">
	<Button href="/app/transactions/new" class="size-12 rounded-full">
		<PlusIcon class="!size-6" />
	</Button>
</FloatingButton>
