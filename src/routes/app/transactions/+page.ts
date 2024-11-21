import { convertTransaction } from '$lib/models/transaction';
import { setUnion } from '$lib/utils/set';

import type { PageLoad } from './$types';

export const load = (async (e) => {
	let availableTags = new Set<string>();

	const { transactions: dbTransactions, ...serverData } = e.data;

	const transactions = dbTransactions.map((t) => {
		const converted = convertTransaction(t);

		availableTags = setUnion(availableTags, converted.tags);

		return converted;
	});

	const term = e.url.searchParams.get('term') || '';
	const tagsParam = e.url.searchParams.get('tags');
	const tags = tagsParam ? tagsParam.split(',') : [];

	const searchParams = {
		term,
		tags
	};

	return {
		transactions,
		availableTags,
		searchParams,
		...serverData
	};
}) satisfies PageLoad;
