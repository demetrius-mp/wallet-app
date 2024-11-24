import {
	checkTransactionCategoryIsValid,
	checkTransactionModeIsValid,
	convertTransaction
} from '$lib/models/transaction';
import type { Entities } from '$lib/types';
import { checkDateIsValid, dates } from '$lib/utils/dates';
import { setUnion } from '$lib/utils/set';

import type { PageLoad } from './$types';

function checkTransactionModeTagsParamIsValid(param: string | null): Entities.TransactionMode[] {
	if (!param) return [];

	const tags = param.split(',');

	if (!tags.every(checkTransactionModeIsValid)) return [];

	return tags;
}

function checkTransactionCategoryTagsParamIsValid(
	param: string | null
): Entities.TransactionCategory[] {
	if (!param) return [];

	const tags = param.split(',');

	if (!tags.every(checkTransactionCategoryIsValid)) return [];

	return tags;
}

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

	const transactionCategoryTagsParam = e.url.searchParams.get('transactionCategoryTags');
	const transactionCategoryTags = checkTransactionCategoryTagsParamIsValid(
		transactionCategoryTagsParam
	);

	const transactionModeTagsParam = e.url.searchParams.get('transactionModeTags');
	const transactionModeTags = checkTransactionModeTagsParamIsValid(transactionModeTagsParam);

	const initialDate = dates
		.tz(new Date(), 'America/Campo_Grande')
		.utc(true)
		.startOf('month')
		.format('YYYY-MM-DD');

	const dateParam = e.url.searchParams.get('date');
	const date = dateParam && checkDateIsValid(dateParam) ? dateParam : initialDate;

	const searchParams = {
		term,
		tags,
		transactionModeTags,
		transactionCategoryTags,
		date
	};

	return {
		transactions,
		availableTags,
		searchParams,
		...serverData
	};
}) satisfies PageLoad;
