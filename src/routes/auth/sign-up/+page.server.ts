import { redirect } from '@sveltejs/kit';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

import { SignUpSchema } from '$lib/schemas';
import { UserRepository } from '$lib/server/db/repositories/user.repository';
import { generatePasswordHash } from '$lib/server/auth/password.auth';
import { setFlashMessage } from '$lib/utils/flash-message';

import type { Actions, PageServerLoad } from './$types';

export const load = (async (e) => {
	const { session } = await e.parent();

	if (session) {
		redirect(302, '/app');
	}

	const form = await superValidate(zod(SignUpSchema));

	return {
		form
	};
}) satisfies PageServerLoad;

export const actions = {
	async default(e) {
		const form = await superValidate(e, zod(SignUpSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { data } = form;

		const repository = new UserRepository();

		const existingUser = await repository.getUserByEmail({
			email: data.email
		});

		if (existingUser) {
			return setError(form, 'email', 'Email já cadastrado');
		}

		await repository.createUser({
			email: data.email,
			name: data.name,
			password: await generatePasswordHash(data.password)
		});

		setFlashMessage(e, {
			type: 'success',
			message: 'Conta criada com sucesso! Faça login para continuar.'
		});

		redirect(302, '/auth/sign-in');
	}
} satisfies Actions;
