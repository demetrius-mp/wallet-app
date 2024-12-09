import { type Handle, redirect } from '@sveltejs/kit';

import {
	deleteSessionTokenCookie,
	setSessionTokenCookie,
	validateSessionToken
} from '$lib/server/auth/session.auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session') ?? null;

	if (token === null) {
		event.locals.session = null;

		return resolve(event);
	}

	const session = await validateSessionToken(token);

	if (session !== null) {
		setSessionTokenCookie(event, token, session.expiresAt);
	} else {
		deleteSessionTokenCookie(event);
	}

	event.locals.session = session;

	const routeId = event.route.id;

	if (routeId?.startsWith('/app') && !session) {
		redirect(302, '/auth/sign-in');
	}

	return resolve(event);
};
