import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (async (e) => {
	redirect(302, `/app/transactions/${e.params.transactionId}/edit`);
}) satisfies PageServerLoad;
