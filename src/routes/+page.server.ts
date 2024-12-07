import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (() => {
	redirect(302, '/auth/sign-in');
}) satisfies PageServerLoad;
