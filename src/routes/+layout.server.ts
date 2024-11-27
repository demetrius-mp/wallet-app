import { getFlashMessage } from '$lib/utils/flash-message';

import type { LayoutServerLoad } from './$types';

export const load = (async (e) => {
	const flashMessage = getFlashMessage(e.cookies);
	const { session } = e.locals;

	return {
		flashMessage,
		session
	};
}) satisfies LayoutServerLoad;
