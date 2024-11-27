import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (async (e) => {
	const { session } = await e.parent();

	if (session) {
		redirect(302, '/app');
	}

	return {};
}) satisfies PageServerLoad;
