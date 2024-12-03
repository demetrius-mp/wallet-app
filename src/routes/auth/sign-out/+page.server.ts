import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session';

import type { Actions } from './$types';

export const actions = {
	async default(e) {
		const { session } = e.locals;

		if (!session) return;

		await invalidateSession(session.id);
		deleteSessionTokenCookie(e);
	}
} satisfies Actions;