import { redirect } from '@sveltejs/kit';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { SignInSchema } from '$lib/schemas';
import { verifyPasswordHash } from '$lib/server/auth/password.auth';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie
} from '$lib/server/auth/session.auth';
import { UserRepository } from '$lib/server/db/repositories/user.repository';
import { setFlashMessage } from '$lib/utils/flash-message';

import type { Actions, PageServerLoad } from './$types';

export const load = (async (e) => {
	const { session } = await e.parent();

	if (session) {
		redirect(302, '/app');
	}

	const form = await superValidate(zod(SignInSchema));

	return {
		form
	};
}) satisfies PageServerLoad;

export const actions = {
	async default(e) {
		const form = await superValidate(e, zod(SignInSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const repository = new UserRepository();

		const user = await repository.getUserByEmail({
			email: data.email
		});

		if (!user) {
			return setError(form, 'Email ou senha incorretos');
		}

		const passwordMatches = await verifyPasswordHash(data.password, user.password);
		console.log(passwordMatches);

		if (!passwordMatches) {
			return setError(form, 'Email ou senha incorretos');
		}

		const token = generateSessionToken();
		const session = await createSession(token, user.id);

		setSessionTokenCookie(e, token, session.expiresAt);

		setFlashMessage(e, {
			type: 'success',
			message: 'Bem vind@!'
		});

		redirect(302, '/auth/sign-in');
	}
} satisfies Actions;
