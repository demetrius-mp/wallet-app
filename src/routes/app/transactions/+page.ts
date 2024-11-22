import {
	checkTransactionCategoryIsValid,
	checkTransactionModeIsValid,
	convertTransaction
} from '$lib/models/transaction';
import { checkDateIsValid, dates } from '$lib/utils/dates';
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

	const transactionModeParam = e.url.searchParams.get('transactionModeTag') || '';
	const transactionModeTag = checkTransactionModeIsValid(transactionModeParam)
		? transactionModeParam
		: null;

	const transactionCategoryParam = e.url.searchParams.get('transactionCategoryTag') || '';
	const transactionCategoryTag = checkTransactionCategoryIsValid(transactionCategoryParam)
		? transactionCategoryParam
		: null;

	const nextMonth = dates
		.tz(new Date(), 'America/Campo_Grande')
		.utc(true)
		.startOf('month')
		.add(1, 'month')
		.format('YYYY-MM-DD');

	const dateParam = e.url.searchParams.get('date');
	const date = dateParam && checkDateIsValid(dateParam) ? dateParam : nextMonth;

	const searchParams = {
		term,
		tags,
		transactionModeTag,
		transactionCategoryTag,
		date
	};

	return {
		transactions,
		availableTags,
		searchParams,
		...serverData
	};
}) satisfies PageLoad;
