<script lang="ts">
	import type { Dayjs } from 'dayjs';

	import MetaTags from '$lib/components/meta-tags.svelte';
	import { dates } from '$lib/utils/dates';

	import Heading from './heading.svelte';
	import SearchBar from './search-bar.svelte';

	type SearchParams = {
		date: Dayjs;
		term: string;
	};

	let searchParams = $state<SearchParams>({
		date: dates().utc(true),
		term: ''
	});

	const minDate = dates().utc(true).subtract(1, 'month');

	let total = 1200;
</script>

<MetaTags title="Lembretes de pagamento" />

<Heading {total} bind:date={searchParams.date} minCalendarDate={minDate} />

<div class="mt-4">
	<SearchBar bind:term={searchParams.term} />
</div>
