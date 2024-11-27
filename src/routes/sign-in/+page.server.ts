import { redirect } from '@sveltejs/kit';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { SignInSchema, SignUpSchema } from '$lib/schemas';
import { createUser, getUserByEmail } from '$lib/server/db/queries/user';
import { verifyPasswordHash } from '$lib/server/password';
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

		const user = await getUserByEmail(data.email);

		if (!user) {
			return setError(form, 'Email ou senha incorretos');
		}

		const passwordMatches = await verifyPasswordHash(data.password, user.password);

		if (!passwordMatches) {
			return setError(form, 'Email ou senha incorretos');
		}

		setFlashMessage(e, {
			type: 'success',
			message: 'Conta criada com sucesso! Faça login para continuar.'
		});

		redirect(302, '/sign-in');
	}
} satisfies Actions;
