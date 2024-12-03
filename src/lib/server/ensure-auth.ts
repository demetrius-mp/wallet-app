import { redirect, type RequestEvent } from '@sveltejs/kit';

import { setFlashMessage } from '$lib/utils/flash-message';

export function ensureAuth(e: RequestEvent) {
	const { session } = e.locals;

	if (!session) {
		setFlashMessage(e, {
			type: 'error',
			message: 'Você precisa estar autenticado para acessar essa página.'
		});

		redirect(302, '/auth/sign-in');
	}

	return session;
}
