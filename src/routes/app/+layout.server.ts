import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

export const load = (async (e) => {
	const { session } = await e.parent();

	if (!session) {
		redirect(302, '/sign-in');
	}

	return {
		session
	};
}) satisfies LayoutServerLoad;
