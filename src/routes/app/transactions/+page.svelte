<script lang="ts">
	import type { Dayjs } from 'dayjs';
	import PlusIcon from 'lucide-svelte/icons/plus';
	import { SvelteSet } from 'svelte/reactivity';

	import { goto } from '$app/navigation';
	import FloatingButton from '$lib/components/floating-button.svelte';
	import MetaTags from '$lib/components/meta-tags.svelte';
	import { getBill, transactionFilters } from '$lib/models/transaction';
	import Button from '$lib/shadcn/ui/button/button.svelte';
	import Separator from '$lib/shadcn/ui/separator/separator.svelte';
	import type { Entities } from '$lib/types.js';
	import { dates } from '$lib/utils/dates.js';

	import Filters from './filters.svelte';
	import Heading from './heading.svelte';
	import SearchBar from './search-bar.svelte';
	import TransactionCard from './transaction-card.svelte';

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
</div>

<FloatingButton>
	<Button href="/app/transactions/new" class="size-12 rounded-full">
		<PlusIcon class="!size-6" />
	</Button>
</FloatingButton>
